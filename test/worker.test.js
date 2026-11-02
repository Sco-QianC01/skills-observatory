import test from 'node:test';
import assert from 'node:assert/strict';
import { feedResponse, validFeed } from '../src/worker.js';

const feed = { version: 1, generatedAt: '2026-11-01T00:00:00Z', sources: [], items: [] };
const request = new Request('https://example.com/api/feed');

test('feed boundary accepts optional string fields and rejects unsafe date and source-name types', () => {
  const article = { title: 'Article', url: 'https://example.com/article' };
  for (const publishedAt of [undefined, null, '2026-11-01T00:00:00Z']) {
    assert.equal(validFeed({ ...feed, items: [{ ...article, publishedAt }] }), true);
  }
  for (const publishedAt of [{ toString: null }, [], 42]) {
    assert.equal(validFeed({ ...feed, items: [{ ...article, publishedAt }] }), false);
  }
  for (const name of [undefined, null, 'Example']) {
    assert.equal(validFeed({ ...feed, sources: [{ id: 'example', status: 'ok', name }] }), true);
  }
  assert.equal(validFeed({ ...feed, sources: [{ id: 'example', status: 'ok', name: {} }] }), false);
  assert.equal(validFeed({ ...feed, generatedAt: { toString: null } }), false);
});

test('upstream timeout, HTTP error, invalid JSON and oversized responses use a validated bundled snapshot', async () => {
  const originalFetch = globalThis.fetch;
  const failures = [
    () => { throw new DOMException('timed out', 'TimeoutError'); },
    () => new Response('', { status: 503 }),
    () => new Response('invalid'),
    () => new Response('x'.repeat(2_500_001)),
    () => Response.json({ version: 1 }),
    () => Response.json({ ...feed, items: [{}] }),
    () => Response.json({ ...feed, items: [{ title: 'Malformed date', url: 'https://example.com/article',
      publishedAt: { toString: null } }] }),
    () => Response.json({ ...feed, sources: [{ id: 'example', status: 'ok', name: { toString: null } }] }),
    () => Response.json({ ...feed, generatedAt: { toString: null } }),
  ];
  try {
    for (const failure of failures) {
      globalThis.fetch = async () => failure();
      const result = await feedResponse(request, { FEED_URL: 'https://raw.githubusercontent.com/example/feed.json',
        ASSETS: { fetch: async () => Response.json(feed) } }, { waitUntil() {} });
      assert.equal(result.status, 200);
      assert.equal(result.headers.get('X-Feed-Origin'), 'bundled-fallback');
      assert.deepEqual(await result.json(), feed);
    }
  } finally { globalThis.fetch = originalFetch; }
});

test('invalid or unavailable bundled snapshots return 503', async () => {
  for (const response of [new Response('invalid'), Response.json({ items: [] }), new Response('', { status: 404 })]) {
    const result = await feedResponse(request, { ASSETS: { fetch: async () => response } }, {});
    assert.equal(result.status, 503);
  }
});
