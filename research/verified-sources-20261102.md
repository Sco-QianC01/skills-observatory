# 新知录新增订阅源实测

验证日期：2026-11-02。在 WSL 用 Python requests 发起真实 GET，再由 ElementTree 解析 RSS item / Atom entry。下表各订阅 URL 本轮均返回 HTTP 200 且有可解析条目。日期和标题来自当前返回的首条记录；条目数是订阅窗口大小，并非机构发稿总数。已对照 src/sources.js，以下不重复既有订阅。

|机构 / 地区 / 分类|订阅 URL|条数|首条日期|真实首条标题 / 注意|
|---|---|---:|---|---|
|香港金融管理局 / 香港 / 财经监管|https://www.hkma.gov.hk/chi/other-information/rss/rss_press-release.xml|424|2026-11-02|香港金融科技周2026|
|香港金融管理局 / 香港 / 监管规则|https://www.hkma.gov.hk/chi/other-information/rss/rss_circulars.xml|224|2026-10-23|經修訂《監管政策手冊》單元CA-B-2「具系統重要性銀行」刊憲（只備英文版本）|
|香港金融管理局 / 香港 / 金融防骗|https://www.hkma.gov.hk/chi/other-information/rss/rss_scam-alert.xml|291|2026-10-30|香港銀行同業結算有限公司提醒公眾慎防偽冒網站|
|香港金融管理局 / 香港 / 财经解读|https://www.hkma.gov.hk/chi/other-information/rss/rss_insight.xml|8|2026-10-26|余偉文談2026 年國際金融領袖投資峰會|
|美联储 / 美国 / 央行|https://www.federalreserve.gov/feeds/press_all.xml|20|2026-10-29|Federal Reserve Board announces approval of application by The Bank of Nova Scotia|
|欧洲央行 / 欧盟 / 央行与AI|https://www.ecb.europa.eu/rss/press.html|15|2026-10-30|Philip R. Lane: AI adoption in Europe|
|美国证券交易委员会 / 美国 / 证券监管|https://www.sec.gov/news/pressreleases.rss|25|2026-10-30|SEC Issues Exemptive Relief from Treasury Clearing Requirements for Certain Inter-Affiliate and Non-U.S. Repo Transactions|
|英国知识产权局 / 英国 / 知识产权|https://www.gov.uk/government/organisations/intellectual-property-office.atom|20|2026-10-30|Avoiding fake beauty products for businesses；Atom updated，机构内容含实务指南而非全部法律变更|
|英国竞争与市场管理局 / 英国 / 平台监管|https://www.gov.uk/government/organisations/competition-and-markets-authority.atom|20|2026-10-30|Suspected abuse of a dominant position in relation to Meta’s commercial terms；Atom updated|
|英国科学创新技术部 / 英国 / AI政策|https://www.gov.uk/government/organisations/department-for-science-innovation-and-technology.atom|20|2026-10-29|Research: Artificial Intelligence sector study 2025；Atom updated|
|英国官方立法库 / 英国 / 新立法|https://www.legislation.gov.uk/new/data.feed|20|2026-10-30|The Pneumoconiosis etc. (Workers’ Compensation) (Payment of Claims) (Amendment) (No. 2) Regulations 2026；全行业噪声大，应按知识产权/数字/AI关键词筛选|
|英国金融行为监管局 / 英国 / 财经监管|https://www.fca.org.uk/news/rss.xml|20|2026-10-30|Brits nearly twice as likely to spot pressure tactics in horror films as investment red flags；pubDate 原值 Friday, October 30, 2026 - 09:00，需验证JS日期解析|
|WIPO新闻室 / 国际 / 版权知识产权|https://www.wipo.int/pressroom/en/rss.xml|10|2026-10-14|WIPO’s “Creators Learn Intellectual Property” (CLIP) Initiative Expands: Now Supporting Visual Artists in Understanding and Managing their Rights|
|Native Instruments / 国际 / Kontakt与音乐制作|https://www.native-instruments.com/blogs/blog.atom|30|2026-07-16|Behind the synth: A. G. Cook on stacked sawtooths and the creation of Super*Saw；官方Atom可读但明显滞后，不能标作每日新闻|
|WIPO Lex / 国际 / 法律数据库|https://www.wipo.int/en/web/wipolex/news/-/journal/rss/497678/7224680|10|2026-03-31|New WIPO Lex Collection Brings Trade Secrets Case Law into Focus；低频，法律研究线索而非澳门法律适用结论|

