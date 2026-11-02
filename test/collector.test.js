import test from 'node:test';
import assert from 'node:assert/strict';
import { canonicalUrl, cleanText, parseFeed, mergeItems, collect, classifyTopics } from '../src/collector.js';
import { validFeed } from '../src/worker.js';
import { SOURCES } from '../src/sources.js';

test('Topic inference rejects permission grants and names containing ai', () => {
  assert(!classifyTopics({ title: 'v2 Miniflux 2.3.5', summary: 'OpenID Connect: grant or revoke the admin role at login.' }).includes('机会与资助'));
  assert(!classifyTopics({ title: 'Carmen Villain: Music Is A Cracked Mirror' }).includes('AI 音乐'));
  assert(classifyTopics({ title: 'AI music generation with Suno' }).includes('AI 音乐'));
  assert(classifyTopics({ title: 'Research grant applications now open' }).includes('机会与资助'));
  assert(classifyTopics({ title: '藝術資助計劃接受申請' }).includes('机会与资助'));
});

test('Topic inference uses cleaned bounded summaries and ignores markup attributes', () => {
  assert.deepEqual(classifyTopics({ title: 'A release', summary: '<p title="copyright funding">Fixed bug.</p>' }), []);
  assert.deepEqual(classifyTopics({ title: 'A release', summary: `${'Ordinary update. '.repeat(30)}<footer>Copyright research grants</footer>` }), []);
  assert(!classifyTopics({ title: '记忆沙龙公众讲座', summary: '回顾历史中的社会、经济及城市发展。' }).includes('金融观察'));
});

test('Automatic and browser topics are recomputed while curated topics remain explicit', () => {
  for (const kind of ['collected', 'browser']) {
    assert.deepEqual(classifyTopics({ title: 'Release', summary: 'Fixed bug', kind, topics: ['机会与资助'] }), []);
  }
  assert.deepEqual(classifyTopics({ title: 'Reading', kind: 'curated', topics: ['机会与资助'] }), ['机会与资助']);
  assert.deepEqual(classifyTopics({ title: 'Notice' }, { topics: ['金融观察'] }), ['金融观察']);
});

test('Broad official sources do not force opportunity or music topics', () => {
  const dsit = SOURCES.find(source => source.id === 'uk-dsit');
  const wipo = SOURCES.find(source => source.id === 'wipo-news');
  assert.deepEqual(classifyTopics({ title: 'Transparency data: DSIT: spending over £500, June 2026' }, dsit), []);
  assert.deepEqual(classifyTopics({ title: 'WIPO Names Charleroi, Liverpool and Shanghai as First City of Innovation Award Winners' }, wipo), ['法律与版权']);
});

test('Historical topics are removed after a failed automatic collection without changing dates', async () => {
  const cached = { title: 'Release', summary: 'Fixed bug', kind: 'collected', sourceId: 'sample',
    url: 'https://example.com/release', topics: ['机会与资助'], publishedAt: '2026-10-31T00:00:00Z', collectedAt: '2026-10-31T01:00:00Z' };
  const result = await collect({ previous: { items: [cached], sources: [] }, sources: [{ id: 'sample', name: 'Sample', type: 'rss', url: 'https://example.com/feed' }],
    now: new Date('2026-11-01T04:00:00Z'), fetchImpl: async () => new Response('', { status: 404 }) });
  assert.deepEqual(result.items[0].topics, []);
  assert.equal(result.items[0].collectedAt, cached.collectedAt);
  assert.equal(result.items[0].publishedAt, cached.publishedAt);
});

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
  assert.equal(item.dateLabel, '原文');
  const [updatedOnly] = parseFeed(atom.replace(/<published>.*?<\/published>/, ''), source, now);
  assert.equal(updatedOnly.publishedAt, '2026-11-01T00:00:00.000Z');
  assert.equal(updatedOnly.dateLabel, '更新');
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

