import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanText, classifyTopics, collect, localDay, mergeEvents, parseFeedEntries } from '../src/collector.js';
import { parseCalendarEvents } from '../src/regional.js';
import { validFeed } from '../src/worker.js';

const now = new Date('2026-11-01T08:00:00Z');
const source = { id: 'events', name: 'Official events', platform: '官方活动', type: 'event-rss',
  scope: '活动', region: 'macau', url: 'https://example.com/calendar', allowEmpty: true, limit: 20 };
const event = { title: 'Music workshop', url: 'https://example.com/event', startsOn: '2026-11-03', endsOn: '2026-11-03',
  sourceId: source.id, sourceName: source.name, platform: source.platform, region: source.region,
  publishedAt: '2026-10-28T00:00:00+08:00' };
const rss = entries => `<rss version="2.0"><channel>${entries.map(entry => `<item><title>${entry.title}</title>
  <link>${entry.url || event.url}</link><description><![CDATA[${entry.summary}]]></description>
  <pubDate>${entry.publishedAt || event.publishedAt}</pubDate></item>`).join('')}</channel></rss>`;

test('event expiry follows the local UTC+8 date and retains the full final day', () => {
  assert.equal(localDay(new Date('2026-11-01T15:59:59Z')), '2026-11-01');
  assert.equal(localDay(new Date('2026-11-01T16:00:00Z')), '2026-11-02');
  const endingToday = { ...event, startsOn: '2026-11-01', endsOn: '2026-11-01' };
  assert.equal(mergeEvents([], [endingToday], new Date('2026-11-01T15:59:59Z')).length, 1);
  assert.equal(mergeEvents([], [endingToday], new Date('2026-11-01T16:00:00Z')).length, 0);
});

test('calendar text tolerates official control references and decodes nested escaped markup safely', () => {
  assert.equal(cleanText('&amp;lt;![CDATA[&amp;lt;p&amp;gt;展览&amp;lt;/p&amp;gt;]]&amp;gt;<script>bad()</script>'), '展览');
  const xml = rss([{ title: '展覽&#xB;', summary: '[2026年11月3日] 地點：展覽館 地址：街道' }]);
  const entries = parseFeedEntries(xml, { calendar: true });
  const [result] = parseCalendarEvents(entries, source, cleanText);
  assert.equal(result.title, '展覽');
  assert.equal(result.venue, '展覽館');
  assert.throws(() => parseFeedEntries('<!DOCTYPE x [<!ENTITY a "x">]><rss/>', { calendar: true }));
});

test('personal reading topics use public interests and ignore arbitrary profile labels', () => {
  assert.deepEqual(classifyTopics({ title: 'Cubase MIDI and Kontakt', tags: [] }), ['音乐制作']);
  const topics = classifyTopics({ title: 'TouchDesigner OSC and spatial audio', topics: ['private note'] });
  assert.deepEqual(topics, ['实时交互', '视听艺术', '空间音频']);
  assert.deepEqual(classifyTopics({ title: 'Guide', category: '写作与编辑' }), ['写作与研究']);
});

test('events preserve distinct performances and long-running exhibitions while rejecting invalid records', () => {
  const longRunning = { ...event, title: '长期展览', startsOn: '2024-11-28', endsOn: '2026-11-08', publishedAt: '2024-11-01T00:00:00Z' };
  const other = { ...event, title: '另一场音乐会' };
  const nextDay = { ...event, startsOn: '2026-11-04', endsOn: '2026-11-04' };
  const invalid = [
    { ...event, endsOn: '2026-10-30' },
    { ...event, startsOn: '2026-02-29' },
    { ...event, publishedAt: '2026-11-20T00:00:00Z' },
    { ...event, url: 'javascript:alert(1)' },
    { ...event, url: 'https://user:password@example.com/event' },
  ];
  const result = mergeEvents([event], [event, other, nextDay, longRunning, ...invalid], now);
  assert.equal(result.length, 4);
  assert.equal(new Set(result.map(item => item.id)).size, 4);
  assert.ok(result.some(item => item.title === '长期展览'));
  const entries = [event, other, event].map(item => ({ ...item, summary: '[2026年11月3日]' }));
  assert.equal(parseCalendarEvents(entries, source, cleanText).length, 2);
});

