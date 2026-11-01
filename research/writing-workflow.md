# 专业写作与编辑：从来源到读者验收

核验日期：2026-11-01。本文综合六份原始技能或文档指南，不根据收藏数排名，也不把“读起来自然”等同于作者身份或检测器结论。本次只读取公开文件与 GitHub 元数据，没有安装或执行仓库代码。

## 1. 校事实：先锁住不能变的内容

先问清文档用途、受众、模板、编辑范围与作者样本。把事实、解释、意见、计划、未知分别识别；遇到事实缺口，在正文之外列出待补材料，不用形容词或编造的具体细节填空。

为待改稿建立最小对照表：主张、原始证据、日期、数值、适用条件、确定程度。改稿时检查否定、比较对象、因果关系、施事者与归因是否改变。“计划完成”不能改为“已经完成”，“可能相关”不能改为“导致”。这些对照项是编辑保护，不意味着原稿事实已核实。

来源依据：Humanizer-zh 的“编辑约束与优先级”“工作流程”，以及 Humanizer 的 “How to work”。本段的证据对照表是据此整理的工作方法，不是两项目提供的自动核查工具。

## 2. 叙事结构：每段为一个真实读者任务服务

先写一句读者读完后应能理解或完成的事，再决定顺序。事实报告可先给结论及支持证据；方案文档应交代问题、选择理由、实施条件与限制。无需把每段强行排成相同模板。

技术资料先用 Diátaxis 的两个问题定位：读者要采取行动还是理解概念？是在学习技能还是应用已有技能？据此决定教程、操作指南、参考或解释的功能。其价值在于解决内容混杂，不在于凑齐四个栏目。

按 Doc Co-Authoring 的方式逐节列出候选内容、筛掉重复项，再完成局部草稿。给每段写一句内部用途说明；如果两个段落完成同一任务，考虑合并；如果一段不断切换任务，拆开或移动材料。用途说明不必展示给最终读者。

## 3. 具体改写：修复信息关系，不做同义词洗稿

优先处理没有信息增量的开场、拔高评价、假想反对意见和复述式收尾。先确认一句话究竟增加了什么，再决定删除、合并或重写。只有原始材料给出行动者、数字或后果时，才把抽象表达改得更具体。

修改整段的主旨、证据位置、句子关系与节奏，避免只把“重要”替换为“关键”。保留必要术语、作者立场和不确定性。长短句变化应服从阅读与含义，不以三句长短不一或少用某个词作为目标。

作者样本可帮助匹配句长、用词与语气，不能把样本中的经历和数据移入新文。学术与商务文本可以保留必要的正式程度；被动句、连接词和四字格都有合理用途。Stop Slop 的绝对禁令只能作为待判断的提醒，不能盖过语义和领域要求。

文件编辑还要保护标题锚点、表格值、列表项含义、引文、链接目标和代码。Google 的文档指南可用于可读源码、信息明确的链接文字和表格选择，不应原样照搬依赖其渲染器的路径规则。

## 4. 人工审读：把理解缺口与事实错误分开验收

第一轮对照原稿，只查新增、遗漏、强化、弱化与错位归因。第二轮朗读，检查连接是否自然、段落是否重复收尾、作者语气是否被统一抹平。最后由作者或目标领域读者确认判断、专业术语与实际用途。

可借鉴 Doc Co-Authoring 的独立读者测试：只给成稿，不提供此前聊天背景，再提三个实际问题，例如“结论依赖什么证据”“哪些条件下不适用”“下一步由谁完成”。记录无法回答或存在多种解释的位置，再补文档本身缺失的内容。模型读者只辅助检查可理解性，不能代替目标读者、专业审查或事实核验；本次研究未开展真人或模型盲读实验。

验收记录应说明事实核对范围、结构修复、保留的未知与人工复核结果。不要用改动字数、模型自评分或检测器分数替代这些证据，不虚构“检测率下降”“百分百人工感”或保证规避检测。

## 所读文件与版本证据

`writing-skills.json` 中的 `publishedAt` 统一表示所链接文件的最近一次提交时间，来自 GitHub commits API 的 `commit.committer.date`，不是项目首发时间，也不是本次抓取时间。`verifiedAt` 是本次核验日期。GitHub 默认分支内容会变动，下列 SHA 用于复核本次版本。

| 项目 | 具体文件 | 提交 SHA | 许可与限制 |
| --- | --- | --- | --- |
| blader/humanizer | [SKILL.md](https://github.com/blader/humanizer/blob/d4b81278e6604e237bf32f0f7ce5c217aee94269/SKILL.md) | d4b81278e6604e237bf32f0f7ce5c217aee94269 | MIT；不是经验证的作者身份检测器 |
| op7418/Humanizer-zh | [SKILL.md](https://github.com/op7418/Humanizer-zh/blob/f4518a8eab97b8bfebc66a89d34320a89bef6930/SKILL.md) | f4518a8eab97b8bfebc66a89d34320a89bef6930 | MIT；以保留事实与语义为优先 |
| anthropics/skills | [doc-coauthoring/SKILL.md](https://github.com/anthropics/skills/blob/00756142ab04c82a447693cf373c4e0c554d1005/skills/doc-coauthoring/SKILL.md)、[README.md](https://github.com/anthropics/skills/blob/f458cee31a7577a47ba0c9a101976fa599385174/README.md) | 技能 00756142ab04c82a447693cf373c4e0c554d1005 | README 称多数示例为 Apache-2.0；该技能没有已确认的独立许可证，不能概括成全仓同许可 |
| google/styleguide | [docguide/style.md](https://github.com/google/styleguide/blob/591fedaf0eb82e0b14c1163ab03b1518ff6dbe60/docguide/style.md)、[philosophy.md](https://github.com/google/styleguide/blob/591fedaf0eb82e0b14c1163ab03b1518ff6dbe60/docguide/philosophy.md)、[LICENSE](https://github.com/google/styleguide/blob/gh-pages/LICENSE) | 文档 591fedaf0eb82e0b14c1163ab03b1518ff6dbe60 | LICENSE 标明 CC-BY-3.0；技术文档与 Markdown 场景 |
| evildmp/diataxis-documentation-framework | [source/compass.rst](https://github.com/evildmp/diataxis-documentation-framework/blob/c9534824c87bfac01d6c8d60417ea672a4096d14/source/compass.rst)、[README.rst](https://github.com/evildmp/diataxis-documentation-framework/blob/ae587360df2517712030c561806c991b99835291/README.rst) | compass c9534824c87bfac01d6c8d60417ea672a4096d14 | README 明确 CC-BY-SA-4.0；文档架构框架，不是 Agent Skill |
| hardikpandya/stop-slop | [SKILL.md](https://github.com/hardikpandya/stop-slop/blob/8da1f030185bdfe8471220585162991eaeb970e9/SKILL.md) | 8da1f030185bdfe8471220585162991eaeb970e9 | MIT；自评分阈值没有提供测量验证 |

本页为方法性概述与来源指引，没有复制完整技能文本。重新分发或改编原文时，应分别核对各项目的许可及署名要求，尤其不能把公开可读一概当作已经确认可任意再许可。