HKMA官方RSS目录已核验：https://www.hkma.gov.hk/chi/other-information/rss/ ，页面直接列出上述四个RSS地址。WIPO当前目录 https://www.wipo.int/en/web/news/rss 直接列出新闻室与WIPO Lex地址。

## 未采用或阻塞

- 澳门金融管理局：试探 `https://www.gov.mo/zh-hans/entities/金融管理局/` 返回404；其 `/feed/` 返回200但零条。官方RSS总目录 `https://www.gov.mo/zh-hans/directory/rss-feeds/` 当前列举劳工局与气象局等，未从该页找到金融管理局订阅。不要伪造AMCM RSS；可在既有澳门政府新闻源按金融管理局/金融/法律筛选，或另行验证官方列表适配器。
- WIPO旧 `https://www.wipo.int/news/en/newsfeed.xml` 与 `.jsp` 无法按XML解析，已找到上表当前官方端点。
- NI旧 `https://blog.native-instruments.com/feed/` 不是可解析XML；使用上表官网Atom。
- `https://www.sfc.hk/edistributionWeb/gateway/EN/news-and-announcements/news/all.rss` 返回403。
- `https://www.ftc.gov/feeds/press-release.xml`、`https://juce.com/feed/`、`https://www.kvraudio.com/news.rss` 无法按XML解析；KVR本来也不是厂商官方。
- `https://cycling74.com/feed` 返回404。不要把HTML 200误当RSS。
- `https://www.bis.org/doclist/all_pressrels.rss` 返回200但未识别到RSS item或Atom entry，未列为可用源。
- EFF `https://www.eff.org/rss/updates.xml` 返回200/50条/2026-10-30，首条 Rewriting Copyright Law for Generative AI Would Hurt Everyone；为组织自身官方观点来源，非政府监管机构，适合单独标记观点。

## 可复用采集与工作流项目：原始文档和许可证实读

本轮直接GET下列原始README、LICENSE及官方文档，均HTTP 200；RSSHub docs站本轮403，因此使用仓库README与许可证，不声称文档站可达。

|项目|已读原始资料|当前许可证|适合复用的最小做法|
|---|---|---|---|
|RSSHub|https://raw.githubusercontent.com/DIYgod/RSSHub/master/README.md ; https://raw.githubusercontent.com/DIYgod/RSSHub/master/LICENSE|GNU AGPL v3，当前已不是常被旧文章写的MIT|原站无RSS时才引入明确的单站路由；官方原生RSS优先。README确认可自部署和广泛路由，部署前核对AGPL义务。|
|Crawl4AI|https://raw.githubusercontent.com/unclecode/crawl4ai/main/README.md ; https://raw.githubusercontent.com/unclecode/crawl4ai/main/LICENSE|Apache 2.0|README列JsonCssExtractionStrategy / JsonXPathExtractionStrategy，可对澳门官方列表作确定性JSON抽取；无需先上LLM。正文去菜单/页脚可用PruningContentFilterLXML或BM25ContentFilter。现有requests能完成的静态页无需新增浏览器依赖。|
|Miniflux|https://miniflux.app/docs/rules.html ; https://raw.githubusercontent.com/miniflux/v2/main/LICENSE|Apache 2.0|按title、URL、tag、author做包含/屏蔽过滤；必要时按CSS抽取文章正文；把关键词筛选和抓取失败分开记录。|
|n8n|https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.rssfeedread/ ; https://raw.githubusercontent.com/n8n-io/n8n/master/LICENSE.md|Sustainable Use License；企业文件另需Enterprise License，不能笼统说OSI开源|RSS Read可作为既有自动化里的订阅读取节点；当前项目已有定时采集，不为此额外部署n8n。涉及对外托管/商业服务先核对SUL范围。|

