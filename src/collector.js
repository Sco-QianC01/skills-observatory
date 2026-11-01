import { createHash } from 'node:crypto';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { SOURCES, SCHEDULE, READING_PROFILE, REGIONS } from './sources.js';
import { parseRegionalNews, parseEventTable, parseCalendarEvents } from './regional.js';

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_', processEntities: true });
const MAX_BODY = 2_500_000;
const RETENTION_DAYS = 90;
const asArray = (value) => value == null ? [] : Array.isArray(value) ? value : [value];
const text = (value) => typeof value === 'object' && value !== null ? String(value['#text'] ?? '') : String(value ?? '');

export function cleanText(value, limit = 260) {
  const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—',
    lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', hellip: '…', middot: '·', bull: '•', times: '×' };
  let decoded = text(value);
  for (let pass = 0; pass < 3; pass++) {
    decoded = decoded.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (whole, entity) => {
      if (!entity.startsWith('#')) return entities[entity.toLowerCase()] ?? whole;
      const point = entity[1]?.toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1));
      return point > 0 && point <= 0x10ffff && !(point >= 0xd800 && point <= 0xdfff) ? String.fromCodePoint(point) : '';
    });
  }
  return decoded.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
    .replace(/\s+/g, ' ').trim().slice(0, limit);
}

export function canonicalUrl(value) {
  try {
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return null;
    url.hash = '';
    for (const key of [...url.searchParams.keys()]) {
      if (/^utm_|^fbclid$|^gclid$/i.test(key)) url.searchParams.delete(key);
    }
    return url.href;
  } catch { return null; }
}

export function validDate(value, now = new Date()) {
  const date = Date.parse(value);
  return Number.isFinite(date) && date <= now.getTime() + 300_000 ? new Date(date).toISOString() : null;
}

function normalize(raw, source, now) {
  const url = canonicalUrl(raw.url);
  const title = cleanText(raw.title, 220);
  if (!url || !title || Date.parse(raw.publishedAt) > now.getTime() + 300_000) return null;
  return {
    ...raw, id: createHash('sha256').update(url).digest('hex').slice(0, 20),
    title, summary: cleanText(raw.summary), url,
    platform: source.platform, sourceId: source.id, sourceName: source.name, category: raw.category || source.category,
    publishedAt: validDate(raw.publishedAt, now), collectedAt: now.toISOString(),
    tags: asArray(raw.tags).map((tag) => cleanText(tag, 36)).filter(Boolean).slice(0, 6),
    kind: raw.kind || 'collected', dateLabel: raw.dateLabel || source.dateLabel || '原文',
    topics: classifyTopics(raw, source), ...(source.region ? { region: source.region } : {}),
  };
}

export function classifyTopics(item, source = {}) {
  const content = [item.title, item.summary, ...(item.tags || [])].join(' ').toLowerCase();
  const topics = new Set([...(source.topics || []), ...(item.topics || [])].filter((topic) => READING_PROFILE.topics.includes(topic)));
  const rules = [
    ['音乐制作', /\b(cubase|nuendo|kontakt|ableton|daw|midi|sampler|synth|mixing|mastering)\b|音乐制作|音樂製作|采样|採樣|编曲|編曲/],
    ['AI 音乐', /\b(musicgen|stable.audio|suno|udio|rave|basic.pitch|acids.ircam|ace.studio)\b|ai.{0,16}(music|audio|音乐|音樂)|音乐生成|音樂生成|音频转|音訊轉/],
    ['实时交互', /\b(max\/msp|pure.data|touchdesigner|osc|ableton.link|interactive|real.time)\b|实时交互|實時互動|实时音频/],
    ['视听艺术', /\b(touchdesigner|audiovisual|shader|point.cloud|gaussian.splat|vjing)\b|视听|視聽|粒子|高斯泼溅/],
    ['空间音频', /\b(spatial.audio|ambisonic|binaural|dolby.atmos|hrtf|surround)\b|空间音频|空間音頻|全景声|全景聲/],
    ['写作与研究', /\b(research|paper|writing|humanizer|citation|arxiv)\b|论文|論文|研究|写作|寫作|润色/],
  ];
  for (const [topic, pattern] of rules) if (pattern.test(content)) topics.add(topic);
  if (item.category === '写作与编辑' || source.category === '写作与编辑') topics.add('写作与研究');
  return [...topics];
}

