import test from 'node:test';
import assert from 'node:assert/strict';
import { canonicalUrl, cleanText, parseFeed, mergeItems, collect } from '../src/collector.js';
import { validFeed } from '../src/worker.js';

const now = new Date('2026-11-01T04:00:00Z');
const source = { id: 'sample', name: 'Sample', platform: '官方博客', category: 'AI 动态', type: 'rss', url: 'https://example.com/rss', limit: 10 };
const rss = `<?xml version="1.0"?><rss version="2.0"><channel><title>Example</title><item><title>Actual &amp; useful</title><link>https://example.com/post?utm_source=rss</link><description><![CDATA[<p>Short <b>summary</b></p>]]></description><pubDate>Sat, 31 Oct 2026 12:00:00 GMT</pubDate></item></channel></rss>`;

test('RSS keeps the original date, strips markup and tracking', () => {
  const [item] = parseFeed(rss, source, now);
  assert.equal(item.title, 'Actual & useful');
  assert.equal(item.summary, 'Short summary');
  assert.equal(item.url, 'https://example.com/post');
  assert.equal(item.publishedAt, '2026-10-31T12:00:00.000Z');
  assert.equal(item.collectedAt, now.toISOString());
});

test('Atom uses alternate link and publication date rather than retrieval date', () => {
  const atom = `<feed xmlns="http://www.w3.org/2005/Atom"><entry><title>Video</title><link rel="self" href="https://example.com/feed"/><link rel="alternate" href="https://www.youtube.com/watch?v=sample"/><published>2026-10-30T12:30:00Z</published><updated>2026-11-01T00:00:00Z</updated></entry></feed>`;
  const [item] = parseFeed(atom, source, now);
  assert.equal(item.url, 'https://www.youtube.com/watch?v=sample');
  assert.equal(item.publishedAt, '2026-10-30T12:30:00.000Z');
});

test('Unknown dates remain null, external entities and malformed XML are rejected', () => {
  const [item] = parseFeed(rss.replace(/<pubDate>.*?<\/pubDate>/, ''), source, now);
  assert.equal(item.publishedAt, null);
  assert.throws(() => parseFeed('<!DOCTYPE x [<!ENTITY data SYSTEM "file:///etc/passwd">]><rss/>', source, now));
  assert.throws(() => parseFeed('<rss><channel></rss>', source, now));
});

test('A future publication is excluded before normalization rather than turned into an unknown date', () => {
  const future = rss.replace('Sat, 31 Oct 2026 12:00:00 GMT', 'Tue, 10 Nov 2026 12:00:00 GMT');
  assert.deepEqual(parseFeed(future, source, now), []);
});

test('Unsafe links are refused and summaries never contain script bodies', () => {
  assert.equal(canonicalUrl('javascript:alert(1)'), null);
  assert.equal(canonicalUrl('https://user:password@example.com'), null);
  assert.equal(canonicalUrl('file:///etc/passwd'), null);
  assert.equal(cleanText('<script>bad()</script><p>Fact</p>'), 'Fact');
});

test('Merge deduplicates canonical URLs, rejects future dates and retains curated readings', () => {
  const old = { id: 'old', title: 'Old', url: 'https://example.com/post?utm_medium=web', publishedAt: '2026-10-30T00:00:00Z' };
  const readings = { title: 'Writing guide', kind: 'curated', url: 'https://example.com/style', publishedAt: '2025-01-01T00:00:00Z' };
  const future = { title: 'Future', url: 'https://example.com/future', publishedAt: '2026-11-10T00:00:00Z' };
  const fresh = { ...old, title: 'Updated', url: 'https://example.com/post' };
  const result = mergeItems([old, readings], [fresh, future], now);
  assert.equal(result.length, 2);
  assert.equal(result.find((item) => item.url === fresh.url).title, 'Updated');
});

test('A failed source retains the previous index and last successful timestamp', async () => {
  const previous = {
    items: [{ title: 'Keep me', sourceId: source.id, url: 'https://example.com/keep', publishedAt: '2026-10-31T00:00:00Z' }],
    sources: [{ id: source.id, lastSuccessAt: '2026-10-31T10:00:00Z' }],
  };
  const result = await collect({ previous, sources: [source], now,
    fetchImpl: async () => new Response('unavailable', { status: 503 }) });
  assert.equal(result.items.length, 1);
  assert.equal(result.sources[0].status, 'error');
  assert.equal(result.sources[0].lastSuccessAt, previous.sources[0].lastSuccessAt);
  assert.equal(result.collection.successfulSources, 0);
});

test('No X token produces a truthful pending state, without a network call', async () => {
  const result = await collect({ sources: [{ ...source, id: 'x-search', platform: 'X', type: 'x' }], now,
    fetchImpl: async () => { throw new Error('Should not fetch without credentials'); } });
  assert.equal(result.sources[0].status, 'needs_credentials');
  assert.equal(result.items.length, 0);
});

test('Worker accepts a complete bounded index and rejects invalid snapshots', () => {
  assert.equal(validFeed({ version: 1, generatedAt: now.toISOString(), sources: [], items: [] }), true);
  assert.equal(validFeed({ version: 1, generatedAt: 'unknown', sources: [], items: [] }), false);
  assert.equal(validFeed({ version: 1, generatedAt: now.toISOString(), sources: [], items: Array(451).fill({}) }), false);
});
