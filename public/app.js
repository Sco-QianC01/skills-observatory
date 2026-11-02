import { readingTopics, searchArticles, selectHighlights, selectBriefs, recommendation, externalSearches, safeUrl } from './reading.js';

const categories = ['全部', '音乐科技', 'AI 动态', 'Skills', '工作流', '开源项目', '写作与编辑', '财经动态', '法律政策', '本地新闻', '视频分享', '社区热议'];
const preferencesKey = 'xinzhi-reading-preferences-v1';
const savedKey = 'xinzhi-saved-v1';
const cacheKey = 'xinzhi-feed-v1';
const pageSize = 12;
const state = { items: [], sources: [], events: [], regions: [], feed: null, loadFailed: false, view: 'journal', category: '全部', topic: '', region: 'macau', query: '', platform: '', sourceId: '', days: '', sort: 'newest', limit: pageSize, eventLimit: 4, interests: [...readingTopics], saved: [] };
const el = id => document.getElementById(id);
const dateFormat = new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' });
const dateTimeFormat = new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
const dayFormat = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' });
let messageTimer;
let preferenceOpener;

function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined && text !== null) element.textContent = String(text);
  return element;
}
function dateValue(value) { const result = typeof value === 'string' ? Date.parse(value) : NaN; return Number.isFinite(result) ? result : null; }
function dateText(value, includeTime = false) { const time = dateValue(value); return time === null ? '未提供' : (includeTime ? dateTimeFormat : dateFormat).format(time); }
function externalLink(url, className, text) {
  const href = safeUrl(url);
  const link = node(href ? 'a' : 'span', className, text);
  if (href) { link.href = href; link.target = '_blank'; link.rel = 'noopener noreferrer'; }
  return link;
}
function tell(message) {
  clearTimeout(messageTimer);
  el('reading-message').textContent = message;
  el('reading-message').hidden = false;
  messageTimer = setTimeout(() => { el('reading-message').hidden = true; }, 5000);
}
function savePreferences() {
  try {
    localStorage.setItem(preferencesKey, JSON.stringify({ region: state.region, topic: state.topic, interests: state.interests }));
    return true;
  } catch { tell('浏览器未允许本地保存，本次选择只在当前页面有效。'); return false; }
}
function savedArticle(item) {
  if (!item || typeof item.title !== 'string' || !safeUrl(item.url)) return null;
  const result = { url: item.url };
  for (const key of ['id', 'title', 'sourceId', 'sourceName', 'category', 'platform', 'summary', 'publishedAt', 'dateLabel', 'jurisdiction', 'region', 'kind', 'license']) {
    if (typeof item[key] === 'string') result[key] = item[key].slice(0, key === 'summary' ? 2400 : 800);
  }
  for (const key of ['topics', 'tags', 'workflow', 'cautions']) {
    if (Array.isArray(item[key])) result[key] = item[key].filter(value => typeof value === 'string').slice(0, 12).map(value => value.slice(0, 600));
    else if (key === 'cautions' && typeof item[key] === 'string') result[key] = item[key].slice(0, 1200);
  }
  return result;
}
try {
  const preferences = JSON.parse(localStorage.getItem(preferencesKey));
  if (['macau', 'hongkong', 'zhuhai'].includes(preferences?.region)) state.region = preferences.region;
  if (readingTopics.includes(preferences?.topic)) state.topic = preferences.topic;
  if (Array.isArray(preferences?.interests)) {
    const topics = readingTopics.filter(topic => preferences.interests.includes(topic));
    if (topics.length) state.interests = topics;
  }
} catch { /* Optional browser data may be unavailable. */ }
try {
  const saved = JSON.parse(localStorage.getItem(savedKey));
  if (Array.isArray(saved)) state.saved = [...new Map(saved.slice(0, 200).map(savedArticle).filter(Boolean).map(item => [item.url, item])).values()];
} catch { /* A broken preference must not hide saved articles. */ }

