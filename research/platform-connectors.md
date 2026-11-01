# 平台连接器与官方视频源核验

核验日期：2026-11-01。请求最多四并发，单请求超时 20 秒。仅读取公开源码、频道页面与 Atom；未安装 MCP、运行第三方代码、接入账号或修改凭据。

## X 官方项目：存在，不等于本站已接入

仓库的 GitHub API 规范名称是 [xdevplatform/xmcp](https://github.com/xdevplatform/xmcp)，默认分支 `master`，本次树 SHA 为 `63d34362d88ed9f94d54ccd5ecd5bb4d12e11759`。用户给出的 `xdevplatform/xMCP` 大小写形式可以解析到同一项目。已读取 [README.md](https://github.com/xdevplatform/xmcp/blob/63d34362d88ed9f94d54ccd5ecd5bb4d12e11759/README.md) 与 [server.py](https://github.com/xdevplatform/xmcp/blob/63d34362d88ed9f94d54ccd5ecd5bb4d12e11759/server.py)。

这是将 X API OpenAPI 定义转换为 FastMCP 工具的官方组织项目，排除了 streaming 与 webhook 操作。README 要求 X Developer app、`X_OAUTH_CONSUMER_KEY`、`X_OAUTH_CONSUMER_SECRET`，并把 `X_BEARER_TOKEN` 列为该配置的必填项。`XAI_API_KEY` 只用于可选 Grok 测试客户端，不能替代 X API 权限。

当前源码的实际路径比“有 bearer token 就可启动”的理解更严格：`create_mcp()` 第 348 行无条件调用 `build_oauth1_client()`；后者执行浏览器 OAuth1 授权并等待回调。虽有 `get_auth_headers()`，不能据此声称当前启动流程已支持纯 bearer 免交互启动。默认 HTTP MCP 地址是 `http://127.0.0.1:8000/mcp`。

同一文件第 314 行附近存在 `LOGGER.info("OAuth1 access token: %s", access_token)`。当前代码可能把真实访问令牌写入日志；本次没有运行，也没有读取用户令牌。若后续获得单独接入授权，需要先处理这一明确的凭据泄露风险，并限制到必要的只读工具，不能直接启用创建、删除或私信等全量操作。

许可：GitHub 元数据未返回许可证，递归树也未找到 LICENSE 文件，故本次无法确认开源许可。公开源码与官方组织归属不等于已获得任意复制、改编或再分发授权。

主 agent 在本轮另行报告已通过 Edge 读取登录后的 X 搜索时间线。该证据证明浏览器会话可读，不能证明 Developer API key 已配置，也不能证明 xMCP 运行或定时后台采集可用。本研究没有独立重做该桌面验证。本站应分别报告“浏览器入口已读到内容”与“X Developer API / xMCP 待配置”，不能用一个总开关混淆两种通路。

## YouTube Research MCP：字幕证据与 API 工具分层

[coyaSONG/youtube-mcp-server](https://github.com/coyaSONG/youtube-mcp-server)，默认分支 `main`，本次树 SHA `9dfa8620e2577f56bfcfd912ef2fc668d99639a4`。[LICENSE](https://github.com/coyaSONG/youtube-mcp-server/blob/9dfa8620e2577f56bfcfd912ef2fc668d99639a4/LICENSE) 实际内容为 MIT。

所读文件：[README.md](https://github.com/coyaSONG/youtube-mcp-server/blob/9dfa8620e2577f56bfcfd912ef2fc668d99639a4/README.md)、[src/youtube-service.ts](https://github.com/coyaSONG/youtube-mcp-server/blob/9dfa8620e2577f56bfcfd912ef2fc668d99639a4/src/youtube-service.ts)、[src/http-server.ts](https://github.com/coyaSONG/youtube-mcp-server/blob/9dfa8620e2577f56bfcfd912ef2fc668d99639a4/src/http-server.ts)。

源码 `YouTubeService` 使用 `youtubei.js` 获取视频与字幕轨，再请求 JSON3 字幕。无 `YOUTUBE_API_KEY` 时可走字幕研究路径；`requireApiKey()` 明确保护搜索、视频与频道详情、评论等 Data API 操作。`research-video` 返回带时间戳的证据，不应把工具存在当成已经对某个视频完成精读。

README 要求 Node.js 22+，支持 stdio 与 HTTP `/mcp`。远程 HTTP 身份验证使用 `MCP_BEARER_TOKEN`，浏览器来源限制使用 `CORS_ORIGIN`；源码确认 bearer 比对和 401 分支。无字幕、地区限制、年龄限制或平台变化仍可能导致失败。本站按频道同步标题和发布日期无需安装此 MCP，官方 Atom 已足够；字幕深读可作为后续独立功能评估。

## ytmcp：访客字幕、API key 与 OAuth 三种能力

[mrsknetwork/ytmcp](https://github.com/mrsknetwork/ytmcp)，默认分支 `main`，本次树 SHA `c4ca227ba8c29539ad8cb319e21ab92e76d4465e`。[LICENSE](https://github.com/mrsknetwork/ytmcp/blob/c4ca227ba8c29539ad8cb319e21ab92e76d4465e/LICENSE) 为 MIT。

所读文件：[README.md](https://github.com/mrsknetwork/ytmcp/blob/c4ca227ba8c29539ad8cb319e21ab92e76d4465e/README.md)、[src/server/auth.ts](https://github.com/mrsknetwork/ytmcp/blob/c4ca227ba8c29539ad8cb319e21ab92e76d4465e/src/server/auth.ts)、[src/server/tools/videos.ts](https://github.com/mrsknetwork/ytmcp/blob/c4ca227ba8c29539ad8cb319e21ab92e76d4465e/src/server/tools/videos.ts)。

`get_video_transcript` 使用 `yt-dlp-exec`，无需 API 凭据；存在本地 `bin/yt-dlp` 时优先使用它。公开搜索、元数据、热门和评论通过 `GOOGLE_API_KEY`；个人订阅和会员相关操作需要 `GOOGLE_CLIENT_ID`、`GOOGLE_CLIENT_SECRET` 与 OAuth 授权。

须注意 README 的凭据表述范围：客户端 ID 与 secret 从环境读取，但 OAuth 令牌实际会写入 `~/.ytmcp_tokens.json`。`auth.ts` 包含读取、刷新后写回和尝试设置 `0600` 权限的代码，不能概括成“所有凭据从不落盘”。本次没有安装、授权、创建或读取该令牌文件。

## 官方频道与 Atom 实测

三个 handle 页面已实际读取，其 canonical URL 与提取的 channel ID 一致。早先的请求曾成功解析三个 Atom，每个返回 15 条；随后在 2026-11-01 的复检中，OpenAI 与 Google DeepMind 的 Atom 返回 HTTP 404，Anthropic 返回 HTTP 200、15 条。频道 ID 已核对，不能为了消除 404 随意替换为其他频道。

下表的日期与视频是早先成功请求留下的样本，不能当作当前最新视频清单。当前可用性以本站每轮采集状态为准；接口失败时保留有效的既有条目并显示错误。

| 官方频道 | channel ID | 官方 Atom URL | 历史样本 published（UTC） |
| --- | --- | --- | --- |
| OpenAI | `UCXZCJLdBC09xxGZ6gcdrc6A` | https://www.youtube.com/feeds/videos.xml?channel_id=UCXZCJLdBC09xxGZ6gcdrc6A | `2026-10-30T20:17:12+00:00` |
| Anthropic | `UCrDwWp7EBBv4NwvScIpBDOA` | https://www.youtube.com/feeds/videos.xml?channel_id=UCrDwWp7EBBv4NwvScIpBDOA | `2026-09-23T18:01:32+00:00` |
| Google DeepMind | `UCP7jMXSY2xbc3KCAE0MHQ-A` | https://www.youtube.com/feeds/videos.xml?channel_id=UCP7jMXSY2xbc3KCAE0MHQ-A | `2026-10-27T16:00:41+00:00` |

对应的历史样本标题与视频：

- OpenAI：[There are many futures. Which do you want to build?](https://www.youtube.com/watch?v=o4D1J1YWjhg)
- Anthropic：[Inside Anthropic's molecular biology lab](https://www.youtube.com/watch?v=DdCEmlAydcw)
- Google DeepMind：[Genie 4: A new generation of world simulation](https://www.youtube.com/watch?v=sFfPkUJd_Jk)

频道身份核验入口：

- [OpenAI handle](https://www.youtube.com/@OpenAI) → canonical `/channel/UCXZCJLdBC09xxGZ6gcdrc6A`，页面标题和 Atom 标题均为 OpenAI。`https://openai.com/` 和 `/about/` 分别返回 403；相同主站入口两次失败后停止，本次未完成 OpenAI 官网出站链接的反向交叉验证。
- [Anthropic 公司首页](https://www.anthropic.com/) HTTP 200，正文包含 `https://www.youtube.com/@anthropic-ai`；[该 handle](https://www.youtube.com/@anthropic-ai) canonical 与上表 ID 相同。
- [Google DeepMind 公司首页](https://deepmind.google/) HTTP 200，正文包含 `https://www.youtube.com/@googledeepmind`；[该 handle](https://www.youtube.com/@googledeepmind) canonical 与上表 ID 相同。

Atom 发布日期必须取 `<entry><published>`，不能用 feed 更新时间、XML 请求时间或视频 `<updated>` 冒充发布时间。Feed 同时可能包含 watch 和 shorts 链接；不要在去重或归档中无意丢掉 Shorts。

## 本次验收边界

已验证项目存在、默认分支、所读源码路径、两份 MIT 许可、实际凭据分层与官方频道 ID。Atom 可用性在请求间发生变化，最近复检仅 Anthropic 成功，不能概括为三个频道持续可用。xMCP 无已确认许可证；OpenAI 官网链接因 403 未反查成功；未验证任何 MCP 的安装后运行、字幕提取、OAuth 或 X API 账户额度。浏览器登录态可读证据来自主 agent，与公开 Atom/API 请求分开记录。
