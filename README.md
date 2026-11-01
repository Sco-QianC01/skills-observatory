# 新知录

在线阅读：[skills-observatory.ancient-art-9bbf.workers.dev](https://skills-observatory.ancient-art-9bbf.workers.dev) · [GitHub 仓库](https://github.com/Sco-QianC01/skills-observatory)

面向中文读者的 AI、Skills、音乐科技、区域文化资讯与写作方法资料索引。自动采集公开订阅和 API 元数据，结合人工阅读整理的写作资料，保留原始标题、出处、日期含义与来源状态。页面支持全字段搜索、分类与平台筛选、日期排序，以及写作步骤和许可限制的展开阅读。

自动短摘用于判断是否值得打开原文，不代表全文精读结论。采集时间、原文发布日期、仓库更新时间和技能文件更新时间分别标注，不相互替代。

## 阅读界面

2026-11-01 重设计以查找和阅读资料为主：桌面采用左侧目录、中央连续列表、右侧活动栏；手机默认收起分类，保留直接可见的搜索和文章。移除了大幅宣传标题、装饰性编号与重复标签，采用冷白背景、系统中文字体和细分隔线。清除筛选可以在列表有结果时使用，分类目录支持键盘操作和屏幕宽度切换。

实际读取了 [Impeccable](https://github.com/pbakaus/impeccable/blob/main/skill/SKILL.src.md) 与 [Anthropic frontend-design](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md) 的原始说明，结合阅读任务取舍；出处、许可和未采用的建议见 [设计研究](research/frontend-redesign.md)，实施规范见 [DESIGN.md](DESIGN.md)。

本地语法检查和 24 项测试通过，真实浏览器 18/18 通过，报告为 `evidence/redesign-local-browser.json`。在相同视口下，第一条资料距页面顶部从桌面约 1370px、手机约 1888px，分别缩至约 419px、537px；1440px、900px、390px、320px 布局均无横向溢出。验收包括搜索、分类、排序、分页、写作详情、地区偏好、活动入口、来源弹窗、键盘焦点与请求失败后的重试。线上发布结果以部署说明和当前任务记录为准。

## 采集来源

来源与限额见 [src/sources.js](src/sources.js)，解析、合并和失败处理见 [src/collector.js](src/collector.js)。

当前配置含 25 个动态来源，围绕音乐制作、AI 音乐、实时交互、视听艺术、空间音频、写作与研究六个主题组织，工具兴趣包括 Cubase、Kontakt、Ableton Live、Max/MSP、TouchDesigner 与 ACE Studio。工具兴趣不表示每个产品均已接入专属官方消息源。

| 来源 | 采集方式 | 凭据与当前验收范围 |
| --- | --- | --- |
| OpenAI News、Google AI、Hugging Face Blog | 官方 RSS | 无需 API key；以每次生成索引中的来源状态为准 |
| OpenAI、Anthropic、Google DeepMind 视频 | 官方 YouTube Atom | 无需 API key；2026-11-01 08:05 UTC 实采三路均成功，各 10 条 |
| GitHub Agent Skills、AI 工作流与 LLM 项目 | GitHub repository search API | 按主题、星数门槛和更新时间检索；Actions 使用 `GITHUB_TOKEN` |
| Hacker News AI 讨论 | Algolia 公开搜索 API | 收录近七天且分数大于 5 的讨论；分数是采集时快照 |
| X Skills 与工作流分享 | X recent search API；可合并人工浏览器快照 | 云端自动采集需要 `X_BEARER_TOKEN` 及相应 API 权限 |
| 专业写作与编辑指南 | 人工阅读原始文件后整理 | 从 [writing-skills.json](research/writing-skills.json) 导入，标为编辑选读 |
| Ableton、Steinberg、TouchDesigner、Ableton Link | 官方博客与公告 RSS、社区 RSS、GitHub releases | 社区发帖、官方公告和正式发行分别标注 |
| 音频转 MIDI、空间音频、音乐信息检索、IRCAM ACIDS | GitHub repository search API | 仓库推送时间不代表新版发行日期 |
| 澳门、香港、珠海官方新闻与澳门文化活动 | RSS、官方 HTML 列表及活动表 | 新闻按兴趣词筛选；活动单独保存日期、场地与参加方法 |

区域暂定澳门，可切换香港和珠海；这不是经过定位确认的当前所在地。香港康文署文化节目搜寻、珠海文广旅体局门户提供官方外部入口，不表示本站已自动抓取这些入口中的活动。来源实测与解析边界见 [音乐科技与区域来源研究](research/music-local-sources.md)。

当前云端索引生成于 `2026-11-01T08:35:19.294Z`（北京时间 16:35），包含 261 条资料、24 场活动；25 个动态来源中 22 个成功。Steinberg 本轮成功采集 12 条，三路 YouTube 各成功采集 10 条；`github-skills`、`github-ai` 本轮有效条目为 0，状态为错误，分别保留 28、52 条既有资料。X API 未配置，保留浏览器人工选录 4 条，状态为 `cached`，不计为自动成功。

上一版音乐科技与区域扩展在前端焦点和失败状态修复后实际运行 `npm run check && npm test`，语法检查通过，24 项测试全部通过。本地浏览器验收 16/16 通过，证据为 `evidence/music-local-local-browser.json`：覆盖桌面 1440px、移动 390px/320px、地区与主题持久化、键盘焦点、feed 503 与断网重试、活动日期和空状态；页面、控制台及请求错误均为 0。该版标题 CSS `text-wrap: balance` 已由对应生产浏览器验收覆盖。

该版生产浏览器实际验收 16/16 PASS，执行退出 0，报告为 `evidence/music-local-production-browser.json`。1440×1000、390×844 和 320px 宽度均无横向溢出，控制台错误、页面错误及失败请求均为 0；筛选、地区持久化、活动时间地点与多场次、503 错误与重试、原生键盘焦点均通过。主任务另已查看 `production-desktop`、`mobile-top`、`ai-event` 三张截图。

功能提交 `6a22a4931ee4446eadadb2ec7e98ae037bbabe7d` 已推送；本次 [Actions 运行 41289478145](https://github.com/Sco-QianC01/skills-observatory/actions/runs/41289478145) 经 `workflow_dispatch` 实际完成并成功，10 个步骤全部成功，包括 `npm test`、采集和 `Save source index`，证据为 `evidence/music-local-actions.json`。bot 索引提交 `fb5fd97` 已取回并快进合并。

X 的登录 Edge 会话已在 2026-11-01 实际读取并手动选录 4 条公开分享，记录的 `readOn` 为 `2026-11-01`；这与开发者 API 授权是两条通路。采集脚本可读取 `public/data/browser-x.json` 中的浏览器快照，但不会操作浏览器或自动刷新该快照。当前没有 X API Token，也未连接 xMCP；最新索引状态为 `cached`、4 条，自动采集的 `lastSuccessAt=null`，不能把手动阅读日期当成 API 成功时间。浏览器登录不使云端 API 自动可用。

YouTube 频道为 OpenAI `UCXZCJLdBC09xxGZ6gcdrc6A`、Anthropic `UCrDwWp7EBBv4NwvScIpBDOA`、Google DeepMind `UCP7jMXSY2xbc3KCAE0MHQ-A`。Atom 只提供有限的近期条目，不保证覆盖频道全部视频。请求可用性会变化，失败时如实保留错误和有效历史条目，不据此替换已核对的频道 ID。具体历史请求、原始日期和身份核验边界见 [平台连接器研究](research/platform-connectors.md)。

## 更新与保留

[采集工作流](.github/workflows/collect.yml) 使用 GitHub Actions cron `17 */6 * * *`，即北京时间每日 **02:17、08:17、14:17、20:17**。GitHub 定时任务可能排队或延迟，不保证准点；也可使用 `workflow_dispatch` 手动触发。定时工作流需在默认分支启用，并允许工作流以 `contents: write` 权限提交索引变更。

每轮最多四个来源并发，单请求超时 18 秒，响应体上限 2.5 MB。新闻资料按规范化 URL 去重，通常保留近 90 天的自动资料，编辑选读不受日期窗口限制，新闻资料上限 450 条。缺少原文日期时保持未知，不用采集时间补填。

活动使用独立的 `startsOn`、`endsOn` 与来源发布日期，按活动结束日期保留，仍在展期或举办期内的活动不套用新闻的 90 天窗口。同一公告 URL 下的不同表演或日期保留独立条目，活动上限 120 条。hush! 2026 的原始表有 18 行活动，“11月14及15日”展开后为 19 场；多时段保留原文，不臆造未提供的时间。日历系列活动须回原文确认具体场次与开放时间。

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

该命令调用 Wrangler，需先在本机或部署环境完成相应 Cloudflare 授权，并确认目标账号与 [wrangler.jsonc](wrangler.jsonc) 配置。本次已实际部署至 [Cloudflare 站点](https://skills-observatory.ancient-art-9bbf.workers.dev)，版本 `4ade365a-2d74-4041-9980-a03eef20e5f4`；首页、`/health`、`/api/feed` 均 HTTP 200，数据接口响应头 `X-Feed-Origin: github`，索引生成时间与上述云端快照吻合，生产浏览器 16/16 验收通过。此前版本 `efa5b309-b0be-40a0-86a1-a75a6fef90b2` 仅保留为上一次部署基线。

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

以下为 2026-11-01 上一次交付基线，不能替代本次扩展的验收：

- 公开仓库 [Sco-QianC01/skills-observatory](https://github.com/Sco-QianC01/skills-observatory) 已创建，代码提交为 `56ae4dfe6d6324a8248aa7008d031c50439f694c`；bot 提交 `55c2598dc3229c6087a1c45a6f56bbcdac211d3a` 仅更新索引，已快进合入本地。
- [GitHub Actions 运行 41275374636](https://github.com/Sco-QianC01/skills-observatory/actions/runs/41275374636) 经 `workflow_dispatch` 实际成功，2026-11-01 `05:02:47Z` 至 `05:03:06Z` 的 10 个步骤全部成功，包含测试。
- 当时 `npm test`、`npm run check` 及工作流测试通过；当前测试数量与结果以本次实际执行为准。
- 上一次索引生成于 `2026-11-01T05:03:00.818Z`；OpenAI、Anthropic YouTube HTTP 404 后保留有效历史资料，X 使用人工选录缓存。当前条目数与来源状态以最新生成索引为准。
- Cloudflare 已实际部署，首页、健康检查、数据接口均 HTTP 200，数据接口响应来源为 `github`；版本和地址见上方部署说明。
- `evidence/browser-acceptance.mjs` 实际运行退出 0，`evidence/browser-acceptance.json` 为 11/11 PASS。覆盖桌面 1440×1000、手机 390×844 和 320px 宽度，验证搜索、分类、排序、分页 16 到 32 条、6 条写作选读详情、来源弹窗 Esc 关闭与焦点恢复、安全外链及无横向溢出；控制台、页面和请求错误均为 0。
- 负责人已查看 `desktop.png`、`mobile.png`、`writing.png`、`sources-mobile.png`，确认中文字体正常、布局无遮挡。先前 QA 环境的共享库和字体问题已用隔离 Chromium 运行库、项目 Fontconfig 及已有 Windows 字体解决，未安装系统依赖或改动产品。

以上是对应执行时刻与指定视口的证据，不保证未来每轮成功或覆盖所有设备。X API/MCP 与 YouTube MCP 尚未连接；当前三路 YouTube Atom 均已采集成功，Atom 不依赖 YouTube MCP。本次扩展验收见 [当前任务记录](task_observatory.md)；原交付记录保留在 [.phrase 任务记录](.phrase/phases/current/task_observatory.md)。
