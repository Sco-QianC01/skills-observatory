# 新知录变更记录

日期：2026-11-01。

已存在的实现：`src/sources.js` 配置公开来源与更新安排；`src/collector.js` 解析、规范化、去重、保留资料并记录状态；`scripts/collect.mjs` 原子更新 JSON；`src/worker.js` 代理 raw GitHub 并回退部署副本；`public/` 提供搜索、分类、排序与来源状态；`.github/workflows/collect.yml` 提供每日四次及手动采集。

资料：`research/writing-skills.json`、`research/writing-workflow.md` 与 `research/platform-connectors.md` 记录六份写作来源、方法、许可和平台能力边界。

本次文档子任务：保留已有 README 内容，补入六份原文入口、日期含义、MIT 与第三方许可边界、待验收状态；新增 LICENSE 与 `.phrase/phases/current/` 六类最小记录。未修改源码、测试或配置。

验证：Node 断言已通过，核对了六份写作原文 URL、README 本地链接、四个调度时刻、六份记录日期、MIT 文件及新增文本无替换乱码。脚本名称已对照 `package.json`。

后续证据更新：负责人确认公开仓库 `https://github.com/Sco-QianC01/skills-observatory` 已创建，main 已合入 bot 提交 `c57dc91`；Actions `https://github.com/Sco-QianC01/skills-observatory/actions/runs/41273177017` 在提交 `6a4f0b017fa2ae83b7d603763b9b79f1005e1add` 上成功。实采 `2026-11-01T04:51:05.130Z` 生成 146 条，9/11 动态来源成功；OpenAI、Anthropic 视频正常，DeepMind Atom 404 如实保留，X 为 2026-11-01 Edge 手动选录 4 条，无 API Token 和 MCP。

最新交付证据：代码提交 `56ae4dfe6d6324a8248aa7008d031c50439f694c` 修复 X 连续使用缓存时自动成功时间丢失的问题；负责人确认 11 项 `npm test` 与语法检查通过。[Actions 41275374636](https://github.com/Sco-QianC01/skills-observatory/actions/runs/41275374636) 在 2026-11-01 `05:02:47Z` 至 `05:03:06Z` 全部 10 步成功，生成 bot 提交 `55c2598dc3229c6087a1c45a6f56bbcdac211d3a`，只更新 feed，已快进合入本地。

最新索引为 `2026-11-01T05:03:00.818Z`、171 条、8/11 动态来源成功；OpenAI、Anthropic YouTube HTTP 404，分别保留 10、7 条历史资料；X 为手动 4 条 `cached`，`lastSuccessAt=null`，没有把手动日期当作自动成功。

Cloudflare 已部署至 `https://skills-observatory.ancient-art-9bbf.workers.dev`，版本 `efa5b309-b0be-40a0-86a1-a75a6fef90b2`；负责人确认 `/health`、`/`、`/api/feed` HTTP 200，数据来源头 `github`。

最终浏览器验收：`evidence/browser-acceptance.mjs` 退出 0，`evidence/browser-acceptance.json` 为 11/11 PASS；覆盖桌面 1440×1000、手机 390×844 及 320px，验证搜索、分类、排序、分页 16 到 32 条、6 条写作详情、来源弹窗 Esc 与焦点恢复、安全外链和无横向溢出；console/page/request errors 均为 0。负责人查看 `desktop.png`、`mobile.png`、`writing.png`、`sources-mobile.png`，确认中文字体和布局正常。

先前 QA 环境问题已解决：复用隔离 Chromium 运行库，通过 `FONTCONFIG_FILE` 使用项目 `evidence/fonts.conf`，以 ignored `evidence/fonts` 符号链接调用已有 Windows 微软雅黑等字体。未安装系统依赖或改动产品。

本次仅据提供证据更新 README 与六份阶段文档，未改 LICENSE、源码、测试或配置，未提交或推送。交付验收记录已收齐；保留 X API/MCP、YouTube MCP 未接入及两个 YouTube Atom 源 404 降级限制。
