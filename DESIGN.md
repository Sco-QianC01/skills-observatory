---
name: 新知录
version: 1
description: 面向中文读者的 AI、Skills、写作方法与开源工作流资料站
colors:
  canvas: "#f5f3ed"
  ink: "#202723"
  muted: "#58645d"
  rule: "#d8ddd3"
  accent: "#315a43"
  highlight: "#e4ebd7"
typography:
  display: '"Noto Serif SC", "Songti SC", SimSun, Georgia, serif'
  body: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif'
  mono: '"SFMono-Regular", Consolas, monospace'
rounded:
  surface: 3px
spacing:
  unit: 8px
  page: 48px
components:
  masthead: 中文宋体刊名、细线分隔、采集时间与来源入口
  story: 原始标题、具体摘要、平台、原始日期和可点击原文
  filters: 可用键盘操作的分类、搜索、平台与排序
  reading: 可展开的编辑方法、步骤和已知限制
  source: 公开显示来源、采集状态与最近成功时间
---

# Overview

以技术刊物和资料索引为参照。读者打开页面后，应能辨认内容来源、发布时间与用途，并直接访问原始资料。借鉴 VoltAgent awesome-design-md 的 Wired 分析中清晰的字号层级、黑白骨架和简洁元数据，不复制其商标或付费字体。

参考原始文件：https://github.com/VoltAgent/awesome-design-md/blob/main/design-md/wired/DESIGN.md （2026-11-01 已读取）。

# Colors

纸白底、深墨文字、森林绿强调。正文与背景保持清楚对比；来源失败用文字和状态标识共同呈现，不能仅靠颜色。

# Typography

刊名、主标题用衬线字体；摘要与界面用系统无衬线字体；时间和来源辅助信息可以使用等宽字体。正文不小于 15px，正文行距至少 1.65。外部字体不可成为页面可用的前提。

# Layout

桌面最大宽度 1320px，正文列表与窄侧栏对齐。顶部有一个克制的编辑专题，正文以实际条目为主。移动端改为单列，筛选栏可横向滚动而页面不得横向溢出。

# Components

每条内容保留原始标题和原文链接，英文标题不伪装成中文翻译。摘要说明可见内容，不把元数据摘要当全文精读。平台、分类和日期分开。写作方法可展开查看，来源状态可以打开对话框。

# Depth

主要靠空白、字号、分隔线与背景明度组织层级。动画只用于透明度或位移的轻微反馈；尊重减少动态偏好。

# Do

- 显示原文日期、采集时间及日期含义。
- 给空结果、请求失败、来源部分失效提供真实提示。
- 使用语义化元素、可见焦点、可关闭对话框与原文链接。
- 把编辑选读与自动采集清楚标注。

# Don't

- 不用编号章节、夸张“全网实时”承诺和虚构热度。
- 不用发光球、渐变大字、玻璃悬浮卡片或堆叠的大圆角。
- 不把抓取时间当发布日期，不把未接入平台显示为已连接。
- 不加载不必要的图片、视频或动画库。

# Responsive

1280px 和 390px 都能完整阅读、筛选、搜索和打开详情。按钮最小触控高度 40px。长英文仓库名与 URL 允许换行。

# Agent Prompt Guide

实现一个可检索、可回看的资料站。优先把数据、出处、状态和编辑方法做清楚，用排版表达品质。不得减少用户要求的自动采集、GitHub 交付和 Cloudflare 部署范围。
