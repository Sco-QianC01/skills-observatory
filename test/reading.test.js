import test from "node:test";
import assert from "node:assert/strict";
import { parseQuery, searchArticles, selectHighlights, selectBriefs, externalSearches, recommendation, fold } from "../public/reading.js";

const now = Date.parse("2026-11-02T12:00:00+08:00");
const articles = [
  { id: "1", title: "Cubase audio workflow", summary: "MIDI editing", sourceId: "steinberg", sourceName: "Steinberg", platform: "官方公告", category: "音乐科技", topics: ["音乐制作"], url: "https://steinberg.net/1", publishedAt: "2026-11-01T00:00:00Z" },
  { id: "2", title: "Copyright for artists", summary: "A practical guide", sourceId: "wipo", sourceName: "WIPO", jurisdiction: "国际", category: "法律政策", topics: ["法律与版权"], url: "https://wipo.int/2", publishedAt: "2026-10-31T00:00:00Z" },
  { id: "3", title: "Finance news", sourceId: "hkma", sourceName: "香港金融管理局", category: "财经动态", topics: ["金融观察"], url: "https://hkma.gov.hk/3", publishedAt: "2026-11-02T00:00:00Z" },
  { id: "4", title: "Undated", url: "https://example.com/4", publishedAt: null },
  { id: "5", title: "Future", url: "https://example.com/5", publishedAt: "2026-11-04T00:00:00Z" },
  { id: "6", title: "香港新聞", category: "本地新闻", region: "hongkong", url: "https://info.gov.hk/6", publishedAt: "2026-11-01T00:00:00Z" },
];

test("search combines words, synonyms, exact phrases and exclusions", () => {
  assert.deepEqual(searchArticles(articles, { query: "Q贝斯 MIDI -video", now }).items.map(item => item.id), ["1"]);
  assert.equal(searchArticles(articles, { query: '"Cubase audio" -editing', now }).items.length, 0);
  assert.equal(searchArticles(articles, { query: "版權", now }).items[0].id, "2");
  assert.equal(searchArticles(articles, { query: "金融", now }).items[0].id, "3");
  assert.equal(searchArticles([{ ...articles[0], title: "bail" }], { query: "AI", now }).items.length, 0);
  assert.equal(fold("音樂與版權"), "音乐与版权");
});

test("source/topic and inclusive Beijing calendar date operators intersect filters", () => {
  assert.deepEqual(searchArticles(articles, { query: 'source:Steinberg topic:"音乐制作" after:2026-11-01 before:2026-11-01', now }).items.map(item => item.id), ["1"]);
  assert.equal(searchArticles(articles, { sourceId: "wipo", days: "7", now }).items.length, 1);
  assert.equal(searchArticles(articles, { platform: "GitHub", now }).items.length, 0);
  assert.ok(parseQuery("after:2026-02-31").errors.length);
  assert.ok(parseQuery("after:2026-11-02 before:2026-10-30").errors.length);
  assert.equal(searchArticles(articles, { query: "after:bad", now }).items.length, 0);
});

test("original dates, jurisdiction and local region remain distinct", () => {
  const result = searchArticles(articles, { region: "macau", now }).items;
  assert.deepEqual(result.map(item => item.id), ["3", "1", "2", "4"]);
  assert.equal(searchArticles(articles, { region: "hongkong", now }).items.some(item => item.id === "6"), true);
  assert.equal(searchArticles(articles, { days: "7", now }).items.some(item => item.id === "4"), false);
  assert.equal(searchArticles([{ ...articles[0], url: "javascript:alert(1)" }], { now }).items.length, 0);
});

test("malformed dates remain undated without interrupting search or ranking", () => {
  for (const publishedAt of [{ toString: null }, [], 1793577600000, false, "not a date"]) {
    const item = { ...articles[0], publishedAt };
    assert.equal(searchArticles([item], { now }).items.length, 1);
    assert.equal(searchArticles([item], { days: "7", now }).items.length, 0);
    assert.equal(searchArticles([item], { query: "after:2026-10-01", now }).items.length, 0);
    assert.ok(Number.isFinite(recommendation(item, undefined, now).score));
    assert.deepEqual(selectHighlights([item], undefined, now), []);
  }
});

test("highlights reflect actual interests, stay recent and diversify sources", () => {
  const support = { ...articles[0], id: "support", title: "VST3 MIDI issue with Ableton Live", platform: "技术社区", sourceId: "derivative", url: "https://forum.derivative.ca/123", publishedAt: "2026-11-02T00:00:00Z", topics: ["音乐制作", "实时交互", "视听艺术"] };
  const result = selectHighlights([...articles, support, { ...articles[0], id: "7", url: "https://steinberg.net/7" }], undefined, now);
  assert.equal(result[0].id, "1");
  assert.equal(new Set(result.map(item => item.sourceId)).size, result.length);
  assert.equal(result.some(item => ["5", "4", "support"].includes(item.id)), false);
  assert.equal(searchArticles([support], { now }).items.length, 1);
  assert.equal(recommendation(articles[0], ["音乐制作"], now).reason, "你关注的 Cubase");
  assert.equal(searchArticles(articles, { sort: "recommended", interests: ["金融观察"], now }).items[0].id, "3");
});

test("briefs cover finance, law and actionable calls without software permission noise", () => {
  const release = { id: "release", title: "Miniflux 2.3.5", summary: "grant or revoke the admin role", topics: ["机会与资助"], category: "工作流", sourceId: "miniflux", url: "https://github.com/miniflux/v2/releases/2.3.5", publishedAt: "2026-11-02T03:00:00Z" };
  const call = { ...release, id: "call", title: "音乐创作资助计划开放申请", sourceId: "macau-culture", category: "本地新闻", region: "macau", url: "https://www.icm.gov.mo/call" };
  const unrelated = { ...articles[1], id: "beauty", title: "Avoiding fake beauty products", sourceId: "uk-ipo", url: "https://gov.uk/beauty", publishedAt: "2026-11-02T03:30:00Z" };
  const result = selectBriefs([...articles, release, call, unrelated], "macau", now);
  assert.deepEqual(result.map(item => item.id), ["call", "2", "3"]);
  assert.equal(selectBriefs([call], "hongkong", now).length, 0);
});

test("external search is encoded and labelled as a destination", () => {
  const links = externalSearches('版权 & "AI"');
  assert.equal(links.length, 4);
  assert.equal(new URL(links[0].url).searchParams.get("q"), '版权 & "AI"');
  assert.deepEqual(externalSearches(" "), []);
});
