# 新知录：博客版与来源扩展

## 2026-11-02 博客版交付

- [x] 前端改为博客阅读主栏与侧栏，提供选读、全部文章、稍后读；保留原文和来源状态。
- [x] 搜索支持AND、引号、排除词、source/topic/after/before及组合筛选；范围为已收录标题、摘要和元数据，不是原站全文。
- [x] 九主题、六工具兴趣参与选读与推荐排序；偏好和最多200篇稍后读保存在当前浏览器。
- [x] 来源配置保留既有内容，扩至41个自动采集来源、1个X人工选录来源及1个编辑选读来源；七个GitHub搜索配置经HTTP/XML验证的release Atom备用。
- [x] 新增财经监管、知识产权和政策源，保留辖区及原文日期；澳门为可切换的暂设范围，不声明定位。
- [x] 本轮本地快照 `2026-11-02T08:16:43.564Z`：合并云端59篇有效历史文章后，445篇文章、24项活动；合并不修改采集或成功时间。40状态ok（39自动、1编辑）、1cached（X人工）、2error。NI429无缓存；Steinberg失败保留6条，最近成功2026-11-01。
- [x] 有界采集、每源18秒预算、瞬时错误重试一次；文章450篇、90天窗口、按来源公平分配。
- [x] 更新README与DESIGN，移除将旧目录版描述为当前界面的说明。新增源、探针与第三方许可见 `research/verified-sources-20261102.md`；未安装RSSHub/Crawl4AI/Miniflux/n8n服务。
- [x] `npm run check && npm test` 通过，50/50测试通过；独立采集边界与选读逻辑审查通过。
- [x] 本地真实Chromium浏览器20/20通过，报告 `evidence/blog-local-browser.json`；覆盖检索、组合筛选、兴趣与收藏持久化、URL状态、活动和来源明细、网络及缓存异常恢复。320/390/900/1440px无横向溢出；正常访问的控制台、运行时及失败请求均为0。
- [x] 主任务已查看最终桌面和手机截图，核对中文显示与博客主栏、侧栏、手机单列；截图为 `evidence/blog-local-desktop.png`、`evidence/blog-local-mobile.png`。
- [x] 功能提交 `860be51` 与远端三次定时索引更新合并为 `4e5ab7a`，已推送；合并前核对云端333条原有文章URL全部保留，没有强推。
- [x] 实际触发Actions `41422947590`，状态为 `completed/success`；测试、采集、保存索引均成功，证据 `evidence/blog-actions-acceptance.json`。索引提交 `b227d4e` 已取回；本轮云端快照 `2026-11-02T09:43:26.398Z` 为450篇文章、24项活动、43来源，41自动和1编辑状态ok、X人工来源cached，无自动来源失败。
- [x] 使用现有授权部署Cloudflare，版本 `f90da890-ffd4-4bde-aae6-db948164678b`，退出0。2026-11-02 09:50 UTC正式首页、健康检查、API、静态索引和三项前端资源全部200；`X-Feed-Origin: github`，API与静态索引一致，前端JS/CSS哈希与本地一致，证据 `evidence/blog-production-http.json`。
- [x] 正式站真实Chromium浏览器20/20通过，退出0；控制台错误、页面异常、失败请求均为0，报告 `evidence/blog-production-browser.json`。主任务已查看正式站桌面与手机截图 `evidence/blog-production-desktop.png`、`evidence/blog-production-mobile.png`，中文、控件及响应式布局正常。

边界：外站搜索由用户点击跳转；X没有API权限，不自动刷新人工快照；YouTube Atom不等于已连接MCP。财经法律消息不构成投资建议，适用范围与生效时间回原文确认。

## 2026-11-01 历史阅读界面重设计

日期：2026-11-01。本次只调整资料站前端与设计文档，沿用既有采集和区域数据。