test('Browser selections are normalized and never reported as automatic collection success', async () => {
  const xSource = { ...source, id: 'x-search', platform: 'X', type: 'x' };
  const raw = { sourceId: xSource.id, title: '<b>Public post</b>', url: 'https://x.com/example/status/1?utm_source=web',
    summary: '<script>unsafe()</script><p>Short finding</p>', publishedAt: '2026-10-31T00:00:00Z' };
  const result = await collect({ sources: [xSource], now, browserState: { readOn: '2026-11-01' },
    browserItems: [raw, { ...raw, url: 'javascript:alert(1)' },
      { ...raw, url: 'https://x.com/example/status/2', publishedAt: '2026-11-10T00:00:00Z' }],
    previous: { sources: [{ id: xSource.id, status: 'cached', lastSuccessAt: '2026-11-01T01:00:00Z' }] },
    fetchImpl: async () => { throw new Error('No API token'); } });
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].title, 'Public post');
  assert.equal(result.items[0].summary, 'Short finding');
  assert.equal(result.items[0].url, 'https://x.com/example/status/1');
  assert.equal(result.items[0].kind, 'browser');
  assert.equal(result.items[0].browserReadOn, '2026-11-01');
  assert.equal(result.sources[0].lastSuccessAt, null);
  assert.equal(result.sources[0].manualReadOn, '2026-11-01');
  assert.equal(result.sources[0].status, 'cached');
  assert.equal(result.collection.successfulSources, 0);
});

test('X retains its real API success through an error and repeated browser-only collections', async () => {
  const xSource = { ...source, id: 'x-search', platform: 'X', type: 'x' };
  const options = { sources: [xSource], now };
  const success = await collect({ ...options, xBearer: 'test-only',
    fetchImpl: async () => Response.json({ data: [{ id: '1', text: 'Public workflow', created_at: '2026-10-31T00:00:00Z' }] }) });
  const failed = await collect({ ...options, previous: success, xBearer: 'test-only',
    fetchImpl: async () => new Response('unavailable', { status: 503 }) });
  const browserItems = [{ sourceId: xSource.id, title: 'Manual selection', url: 'https://x.com/example/status/2',
    publishedAt: '2026-10-31T00:00:00Z' }];
  const first = await collect({ ...options, previous: failed, browserItems });
  const second = await collect({ ...options, previous: first, browserItems });
  for (const result of [success, failed, first, second]) {
    assert.equal(result.sources[0].lastAutomaticSuccessAt, now.toISOString());
    assert.equal(result.sources[0].lastSuccessAt, now.toISOString());
  }
  assert.equal(second.sources[0].status, 'cached');
  assert.equal(second.collection.successfulSources, 0);
});

test('Worker accepts a complete bounded index and rejects invalid snapshots', () => {
  assert.equal(validFeed({ version: 1, generatedAt: now.toISOString(), sources: [], items: [] }), true);
  assert.equal(validFeed({ version: 1, generatedAt: 'unknown', sources: [], items: [] }), false);
  assert.equal(validFeed({ version: 1, generatedAt: now.toISOString(), sources: [], items: Array(451).fill({}) }), false);
});

test('transient HTTP failures retry once and permanent errors do not retry', async () => {
  for (const status of [503, 429, 404]) {
    let calls = 0;
    const result = await collect({ sources: [source], now, fetchImpl: async () => {
      calls++;
      return calls === 1 ? new Response('', { status }) : new Response(rss);
    } });
    assert.equal(calls, status === 503 ? 2 : 1);
    assert.equal(result.sources[0].status, status === 503 ? 'ok' : 'error');
  }
});

test('a short connection failure retries once', async () => {
  let calls = 0;
  const result = await collect({ sources: [source], now, fetchImpl: async () => {
    if (++calls === 1) throw new TypeError('fetch failed');
    return new Response(rss);
  } });
  assert.equal(calls, 2);
  assert.equal(result.sources[0].status, 'ok');
});

test('a connection failure while reading the response body retries within the same timeout budget', async () => {
  let calls = 0;
  const signals = [];
  const result = await collect({ sources: [source], now, fetchImpl: async (url, options) => {
    signals.push(options.signal);
    if (++calls > 1) return new Response(rss);
    return new Response(new ReadableStream({
      start(controller) { controller.enqueue(new TextEncoder().encode('<rss>')); },
      pull(controller) { controller.error(new TypeError('terminated')); },
    }));
  } });
  assert.equal(calls, 2);
  assert.equal(signals[0], signals[1]);
  assert.equal(result.sources[0].status, 'ok');
  assert.equal(result.items.length, 1);
});

test('oversized bodies and malformed XML do not trigger network retries', async () => {
  for (const body of ['x'.repeat(2_500_001), '<rss>']) {
    let calls = 0;
    const result = await collect({ sources: [source], now, fetchImpl: async () => {
      calls++;
      return new Response(body);
    } });
    assert.equal(calls, 1);
    assert.equal(result.sources[0].status, 'error');
  }
});