export function parseFeedEntries(xml, { calendar = false } = {}) {
  if (/<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error('订阅源含不受支持的文档实体');
  if (calendar) {
    // The official calendar contains an XML-forbidden vertical-tab reference.
    xml = xml.replace(/&#(x[\da-f]+|\d+);/gi, (whole, code) => {
      const point = code[0].toLowerCase() === 'x' ? parseInt(code.slice(1), 16) : Number(code);
      return point < 32 && ![9, 10, 13].includes(point) ? '' : whole;
    });
  }
  if (XMLValidator.validate(xml) !== true) throw new Error('订阅源 XML 格式无效');
  const data = parser.parse(xml);
  let entries;
  if (data.rss?.channel) {
    entries = asArray(data.rss.channel.item).map((item) => ({
      title: item.title, url: text(item.link),
      summary: item.description || item['content:encoded'] || '',
      publishedAt: text(item.pubDate || item['dc:date']),
      tags: asArray(item.category).map(text),
    }));
  } else if (data.feed) {
    entries = asArray(data.feed.entry).map((item) => ({
      title: item.title,
      url: asArray(item.link).find((link) => !link['@_rel'] || link['@_rel'] === 'alternate')?.['@_href'],
      summary: item.summary || item['media:group']?.['media:description'] || '',
      publishedAt: text(item.published || item.updated),
      dateLabel: item.published ? '原文' : '更新',
      tags: ['视频'],
    }));
  } else { throw new Error('无法识别 RSS / Atom 结构'); }
  return entries;
}

export function parseFeed(xml, source, now = new Date()) {
  return parseFeedEntries(xml).map((entry) => normalize(entry, source, now)).filter(Boolean);
}

async function request(url, fetchImpl, headers = {}) {
  const response = await fetchImpl(url, {
    headers: { 'User-Agent': 'SkillsObservatory/1.0 (public reading index)', Accept: 'application/json, application/xml;q=0.9, */*;q=0.5', ...headers },
    signal: AbortSignal.timeout(18_000),
  });
  if (!response.ok) throw new Error(`来源返回 HTTP ${response.status}`);
  if (Number(response.headers.get('content-length')) > MAX_BODY) throw new Error('来源响应超出大小限制');
  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BODY) throw new Error('来源响应超出大小限制');
      chunks.push(value);
    }
  } catch (error) { await reader.cancel().catch(() => {}); throw error; }
  const joined = Buffer.concat(chunks);
  return joined.toString('utf8');
}

async function fetchSource(source, options) {
  const { now, fetchImpl, githubToken, xBearer } = options;
  if (source.type === 'rss' || source.type === 'atom') {
    return parseFeed(await request(source.url, fetchImpl), source, now);
  }
  if (source.type === 'icm-news' || source.type === 'zhuhai-news') {
    return parseRegionalNews(await request(source.url, fetchImpl), source, cleanText)
      .map((entry) => normalize(entry, source, now)).filter(Boolean);
  }
  if (source.type === 'event-rss') {
    const entries = parseFeedEntries(await request(source.url, fetchImpl), { calendar: true });
    return parseCalendarEvents(entries, source, cleanText).map((entry) => normalizeEvent(entry, source, now)).filter(Boolean);
  }
  if (source.type === 'event-table') {
    return parseEventTable(await request(source.url, fetchImpl), source, cleanText)
      .map((entry) => normalizeEvent(entry, source, now)).filter(Boolean);
  }
  if (source.type === 'releases') {
    const body = JSON.parse(await request(`https://api.github.com/repos/${source.repository}/releases?per_page=${source.limit}`, fetchImpl, {
      Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28',
      ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {}),
    }));
    if (!Array.isArray(body)) throw new Error('GitHub 发行记录结构无效');
    return body.filter((release) => !release.draft && !release.prerelease && release.tag_name !== 'latest').map((release) => normalize({
      title: `${source.repository.split('/').at(-1)} ${release.name || release.tag_name}`,
      summary: release.body, url: release.html_url, publishedAt: release.published_at,
      dateLabel: '正式发行', tags: [release.tag_name],
    }, source, now)).filter(Boolean);
  }
  if (source.type === 'github') {
    const url = new URL('https://api.github.com/search/repositories');
    url.search = new URLSearchParams({ q: source.query, sort: 'updated', order: 'desc', per_page: String(source.limit) });
    const body = JSON.parse(await request(url.href, fetchImpl, {
      Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28',
      ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {}),
    }));
    if (!Array.isArray(body.items)) throw new Error('GitHub 响应结构无效');
    return body.items.map((repo) => normalize({
      title: repo.full_name, summary: repo.description || '项目未提供简介，请阅读仓库说明。',
      url: repo.html_url, publishedAt: repo.pushed_at || repo.updated_at, dateLabel: '仓库更新',
      tags: repo.topics || [], stars: repo.stargazers_count,
      license: repo.license?.spdx_id && repo.license.spdx_id !== 'NOASSERTION' ? repo.license.spdx_id : '未声明或未识别，请核对仓库许可',
    }, source, now)).filter(Boolean);
  }
  if (source.type === 'hn') {
    const url = new URL('https://hn.algolia.com/api/v1/search');
    url.search = new URLSearchParams({ query: 'AI', tags: 'story', hitsPerPage: '30',
      numericFilters: `created_at_i>${Math.floor(now.getTime() / 1000) - 7 * 86400},points>5` });
    const body = JSON.parse(await request(url.href, fetchImpl));
    if (!Array.isArray(body.hits)) throw new Error('Hacker News 响应结构无效');
    return body.hits.map((hit) => normalize({
      title: hit.title, url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
      summary: `Hacker News 社区讨论，收录时 ${Number(hit.points) || 0} 点、${Number(hit.num_comments) || 0} 条评论。摘要与观点请以原文为准。`,
      publishedAt: hit.created_at, tags: ['社区讨论'],
      discussionUrl: `https://news.ycombinator.com/item?id=${hit.objectID}`,
    }, source, now)).filter(Boolean);
  }
  if (source.type === 'x') {
    if (!xBearer) return null;
    const url = new URL('https://api.x.com/2/tweets/search/recent');
    url.search = new URLSearchParams({ query: '("agent skills" OR "AI workflow" OR MCP) -is:retweet -is:reply', max_results: '10', 'tweet.fields': 'created_at' });
    const body = JSON.parse(await request(url.href, fetchImpl, { Authorization: `Bearer ${xBearer}` }));
    if (!Array.isArray(body.data)) throw new Error('X 暂未返回可收录内容');
    return body.data.map((post) => normalize({
      title: cleanText(post.text, 90), summary: cleanText(post.text, 200),
      url: `https://x.com/i/status/${post.id}`, publishedAt: post.created_at, tags: ['X 公开分享'],
    }, source, now)).filter(Boolean);
  }
  throw new Error('不支持的来源类型');
}