- [x] 实际读取 Impeccable 与 Anthropic frontend-design 原始说明，记录出处、许可与取舍于 `research/frontend-redesign.md`。
- [x] 实现冷白阅读界面：桌面目录／文章／活动三栏，手机分类原生折叠，搜索和资料进入首屏。
- [x] 移除大幅宣传标题、装饰性编号、重复标签；保留原始标题、日期含义、许可说明与来源状态。
- [x] 清除筛选不依赖空结果，目录支持键盘和屏幕宽度切换，地区说明随选择变化。
- [x] `npm run check && npm test` 通过，24/24 测试通过；独立前端差异审查通过。
- [x] 本地真实浏览器 18/18 通过：1440px、900px、390px、320px 无横向溢出；桌面第一条资料约 419px，手机约 537px。报告为 `evidence/redesign-local-browser.json`。
- [x] 主任务查看桌面、390px 手机及 320px 手机实际截图，中文显示正常，控件无遮挡。
- [x] 重设计代码 `3a4113c` 已推送 GitHub；复用现有本机授权部署 Cloudflare，版本 `089c64ef-0de5-43ee-9e96-c6c621e5f97d`。
- [x] 2026-11-01 09:53 UTC 正式站点首页、`/health`、`/api/feed` 均 200，数据来自 GitHub，线上 `app.js`、`style.css` 字节与本地一致。证据为 `evidence/redesign-production-http.json`。
- [x] 正式线上页面运行相同浏览器验收 18/18 PASS、退出 0，页面／控制台／请求错误均为 0，报告为 `evidence/redesign-production-browser.json`；主任务已查看正式站点桌面与手机截图。

## 上一版音乐科技与区域扩展

日期：2026-11-01。上一次部署与工作流验收保留于 README 的“上一次交付基线”；不能作为本次上线证据。

- [x] 来源配置扩展为 25 个动态来源，声明六个阅读主题和六项工具兴趣。
- [x] 澳门政府、文化局新闻及活动、香港公报、珠海要闻核验；澳门是暂定阅读区域，可切换香港和珠海，不声明已确认定位。
- [x] 独立区域解析支持严格活动日期、同 URL 不同表演、场地及参加方法；18 行 hush! 表格展开为 19 场。
- [x] 区域解析测试改用仓库内精简真实 HTML fixture，指定 Node22 下四项测试通过；不依赖被忽略的本地 evidence。
- [x] README 与来源研究更新，区分官方新闻、社区讨论、仓库更新、正式发行、外部活动入口和已自动采集活动。
- [x] 当前云端快照生成于 `2026-11-01T08:35:19.294Z`（北京时间 16:35）：261 条资料、24 场活动，25 个动态来源中 22 个成功；三路 YouTube Atom 各成功 10 条，Steinberg 成功 12 条。`github-skills`、`github-ai` 本轮有效条目为 0，状态错误，分别保留 28、52 条既有资料；X 为人工选录 4 条缓存，非自动成功。
- [x] 前端焦点及失败状态修复后，主任务实际执行 `npm run check && npm test`，语法检查通过，24/24 测试通过。
- [x] 本地浏览器 16/16 通过，证据 `evidence/music-local-local-browser.json`；覆盖桌面 1440px、移动 390px/320px、地区与主题持久化、键盘焦点、feed 503 与断网重试、活动日期和空状态，页面／控制台／请求错误均为 0。
- [x] 功能提交 `6a22a4931ee4446eadadb2ec7e98ae037bbabe7d` 已推送；Actions `41289478145` 实际 `completed/success`，bot 索引提交 `fb5fd97` 已取回并快进合并。
- [x] Cloudflare 部署版本 `4ade365a-2d74-4041-9980-a03eef20e5f4` 成功；首页、`/health`、`/api/feed` 均 200，`X-Feed-Origin: github`，生成时间与当前云端快照吻合。
- [x] Actions 10 个步骤全部成功，包括 `npm test`、采集和 `Save source index`；步骤证据为 `evidence/music-local-actions.json`。
- [x] 正式生产浏览器 16/16 PASS，退出 0，报告 `evidence/music-local-production-browser.json`，覆盖新增标题 CSS `text-wrap: balance`；1440×1000、390×844、320px 宽度无横向溢出，控制台／页面错误／失败请求均为 0，筛选、地区持久化、活动时间地点与多场次、503 错误与重试、原生键盘焦点通过。
- [x] 主任务已查看 `production-desktop`、`mobile-top`、`ai-event` 三张生产截图。

持续边界：X API/MCP 未连接，仅保留授权人工选录快照；三路 YouTube Atom 本轮均成功，失败时保留有效缓存的机制继续适用。香港康文署与珠海文广旅体局链接是官方入口，不代表已自动采集其活动。活动按结束日期保留，ongoing 活动不受新闻 90 天窗口约束，具体场次与开放时间仍须核对原文。本地浏览器、生产部署、正式线上浏览器及本次 Actions 已通过相应验收；旧部署和旧 Actions 结果仅作上一次基线，验收不保证未来每轮成功或覆盖所有设备。
