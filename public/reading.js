export const readingTopics = ["音乐制作", "AI 音乐", "实时交互", "视听艺术", "空间音频", "写作与研究", "金融观察", "法律与版权", "机会与资助"];
export const readingTools = ["Cubase", "Kontakt", "Ableton Live", "Max/MSP", "TouchDesigner", "ACE Studio"];

const aliases = [
  ["cubase", "q贝斯", "q貝斯"],
  ["kontakt", "康泰克"],
  ["ableton", "ableton live"],
  ["max/msp", "maxmsp"],
  ["touchdesigner", "td"],
  ["版权", "copyright"],
  ["知识产权", "intellectual property"],
  ["金融", "finance", "financial"],
  ["人工智能", "artificial intelligence", "ai"],
  ["工作流", "workflow"],
  ["资助", "funding", "grant"],
];
const traditional = Object.fromEntries([..."樂術實時視聽寫與觀察權機會資助開關鍵詞學習軟體碼錄訊財經監管規則"].map((char, index) => [char, [..."乐术实时视听写与观察权机会资助开关键词学习软体码录讯财经监管规则"][index]]));

export function fold(value) {
  return String(value || "").normalize("NFKC").toLowerCase().replace(/[樂術實時視聽寫與觀察權機會資助開關鍵詞學習軟體碼錄訊財經監管規則]/g, char => traditional[char]);
}

export function safeUrl(value) {
  try {
    const url = new URL(String(value));
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}

function dateBoundary(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const time = Date.parse(`${value}T00:00:00+08:00`);
  return Number.isFinite(time) && new Date(time + 28_800_000).toISOString().slice(0, 10) === value ? time : null;
}

export function parseQuery(query) {
  const parsed = { terms: [], after: null, before: null, errors: [] };
  const pattern = /(-?)(?:(source|topic|after|before):)?(?:"([^"]+)"|([^\s"]+))/gi;
  for (const match of String(query || "").slice(0, 300).matchAll(pattern)) {
    const [, excluded, field = "", phrase, word] = match;
    const value = phrase || word;
    if (["after", "before"].includes(field.toLowerCase())) {
      const boundary = dateBoundary(value);
      if (boundary === null || excluded) parsed.errors.push(`${field} 请使用 YYYY-MM-DD 格式的日期。`);
      else if (field.toLowerCase() === "after") parsed.after = Math.max(parsed.after ?? -Infinity, boundary);
      else parsed.before = Math.min(parsed.before ?? Infinity, boundary + 86_400_000);
    } else {
      parsed.terms.push({ field: field.toLowerCase(), value: fold(value), excluded: Boolean(excluded), exact: Boolean(phrase) });
    }
  }
  if (parsed.after !== null && parsed.before !== null && parsed.after >= parsed.before) parsed.errors.push("起始日期应早于结束日期。");
  return parsed;
}

function includesTerm(text, term) {
  if (term.exact) return text.includes(term.value);
  const group = aliases.find(values => values.includes(term.value));
  return (group || [term.value]).some(value => value.length <= 2 && /^[a-z]+$/.test(value)
    ? new RegExp(`(^|[^a-z0-9])${value}([^a-z0-9]|$)`, "i").test(text)
    : text.includes(value));
}

function textFields(item) {
  return {
    title: fold(item.title),
    source: fold([item.sourceName, item.sourceId, item.platform, item.url].filter(Boolean).join(" ")),
    topic: fold([...(Array.isArray(item.topics) ? item.topics : []), ...(Array.isArray(item.tags) ? item.tags : []), item.category].filter(Boolean).join(" ")),
    body: fold([item.summary, item.author, item.jurisdiction, ...(Array.isArray(item.workflow) ? item.workflow : [])].filter(Boolean).join(" ")),
  };
}

function publishedTime(item) {
  return typeof item.publishedAt === "string" ? Date.parse(item.publishedAt) : NaN;
}

export function recommendation(item, interests = readingTopics, now = Date.now()) {
  const fields = textFields(item);
  const topics = Array.isArray(item.topics) ? item.topics.filter(topic => interests.includes(topic)) : [];
  const followsMusicTools = interests.some(topic => ["音乐制作", "AI 音乐", "实时交互", "视听艺术", "空间音频"].includes(topic));
  const tool = followsMusicTools ? readingTools.find(name => includesTerm(`${fields.title} ${fields.body} ${fields.source}`, { value: fold(name) })) : null;
  const time = publishedTime(item);
  const age = Number.isFinite(time) ? Math.max(0, (now - time) / 86_400_000) : 180;
  const score = (topics.length ? 12 + Math.min(topics.length, 3) * 2 : 0) + (tool ? 15 : 0)
    + Math.max(0, 20 - age * 0.7) + (item.category === "音乐科技" && interests.includes("音乐制作") ? 6 : 0);
  return { score, reason: tool ? `你关注的 ${tool}` : topics.length ? `与你关注的「${topics[0]}」相关` : "近期收录" };
}

