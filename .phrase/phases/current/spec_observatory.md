# 新知录交付范围

日期：2026-11-01。目标：建立面向中文读者的 AI、Skills、优质工作流、开源项目与专业写作编辑资料站，交付至 GitHub `Sco-QianC01/skills-observatory` 和 Cloudflare。

实现范围：公开 RSS / YouTube Atom / GitHub API / Hacker News 索引，X API 可选接入与已有浏览器选录合并，六份原始写作资料的方法整理；URL 去重、日期语义、失败状态、历史保留、来源外链；静态阅读界面与 Worker 数据代理。

采集按 GitHub Actions 定时配置执行，北京时间每日 02:17、08:17、14:17、20:17，可能延迟。Cloudflare 提供前端、raw GitHub 数据代理与部署副本回退，不承担定时采集。

边界：不发布第三方全文，不把模板表达修订当作检测器分数或作者身份保证；YouTube 当前使用 Atom，研究过的 MCP 未安装连接；X 浏览器选录不等于云端 API 授权。代码 MIT，第三方材料各自许可。

验收依据：真实采集结果、测试结果、GitHub 远端提交与 Actions 实际运行、Cloudflare 线上 API、桌面/移动端阅读操作。当前实现已存在；执行和线上验收待负责人提供证据。