## 选择建议

先接入HKMA新闻、通告、防骗，WIPO新闻，NI Atom，Fed/ECB/SEC，以及英国IPO/CMA/DSIT。HKMA数据较大应在解析后保留现有每源limit。金融法律必须显示地区与原始机构，保留原文链接；机构新闻、评论、指南、法律文本与生效日期不能互相替代。澳门/HK/珠海位置切换应只影响地区关联来源，全球音乐科技与国际监管资讯保留独立筛选。

## 已落实的来源配置与GitHub探针

`src/sources.js` 保留既有25源，新增14个官方订阅（上表除FCA以外的14项）及3个项目发行源，共42源。官方新增源有 jurisdiction、无 region，避免跟随城市筛选隐藏跨境信息。兴趣新增金融观察、法律与版权、机会与资助；本地关键词补财政、政策、法律、版权、资助、征集等。没有新增专门资助RSS；DSIT按实际条目分类，不为整个来源强加机会与资助标签。

7个GitHub搜索源各配置一个明确相关的 `fallbackFeeds`。下列端点本轮均HTTP 200、Atom entry非空，日期保留原始发行updated，不把旧发行伪装成今天更新。releases Atom可能包含开发版或预发行，例如下表Langflow的 `v1.14.0.dev13`，不能将订阅条目全部称为正式稳定发行。

|用途|实测Atom URL|条数|首条updated|首条title|
|---|---|---:|---|---|
|Agent Skills|https://github.com/vercel-labs/skills/releases.atom|10|2026-10-19T20:34:33Z|v1.7.4|
|AI工作流|https://github.com/langflow-ai/langflow/releases.atom|10|2026-11-02T00:26:41Z|v1.14.0.dev13|
|本地LLM|https://github.com/ollama/ollama/releases.atom|10|2026-10-29T02:54:11Z|v0.40.13|
|IRCAM音频研究|https://github.com/acids-ircam/nn_tilde/releases.atom|10|2025-05-22T09:57:52Z|v1.6.0|
|音频转MIDI|https://github.com/spotify/basic-pitch/releases.atom|8|2024-08-16T17:16:26Z|v0.4.0|
|空间音频|https://github.com/videolabs/libspatialaudio/releases.atom|4|2026-07-14T07:32:46Z|libspatialaudio 0.4.1|
|音乐信息检索|https://github.com/librosa/librosa/releases.atom|10|2026-08-17T20:22:15Z|1.0.0|
|RSSHub独立发行源|https://github.com/DIYgod/RSSHub/releases.atom|10|2026-11-02T07:34:54Z|v2026.11.02-8526.434d495|
|Crawl4AI独立发行源|https://github.com/unclecode/crawl4ai/releases.atom|10|2026-10-14T10:25:39Z|Release v0.9.5|
|Miniflux独立发行源|https://github.com/miniflux/v2/releases.atom|10|2026-11-02T04:29:21Z|Miniflux 2.3.5|

空发行源未采用：anthropics/skills、agentskills/agentskills、ComposioHQ/awesome-claude-skills、skillmatic-ai/awesome-agent-skills 均200但零entry，不能冒充成功候选。

Node assert实测通过：42个唯一source id、14个jurisdiction新增源均无region、7个GitHub搜索均有1个合法releases.atom fallback、3个新兴趣存在。独立源数初始人工期望写成45导致一次断言失败；复核原有25+新增17后修正检查期望42，通过。采集器已实现备用订阅及来源状态记录，配置与运行验收结果见 [当前任务记录](../task_observatory.md)；上述HTTP/XML探针保留为研究时点证据。