function readLocation() {
  const params = new URLSearchParams(location.search);
  state.view = ['journal', 'all', 'saved'].includes(params.get('view')) ? params.get('view') : 'journal';
  state.query = (params.get('q') || '').slice(0, 300);
  state.category = categories.includes(params.get('cat')) ? params.get('cat') : '全部';
  state.topic = readingTopics.includes(params.get('topic')) ? params.get('topic') : '';
  state.platform = params.get('platform') || '';
  state.sourceId = params.get('source') || '';
  state.days = ['7', '30'].includes(params.get('days')) ? params.get('days') : '';
  state.sort = ['newest', 'oldest', 'relevance', 'recommended'].includes(params.get('sort')) ? params.get('sort') : 'newest';
  if (['macau', 'hongkong', 'zhuhai'].includes(params.get('region'))) state.region = params.get('region');
  state.limit = pageSize;
}
function syncLocation(mode) {
  if (!mode) return;
  const params = new URLSearchParams();
  for (const [key, value, defaultValue] of [['view', state.view, 'journal'], ['q', state.query, ''], ['cat', state.category, '全部'], ['topic', state.topic, ''], ['platform', state.platform, ''], ['source', state.sourceId, ''], ['days', state.days, ''], ['sort', state.sort, 'newest'], ['region', state.region, 'macau']]) {
    if (value !== defaultValue) params.set(key, value);
  }
  const target = `${location.pathname}${params.size ? `?${params}` : ''}${location.hash}`;
  if (target !== `${location.pathname}${location.search}${location.hash}`) history[mode === 'push' ? 'pushState' : 'replaceState'](null, '', target);
}
function resetFilters() { Object.assign(state, { query: '', category: '全部', topic: '', platform: '', sourceId: '', days: '', sort: 'newest', limit: pageSize }); }
function scrollToArchive() { el('feed-title').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' }); }
function isSaved(item) { return state.saved.some(saved => saved.url === item.url); }
function toggleSaved(item, clicked) {
  const wasSaved = isSaved(item);
  if (!wasSaved && state.saved.length >= 200) { tell('稍后读已满 200 篇，读完后移除一些再收藏。'); return; }
  const next = wasSaved ? state.saved.filter(saved => saved.url !== item.url) : [savedArticle(item), ...state.saved].filter(Boolean);
  try { localStorage.setItem(savedKey, JSON.stringify(next)); }
  catch { tell('浏览器未允许本地保存，暂时无法加入稍后读。'); return; }
  state.saved = next;
  const hadFocus = document.activeElement === clicked;
  render();
  if (hadFocus) {
    const replacement = [...document.querySelectorAll('.save-button')].find(button => button.dataset.url === item.url);
    (replacement || document.querySelector('[data-view="saved"]')).focus();
  }
  tell(wasSaved ? '已从稍后读移除。' : '已加入稍后读，可在当前浏览器回看。');
}
function saveButton(item) {
  const saved = isSaved(item);
  const button = node('button', 'save-button', saved ? '已收藏' : '稍后读');
  button.type = 'button';
  button.dataset.url = item.url;
  button.setAttribute('aria-pressed', String(saved));
  button.setAttribute('aria-label', `${saved ? '移除收藏' : '加入稍后读'}：${item.title}`);
  button.addEventListener('click', () => toggleSaved(item, button));
  return button;
}
function articleMeta(item) {
  const meta = node('p', 'story-meta');
  meta.append(node('span', 'source-label', item.sourceName || item.platform || '来源未标注'));
  if (item.jurisdiction) meta.append(node('span', 'jurisdiction', item.jurisdiction));
  const date = node('time', 'original-date', dateValue(item.publishedAt) === null ? '原文未注明日期' : `${item.dateLabel || '原文'} ${dateText(item.publishedAt)}`);
  if (dateValue(item.publishedAt) !== null) date.dateTime = item.publishedAt;
  meta.append(date);
  if (item.kind === 'curated' || item.kind === 'browser') meta.append(node('span', 'curated-label', item.kind === 'curated' ? '编辑选读' : '人工选录'));
  return meta;
}
function renderStory(item, highlight = false) {
  const article = node('article', highlight ? 'highlight' : 'story');
  article.dataset.itemId = String(item.id || '');
  if (highlight) article.append(node('p', 'reading-reason', recommendation(item, state.interests).reason));
  article.append(articleMeta(item));
  const heading = node('h3');
  heading.append(externalLink(item.url, 'story-title', item.title));
  article.append(heading);
  if (item.summary) article.append(node('p', 'story-summary', item.summary));
  const bottom = node('div', 'story-bottom');
  const tags = node('div', 'tags');
  if (item.category) tags.append(node('span', 'category-label', item.category));
  if (item.platform) tags.append(node('span', 'platform-label', item.platform));
  const actions = node('div', 'story-actions');
  actions.append(saveButton(item), externalLink(item.url, 'original-link', '读原文 ↗'));
  bottom.append(tags, actions);
  article.append(bottom);
  const workflow = Array.isArray(item.workflow) ? item.workflow : [];
  if (!highlight && (workflow.length || item.cautions || item.license)) {
    const details = node('details', 'reading-detail');
    details.append(node('summary', '', workflow.length ? '方法与适用范围' : '许可与适用范围'));
    const content = node('div', 'reading-content');
    if (workflow.length) {
      const list = node('ol');
      workflow.forEach(step => list.append(node('li', '', step)));
      content.append(list);
    }
    if (item.cautions) content.append(node('p', '', `适用范围：${Array.isArray(item.cautions) ? item.cautions.join('；') : item.cautions}`));
    if (item.license) content.append(node('p', '', `许可：${item.license}`));
    details.append(content);
    article.append(details);
  }
  return article;
}
function renderTopics() {
  if (!el('topics').childElementCount) {
    el('topics').append(...['', ...readingTopics].map(topic => {
      const button = node('button', 'topic-button', topic || '全部主题');
      button.type = 'button'; button.dataset.topic = topic;
      button.addEventListener('click', () => { state.topic = topic; state.limit = pageSize; savePreferences(); render('push'); });
      return button;
    }));
  }
  el('topics').querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.topic === state.topic)));
}
function renderHighlights() {
  const unfiltered = !state.query && state.category === '全部' && !state.topic && !state.platform && !state.sourceId && !state.days && state.sort === 'newest';
  const candidates = state.items.filter(item => item.category !== '本地新闻' || item.region === state.region);
  const highlights = selectHighlights(candidates, state.interests, Date.now(), state.region);
  el('highlights-section').hidden = state.view !== 'journal' || !unfiltered || !highlights.length;
  el('highlights').replaceChildren(...highlights.map(item => renderStory(item, true)));
  el('reading-profile').textContent = `目前关注：${state.interests.join('、')}。`;
}
function renderBriefs() {
  const chosen = selectBriefs(state.items, state.region);
  el('briefs-list').replaceChildren(...(chosen.length ? chosen.map(item => {
    const article = node('article', 'brief');
    article.append(node('p', 'brief-meta', [item.jurisdiction, dateText(item.publishedAt)].filter(Boolean).join(' · ')));
    const heading = node('h3'); heading.append(externalLink(item.url, '', item.title));
    article.append(heading, node('p', 'brief-source', item.sourceName));
    return article;
  }) : [node('p', 'events-empty', '近期尚无已收录的消息。')]));
}
function render(mode) {
  for (const [id, key] of [['search', 'query'], ['category', 'category'], ['platform', 'platform'], ['source', 'sourceId'], ['period', 'days'], ['sort', 'sort']]) el(id).value = state[key];
  document.querySelectorAll('[data-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === state.view)));
  el('saved-count').textContent = state.saved.length;
  renderTopics();
  renderHighlights();
  const pool = state.view === 'saved' ? state.saved.map(saved => state.items.find(item => item.url === saved.url) || saved) : state.items;
  const result = searchArticles(pool, state);
  const visible = result.items.slice(0, state.limit);
  el('feed-title').textContent = state.view === 'saved' ? '稍后读' : state.category === '全部' ? '最近收录' : state.category;
  el('result-count').textContent = `${result.items.length} 篇`;
  el('reset-filters').hidden = !state.query && !state.platform && !state.sourceId && !state.topic && !state.days && state.category === '全部' && state.sort === 'newest';
  el('stories').replaceChildren(...visible.map(item => renderStory(item)));
  const empty = el('empty-state'); empty.hidden = result.items.length > 0;
  empty.querySelector('h3').textContent = result.errors.length ? '请调整搜索条件' : state.loadFailed && !state.feed && state.view !== 'saved' ? '文章暂时未能载入' : state.view === 'saved' && !state.saved.length ? '留几篇文章，慢慢读' : '还没有匹配的文章';
  empty.querySelector('p').textContent = result.errors.length ? result.errors.join(' ') : state.view === 'saved' && !state.saved.length ? '点文章旁的“稍后读”，下次用这个浏览器打开时还能找到。' : state.loadFailed && !state.feed ? '可以使用“重新获取文章”再试一次。' : '换一个词，或清除主题、来源与日期筛选。';
  el('load-more').hidden = result.items.length <= visible.length;
  el('showing-count').textContent = result.items.length ? `已展示 ${visible.length} / ${result.items.length} 篇` : '';
  const destinations = externalSearches(state.query);
  el('external-search').hidden = !destinations.length || Boolean(result.errors.length);
  el('external-search').replaceChildren(node('span', '', '也可以继续查找原站：'), ...destinations.map(entry => externalLink(entry.url, 'original-link', `${entry.name} ↗`)));
  syncLocation(mode);
}

function calendarDay(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T12:00:00+08:00`);
  if (!Number.isFinite(date.getTime())) return null;
  const parts = dayFormat.formatToParts(date);
  const part = (name) => parts.find((entry) => entry.type === name)?.value;
  return `${part("year")}-${part("month")}-${part("day")}` === value ? value : null;
}

function renderEvents() {
  el("region").value = state.region;
  const parts = dayFormat.formatToParts(new Date());
  const part = (name) => parts.find((entry) => entry.type === name)?.value;
  const today = `${part("year")}-${part("month")}-${part("day")}`;
  const events = state.events.filter((event) => event.region === state.region
    && calendarDay(event.startsOn) && calendarDay(event.endsOn)
    && event.endsOn >= event.startsOn && event.endsOn >= today)
    .sort((a, b) => {
      const aOngoing = a.startsOn <= today;
      const bOngoing = b.startsOn <= today;
      if (aOngoing !== bOngoing) return aOngoing ? 1 : -1;
      return aOngoing ? a.endsOn.localeCompare(b.endsOn) : a.startsOn.localeCompare(b.startsOn);
    });
  const rows = events.slice(0, state.eventLimit).map((event) => {
    const article = node("article", "event");
    const ongoing = event.startsOn <= today;
    const status = ongoing ? (event.startsOn === event.endsOn ? "今日" : "活动期内") : "即将举办";
    article.append(node("p", "event-date", `${status} · ${dateText(`${event.startsOn}T12:00:00+08:00`)}${event.endsOn !== event.startsOn ? ` — ${dateText(`${event.endsOn}T12:00:00+08:00`)}` : ""}`));
    const heading = node("h3");
    heading.append(externalLink(event.url, "", event.title || "未命名活动"));
    article.append(heading);
    if (event.summary) article.append(node("p", "event-summary", event.summary));
    if (event.timeText && !/^[—–\s-]+$/.test(event.timeText)) article.append(node("p", "event-source", `活动时间：${event.timeText}`));
    article.append(node("p", "event-source", [event.venue, event.sourceName].filter(Boolean).join(" · ")));
    if (event.registrationText) article.append(node("p", "event-source", `报名方式（原文）：${event.registrationText}`));
    const deadline = calendarDay(event.registrationClosesOn || event.registrationDeadline);
    if (deadline) article.append(node("p", "event-deadline", `${deadline < today ? "报名已截止" : "报名截止"} · ${dateText(`${deadline}T12:00:00+08:00`)}`));
    article.append(externalLink(event.url, "original-link", "查看官方详情"));
    return article;
  });
  el("events-list").replaceChildren(...(rows.length ? rows : [node("p", "events-empty", state.loadFailed && !state.feed ? "活动资料暂时未能载入，请稍后重新获取。" : "暂无已收录的进行中或即将开始活动。")]));
  el("more-events").hidden = events.length <= state.eventLimit;
  const region = state.regions.find((entry) => entry.id === state.region);
  const regionName = region?.name || el("region").selectedOptions[0]?.textContent || "所选城市";
  el("region-note").textContent = state.region === "macau" ? "澳门为暂定范围，可切换城市。" : `已选择${regionName}，可切换城市。`;
  el("region-official").replaceChildren(...(region?.calendarUrl ? [externalLink(region.calendarUrl, "original-link", region.calendarLabel || `${regionName}官方活动日历`)] : []));
}

function statusLabel(source) {
  if (source.status === 'fallback') return ['备用订阅可用', false];
  if (source.status === 'ok') return ['更新正常', false];
  if (source.manualReadOn) return ['人工选录 · 自动订阅待接入', true];
  if (['error', 'failed', 'failure', 'unavailable'].includes(source.status)) return [source.availableCount || source.retainedCount ? '暂缓更新 · 保留已收录' : '暂缓更新', true];
  if (['cached', 'stale', 'partial'].includes(source.status)) return ['沿用已有收录', true];
  return ['待接入', true];
}
function renderSources() {
  el('source-list').replaceChildren(...state.sources.map(source => {
    const row = node('div', 'source-row');
    const top = node('div', 'source-row-top');
    const [label, warning] = statusLabel(source);
    top.append(externalLink(source.url, 'source-name', source.name || source.id), node('span', `source-state${warning ? ' warning' : ''}`, label));
    row.append(top);
    const available = state.items.filter(item => item.sourceId === source.id).length;
    const events = state.events.filter(event => event.sourceId === source.id).length;
    const quantity = source.scope === '活动' ? `${events} 项活动` : `${available} 篇`;
    const metadata = [source.platform, source.jurisdiction, state.regions.find(region => region.id === source.region)?.name, `已收录 ${quantity}`, source.manualReadOn ? `人工查阅 ${source.manualReadOn}` : null, `自动订阅最近成功 ${dateText(source.lastSuccessAt, true)}`].filter(Boolean);
    row.append(node('p', 'source-detail', metadata.join(' · ')));
    if (source.latestPublishedAt) row.append(node('p', 'source-detail', `最近原文 ${dateText(source.latestPublishedAt)}${typeof source.count === 'number' ? ` · ${['ok', 'fallback'].includes(source.status) ? '本轮读取' : '上次保存'} ${source.count} 条` : ''}`));
    if (source.status === 'fallback' && safeUrl(source.fallbackUrl)) row.append(externalLink(source.fallbackUrl, 'original-link', '查看本次使用的备用订阅 ↗'));
    if (source.error || source.primaryError) {
      const details = node('details', 'source-diagnostic');
      details.append(node('summary', '', '查看更新详情'), node('p', 'source-detail', String(source.error || source.primaryError)));
      row.append(details);
    }
    return row;
  }));
  el('sources-updated').textContent = state.feed ? `${state.sources.length} 个收录入口 · 文章目录生成于 ${dateText(state.feed.generatedAt, true)}，日期为北京时间。` : '尚未取得来源状态。';
}
function validFeed(feed) {
  return feed && feed.version === 1 && Array.isArray(feed.items) && feed.items.length <= 1000
    && Array.isArray(feed.sources) && feed.sources.length <= 200
    && feed.sources.every(source => source && typeof source.id === 'string' && (!source.name || typeof source.name === 'string'))
    && dateValue(feed.generatedAt) !== null && dateValue(feed.generatedAt) <= Date.now() + 300000
    && feed.items.every(item => item && typeof item.title === 'string' && safeUrl(item.url)
      && (item.publishedAt == null || typeof item.publishedAt === 'string'));
}
function applyFeed(feed, mode) {
  if (!validFeed(feed)) throw new Error('Invalid feed');
  state.feed = feed; state.loadFailed = false; state.items = feed.items;
  state.sources = feed.sources.filter(source => source && typeof source.id === 'string');
  state.events = Array.isArray(feed.events) ? feed.events.filter(event => event && typeof event.title === 'string' && safeUrl(event.url)) : [];
  state.regions = Array.isArray(feed.regions) ? feed.regions.filter(region => region && typeof region.id === 'string') : [];
  const platforms = [...new Set(state.items.map(item => item.platform).filter(value => typeof value === 'string' && value))].sort();
  el('platform').replaceChildren(...['', ...platforms].map(value => { const option = node('option', '', value || '全部平台'); option.value = value; return option; }));
  el('source').replaceChildren(...[{ id: '', name: '全部来源' }, ...[...state.sources].sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id, 'zh-CN'))].map(source => { const option = node('option', '', source.name || source.id); option.value = source.id; return option; }));
  if (!platforms.includes(state.platform)) state.platform = '';
  if (!state.sources.some(source => source.id === state.sourceId)) state.sourceId = '';
  el('edition-date').textContent = `更新于 ${dateText(feed.generatedAt)}`;
  el('schedule').textContent = typeof feed.schedule === 'string' ? feed.schedule : feed.schedule?.description || '定期检查订阅，部分来源更新较慢。';
  const failures = state.sources.filter(source => ['error', 'failed', 'failure', 'unavailable'].includes(source.status)).length;
  const copies = { api: '最近更新', bundled: '正在阅读部署时保存的副本', static: '正在阅读站内保存的副本', cache: '网络暂不可用，正在阅读浏览器缓存' };
  el('feed-status').textContent = `${copies[mode]} · ${dateText(feed.generatedAt, true)}${failures ? ` · ${failures} 个来源暂缓更新` : ''}`;
  el('feed-status').classList.toggle('is-warning', mode !== 'api');
  render(); renderEvents(); renderBriefs(); renderSources();
}
async function loadFeed() {
  el('retry-button').disabled = true;
  el('stories').setAttribute('aria-busy', 'true');
  el('feed-status').textContent = '正在检查新文章…';
  try {
    for (const [url, mode] of [['/api/feed', 'api'], ['/data/feed.json', 'static']]) {
      try {
        const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(12000) });
        if (!response.ok) continue;
        const declared = Number(response.headers.get('Content-Length'));
        if (declared > 2500000) continue;
        const text = await response.text();
        if (text.length > 2500000) continue;
        const feed = JSON.parse(text);
        applyFeed(feed, response.headers.get('X-Feed-Origin') === 'bundled-fallback' ? 'bundled' : mode);
        try { localStorage.setItem(cacheKey, JSON.stringify(feed)); } catch { /* Reading does not require storage. */ }
        return;
      } catch { /* Fall back to the next saved copy. */ }
    }
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey));
      if (validFeed(cached)) { applyFeed(cached, 'cache'); return; }
    } catch { /* A broken optional cache is ignored. */ }
    state.loadFailed = true;
    el('feed-status').textContent = state.feed ? '这次未能取得新文章，仍可阅读当前目录。' : '这次未能取得文章，请稍后重新获取。稍后读仍保存在当前浏览器。';
    el('feed-status').classList.add('is-warning');
    render(); renderEvents(); renderSources();
  } finally { el('stories').setAttribute('aria-busy', 'false'); el('retry-button').disabled = false; }
}
function openPreferences(event) {
  preferenceOpener = event.currentTarget;
  el('preferences-message').textContent = '';
  el('interest-options').replaceChildren(node('legend', '', '关注的主题'), ...readingTopics.map(topic => {
    const label = node('label', 'interest-option');
    const input = node('input'); input.type = 'checkbox'; input.name = 'interest'; input.value = topic; input.checked = state.interests.includes(topic);
    label.append(input, document.createTextNode(topic)); return label;
  }));
  el('preferences-dialog').showModal();
}
el('category').replaceChildren(...categories.map(value => { const option = node('option', '', value === '全部' ? '全部分类' : value); option.value = value; return option; }));
el('filter-form').addEventListener('submit', event => event.preventDefault());
for (const [id, key] of [['search', 'query'], ['category', 'category'], ['platform', 'platform'], ['source', 'sourceId'], ['period', 'days'], ['sort', 'sort']]) {
  el(id).addEventListener(id === 'search' ? 'input' : 'change', () => { state[key] = el(id).value; state.limit = pageSize; render(id === 'search' ? 'replace' : 'push'); });
}
el('reset-filters').addEventListener('click', () => { resetFilters(); render('push'); el('search').focus(); });
el('search-example').addEventListener('click', () => { resetFilters(); state.query = '版权 -商标'; render('push'); el('search').focus(); });
document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => { state.view = button.dataset.view; resetFilters(); render('push'); }));
el('load-more').addEventListener('click', () => { state.limit += pageSize; render(); });
el('policy-filter').addEventListener('click', () => { state.view = 'all'; resetFilters(); state.category = '法律政策'; render('push'); scrollToArchive(); });
el('region').addEventListener('change', () => { state.region = el('region').value; state.eventLimit = 4; state.limit = pageSize; savePreferences(); renderEvents(); renderBriefs(); render('push'); });
el('more-events').addEventListener('click', () => { state.eventLimit += 4; renderEvents(); });
el('retry-button').addEventListener('click', loadFeed);
el('source-button').addEventListener('click', () => { renderSources(); el('sources-dialog').showModal(); });
el('close-sources').addEventListener('click', () => el('sources-dialog').close());
el('sources-dialog').addEventListener('close', () => el('source-button').focus());
for (const id of ['preferences-button', 'edit-preferences']) el(id).addEventListener('click', openPreferences);
el('close-preferences').addEventListener('click', () => el('preferences-dialog').close());
el('preferences-dialog').addEventListener('close', () => preferenceOpener?.focus());
el('preferences-form').addEventListener('submit', event => {
  event.preventDefault();
  const interests = new FormData(event.currentTarget).getAll('interest').filter(topic => readingTopics.includes(topic));
  if (!interests.length) { el('preferences-message').textContent = '至少选一个感兴趣的主题。'; return; }
  state.interests = interests;
  savePreferences(); render(); el('preferences-dialog').close();
});
window.addEventListener('popstate', () => { readLocation(); render(); renderEvents(); renderBriefs(); });
readLocation();
render();
loadFeed();
