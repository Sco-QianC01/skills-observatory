# 新知录

中文阅读博客，关注音乐科技、AI、开源工作流、版权政策、财经消息与港珠澳活动。保留原始标题、出处和日期；短摘帮助决定是否打开原文，不代表全文精读。

站点：<https://skills-observatory.ancient-art-9bbf.workers.dev>。仓库：<https://github.com/Sco-QianC01/skills-observatory>。博客版已推送并部署，2026-11-02 通过正式站点浏览器和HTTP验收，见 [任务记录](task_observatory.md)。

## 阅读与检索

桌面采用文章主栏和侧栏，提供“选读、全部文章、稍后读”三个视图；侧栏展示阅读兴趣、政策消息与周边活动。手机改为单列。界面采用统一字号、细分隔线和语义颜色，不使用渐变、阴影或模糊效果。版式与交互约定见 [DESIGN.md](DESIGN.md)。

页面外观可选择跟随系统、浅色或深色；选择保存在当前浏览器，与阅读兴趣和稍后读分开。跟随系统时响应系统外观变化，浏览器禁止存储时仍可切换本次外观。字体优先声明 Anthropic Sans，实际使用可用的系统回退字体，不加载外部字体。

搜索覆盖已收录标题、摘要、来源、主题、作者等元数据，不搜索原站全文。空格连接多个条件取AND，支持双引号短语、`-排除词`、`source:WIPO`、`topic:音乐制作`、`after:2026-10-01`、`before:2026-11-02`；日期按北京时间且包含当天。分类、主题、平台、来源和日期筛选可以组合，提供新旧、相关度和按关注排序。

用户可选择九个主题；六项工具兴趣为Cubase、Kontakt、Ableton Live、Max/MSP、TouchDesigner、ACE Studio，不表示各工具均有独立订阅或可单独编辑。关注主题影响首页近期选读与推荐排序。偏好和最多200篇稍后读保存在当前浏览器，不跨设备同步；清理浏览器数据会移除这些记录。

GitHub、YouTube、X、新闻搜索是用户点击后跳转的外站入口，不表示本站自动抓取搜索结果。澳门只是可改为香港或珠海的暂设阅读范围，不使用定位推断所在地；城市选择影响本地新闻和活动，国际财经法律信息保留发布辖区。

## 来源与当前快照

来源配置见 [src/sources.js](src/sources.js)，采集实现见 [src/collector.js](src/collector.js)。当前为41个自动采集来源、1个X人工选录来源和1个编辑选读来源，共43个入口。

|内容|采集方式与边界|
|---|---|
|AI与音乐科技|官方RSS/Atom、Steinberg公告、TouchDesigner社区及正式发行；社区讨论不标作官方公告|
|GitHub项目|repository search API，失败时可回退到明确对应的release Atom；仓库推送时间与发行日期分别保留|
|财经与法律|HKMA、Fed、ECB、SEC、英国官方机构、WIPO等；标注辖区和原文日期，新闻或指南不等同已生效法律|
|本地新闻与活动|澳门、香港、珠海官方RSS或HTML；活动单独保存日期、场地及原文参加方式|
|写作方法|人工阅读原始资料后整理，标为编辑选读，见 [写作研究](research/writing-workflow.md)|
|X|当前没有API访问凭据，仅保留人工选录快照，状态为cached；不会自动操作浏览器刷新快照|
|YouTube|OpenAI、Anthropic、DeepMind官方Atom，只覆盖有限近期条目；不依赖也不声称已连接YouTube MCP|

本轮云端数据快照生成于 `2026-11-02T09:43:26.398Z`（北京时间17:43），含450篇文章、24项活动。41个自动来源和1个编辑来源状态为ok，X人工选录来源为cached；自动来源本轮没有失败。成功获取订阅不等于一定存在近期条目：Native Instruments、WIPO Lex和英国法律订阅本轮均无符合保留条件的文章，不补写日期或凑入旧闻。

