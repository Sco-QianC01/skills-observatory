const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
  'Cache-Control': 'public, max-age=120',
};

export function validFeed(feed) {
  const validRecord = item => {
    if (!item || typeof item.title !== 'string' || !item.title.trim() || typeof item.url !== 'string') return false;
    if (item.publishedAt != null && typeof item.publishedAt !== 'string') return false;
    try {
      const url = new URL(item.url);
      return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password;
    } catch { return false; }
  };
  return feed && feed.version === 1 && Array.isArray(feed.items) && Array.isArray(feed.sources)
    && feed.items.length <= 450 && (feed.events === undefined || (Array.isArray(feed.events) && feed.events.length <= 120))
    && feed.items.every(validRecord) && (feed.events || []).every(validRecord)
    && feed.sources.every(source => source && typeof source.id === 'string' && typeof source.status === 'string'
      && (source.name == null || typeof source.name === 'string'))
    && (feed.regions === undefined || Array.isArray(feed.regions)) && typeof feed.generatedAt === 'string'
    && Number.isFinite(Date.parse(feed.generatedAt))
    && Date.parse(feed.generatedAt) < Date.now() + 300_000;
}

async function readFeed(response) {
  if (!response.ok || !response.body || Number(response.headers.get('content-length')) > 2_500_000) throw new Error('Invalid feed response');
  const reader = response.body.getReader();
  const chunks = [];
  let length = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 2_500_000) throw new Error('Feed too large');
      chunks.push(value);
    }
  } catch (error) {
    await reader.cancel().catch(() => {});
    throw error;
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  const body = new TextDecoder().decode(bytes);
  if (!validFeed(JSON.parse(body))) throw new Error('Invalid feed');
  return body;
}

export async function feedResponse(request, env, ctx) {
  const cache = globalThis.caches?.default;
  const cacheKey = new Request(new URL('/api/feed', request.url).href);
  const cached = cache ? await cache.match(cacheKey) : null;
  if (cached) return cached;
  if (env.FEED_URL) {
    try {
      const url = new URL(env.FEED_URL);
      if (url.protocol !== 'https:' || url.hostname !== 'raw.githubusercontent.com') throw new Error('Invalid feed origin');
      const upstream = await fetch(url.href, { signal: AbortSignal.timeout(7_000), cf: { cacheTtl: 120, cacheEverything: true } });
      const body = await readFeed(upstream);
      const response = new Response(body, { headers: { ...JSON_HEADERS, 'X-Feed-Origin': 'github' } });
      if (cache) ctx.waitUntil(cache.put(cacheKey, response.clone()));
      return response;
    } catch { /* A bundled snapshot keeps the reading desk usable during upstream failures. */ }
  }
  try {
    const asset = await env.ASSETS.fetch(new Request(new URL('/data/feed.json', request.url)));
    const body = await readFeed(asset);
    return new Response(body, { headers: { ...JSON_HEADERS, 'X-Feed-Origin': 'bundled-fallback', 'Cache-Control': 'no-cache' } });
  } catch {
    return Response.json({ error: '索引暂不可用' }, { status: 503 });
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (!['GET', 'HEAD'].includes(request.method)) return new Response('Method not allowed', { status: 405 });
    if (url.pathname === '/health') return Response.json({ ok: true, service: 'skills-observatory', version: '1.0.0' });
    if (url.pathname === '/api/feed') return feedResponse(request, env, ctx);
    return env.ASSETS.fetch(request);
  },
};
