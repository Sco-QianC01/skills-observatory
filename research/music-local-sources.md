# 音乐科技与区域来源核验

核验日期：2026-11-01，Asia/Shanghai。配置真值见 [sources.js](../src/sources.js)，本次配置含 25 个动态来源。六个兴趣主题为音乐制作、AI 音乐、实时交互、视听艺术、空间音频、写作与研究；Cubase、Kontakt、Ableton Live、Max/MSP、TouchDesigner、ACE Studio 是阅读兴趣，不代表均有已连接的官方专属来源。

## 音乐科技

| 来源 | 配置 URL | 日期与内容边界 |
| --- | --- | --- |
| Ableton 创作与技术 | https://www.ableton.com/en/blog/feeds/latest/ | 官方博客文章 |
| Steinberg 公告 | https://forums.steinberg.net/c/announcements/5.rss | 官方论坛公告，不能把普通用户讨论当发行说明 |
| TouchDesigner 官方社区 | https://forum.derivative.ca/latest.rss | 按音频、MIDI、OSC、粒子、点云等兴趣词筛选；标社区发帖 |
| Ableton Link | https://github.com/Ableton/link/releases | 正式发行，使用 release 元数据 |
| IRCAM ACIDS | https://github.com/acids-ircam | GitHub 仓库发现，非正式发行 |
| 音频转 MIDI | https://github.com/topics/audio-to-midi | Topic 检索，不保证所有结果均专业适用 |
| 空间音频 | https://github.com/topics/spatial-audio | 仓库推送日期不是发布新版本的日期 |
| 音乐信息检索 | https://github.com/topics/music-information-retrieval | 研究代码发现，不代替论文审核 |

GitHub 查询实测均 HTTP 200、`incomplete_results=false`：`spatial-audio stars:>20` 70 个，`audio-to-midi stars:>20` 8 个，`music-information-retrieval stars:>50` 96 个，`org:acids-ircam` 30 个，全部附加 `archived:false fork:false`。这些是核验时的快照，未来会变化。界面应以仓库更新标注 `pushed_at`；只有 releases 来源才标正式发行。

## 区域资讯与活动

澳门为暂定阅读区域，不是经过设备定位确认的所在地。用户可切换香港或珠海。新闻来自发布机构，不等于活动位于该城市；例如珠海政府报道的大三巴音乐会实际场地在澳门。

| 来源 | 已验证 URL | 采集方式与限制 |
| --- | --- | --- |
| 澳门政府新闻 | https://www.gov.mo/zh-hans/news/feed/ | RSS，含 2026-11-01 新闻；按文化、科技、通行兴趣词筛选 |
| 澳门文化局新闻 | https://www.icm.gov.mo/cn/ | HTML 的 `h5.newsTitleTxt a` 与随后 `div.grayTxt` |
| 澳门文化局活动 | https://www.icm.gov.mo/rss/files/rssEvents_C.xml | RSS，活动日期来自 description 的方括号前缀；存在重复条目 |
| hush! 2026 | https://www.icm.gov.mo/cn/news/detail/25185 | 2026-10-28 公告的五列表格：日期、时间、活动名称、地点、参加方法 |
| 香港政府公报 | https://www.info.gov.hk/gia/rss/general_zh.xml | RSS，含 2026-11-01 新闻；按兴趣词筛选 |
| 珠海要闻 | https://www.zhuhai.gov.cn/xw/xwzx/zhyw/index.html | HTML 列表，完整标题取链接 title 属性，日期来自同一列表行 |

官方外部活动入口与自动采集分开：

- 澳门文化局活动入口：https://www.icm.gov.mo/cn/events/
- 香港康文署按日期搜索：https://www.lcsd.gov.hk/clpss/tc/search/culture/GeneralSearchForm.do?searchType=date 。已确认可打开真实搜索表单，尚未验证自动提交及搜索结果采集。
- 珠海文广旅体局：https://wgltj.zhuhai.gov.cn/ 。已确认官方门户可读，应标“官方资讯”，不是已验证的演出日历或排期 API。

澳门文化局新闻 RSS `rssNews_C.xml` 本次虽 HTTP 200，却没有 item，因此采用官网新闻列表。旅游局 whatson 页虽 HTTP 200，但服务端返回的活动 results 为空，本次没有将它宣称为有效活动采集源。