export function searchArticles(items, options = {}) {
  const { query = "", category = "全部", topic = "", platform = "", sourceId = "", region = "macau", days = "", sort = "newest", interests = readingTopics, now = Date.now() } = options;
  const parsed = parseQuery(query);
  if (parsed.errors.length) return { items: [], errors: parsed.errors };
  const matches = [];
  for (const item of items) {
    if (!item || !safeUrl(item.url) || !item.title) continue;
    if (category !== "全部" && item.category !== category) continue;
    if (item.category === "本地新闻" && item.region !== region) continue;
    if (topic && !(Array.isArray(item.topics) && item.topics.includes(topic))) continue;
    if (platform && item.platform !== platform) continue;
    if (sourceId && item.sourceId !== sourceId) continue;
    const time = publishedTime(item);
    if (Number.isFinite(time) && time > now + 300_000) continue;
    if (days && (!Number.isFinite(time) || time < now - Number(days) * 86_400_000)) continue;
    if (parsed.after !== null && (!Number.isFinite(time) || time < parsed.after)) continue;
    if (parsed.before !== null && (!Number.isFinite(time) || time >= parsed.before)) continue;
    const fields = textFields(item);
    let relevance = 0;
    let accepted = true;
    for (const term of parsed.terms) {
      const targeted = term.field ? fields[term.field] : Object.values(fields).join(" ");
      const found = includesTerm(targeted || "", term);
      if (term.excluded ? found : !found) { accepted = false; break; }
      if (!term.excluded) relevance += includesTerm(fields.title, term) ? 8 : 1;
    }
    if (accepted) matches.push({ item, time: Number.isFinite(time) ? time : null, relevance, preference: recommendation(item, interests, now).score });
  }
  matches.sort((a, b) => {
    if (sort === "relevance" && a.relevance !== b.relevance) return b.relevance - a.relevance;
    if (sort === "recommended" && a.preference !== b.preference) return b.preference - a.preference;
    if (a.time === null || b.time === null) return a.time === b.time ? 0 : a.time === null ? 1 : -1;
    return sort === "oldest" ? a.time - b.time : b.time - a.time;
  });
  return { items: matches.map(match => match.item), errors: [] };
}

export function selectHighlights(items, interests = readingTopics, now = Date.now(), region = "macau") {
  const recent = searchArticles(items, { days: "30", sort: "recommended", interests, now, region }).items
    .filter(item => item.kind !== "curated" && !["技术社区", "Hacker News", "X"].includes(item.platform)
      && item.category !== "社区热议" && recommendation(item, interests, now).score > 20);
  const selected = [];
  for (const item of recent) {
    if (selected.some(entry => entry.url === item.url || entry.sourceId === item.sourceId)) continue;
    if (selected.some(entry => entry.category === item.category) && recent.some(entry => !selected.some(chosen => chosen.category === entry.category))) continue;
    selected.push(item);
    if (selected.length === 3) break;
  }
  return selected;
}

export function selectBriefs(items, region = "macau", now = Date.now()) {
  const relevant = /\bai\b|agentic|copyright|creators?|artists?|music|fintech|intellectual property|人工智能|版权|版權|创作|創作|金融科技|资助|資助|征集|徵集|驻留|駐留/i;
  const candidates = searchArticles(items, { days: "30", region, now }).items
    .filter(item => ["财经动态", "法律政策"].includes(item.category)
      || /(?:funding|grant) (?:opportunit|application|call)|open call|fellowship|scholarship|资助|資助|征集|徵集|驻留|駐留|奖学金|獎學金/i.test(item.title))
    .sort((a, b) => Number(relevant.test(b.title)) - Number(relevant.test(a.title)));
  const chosen = [];
  for (const item of candidates) {
    if (chosen.some(entry => entry.sourceId === item.sourceId)) continue;
    if (chosen.some(entry => entry.category === item.category) && candidates.some(entry => !chosen.some(pick => pick.category === entry.category))) continue;
    chosen.push(item);
    if (chosen.length === 3) break;
  }
  return chosen;
}

export function externalSearches(query) {
  const value = String(query || "").trim().slice(0, 300);
  if (!value) return [];
  return [
    { name: "GitHub", url: `https://github.com/search?type=repositories&q=${encodeURIComponent(value)}` },
    { name: "YouTube", url: `https://www.youtube.com/results?search_query=${encodeURIComponent(value)}` },
    { name: "X", url: `https://x.com/search?f=live&q=${encodeURIComponent(value)}` },
    { name: "新闻", url: `https://news.google.com/search?q=${encodeURIComponent(value)}&hl=zh-CN&gl=HK&ceid=HK:zh-Hans` },
  ];
}
