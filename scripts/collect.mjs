import { readFile, writeFile, mkdir, rename, appendFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { collect } from '../src/collector.js';

const root = new URL('../', import.meta.url);
const output = new URL('public/data/feed.json', root);
async function optionalJson(url, fallback) {
  try { return JSON.parse(await readFile(url, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return fallback; throw error; }
}
const [previous, curated, browser] = await Promise.all([
  optionalJson(output, {}),
  optionalJson(new URL('research/writing-skills.json', root), []),
  optionalJson(new URL('public/data/browser-x.json', root), { items: [] }),
]);
const feed = await collect({ previous, curated, browserItems: browser.items, browserState: browser,
  githubToken: process.env.GITHUB_TOKEN, xBearer: process.env.X_BEARER_TOKEN });
await mkdir(new URL('public/data/', root), { recursive: true });
const temporary = fileURLToPath(output) + '.tmp';
await writeFile(temporary, JSON.stringify(feed, null, 2) + '\n');
await rename(temporary, output);
console.log(JSON.stringify({ generatedAt: feed.generatedAt, items: feed.items.length,
  sources: feed.sources.map(({ id, status, count, error }) => ({ id, status, count, error })) }, null, 2));
if (process.env.GITHUB_STEP_SUMMARY) {
  const rows = feed.sources.map(({ name, status, count, availableCount, retainedCount }) => {
    const countBasis = ['ok', 'fallback'].includes(status) ? '本轮读取' : '旧缓存/人工选录';
    return `| ${name.replaceAll('|', '/')} | ${status} | ${availableCount} | ${count} (${countBasis}) | ${retainedCount} |`;
  });
  await appendFile(process.env.GITHUB_STEP_SUMMARY,
    `## Source Collection\n\n${feed.generatedAt} · ${feed.items.length} articles · ${feed.events.length} events\n\n| Source | Status | Available | Read / Cached | Retained |\n| --- | --- | ---: | --- | ---: |\n${rows.join('\n')}\n`);
}
if (!feed.collection.successfulSources) {
  console.error('所有自动来源均失败；已有资料已保留。本次工作流标记失败。');
  process.exitCode = 1;
}
