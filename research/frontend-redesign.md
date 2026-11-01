# 新知录前端重设计研究

研究日期：2026-11-01。

本记录支持 DESIGN.md v2 的方向选择。它不声称设计已经实现、通过视觉验收或部署，也不把任何技能称为最佳方案，不承诺 AI 检测率或“去 AI 味”的可量化效果。

# 方法与原始出处

通过 GitHub 公开原始文件实际读取以下内容，比较其适用场景、反模式和取舍。研究仅阅读文档，没有安装仓库或运行其脚本。

## Impeccable

- 仓库：https://github.com/pbakaus/impeccable
- 技能入口：https://github.com/pbakaus/impeccable/blob/main/skill/SKILL.src.md
- 原始入口：https://raw.githubusercontent.com/pbakaus/impeccable/main/skill/SKILL.src.md
- 质量与反模式：https://raw.githubusercontent.com/pbakaus/impeccable/main/skill/reference/craft-floor.md
- Operate 与 Read 指导：https://raw.githubusercontent.com/pbakaus/impeccable/main/skill/reference/operate.md
- 许可证：https://raw.githubusercontent.com/pbakaus/impeccable/main/LICENSE

读取时入口为 SKILL.src.md；直接访问 skill/SKILL.md 返回 404。入口和仓库 LICENSE 标示 Apache 2.0。这里记录读取时的文件状态，后续仓库可能更新。

该技能按访客目的区分 Persuade、Operate、Read 和 Experience。新知录采用 Read 为主的理解与导航目标，并参考 Operate 对熟悉控件和克制表达的要求。craft-floor 反对同尺寸“图标、标题、说明”卡片承担页面结构、无信息的章节编号、hero 统计模板和装饰性等宽字；operate 强调单一字体、固定 rem 层级、结构响应式和完整交互状态。

## Anthropic frontend-design

- 技能入口：https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md
- 原始入口：https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/SKILL.md
- 技能许可证：https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/LICENSE.txt

实际读取的技能 LICENSE.txt 为 Apache License 2.0。SKILL.md 强调从具体主题和使用者任务形成视觉选择，并列出暖奶油底配衬线大标题、黑底鲜亮强调、密集报纸线框、统一卡片套件和机械标签等常见生成式页面默认套路。它要求先拟定紧凑的色彩、字体和布局方向，再对照需求检查是否只是通用默认设计。

# 对本项目的采用

1. 首屏直接搜索和阅读。紧凑站名与导航不占据内容的主要空间。
2. 分类目录、阅读条目、活动日期使用不同的信息组织方式。中心连续列表支持扫描，活动以城市、日期和名称帮助判断，不复用整页同尺寸卡片。
3. 使用冷白、中性辅底、系统中文无衬线字体与有限强调色。文字层级由真实信息的重要程度决定，取消衬线大标题和装饰等宽字。
4. 采用熟悉的原生 dialog、details 与表单操作；保证焦点、错误、空结果、来源失败透明度和移动触控。
5. 列表不安排入场表演。以真实文章、长标题和活动内容检查布局，避免仅靠短占位文案判断效果。

# 明确不照搬

Impeccable 中关于负字距、12–16px 卡片圆角、定制浏览器表面的建议不是本项目规范。这里遵循字距 0、卡片圆角不超过 8px，并保留熟悉的浏览器控件行为。通用的 65–75ch 英文阅读宽度建议不能直接视为中文排版的字符数标准，需要以中文实际显示检查。

Anthropic 文档关于大胆视觉开场与审美风险的建议不能自动转化为大 hero、品牌展示或复杂动效。新知录主要供反复检索阅读，视觉表达应服从阅读任务。

拒绝米白衬线卡片后，也不换成另一种默认模板：不采用黑底酸绿、密集报纸分栏、装饰编号或技术感等宽标签。两份资料提供决策和检查方法，不提供可直接套用的最终页面。

# 文案方向

主标题沿用“新知录”。栏目采用“全部”“AI 与开源”“音乐科技”“港珠澳活动”等具体名称；阅读列表可用“最近收录”，活动区可用“接下来的活动”。说明文字以准确覆盖为限，例如“AI 工具与开源工作流、音乐科技的新进展，以及澳门、香港、珠海值得留意的活动。”

来源、日期和失败说明使用事实语言。避免“全网实时”“前沿赋能”等未经数据支持的承诺，不添加装饰口号或无信息编号。最终文案必须与实际数据覆盖及已有功能一致。
