export const notesSeed = [
  {
    id: "n1",
    title: "操作系统：进程与线程",
    source: "课堂录音",
    updatedAt: "今天 14:28",
    status: "已整理",
    tagColor: "bg-violet-500/15 text-violet-200 border-violet-400/30",
    tags: ["操作系统", "期末复习", "线程"],
    summary:
      "解释进程与线程的定义、共享资源边界与调度模型，并补充用户态/内核态切换的性能影响。",
    original:
      "老师先从进程和线程的定义讲起，强调进程是资源分配的基本单位，线程是 CPU 调度的基本单位。同一进程中的线程共享地址空间，但有各自独立的栈。在线程切换成本、并发模型和上下文切换方面要重点理解。",
    cleaned:
      "1. 进程是资源分配单位，线程是调度单位。\n2. 线程共享地址空间与大部分资源，但拥有独立栈。\n3. 线程切换开销低于进程切换，更适合高并发。\n4. 用户态与内核态切换会带来额外性能损耗。",
    outline: [
      "进程与线程的定义",
      "共享资源与独立资源",
      "调度与切换成本",
      "课堂重点：用户态/内核态切换",
    ],
    related: ["高并发服务器模型", "操作系统期末高频考点", "CPU 调度算法导读"],
    knowledgeScore: 86,
  },
  {
    id: "n2",
    title: "产品周会：增长实验复盘",
    source: "会议录音",
    updatedAt: "昨天 18:05",
    status: "待确认",
    tagColor: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30",
    tags: ["增长", "周会", "实验复盘"],
    summary:
      "讨论了新用户引导实验的留存变化、渠道归因偏差与下周需要继续验证的按钮文案方案。",
    original:
      "本周实验主要看新用户路径，注册到首条笔记的完成率有提升，但 7 日留存变化不明显。大家认为按钮文案和首次 AI 提示的时机会影响用户是否愿意继续使用。",
    cleaned:
      "- 首条笔记完成率提升 12%。\n- 7 日留存暂无显著提升。\n- 下周继续测试 CTA 文案与首次 AI 整理提示时机。\n- 需要补充渠道归因校验。",
    outline: ["实验结果", "问题归因", "待办事项", "下周计划"],
    related: ["新手引导漏斗", "首日激活指标", "首次整理成功率"],
    knowledgeScore: 74,
  },
  {
    id: "n3",
    title: "英语写作素材：教育公平",
    source: "图片 OCR",
    updatedAt: "4 月 18 日",
    status: "已整理",
    tagColor: "bg-sky-500/15 text-sky-200 border-sky-400/30",
    tags: ["考研英语", "写作", "教育公平"],
    summary:
      "从图片中的论据提取出适合写作模板的观点、论证词组与例句，可直接用于作文练习。",
    original:
      "Education equity is not merely an ethical aspiration but also a practical necessity for social mobility...",
    cleaned:
      "观点：教育公平提升社会流动性。\n论据：资源分配不均会放大贫富差距。\n可复用表达：bridge the gap / equal access / upward mobility。",
    outline: ["核心观点", "论据扩展", "可复用表达", "作文应用场景"],
    related: ["教育类作文模板", "社会议题高频表达", "写作句型整理"],
    knowledgeScore: 81,
  },
];

export const reviewCardsSeed = [
  {
    id: "f1",
    noteId: "n1",
    question: "线程与进程最核心的区别是什么？",
    answer: "进程是资源分配的基本单位，线程是 CPU 调度的基本单位；同一进程内线程共享地址空间。",
    due: "今天",
    type: "问答卡片",
  },
  {
    id: "f2",
    noteId: "n2",
    question: "本周增长实验最值得继续验证的变量是什么？",
    answer: "首次 AI 整理提示的时机，以及新用户 CTA 文案是否影响用户完成首条笔记后的继续使用。",
    due: "今天",
    type: "复盘卡片",
  },
  {
    id: "f3",
    noteId: "n3",
    question: "教育公平主题中可复用的三个英文表达是什么？",
    answer: "bridge the gap、equal access、upward mobility。",
    due: "明天",
    type: "考点提炼",
  },
];

export const knowledgeLinks = [
  {
    relation: "same_topic",
    title: "高并发服务器模型",
    reason: "都涉及线程切换与并发处理，适合一起复习。",
  },
  {
    relation: "supplement",
    title: "CPU 调度算法导读",
    reason: "可补充理解线程调度与时间片切换。",
  },
  {
    relation: "follow_up",
    title: "操作系统期末高频考点",
    reason: "已自动归入同一复习链路。",
  },
];

export const aiTimeline = [
  { title: "音频识别完成", desc: "已生成 3 段 speaker 分段与时间戳", done: true },
  { title: "摘要生成完成", desc: "提炼出 4 个关键要点", done: true },
  { title: "标签推荐完成", desc: "已推荐 4 个标签，可手动调整", done: true },
  { title: "关联笔记分析中", desc: "正在比对历史知识主题", done: false },
];

export const searchKnowledgeBase = [
  {
    noteId: "n2",
    title: "产品周会：增长实验复盘",
    excerpt: "新用户从注册到首条笔记完成率提升，但 7 日留存变化不明显。",
    score: 0.96,
    tags: ["增长", "实验"],
  },
  {
    noteId: "n1",
    title: "操作系统：进程与线程",
    excerpt: "线程切换成本低于进程切换，更适合高并发任务。",
    score: 0.74,
    tags: ["并发", "线程"],
  },
  {
    noteId: "n3",
    title: "英语写作素材：教育公平",
    excerpt: "可复用表达适合快速迁移到作文写作练习。",
    score: 0.68,
    tags: ["写作", "素材"],
  },
];
