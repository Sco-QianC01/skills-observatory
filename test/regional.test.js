import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseEventDates, parseRegionalNews, parseEventTable, parseCalendarEvents } from '../src/regional.js';

const clean = (value, limit = 260) => String(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, limit);
const fixture = name => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8');

test('event dates validate calendar days and explicit ranges', () => {
  assert.deepEqual(parseEventDates('2024年11月28日至2026年11月8日'), [{ startsOn: '2024-11-28', endsOn: '2026-11-08' }]);
  assert.deepEqual(parseEventDates('2026年4月25日至12月31日'), [{ startsOn: '2026-04-25', endsOn: '2026-12-31' }]);
  assert.equal(parseEventDates('11月14及15日').length, 2);
  assert.deepEqual(parseEventDates('11月8日至12月31日'), [{ startsOn: '2026-11-08', endsOn: '2026-12-31' }]);
  assert.deepEqual(parseEventDates('2026年4月1日 週三'), [{ startsOn: '2026-04-01', endsOn: '2026-04-01' }]);
  for (const value of ['2026年2月29日', '11月31日', '13月1日', '11月8日至11月7日', 'junk11月8日']) assert.deepEqual(parseEventDates(value), []);
});

test('real ICM homepage and event table preserve separate performances', () => {
  const news = parseRegionalNews(fixture('icm-news.html'), { type: 'icm-news', url: 'https://www.icm.gov.mo/cn/' }, clean);
  assert.ok(news.some(entry => entry.url.endsWith('/25185') && entry.publishedAt.startsWith('2026-10-28')));
  const events = parseEventTable(fixture('icm-hush-table.html'), { url: 'https://www.icm.gov.mo/cn/news/detail/25185', year: 2026 }, clean);
  assert.ok(events.length >= 18);
  assert.equal(events.filter(entry => entry.title === '低窪供電派對').length, 2);
  assert.ok(events.find(entry => entry.title.includes('AI')).timeText.includes('18:00-22:00'));
  assert.ok(events.find(entry => entry.title === '中東鼓體驗班').timeText.includes('16:00-17:00'));
});

test('calendar description dates take precedence over publication and deduplicate', () => {
  const entry = { title: '閱進生活', url: '/cn/events/detail/11616', summary: '[2026年4月25日至12月31日 ] 地點：澳門文學館 地址：澳門荷蘭園大馬路95號', publishedAt: '2026-11-01T00:00:00Z' };
  const events = parseCalendarEvents([entry, entry], { url: 'https://www.icm.gov.mo/' }, clean);
  assert.equal(events.length, 1);
  assert.equal(events[0].startsOn, '2026-04-25');
  assert.equal(events[0].venue, '澳門文學館');
  assert.equal(parseCalendarEvents([{ ...entry, summary: '[2026年2月29日]' }], { url: 'https://www.icm.gov.mo/' }, clean).length, 0);
});

test('Zhuhai list uses full title attribute and local publication day', () => {
  const entries = parseRegionalNews('<li><span>[2026-11-01]</span><a href="/xw/content/post_123.html" title="完整标题">完整...</a></li>', { type: 'zhuhai-news', url: 'https://www.zhuhai.gov.cn/' }, clean);
  assert.equal(entries[0].title, '完整标题');
  assert.equal(entries[0].publishedAt, '2026-11-01T00:00:00+08:00');
  assert.equal(entries[0].datePrecision, 'day');
});