## 日期与原文

活动日期与发布日期独立，允许来源文章已超过 90 天而活动尚未结束。活动按结束日期保留；同一 URL 的不同标题或举办日期必须保留。新闻的发布日期、仓库推送时间、正式发行日期、活动日期不互相替代。HTML 仅提供日期时标明日精度，不把午夜编码当原文给出的准确时刻。

活动 RSS 的已核实前缀包括 `[2024年11月28日至2026年11月8日 ]`、`[2026年4月25日至12月31日 ]`、`[2026年4月1日 週三 ]`。其中“健康加油站”的 pubDate 在 11 月更新，活动前缀仍为 4 月，不能因此称为当日活动。“閱進生活”正文提供澳门文学馆及地址；有些条目无场地，保持未知。系列展期注明“具体场次与开放时间以原文为准”。

hush! 表格共 18 行活动，“11月14及15日”的低洼供电派对展开两天后共 19 场。日期格可能有两段 p（11月8日／至12月31日），时间格可能有两段 p（15:00-16:00／16:00-17:00），场地格可能分别列集合和结束地点。保留这些内容，不能仅取第一段。AI 辅助音乐创作体验为 2026-11-11 18:00-22:00，妈阁塘片区原妈阁屠场旧址，一户通报名。

原始响应保存在本地 `evidence/local-sources/icm-events.txt`、`icm-home.txt`、`icm-hush.txt`、`macau-news.txt`；该目录可能被 Git 忽略，不是 CI 必需文件。可复现解析测试使用已纳入版本管理范围的小片段 [icm-news.html](../test/fixtures/icm-news.html)、[icm-hush-table.html](../test/fixtures/icm-hush-table.html)，不复制页面无关脚本与导航。

## 平台连接边界

当前云端快照生成于 `2026-11-01T08:35:19.294Z`（北京时间 16:35），包含 261 条资料、24 场活动，25 个动态来源中 22 个成功。OpenAI、Anthropic、Google DeepMind 三路 YouTube Atom 均成功，各 10 条；Steinberg 本轮成功 12 条。`github-skills`、`github-ai` 本轮有效条目为 0，状态为错误，分别保留 28、52 条既有资料；X 为人工选录 4 条缓存，不计为自动成功。

主任务在前端焦点及失败状态修复后实际执行 `npm run check && npm test`，语法检查通过，24/24 测试通过。这是代码检查证据，不替代浏览器、部署或 Actions 验收。

本地浏览器另已完成 16/16 验收，记录为 `evidence/music-local-local-browser.json`。覆盖桌面 1440px、移动 390px 和 320px、地区与主题持久化、键盘焦点、feed 503 和断网重试、活动日期及空状态；页面、控制台、请求错误均为 0。此后新增的标题 `text-wrap: balance` 已由生产浏览器验收覆盖。

生产浏览器实际 16/16 PASS，退出 0，报告为 `evidence/music-local-production-browser.json`。1440×1000、390×844 和 320px 宽度均无横向溢出；控制台错误、页面错误和失败请求均为 0。筛选、地区持久化、活动时间地点与多场次、503 错误与重试、原生键盘焦点通过。主任务已实际查看 `production-desktop`、`mobile-top`、`ai-event` 三张截图；这些证据仅覆盖执行时刻与指定视口。

功能提交 `6a22a4931ee4446eadadb2ec7e98ae037bbabe7d` 已推送，本次 Actions `41289478145` 经手动触发实际 `completed/success`，10 个步骤全部成功，包括 `npm test`、采集及 `Save source index`，证据为 `evidence/music-local-actions.json`；bot 索引提交 `fb5fd97` 已快进合并。Cloudflare 部署版本 `4ade365a-2d74-4041-9980-a03eef20e5f4` 已成功，首页、健康检查、数据接口均 HTTP 200，数据源响应头为 `github`，生成时间吻合云端快照；正式生产浏览器 16/16 验收通过。

X API 未配置，仍使用浏览器人工选录 4 条；登录 Edge 中的人工选录不代表 X API、xMCP 或定时自动采集可用。YouTube Atom 的失败保留缓存策略仍然有效，但本次三路请求没有失败。README 中明确标注的旧部署与旧 Actions 仅为上一次基线，不与本次证据混用。
