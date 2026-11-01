"use strict";

const categories = ["全部", "AI 动态", "Skills", "工作流", "开源项目", "写作与编辑", "视频分享", "社区热议"];
const pageSize = 16;
const cacheKey = "xinzhi-feed-v1";
const state = { items: [], sources: [], category: "全部", limit: pageSize, feed: null };
const el = (id) => document.getElementById(id);
const dateFormat = new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" });
const dateTimeFormat = new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });

function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined && text !== null) element.textContent = String(text);
  return element;
}

function dateValue(value) {
  const number = value ? Date.parse(value) : NaN;
  return Number.isFinite(number) ? number : null;
}

function dateText(value, includeTime = false) {
  const date = dateValue(value);
  return date === null ? "未提供" : (includeTime ? dateTimeFormat : dateFormat).format(date);
}

function safeUrl(value) {
  try {
    const url = new URL(String(value));
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}

function externalLink(url, className, text) {
  const href = safeUrl(url);
  const link = node(href ? "a" : "span", className, text);
  if (href) {
    link.href = href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }
  return link;
}

function setCategory(category) {
  state.category = category;
  state.limit = pageSize;
  render();
}

function renderCategories() {
  const nav = el("categories");
  nav.replaceChildren();
  categories.forEach((category) => {
    const button = node("button", "category-button", category);
    button.type = "button";
    button.dataset.category = category;
    button.setAttribute("aria-pressed", String(state.category === category));
    const count = state.items.filter((item) => category === "全部" || item.category === category).length;
    button.append(node("span", "category-count", count));
    button.addEventListener("click", () => setCategory(category));
    nav.append(button);
  });
}

function renderStory(item) {
  const article = node("article", "story");
  article.dataset.itemId = String(item.id || "");
  const meta = node("div", "story-meta");
  meta.append(node("span", "platform-label", item.platform || "来源未标注"));
  if (item.category) meta.append(node("span", "meta-dot", "·"), node("span", "", item.category));
  meta.append(node("span", "meta-dot", "·"), node("span", "original-date", dateValue(item.publishedAt) === null ? "未提供原文日期" : `${item.dateLabel || "原文"} ${dateText(item.publishedAt)}`));
  if (item.kind === "curated") meta.append(node("span", "curated-label", "编辑选读"));
  if (item.kind === "browser") meta.append(node("span", "curated-label", "浏览器选录"));
  article.append(meta);
  const heading = node("h3");
  heading.append(externalLink(item.url, "story-title", item.title || "未命名资料"));
  article.append(heading);
  if (item.summary) article.append(node("p", "story-summary", item.summary));
  const bottom = node("div", "story-bottom");
  const tags = node("div", "tags");
  const tagList = Array.isArray(item.tags) ? item.tags.slice(0, 5) : [];
  tagList.forEach((tag) => tags.append(node("span", "tag", tag)));
  if (!tagList.length && item.sourceName) tags.append(node("span", "", item.sourceName));
  if (typeof item.stars === "number") tags.append(node("span", "", `★ ${new Intl.NumberFormat("zh-CN", { notation: "compact" }).format(item.stars)}`));
  bottom.append(tags, externalLink(item.url, "original-link", "阅读原文 ↗"));
  article.append(bottom);
  const workflow = Array.isArray(item.workflow) ? item.workflow : [];
  if (workflow.length || item.cautions || item.license) {
    const details = node("details", "reading-detail");
    details.append(node("summary", "", workflow.length ? "编辑方法与适用限制" : "许可与适用限制"));
    const content = node("div", "reading-content");
    if (workflow.length) {
      const list = node("ol");
      workflow.forEach((step) => list.append(node("li", "", step)));
      content.append(list);
    }
    if (item.cautions) {
      const paragraph = node("p");
      paragraph.append(node("strong", "", "适用限制："), document.createTextNode(Array.isArray(item.cautions) ? item.cautions.join("；") : String(item.cautions)));
      content.append(paragraph);
    }
    if (item.license) {
      const paragraph = node("p");
      paragraph.append(node("strong", "", "许可："), document.createTextNode(String(item.license)));
      content.append(paragraph);
    }
    details.append(content);
    article.append(details);
  }
  return article;
}

function render() {
  renderCategories();
  const query = el("search").value.trim().toLocaleLowerCase();
  const platform = el("platform").value;
  const direction = el("sort").value === "oldest" ? 1 : -1;
  const filtered = state.items.filter((item) => {
    return (state.category === "全部" || item.category === state.category)
      && (!platform || item.platform === platform)
      && (!query || JSON.stringify(item).toLocaleLowerCase().includes(query));
  }).sort((a, b) => {
    const first = dateValue(a.publishedAt);
    const second = dateValue(b.publishedAt);
    if (first === null && second === null) return 0;
    if (first === null) return 1;
    if (second === null) return -1;
    return (first - second) * direction;
  });
  el("feed-title").textContent = state.category === "全部" ? "全部资料" : state.category;
  el("result-count").textContent = `${filtered.length} 条资料`;
  const visible = filtered.slice(0, state.limit);
  el("stories").replaceChildren(...visible.map(renderStory));
  el("empty-state").hidden = filtered.length > 0;
  el("empty-state").querySelector("h3").textContent = "还没有匹配的资料";
  el("empty-state").querySelector("p").textContent = "换一个词，或清除平台与分类筛选。";
  el("load-more").hidden = filtered.length <= visible.length;
  el("showing-count").textContent = filtered.length ? `已展示 ${visible.length} / ${filtered.length} 条` : "";
}

function statusLabel(source) {
  const status = String(source.status || "unknown").toLowerCase();
  if (status === "cached" && source.manualReadOn) return ["浏览器选录 · API 待接入", true];
  if (["ok", "success", "healthy", "connected", "active"].includes(status)) return ["采集正常", false];
  if (["disabled", "pending", "unconfigured", "not_configured", "not-configured", "needs_credentials", "not_connected"].includes(status)) return ["待接入", true];
  if (["error", "failed", "failure", "unavailable"].includes(status)) return ["采集失败", true];
  if (["cached", "stale", "partial"].includes(status)) return ["保留已有资料", true];
  return [source.status ? String(source.status) : "状态未提供", true];
}

function renderSources() {
  const list = el("source-list");
  list.replaceChildren();
  const sources = [...state.sources];
  if (!sources.some((source) => source.platform === "X" || String(source.id).toLowerCase() === "x")) {
    sources.push({ id: "x", name: "X", platform: "X", status: "unconfigured", error: "未提供接入状态，需要配置访问权限。" });
  }
  sources.forEach((source) => {
    const row = node("div", "source-row");
    const top = node("div", "source-row-top");
    top.append(externalLink(source.url, "source-name", source.name || source.id || source.platform || "未命名来源"));
    const [label, warning] = statusLabel(source);
    top.append(node("span", `source-state${warning ? " warning" : ""}`, label));
    row.append(top);
    const metadata = [source.platform, typeof source.count === "number" ? `${source.count} 条` : null,
      source.manualReadOn ? `人工查阅：${source.manualReadOn}` : null,
      `${source.id === "editorial-writing" ? "最近核对" : "自动采集最近成功"}：${dateText(source.lastSuccessAt, source.id !== "editorial-writing")}`].filter(Boolean);
    row.append(node("p", "source-detail", metadata.join(" · ")));
    if (source.error) row.append(node("p", "source-error", typeof source.error === "string" ? source.error : JSON.stringify(source.error)));
    list.append(row);
  });
  el("sources-updated").textContent = state.feed
    ? `索引生成：${dateText(state.feed.generatedAt, true)}；最近尝试：${dateText(state.feed.lastAttemptAt, true)}`
    : "尚未取得来源状态。";
}

function scheduleText(schedule) {
  if (!schedule) return "来源未提供更新安排";
  if (typeof schedule === "string") return schedule;
  if (schedule.description) return String(schedule.description);
  return Object.entries(schedule).map(([key, value]) => `${key}：${typeof value === "object" ? JSON.stringify(value) : value}`).join(" · ");
}

function applyFeed(feed, mode) {
  if (!feed || !Array.isArray(feed.items)) throw new Error("资料结构不完整");
  state.feed = feed;
  state.items = feed.items.filter((item) => item && typeof item === "object");
  state.sources = Array.isArray(feed.sources) ? feed.sources.filter((source) => source && typeof source === "object") : [];
  const date = dateValue(feed.generatedAt);
  el("edition-date").textContent = date === null ? "采集时间未提供" : `${dateText(feed.generatedAt)} · 资料索引`;
  el("schedule").textContent = scheduleText(feed.schedule);
  const prefix = mode === "api" ? "在线索引" : mode === "bundled" ? "部署副本 · 实时索引暂不可用" : mode === "static" ? "静态副本 · 在线接口暂不可用" : "浏览器缓存 · 网络获取失败";
  const failures = state.sources.filter((source) => ["error", "failed", "failure", "unavailable"].includes(String(source.status).toLowerCase())).length;
  el("feed-status").textContent = `${prefix} · 索引生成 ${dateText(feed.generatedAt, true)}${failures ? ` · ${failures} 个来源采集失败` : ""}`;
  el("feed-status").classList.toggle("is-warning", mode !== "api" || failures > 0);
  render();
  renderSources();
}

async function loadFeed() {
  el("retry-button").disabled = true;
  el("stories").setAttribute("aria-busy", "true");
  el("feed-status").textContent = "正在获取资料索引…";
  try {
    for (const [url, mode] of [["/api/feed", "api"], ["/data/feed.json", "static"]]) {
      try {
        const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(12000) });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const feed = await response.json();
        applyFeed(feed, response.headers.get("X-Feed-Origin") === "bundled-fallback" ? "bundled" : mode);
        try { localStorage.setItem(cacheKey, JSON.stringify(feed)); } catch { /* The feed remains usable when storage is unavailable. */ }
        return;
      } catch { /* Try the next explicitly labelled source. */ }
    }
    let cached = null;
    try { cached = JSON.parse(localStorage.getItem(cacheKey)); } catch { /* Invalid cache is ignored. */ }
    if (cached) {
      applyFeed(cached, "cache");
      return;
    }
    throw new Error("未取得资料");
  } catch {
    el("feed-status").textContent = "暂时无法获取资料，在线接口与静态副本均不可用。可以稍后重新获取。";
    el("feed-status").classList.add("is-warning");
    render();
    renderSources();
    el("empty-state").querySelector("h3").textContent = "资料暂时未能载入";
    el("empty-state").querySelector("p").textContent = "请使用右侧的“重新获取资料”再试一次。";
  } finally {
    el("stories").setAttribute("aria-busy", "false");
    el("retry-button").disabled = false;
  }
}

el("filter-form").addEventListener("submit", (event) => event.preventDefault());
["search", "platform", "sort"].forEach((id) => el(id).addEventListener(id === "search" ? "input" : "change", () => {
  state.limit = pageSize;
  render();
}));
el("reset-filters").addEventListener("click", () => {
  el("search").value = "";
  el("platform").value = "";
  el("sort").value = "newest";
  setCategory("全部");
});
el("load-more").addEventListener("click", () => { state.limit += pageSize; render(); });
el("writing-filter").addEventListener("click", () => {
  el("search").value = "";
  el("platform").value = "";
  setCategory("写作与编辑");
  el("feed").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
});
el("retry-button").addEventListener("click", loadFeed);
el("source-button").addEventListener("click", () => {
  renderSources();
  el("sources-dialog").showModal();
});
el("close-sources").addEventListener("click", () => el("sources-dialog").close());
el("sources-dialog").addEventListener("close", () => el("source-button").focus());
renderCategories();
loadFeed();
