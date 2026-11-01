const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
  'Cache-Control': 'public, max-age=120',
};

export function validFeed(feed) {
  return feed && feed.version === 1 && Array.isArray(feed.items) && Array.isArray(feed.sources)
    && feed.items.length <= 450 && Number.isFinite(Date.parse(feed.generatedAt))
    && Date.parse(feed.generatedAt) < Date.now() + 300_000;
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
      if (!upstream.ok) throw new Error('Upstream unavailable');
      const body = await upstream.text();
      if (body.length > 2_500_000) throw new Error('Feed too large');
      const feed = JSON.parse(body);
      if (!validFeed(feed)) throw new Error('Invalid feed');
      const response = new Response(body, { headers: { ...JSON_HEADERS, 'X-Feed-Origin': 'github' } });
      if (cache) ctx.waitUntil(cache.put(cacheKey, response.clone()));
      return response;
    } catch { /* A bundled snapshot keeps the reading desk usable during upstream failures. */ }
  }
  const asset = await env.ASSETS.fetch(new Request(new URL('/data/feed.json', request.url)));
  if (!asset.ok) return Response.json({ error: '索引暂不可用' }, { status: 503 });
  return new Response(asset.body, { headers: { ...JSON_HEADERS, 'X-Feed-Origin': 'bundled-fallback', 'Cache-Control': 'no-cache' } });
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
