import { createHash } from 'node:crypto';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { SOURCES, SCHEDULE } from './sources.js';

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_', processEntities: true });
const MAX_BODY = 2_500_000;
const RETENTION_DAYS = 90;
const asArray = (value) => value == null ? [] : Array.isArray(value) ? value : [value];
const text = (value) => typeof value === 'object' && value !== null ? String(value['#text'] ?? '') : String(value ?? '');

export function cleanText(value, limit = 260) {
  return text(value).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ').replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim().slice(0, limit);
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
    kind: raw.kind || 'collected', dateLabel: raw.dateLabel || '原文',
  };
}

export function parseFeed(xml, source, now = new Date()) {
  if (/<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error('订阅源含不受支持的文档实体');
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
      tags: [source.name.replace(' · YouTube', ''), '视频'],
    }));
  } else { throw new Error('无法识别 RSS / Atom 结构'); }
  return entries.map((entry) => normalize(entry, source, now)).filter(Boolean);
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

export async function collect({ previous = {}, curated = [], browserItems = [], browserState = null,
  sources = SOURCES, now = new Date(), fetchImpl = fetch, githubToken, xBearer } = {}) {
  const incoming = [];
  const states = [];
  let next = 0;
  let successes = 0;
  await Promise.all(Array.from({ length: Math.min(4, sources.length) }, async () => {
    while (next < sources.length) {
      const source = sources[next++];
      const prior = (previous.sources || []).find((entry) => entry.id === source.id);
      const base = { id: source.id, name: source.name, platform: source.platform, url: source.url };
      try {
        const items = await fetchSource(source, { now, fetchImpl, githubToken, xBearer });
        if (items === null) {
          const captured = browserItems.filter((item) => item.sourceId === source.id);
          incoming.push(...captured);
          states.push({ ...base, status: captured.length ? 'cached' : 'needs_credentials',
            count: captured.length, lastSuccessAt: browserState?.collectedAt || prior?.lastSuccessAt || null,
            error: captured.length ? '已收录 Edge 实际读取的公开分享。云端 X API 尚未配置；浏览器采集时间见最近成功。' : 'X 云端自动采集需配置开发者 Bearer Token；浏览器登录不能替代 API 授权。' });
          continue;
        }
        if (!items.length) throw new Error('来源未返回有效条目，保留已有资料');
        incoming.push(...items.slice(0, source.limit));
        successes++;
        states.push({ ...base, status: 'ok', count: Math.min(items.length, source.limit), lastSuccessAt: now.toISOString(), error: null });
      } catch (error) {
        states.push({ ...base, status: 'error', count: (previous.items || []).filter((item) => item.sourceId === source.id).length,
          lastSuccessAt: prior?.lastSuccessAt || null, error: error.name === 'TimeoutError' ? '来源响应超时，保留已有资料' : String(error.message || error).slice(0, 180) });
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
  const items = mergeItems(previous.items || [], incoming, now);
  return {
    version: 1, generatedAt: now.toISOString(), lastAttemptAt: now.toISOString(),
    schedule: SCHEDULE, retentionDays: RETENTION_DAYS,
    collection: { successfulSources: successes, totalSources: sources.length, itemCount: items.length,
      mode: '公开订阅 / API + 人工精读', fullTextRepublished: false },
    sources: states.sort((a, b) => [...sources, editorial].findIndex((source) => source.id === a.id) - [...sources, editorial].findIndex((source) => source.id === b.id)),
    items,
  };
}