test('a broken primary feed uses its configured fallback and reports provenance', async () => {
  const result = await collect({ sources: [{ ...source, fallbackUrls: ['https://example.com/alternate'] }], now,
    fetchImpl: async url => new Response(url.endsWith('/alternate') ? rss : '<rss>') });
  assert.equal(result.sources[0].status, 'fallback');
  assert.equal(result.sources[0].fallbackUrl, 'https://example.com/alternate');
  assert.equal(result.sources[0].lastSuccessAt, now.toISOString());
  assert.equal(result.sources[0].latestPublishedAt, '2026-10-31T12:00:00.000Z');
});

test('GitHub future dates remain excluded and a release feed can recover empty results', async () => {
  const gitSource = { ...source, type: 'github', query: 'topic:sample', fallbackFeeds: ['https://example.com/releases.atom'] };
  const result = await collect({ sources: [gitSource], now, fetchImpl: async url =>
    url.includes('api.github.com') ? Response.json({ items: [{ full_name: 'sample/repo', html_url: 'https://github.com/sample/repo',
      pushed_at: '2026-12-01T00:00:00Z' }] }) : new Response(rss) });
  assert.equal(result.sources[0].status, 'fallback');
  assert.match(result.sources[0].primaryError, /未来日期 1/);
  assert.equal(result.items.length, 1);
});

test('Atom blogs retain content and categories without acquiring video tags', () => {
  const [item] = parseFeed(`<feed><entry><title>Article</title><link href="https://example.com/article"/>
    <content type="html">&lt;p&gt;Original content&lt;/p&gt;</content><category term="Research"/></entry></feed>`, source, now);
  assert.equal(item.summary, 'Original content');
  assert.deepEqual(item.tags, ['Research']);
});

test('bounded merge retains curated work and allocates space across sources', () => {
  const make = (sourceId, index) => ({ sourceId, title: `${sourceId} ${index}`, url: `https://example.com/${sourceId}/${index}`,
    publishedAt: sourceId === 'quiet' ? '2026-10-01T00:00:00Z' : '2026-10-31T00:00:00Z' });
  const items = mergeItems([], [...Array.from({ length: 500 }, (_, i) => make('busy', i)),
    ...Array.from({ length: 10 }, (_, i) => make('quiet', i)), { ...make('guide', 1), kind: 'curated', publishedAt: '2020-01-01T00:00:00Z' }], now);
  assert.equal(items.length, 450);
  assert.equal(items.filter(item => item.sourceId === 'quiet').length, 10);
  assert.equal(items.filter(item => item.kind === 'curated').length, 1);
});

test('failed primary and fallback feeds preserve retained records and successful timestamp', async () => {
  const previous = { items: [{ title: 'Keep', sourceId: source.id, url: 'https://example.com/keep',
    publishedAt: '2026-10-31T00:00:00Z' }], sources: [{ id: source.id, lastSuccessAt: '2026-10-31T10:00:00Z' }] };
  const result = await collect({ previous, sources: [{ ...source, jurisdiction: '澳门', fallbackUrls: ['https://example.com/backup'] }],
    now, fetchImpl: async () => new Response('unavailable', { status: 503 }) });
  assert.equal(result.sources[0].lastSuccessAt, previous.sources[0].lastSuccessAt);
  assert.equal(result.sources[0].retainedCount, 1);
  assert.equal(result.sources[0].availableCount, 1);
  assert.equal(result.items[0].jurisdiction, '澳门');
});

test('available count reflects retention after a successful old RSS fetch', async () => {
  const oldRss = rss.replace('Sat, 31 Oct 2026 12:00:00 GMT', 'Tue, 31 Mar 2026 12:00:00 GMT');
  const result = await collect({ sources: [source], now, fetchImpl: async () => new Response(oldRss) });
  assert.equal(result.sources[0].status, 'ok');
  assert.equal(result.sources[0].count, 1);
  assert.equal(result.sources[0].availableCount, 0);
  assert.equal(result.items.length, 0);
});

test('public finance, law and opportunity terms map to reading topics', () => {
  const topics = classifyTopics({ title: 'Central bank regulation copyright funding grants' });
  for (const topic of ['金融观察', '法律与版权', '机会与资助']) assert.ok(topics.includes(topic));
});
