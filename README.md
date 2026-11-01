# 新知录

在线阅读：[skills-observatory.ancient-art-9bbf.workers.dev](https://skills-observatory.ancient-art-9bbf.workers.dev) · [GitHub 仓库](https://github.com/Sco-QianC01/skills-observatory)

面向中文读者的 AI、Skills、开源项目与写作方法资料索引。自动采集公开订阅和 API 元数据，结合人工阅读整理的写作资料，保留原始标题、出处、日期含义与来源状态。页面支持全字段搜索、分类与平台筛选、日期排序，以及写作步骤和许可限制的展开阅读。

自动短摘用于判断是否值得打开原文，不代表全文精读结论。采集时间、原文发布日期、仓库更新时间和技能文件更新时间分别标注，不相互替代。

## 采集来源

来源与限额见 [src/sources.js](src/sources.js)，解析、合并和失败处理见 [src/collector.js](src/collector.js)。

| 来源 | 采集方式 | 凭据与当前验收范围 |
| --- | --- | --- |
| OpenAI News、Google AI、Hugging Face Blog | 官方 RSS | 无需 API key；以每次生成索引中的来源状态为准 |
| OpenAI、Anthropic、Google DeepMind 视频 | 官方 YouTube Atom | 无需 API key；2026-11-01 05:03 UTC 实采 OpenAI、Anthropic HTTP 404，分别保留 10、7 条历史资料 |
| GitHub Agent Skills、AI 工作流与 LLM 项目 | GitHub repository search API | 按主题、星数门槛和更新时间检索；Actions 使用 `GITHUB_TOKEN` |
| Hacker News AI 讨论 | Algolia 公开搜索 API | 收录近七天且分数大于 5 的讨论；分数是采集时快照 |
| X Skills 与工作流分享 | X recent search API；可合并人工浏览器快照 | 云端自动采集需要 `X_BEARER_TOKEN` 及相应 API 权限 |
| 专业写作与编辑指南 | 人工阅读原始文件后整理 | 从 [writing-skills.json](research/writing-skills.json) 导入，标为编辑选读 |

X 的登录 Edge 会话已在 2026-11-01 实际读取并手动选录 4 条公开分享，记录的 `readOn` 为 `2026-11-01`；这与开发者 API 授权是两条通路。采集脚本可读取 `public/data/browser-x.json` 中的浏览器快照，但不会操作浏览器或自动刷新该快照。当前没有 X API Token，也未连接 xMCP；最新索引状态为 `cached`、4 条，自动采集的 `lastSuccessAt=null`，不能把手动阅读日期当成 API 成功时间。浏览器登录不使云端 API 自动可用。

YouTube 频道为 OpenAI `UCXZCJLdBC09xxGZ6gcdrc6A`、Anthropic `UCrDwWp7EBBv4NwvScIpBDOA`、Google DeepMind `UCP7jMXSY2xbc3KCAE0MHQ-A`。Atom 只提供有限的近期条目，不保证覆盖频道全部视频。请求可用性会变化，失败时如实保留错误和有效历史条目，不据此替换已核对的频道 ID。具体历史请求、原始日期和身份核验边界见 [平台连接器研究](research/platform-connectors.md)。

## 更新与保留

[采集工作流](.github/workflows/collect.yml) 使用 GitHub Actions cron `17 */6 * * *`，即北京时间每日 **02:17、08:17、14:17、20:17**。GitHub 定时任务可能排队或延迟，不保证准点；也可使用 `workflow_dispatch` 手动触发。定时工作流需在默认分支启用，并允许工作流以 `contents: write` 权限提交索引变更。

每轮最多四个来源并发，单请求超时 18 秒，响应体上限 2.5 MB。索引按规范化 URL 去重，通常保留近 90 天的自动资料，编辑选读不受日期窗口限制，总条目数上限 450。缺少原文日期时保持未知，不用采集时间补填。

来源失败时保留仍在保留范围内的既有条目，记录错误和最近成功时间。所有自动来源均未成功时，采集命令以失败状态退出；工作流仍会尝试保存更新后的状态索引。因此，页面存在内容、命令生成文件与某个来源本次成功是不同的状态，应查看来源对话框确认。

## 本地开发

需要 Node.js 22 或更新版本。按锁文件安装依赖后运行：

```sh
npm ci
npm run collect
npm test
npm run check
npm run dev
```

`npm run collect` 会访问公开网络并更新 `public/data/feed.json`，从已有索引、写作研究条目及可选浏览器快照合并生成新索引。`npm test` 运行 Node 测试，`npm run check` 检查 Worker、采集器与前端脚本语法。`npm run dev` 通过 Wrangler 启动本地开发环境，访问地址以终端输出为准。

本地采集可通过环境变量提供 `GITHUB_TOKEN`；不提供时仍会尝试公开 GitHub 请求，但更容易受到匿名请求额度限制。X API 接入使用 `X_BEARER_TOKEN`。在 GitHub Actions 中，前者由工作流令牌提供，后者读取同名仓库 secret。不要把令牌写入公开配置、数据文件或研究文档；无需为查看页面配置这些凭据。

## Cloudflare 部署

部署入口：

```sh
npm run deploy
```

该命令调用 Wrangler，需先在本机或部署环境完成相应 Cloudflare 授权，并确认目标账号与 [wrangler.jsonc](wrangler.jsonc) 配置。本轮已实际部署至 [Cloudflare 站点](https://skills-observatory.ancient-art-9bbf.workers.dev)，版本为 `efa5b309-b0be-40a0-86a1-a75a6fef90b2`；`/health`、`/` 与 `/api/feed` 均已返回 HTTP 200，接口响应头 `X-Feed-Origin: github`。桌面与移动浏览器交互验收已通过，范围见下方交付记录。

[src/worker.js](src/worker.js) 提供静态资源与 `/api/feed`：

- 静态页面和随部署打包的资料副本来自 `public/`。
- `/api/feed` 优先读取 `FEED_URL` 指向的 GitHub raw JSON，并校验基本结构；当前实现只接受 HTTPS 的 `raw.githubusercontent.com` 地址。
- 成功的上游响应采用 120 秒缓存；上游请求或校验失败时，回退到部署包内的 `/data/feed.json`。
- `/health` 返回 Worker 的基本存活信息，不能代替采集成功或资料新鲜度验收。

**这是 Worker 静态资源加 GitHub JSON 代理，不是 Cloudflare Cron 采集。** 更新采集逻辑由 GitHub Actions 完成并提交 JSON；Worker 从配置的 GitHub 地址读取新索引，静态兜底副本则随下一次部署更新。修改仓库归属或分支时，应同时检查 `FEED_URL`，避免读取旧项目的数据。

前端请求在线接口失败后还会尝试静态 JSON 和浏览器缓存，并标明回退状态。资料是否新鲜应结合索引生成时间、来源最近成功时间与错误状态判断。

## 写作资料与连接器边界

六份写作来源的具体文件、提交 SHA、许可与适用限制见 [写作方法研究](research/writing-workflow.md)，可供采集器读取的记录见 [writing-skills.json](research/writing-skills.json)。整理顺序为事实与确定程度、段落结构、具体表达、读者审阅；不为追求自然感编造经历、数据、引文或结论。

| 原文 | 本站整理的用途 |
| --- | --- |
| [Humanizer · SKILL.md](https://github.com/blader/humanizer/blob/main/SKILL.md) | 识别模板表达，保留事实后改写段落 |
| [Humanizer-zh · SKILL.md](https://github.com/op7418/Humanizer-zh/blob/main/SKILL.md) | 保护中文语义、确定程度与作者声音 |
| [Anthropic · Doc Co-Authoring](https://github.com/anthropics/skills/blob/main/skills/doc-coauthoring/SKILL.md) | 收集上下文、逐节构建、独立读者检查 |
| [Google · Markdown Style Guide](https://github.com/google/styleguide/blob/gh-pages/docguide/style.md) | 组织技术文档、链接与可维护源码 |
| [Diátaxis · Compass](https://github.com/evildmp/diataxis-documentation-framework/blob/main/source/compass.rst) | 按读者任务区分教程、操作、参考和解释 |
| [Stop Slop · SKILL.md](https://github.com/hardikpandya/stop-slop/blob/main/SKILL.md) | 检查空泛表达、重复收尾与具体行动 |

以上链接跟随各项目分支更新；本次精读版本的固定提交链接保存在研究文档中。写作条目的 `publishedAt` 表示所链接文件最近一次提交时间，`verifiedAt` 表示资料核验日期，均不表示项目首发日期。

“去模板化”属于编辑工作，不是作者身份鉴定，不能保证检测率下降或规避 AI 检测器。禁词表与模型自评分也不能替代事实核验、学术要求或作者终审。

[平台连接器研究](research/platform-connectors.md) 核验了 `xdevplatform/xmcp`、`coyaSONG/youtube-mcp-server` 和 `mrsknetwork/ytmcp` 的公开源码、许可及凭据要求。**这些 MCP 仅完成源码调研，尚未安装或连接。** 当前 Atom 采集不依赖 YouTube MCP，浏览器读取也不能作为 xMCP 已接入的证据。

各原始项目的许可分别记录，公开可读不等于可任意再分发。本站保留原文外链与短摘，不重新发布来源全文；专业和时效性结论仍应回到原始材料核对。

## 许可与交付状态

本站原创代码采用 [MIT License](LICENSE)。第三方文章、摘要所引材料、技能原文、商标与外链目标保留各自权利；本站代码许可不为这些内容重新授权。具体转载、改编或安装前，应分别核对来源许可与署名要求。

截至 2026-11-01，交付负责人已确认以下结果：

- 公开仓库 [Sco-QianC01/skills-observatory](https://github.com/Sco-QianC01/skills-observatory) 已创建，代码提交为 `56ae4dfe6d6324a8248aa7008d031c50439f694c`；bot 提交 `55c2598dc3229c6087a1c45a6f56bbcdac211d3a` 仅更新索引，已快进合入本地。
- [GitHub Actions 运行 41275374636](https://github.com/Sco-QianC01/skills-observatory/actions/runs/41275374636) 经 `workflow_dispatch` 实际成功，2026-11-01 `05:02:47Z` 至 `05:03:06Z` 的 10 个步骤全部成功，包含测试。
- `npm test` 的 11 项测试及 `npm run check` 语法检查均通过；新工作流中的测试也通过。
- 最新索引 `generatedAt=2026-11-01T05:03:00.818Z`，171 条，11 个动态来源中 8 个成功；OpenAI、Anthropic YouTube HTTP 404，分别保留 10、7 条历史资料，X 为手动选录的 4 条缓存。
- Cloudflare 已实际部署，首页、健康检查、数据接口均 HTTP 200，数据接口响应来源为 `github`；版本和地址见上方部署说明。
- `evidence/browser-acceptance.mjs` 实际运行退出 0，`evidence/browser-acceptance.json` 为 11/11 PASS。覆盖桌面 1440×1000、手机 390×844 和 320px 宽度，验证搜索、分类、排序、分页 16 到 32 条、6 条写作选读详情、来源弹窗 Esc 关闭与焦点恢复、安全外链及无横向溢出；控制台、页面和请求错误均为 0。
- 负责人已查看 `desktop.png`、`mobile.png`、`writing.png`、`sources-mobile.png`，确认中文字体正常、布局无遮挡。先前 QA 环境的共享库和字体问题已用隔离 Chromium 运行库、项目 Fontconfig 及已有 Windows 字体解决，未安装系统依赖或改动产品。

以上是对应执行时刻与指定视口的证据，不保证未来每轮成功或覆盖所有设备。当前剩余限制是 X API/MCP 与 YouTube MCP 未连接，以及两个 YouTube Atom 源本轮 HTTP 404 后使用历史资料，见 [.phrase 任务记录](.phrase/phases/current/task_observatory.md)。