test('collection separates publication, event dates and news retention', async () => {
  const xml = rss([
    { title: '过去的活动', summary: '[2026年4月1日] 地點：旧场地', publishedAt: '2026-11-01T00:00:00Z' },
    { title: 'AI 音樂工作坊', summary: '[2026年11月11日] 地點：展览馆 地址：某街' },
    { title: '长期展览', summary: '[2024年11月28日至2026年11月8日]', publishedAt: '2024-11-01T00:00:00Z' },
    { title: '未来发布日期', summary: '[2026年11月11日]', publishedAt: '2026-11-20T00:00:00Z' },
  ]);
  const result = await collect({ sources: [source], now, fetchImpl: async () => new Response(xml) });
  assert.equal(result.items.length, 0);
  assert.equal(result.events.length, 2);
  assert.equal(result.collection.eventCount, 2);
  const workshop = result.events.find(item => item.title === 'AI 音樂工作坊');
  assert.equal(workshop.startsOn, '2026-11-11');
  assert.equal(workshop.publishedAt, '2026-10-27T16:00:00.000Z');
  assert.ok(workshop.topics.includes('AI 音乐'));
  assert.equal(result.sources[0].status, 'ok');
});

test('a failed event source retains current activities and its actual successful timestamp', async () => {
  const previous = { events: [event, { ...event, title: 'Expired', startsOn: '2026-10-30', endsOn: '2026-10-30' }],
    sources: [{ id: source.id, lastSuccessAt: '2026-10-31T10:00:00Z' }] };
  const result = await collect({ sources: [source], previous, now, fetchImpl: async () => new Response('', { status: 503 }) });
  assert.equal(result.events.length, 1);
  assert.equal(result.sources[0].status, 'error');
  assert.equal(result.sources[0].lastSuccessAt, previous.sources[0].lastSuccessAt);
  assert.equal(result.collection.successfulSources, 0);
});

test('keyword-filtered regional news can truthfully return no relevant stories and enrich cached records', async () => {
  const newsSource = { ...source, id: 'news', type: 'rss', scope: '文化与科技', category: '本地新闻', keywords: ['音乐'] };
  const previous = { items: [{ title: 'Kontakt workshop', sourceId: 'news', category: '本地新闻',
    url: 'https://example.com/cached', publishedAt: '2026-10-30T00:00:00Z' }] };
  const result = await collect({ sources: [newsSource], previous, now,
    fetchImpl: async () => new Response(rss([{ title: '无关资讯', summary: '其他话题' }])) });
  assert.equal(result.sources[0].status, 'ok');
  assert.equal(result.sources[0].count, 0);
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].region, 'macau');
  assert.ok(result.items[0].topics.includes('音乐制作'));
});

test('formal music releases use published_at and exclude drafts, prereleases and moving latest tags', async () => {
  const releaseSource = { ...source, id: 'link', type: 'releases', scope: '音乐科技', category: '音乐科技', repository: 'Ableton/link' };
  const releases = [
    { name: '4.1.1', tag_name: '4.1.1', body: 'MIDI integration', html_url: 'https://github.com/Ableton/link/releases/tag/4.1.1',
      created_at: '2026-10-01T00:00:00Z', published_at: '2026-10-19T08:53:05Z' },
    { tag_name: 'preview', prerelease: true }, { tag_name: 'draft', draft: true }, { tag_name: 'latest' },
  ];
  const result = await collect({ sources: [releaseSource], now, fetchImpl: async () => Response.json(releases) });
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].publishedAt, '2026-10-19T08:53:05.000Z');
  assert.equal(result.items[0].dateLabel, '正式发行');
  assert.equal(result.items[0].title, 'link 4.1.1');
});

test('worker remains compatible with old feeds and bounds new event snapshots', () => {
  const feed = { version: 1, generatedAt: now.toISOString(), sources: [], items: [] };
  assert.equal(validFeed(feed), true);
  assert.equal(validFeed({ ...feed, events: [], regions: [] }), true);
  assert.equal(validFeed({ ...feed, events: {} }), false);
  assert.equal(validFeed({ ...feed, events: Array(121).fill(event) }), false);
  assert.equal(validFeed({ ...feed, regions: 'macau' }), false);
});