[Actions运行41422947590](https://github.com/Sco-QianC01/skills-observatory/actions/runs/41422947590) 的测试、采集及索引保存步骤均已实际成功，生成索引提交 `b227d4e`。此前本地采集曾遇到NI限流、Steinberg请求失败；恢复与保留机制的本地验收仍记录在任务文件中，不能把本次成功推断为以后每次均成功。

新增来源与HTTP/XML探针见 [核验报告](research/verified-sources-20261102.md)。NI订阅部分内容较旧，不用采集日期替换原文日期。财经法律资料用于了解信息，不构成投资建议或个案法律意见；适用地域和生效时间以原始机构文本为准。

## 更新与保留

[GitHub Actions](.github/workflows/collect.yml) 使用 `17 */6 * * *`，即北京时间每日02:17、08:17、14:17、20:17，可能排队或延迟；支持手动触发。工作流需要提交索引的权限。Cloudflare Worker负责静态资源和数据代理，不执行这一定时采集。

RSS/Atom采集有界：最多四源并发，每源18秒预算，瞬时错误最多重试一次，响应体有大小限制。按规范化URL去重，自动文章通常保留90天，总量上限450篇并按来源公平分配；编辑选读不受文章日期窗口限制。缺少原文日期时保持未知。

活动按结束日期保留，不套用文章90天窗口，最多120项；同一公告下不同日期和表演可单列。具体场次、开放时间与报名条件仍需回原文核对。香港康文署和珠海文广旅体局外链属于官方入口，不表示已自动抓取其中全部活动。

来源失败时保留仍有效的历史条目，记录错误和真实最近成功时间；全部自动来源失败时采集命令失败退出。页面有文章不等于本轮采集成功。前端依次尝试在线接口、静态副本、浏览器缓存，并显示实际回退状态。

## 本地验收

使用Node.js 22或更新版本：

```sh
npm ci
npm run check
npm test
npm run collect
npm run dev
```

`collect`访问公开网络并更新 `public/data/feed.json`；`check`和`test`检查代码与测试，不能替代真实浏览器验收。开发地址以Wrangler输出为准。2026-11-03语法检查及58项测试通过；本地真实Chromium浏览器20项阅读功能、11项主题与设计检查通过。覆盖搜索、组合筛选、兴趣与收藏持久化、320/390/900/1440px布局、接口与静态索引失败后的缓存回退，以及无缓存时的重试；另核对系统外观变化、主题持久化与存储失败、深色对话框、长标题、提示消息位置和文字对比度。正常访问的控制台、运行时和请求错误均为0。报告为 `evidence/imagine-local-browser.json`、`evidence/imagine-local-theme.json`；本轮正式站验收仍待部署后执行，证据目录不提交版本库。

GitHub采集可使用环境变量 `GITHUB_TOKEN`，无令牌时使用公开请求更容易遇到限流；X自动API采集需要 `X_BEARER_TOKEN`及访问权限。不要把令牌写入配置、数据或文档。浏览页面无需配置这些凭据。

## 部署

```sh
npm run deploy
```

部署需已授权的Cloudflare账号，并核对 [wrangler.jsonc](wrangler.jsonc)。本轮已部署版本 `f90da890-ffd4-4bde-aae6-db948164678b`。2026-11-02 09:50 UTC核验：首页、`/health`、`/api/feed`、静态索引及三项前端资源均为HTTP 200；API来自GitHub且与静态索引一致，线上JS/CSS哈希与本地一致。证据为 `evidence/blog-production-http.json`；主任务已查看正式站桌面与手机截图。

[Worker](src/worker.js) 的 `/api/feed`优先请求 `FEED_URL`，只接受HTTPS的 `raw.githubusercontent.com`地址，成功响应缓存120秒；失败时回退到部署包内 `/data/feed.json`。静态兜底副本随部署更新。`/health`只说明服务存活，不证明来源成功或数据新鲜。变更仓库或分支时同时核对 `FEED_URL`。

## 研究与许可

写作资料固定版本、许可与适用限制见 [写作研究](research/writing-workflow.md)；平台MCP调研见 [连接器研究](research/platform-connectors.md)。源码调研不等于安装或连接，浏览器登录也不等于取得云端API权限。

采集工作流研究核验RSSHub当前为AGPL v3，Crawl4AI、Miniflux为Apache 2.0；n8n使用Sustainable Use License且有企业许可例外，不能笼统称为OSI开源。这些服务本轮均未安装，具体文档及端点见 [核验报告](research/verified-sources-20261102.md)。

本站原创代码使用 [MIT License](LICENSE)。第三方文章、技能原文、商标及链接目标保留各自权利；公开可读不代表可任意再分发。本站提供外链与短摘，不重新发布来源全文。写作编辑不能保证AI检测率或替代作者终审。
