# 新知录变更记录

日期：2026-11-01。

已存在的实现：`src/sources.js` 配置公开来源与更新安排；`src/collector.js` 解析、规范化、去重、保留资料并记录状态；`scripts/collect.mjs` 原子更新 JSON；`src/worker.js` 代理 raw GitHub 并回退部署副本；`public/` 提供搜索、分类、排序与来源状态；`.github/workflows/collect.yml` 提供每日四次及手动采集。

资料：`research/writing-skills.json`、`research/writing-workflow.md` 与 `research/platform-connectors.md` 记录六份写作来源、方法、许可和平台能力边界。

本次文档子任务：保留已有 README 内容，补入六份原文入口、日期含义、MIT 与第三方许可边界、待验收状态；新增 LICENSE 与 `.phrase/phases/current/` 六类最小记录。未修改源码、测试或配置。

验证：Node 断言已通过，核对了六份写作原文 URL、README 本地链接、四个调度时刻、六份记录日期、MIT 文件及新增文本无替换乱码。脚本名称已对照 `package.json`。本地应用测试、真实采集、GitHub、Actions、Cloudflare 与浏览器结果待负责人补充。