export function mergeItems(previous, incoming, now = new Date()) {
  const cutoff = now.getTime() - RETENTION_DAYS * 86400_000;
  const unique = new Map();
  for (const item of [...previous, ...incoming]) {
    const url = canonicalUrl(item.url);
    if (!url || !item.title) continue;
    if (item.publishedAt && !validDate(item.publishedAt, now)) continue;
    if (item.kind !== 'curated' && item.publishedAt && Date.parse(item.publishedAt) < cutoff) continue;
    unique.set(url, { ...item, url });
  }
  return [...unique.values()].sort((a, b) => (Date.parse(b.publishedAt) || 0) - (Date.parse(a.publishedAt) || 0)).slice(0, 450);
}

export function localDay(now = new Date()) {
  return new Date(now.getTime() + 8 * 3600_000).toISOString().slice(0, 10);
}

function calendarDay(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && Number.isFinite(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
}

function normalizeEvent(raw, source, now) {
  const url = canonicalUrl(raw.url);
  const title = cleanText(raw.title, 220);
  if (!url || !title || !calendarDay(raw.startsOn) || !calendarDay(raw.endsOn) || raw.endsOn < raw.startsOn
    || raw.endsOn < localDay(now) || Date.parse(raw.publishedAt) > now.getTime() + 300_000) return null;
  return {
    id: createHash('sha256').update([url, title, raw.startsOn, raw.endsOn].join('|')).digest('hex').slice(0, 20),
    title, url, startsOn: raw.startsOn, endsOn: raw.endsOn,
    timeText: cleanText(raw.timeText, 180), venue: cleanText(raw.venue, 220),
    registrationText: cleanText(raw.registrationText, 300), summary: cleanText(raw.summary),
    ...(calendarDay(raw.registrationClosesOn) ? { registrationClosesOn: raw.registrationClosesOn } : {}),
    publishedAt: validDate(raw.publishedAt, now), dateLabel: '来源更新', collectedAt: now.toISOString(),
    sourceId: source.id, sourceName: source.name, region: source.region, platform: source.platform,
    topics: classifyTopics(raw, source),
  };
}

export function mergeEvents(previous, incoming, now = new Date()) {
  const unique = new Map();
  for (const event of [...previous, ...incoming]) {
    const source = { id: event.sourceId, name: event.sourceName, platform: event.platform, region: event.region };
    const normalized = normalizeEvent(event, source, now);
    if (normalized) unique.set(normalized.id, { ...normalized, collectedAt: event.collectedAt || now.toISOString() });
  }
  return [...unique.values()].sort((a, b) => a.startsOn.localeCompare(b.startsOn) || a.title.localeCompare(b.title)).slice(0, 120);
}

function matchesSource(item, source) {
  if (!source.keywords?.length) return true;
  const content = `${item.title} ${item.summary || ''}`.toLowerCase();
  return source.keywords.some((keyword) => content.includes(keyword.toLowerCase()));
}

export async function collect({ previous = {}, curated = [], browserItems = [], browserState = null,
  sources = SOURCES, now = new Date(), fetchImpl = fetch, githubToken, xBearer } = {}) {
  const incoming = [];
  const incomingEvents = [];
  const states = [];
  let next = 0;
  let successes = 0;
  await Promise.all(Array.from({ length: Math.min(4, sources.length) }, async () => {
    while (next < sources.length) {
      const source = sources[next++];
      const prior = (previous.sources || []).find((entry) => entry.id === source.id);
      const base = { id: source.id, name: source.name, platform: source.platform, url: source.url,
        type: source.type, scope: source.scope || source.category, ...(source.region ? { region: source.region } : {}) };
      const lastAutomaticSuccessAt = prior?.lastAutomaticSuccessAt || (prior?.status === 'ok' ? prior.lastSuccessAt : null) || null;
      try {
        const fetched = await fetchSource(source, { now, fetchImpl, githubToken, xBearer });
        if (fetched === null) {
          const manualReadOn = validDate(browserState?.readOn || browserState?.collectedAt, now)?.slice(0, 10) || null;
          const captured = browserItems.filter((item) => item.sourceId === source.id)
            .map((item) => normalize({ ...item, kind: 'browser', browserReadOn: manualReadOn }, source, now))
            .filter(Boolean).slice(0, source.limit);
          incoming.push(...captured);
          states.push({ ...base, status: captured.length ? 'cached' : 'needs_credentials',
            count: captured.length, manualReadOn,
            lastSuccessAt: lastAutomaticSuccessAt, lastAutomaticSuccessAt,
            error: captured.length ? '已选录 Edge 实际读取的公开分享；云端 X API 尚未配置，选录内容不会自动刷新。' : 'X 云端自动采集需配置开发者 Bearer Token；浏览器登录不能替代 API 授权。' });
          continue;
        }
        const items = fetched.filter((item) => matchesSource(item, source)).slice(0, source.limit);
        if (!items.length && !source.allowEmpty) throw new Error('来源未返回有效条目，保留已有资料');
        (source.scope === '活动' ? incomingEvents : incoming).push(...items);
        successes++;
        states.push({ ...base, status: 'ok', count: Math.min(items.length, source.limit), lastSuccessAt: now.toISOString(),
          ...(source.type === 'x' ? { lastAutomaticSuccessAt: now.toISOString() } : {}), error: null });
      } catch (error) {
        states.push({ ...base, status: 'error', count: (source.scope === '活动' ? previous.events || [] : previous.items || []).filter((item) => item.sourceId === source.id).length,
          lastSuccessAt: source.type === 'x' ? lastAutomaticSuccessAt : prior?.lastSuccessAt || null,
          ...(source.type === 'x' ? { lastAutomaticSuccessAt } : {}),
          error: error.name === 'TimeoutError' ? '来源响应超时，保留已有资料' : String(error.message || error).slice(0, 180) });
      }
    }
  }));
  const editorial = { id: 'editorial-writing', name: '写作资料 · 原文精读', platform: 'GitHub', category: '写作与编辑' };
  const readings = curated.map((item) => normalize({ ...item, kind: 'curated', dateLabel: '文件更新',
    tags: ['编辑方法', '事实核验'], collectedAt: item.verifiedAt }, editorial, now)).filter(Boolean);
  incoming.push(...readings);
  states.push({ ...editorial, url: 'https://github.com/blader/humanizer', status: readings.length ? 'ok' : 'error',
    count: readings.length, lastSuccessAt: readings.length ? curated[0]?.verifiedAt || now.toISOString() : null,
    error: readings.length ? null : '精读资料尚未载入' });
  const items = mergeItems(previous.items || [], incoming, now).map((item) => {
    const source = [...sources, editorial].find((entry) => entry.id === item.sourceId) || {};
    return { ...item, topics: classifyTopics(item, source), ...(source.region ? { region: source.region } : {}) };
  });
  const events = mergeEvents(previous.events || [], incomingEvents, now);
  return {
    version: 1, generatedAt: now.toISOString(), lastAttemptAt: now.toISOString(),
    schedule: SCHEDULE, retentionDays: RETENTION_DAYS, readingProfile: READING_PROFILE, regions: REGIONS,
    collection: { successfulSources: successes, totalSources: sources.length, itemCount: items.length,
      eventCount: events.length, mode: '公开订阅 / API + 人工精读', fullTextRepublished: false },
    sources: states.sort((a, b) => [...sources, editorial].findIndex((source) => source.id === a.id) - [...sources, editorial].findIndex((source) => source.id === b.id)),
    items, events,
  };
}
