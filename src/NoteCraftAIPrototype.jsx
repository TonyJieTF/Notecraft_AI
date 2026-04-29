import React, { useMemo, useState } from "react";
import { AudioSummaryRecorder } from "./components/AudioSummaryRecorder";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BellRing,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Database,
  Download,
  Eye,
  EyeOff,
  FileAudio,
  FileImage,
  FileText,
  FileVideo,
  Filter,
  FolderKanban,
  Link2,
  Lock,
  MessageSquareMore,
  Mic,
  Moon,
  RefreshCcw,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Tags,
  Trash2,
  UploadCloud,
  Wand2,
} from "lucide-react";

const notesSeed = [
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

const reviewCardsSeed = [
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

const knowledgeLinks = [
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

const aiTimeline = [
  { title: "音频识别完成", desc: "已生成 3 段 speaker 分段与时间戳", done: true },
  { title: "摘要生成完成", desc: "提炼出 4 个关键要点", done: true },
  { title: "标签推荐完成", desc: "已推荐 4 个标签，可手动调整", done: true },
  { title: "关联笔记分析中", desc: "正在比对历史知识主题", done: false },
];

const searchKnowledgeBase = [
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

const navItems = [
  { key: "dashboard", label: "工作台", icon: FolderKanban },
  { key: "note", label: "笔记详情", icon: FileText },
  { key: "search", label: "AI 搜索", icon: Search },
  { key: "review", label: "今日复习", icon: RefreshCcw },
  { key: "privacy", label: "隐私设置", icon: ShieldCheck },
];

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function AppShell({ children, dark }) {
  return (
    <div
      className={cn(
        "min-h-screen w-full transition-colors duration-300",
        dark
          ? "dark bg-[#0b1020] text-slate-100"
          : "bg-[#f6f8fc] text-slate-900"
      )}
    >
      <div
        className={cn(
          "absolute inset-0 -z-10",
          dark
            ? "bg-[radial-gradient(circle_at_top,_rgba(109,94,249,0.18),_transparent_28%),radial-gradient(circle_at_right,_rgba(25,195,125,0.10),_transparent_24%)]"
            : "bg-[radial-gradient(circle_at_top,_rgba(109,94,249,0.12),_transparent_28%),radial-gradient(circle_at_right,_rgba(25,195,125,0.10),_transparent_20%)]"
        )}
      />
      {children}
    </div>
  );
}

function Card({ children, className = "" }) {
  return (
    <div
      className={cn(
        "rounded-3xl border backdrop-blur-sm shadow-[0_16px_60px_rgba(15,23,42,0.12)]",
        "border-slate-200/60 bg-white/80 dark:border-white/[0.06] dark:bg-[#131b2f]/70",
        className
      )}
    >
      {children}
    </div>
  );
}

function Badge({ children, className = "" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
        className
      )}
    >
      {children}
    </span>
  );
}

function SectionTitle({ title, subtitle, right }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight md:text-2xl">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
      </div>
      {right}
    </div>
  );
}

function NavButton({ active, icon: Icon, label, onClick, dark }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition",
        active
          ? "bg-violet-500 text-white shadow-[0_14px_32px_rgba(109,94,249,0.35)]"
          : dark
          ? "text-slate-300 hover:bg-white/6"
          : "text-slate-700 hover:bg-slate-900/5"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="font-medium">{label}</span>
    </button>
  );
}

function Metric({ label, value, hint, accent = "violet" }) {
  const accents = {
    violet: "from-violet-500/20 to-violet-500/5 text-violet-200 border-violet-400/20",
    emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-200 border-emerald-400/20",
    sky: "from-sky-500/20 to-sky-500/5 text-sky-200 border-sky-400/20",
    amber: "from-amber-500/20 to-amber-500/5 text-amber-100 border-amber-400/20",
  };

  return (
    <Card className={cn("bg-gradient-to-br p-5", accents[accent])}>
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div>
      <div className="mt-2 text-xs text-slate-400">{hint}</div>
    </Card>
  );
}

function ProgressBar({ value }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/10">
      <div
        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-400"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function Toggle({ enabled, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div>
        <div className="font-medium">{label}</div>
        <div className="mt-1 text-sm text-slate-400">{description}</div>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={cn(
          "relative h-8 w-14 rounded-full transition",
          enabled ? "bg-violet-500" : "bg-slate-500/30"
        )}
      >
        <span
          className={cn(
            "absolute top-1 h-6 w-6 rounded-full bg-white transition",
            enabled ? "left-7" : "left-1"
          )}
        />
      </button>
    </div>
  );
}

function Dot({ active }) {
  return <span className={cn("h-2.5 w-2.5 rounded-full", active ? "bg-emerald-400" : "bg-slate-500/40")} />;
}

export default function NoteCraftAIPrototype() {
  const [dark, setDark] = useState(true);
  const [page, setPage] = useState("dashboard");
  const [showRecorder, setShowRecorder] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState("n1");
  const [captureType, setCaptureType] = useState("audio");
  const [searchMode, setSearchMode] = useState("ai");
  const [searchQuery, setSearchQuery] = useState("帮我总结最近和增长相关的笔记");
  const [reviewIndex, setReviewIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewDone, setReviewDone] = useState(9);
  const [privacyState, setPrivacyState] = useState({
    allowCloudAi: false,
    encryptCache: true,
    sensitiveLock: true,
    autoDeleteDays: 30,
    processingMode: "本地优先",
  });

  const selectedNote = useMemo(
    () => notesSeed.find((note) => note.id === selectedNoteId) || notesSeed[0],
    [selectedNoteId]
  );

  const filteredSearchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return searchKnowledgeBase;
    return searchKnowledgeBase
      .filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.excerpt.toLowerCase().includes(q) ||
          item.tags.join(" ").toLowerCase().includes(q)
      )
      .sort((a, b) => b.score - a.score);
  }, [searchQuery]);

  const currentCard = reviewCardsSeed[reviewIndex % reviewCardsSeed.length];

  function rateReviewCard(level) {
    setReviewDone((v) => v + 1);
    setShowAnswer(false);
    setReviewIndex((v) => (v + 1) % reviewCardsSeed.length);
  }

  const CaptureIcon =
    captureType === "audio"
      ? FileAudio
      : captureType === "image"
      ? FileImage
      : captureType === "video"
      ? FileVideo
      : FileText;

  return (
    <AppShell dark={dark}>
      <div className="mx-auto flex min-h-screen max-w-[1680px] gap-4 p-4 md:p-6">
        <aside
          className={cn(
            "hidden w-[280px] shrink-0 rounded-[28px] border p-5 lg:flex lg:flex-col",
            dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white/80"
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-semibold tracking-tight">
                Note<span className="text-violet-400">Craft</span> AI
              </div>
              <div className="mt-1 text-sm text-slate-400">AI 智能知识库原型</div>
            </div>
            <button
              onClick={() => setDark((v) => !v)}
              className={cn(
                "grid h-11 w-11 place-items-center rounded-2xl border",
                dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
              )}
            >
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>

          <div className="mt-8 space-y-2">
            {navItems.map((item) => (
              <NavButton
                key={item.key}
                active={page === item.key}
                icon={item.icon}
                label={item.label}
                dark={dark}
                onClick={() => setPage(item.key)}
              />
            ))}
          </div>

          <Card className="mt-8 p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-500/15 text-violet-200">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium">7 天 Pro 体验</div>
                <div className="text-sm text-slate-400">已完成 3/5 个新手步骤</div>
              </div>
            </div>
            <div className="mt-4">
              <ProgressBar value={60} />
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
                <span>导入第一条内容</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
                <span>首次 AI 整理</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
                <span>完成今日复习</span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </div>
            </div>
          </Card>

          <div className="mt-auto rounded-3xl bg-gradient-to-br from-violet-500/20 to-emerald-500/10 p-5">
            <div className="text-sm font-medium text-violet-100">本地优先处理已开启</div>
            <div className="mt-2 text-sm leading-6 text-slate-300">
              默认不上传原始录音，敏感笔记可启用额外锁定和缓存加密。
            </div>
          </div>
        </aside>

        <main className="flex-1 space-y-4">
          <header
            className={cn(
              "rounded-[28px] border px-4 py-5 md:px-6",
              dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white/80"
            )}
          >
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="space-y-3">
                <Badge className="border-violet-400/20 bg-violet-500/15 text-violet-100">
                  桌面端优先 · AI 智能知识库 MVP
                </Badge>
                <div>
                  <div className="text-3xl font-semibold tracking-tight md:text-4xl">
                    NoteCraft AI 工作台
                  </div>
                  <div className="mt-2 max-w-3xl text-sm leading-7 text-slate-400 md:text-base">
                    把录音、图片、视频和随手记统一沉淀为结构化笔记，并通过 AI 整理、智能检索与主动回顾形成完整闭环。
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                  <Badge className="border-white/10 bg-white/5 text-slate-300">记录 → 整理 → 检索 → 回顾</Badge>
                  <Badge className="border-white/10 bg-white/5 text-slate-300">本地优先隐私模式</Badge>
                  <Badge className="border-white/10 bg-white/5 text-slate-300">支持多模态输入</Badge>
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-[minmax(0,360px)_auto]">
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    defaultValue="帮我总结最近与考试复习有关的笔记"
                    className="w-full bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-500"
                    placeholder="搜索笔记、标签或直接提问"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button onClick={() => setShowRecorder(true)} className="inline-flex items-center gap-2 rounded-2xl bg-violet-500 px-4 py-3 font-medium text-white shadow-[0_14px_36px_rgba(109,94,249,0.35)]">
                    <Mic className="h-4 w-4" />
                    开始录音
                  </button>
                  <button
                    className={cn(
                      "inline-flex items-center gap-2 rounded-2xl border px-4 py-3 font-medium",
                      dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
                    )}
                  >
                    <UploadCloud className="h-4 w-4" />
                    导入内容
                  </button>
                </div>
              </div>
            </div>
          </header>

          <AnimatePresence mode="wait">
            {page === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-4"
              >
                {showRecorder && (
                  <AudioSummaryRecorder onClose={() => setShowRecorder(false)} />
                )}
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_380px]">
                  <Card className="overflow-hidden p-0">
                    <div className="grid lg:grid-cols-[minmax(0,1.2fr)_360px]">
                      <div className="border-b border-white/10 bg-gradient-to-br from-violet-500/18 via-slate-950/20 to-emerald-500/12 p-6 lg:border-b-0 lg:border-r">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className="border-violet-400/20 bg-violet-500/15 text-violet-100">今日主页</Badge>
                          <Badge className="border-emerald-400/20 bg-emerald-500/15 text-emerald-100">AI 待整理 4 条</Badge>
                        </div>

                        <div className="mt-5 max-w-2xl text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
                          今天先整理 2 条内容，再完成 3 张复习卡片
                        </div>
                        <div className="mt-4 max-w-2xl text-sm leading-8 text-slate-300 md:text-base">
                          首页聚焦三件事：快速录入、查看 AI 整理进度、继续复习任务。整个排版按桌面端高频操作优先级重新组织，先给出行动入口，再展示知识沉淀结果。
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                          <button className="inline-flex items-center gap-2 rounded-2xl bg-violet-500 px-5 py-3 text-sm font-medium text-white shadow-[0_14px_36px_rgba(109,94,249,0.35)]">
                            <Sparkles className="h-4 w-4" />
                            开始一次 AI 整理
                          </button>
                          <button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-slate-200">
                            <RefreshCcw className="h-4 w-4" />
                            继续今日复习
                          </button>
                        </div>

                        <div className="mt-8 grid gap-3 sm:grid-cols-3">
                          {[
                            { title: '多模态录入', desc: '文字 / 图片 / 录音 / 视频统一接入', icon: UploadCloud },
                            { title: 'AI 自动整理', desc: '摘要、大纲、标签与关联笔记', icon: Wand2 },
                            { title: '主动回顾', desc: '问答卡片与重点提炼同步推进', icon: BellRing },
                          ].map((item) => {
                            const Icon = item.icon;
                            return (
                              <div key={item.title} className="rounded-3xl border border-white/10 bg-white/6 p-4">
                                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-violet-100">
                                  <Icon className="h-5 w-5" />
                                </div>
                                <div className="mt-4 font-medium">{item.title}</div>
                                <div className="mt-2 text-sm leading-7 text-slate-400">{item.desc}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-slate-400">今日焦点</div>
                            <div className="mt-1 text-xl font-semibold">下一步该做什么</div>
                          </div>
                          <Badge className="border-amber-400/20 bg-amber-500/15 text-amber-100">预计 12 分钟</Badge>
                        </div>

                        <div className="mt-5 space-y-3">
                          {[
                            { title: '整理课堂录音', desc: '生成摘要、大纲与推荐标签', done: true },
                            { title: '确认增长周会待办', desc: '补充实验结论与行动项', done: false },
                            { title: '完成今日复习卡片', desc: '还剩 3 张待处理', done: false },
                          ].map((item) => (
                            <div key={item.title} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                              <div className="pt-0.5">
                                {item.done ? (
                                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                ) : (
                                  <Clock3 className="h-5 w-5 text-amber-300" />
                                )}
                              </div>
                              <div>
                                <div className="font-medium">{item.title}</div>
                                <div className="mt-1 text-sm text-slate-400">{item.desc}</div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-5 rounded-3xl border border-white/10 bg-slate-950/25 p-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">今日进度</span>
                            <span className="font-medium text-slate-200">75%</span>
                          </div>
                          <div className="mt-3">
                            <ProgressBar value={75} />
                          </div>
                          <div className="mt-3 text-sm leading-7 text-slate-400">
                            已完成 9 / 12 条回顾任务，知识沉淀分在本周提升了 11%。
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
                    <Metric label="待整理内容" value="4" hint="2 条录音、1 张图片、1 条文字速记" accent="violet" />
                    <Metric label="今日待复习" value="12" hint="预计耗时 8 分钟，已完成 9 条" accent="emerald" />
                    <Metric label="关联知识命中" value="18" hint="过去 7 天新增同主题链接 18 条" accent="sky" />
                    <Card className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-500/15 text-amber-100">
                          <Star className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium">7 天 Pro 体验</div>
                          <div className="text-sm text-slate-400">已完成 3 / 5 个新手步骤</div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <ProgressBar value={60} />
                      </div>
                      <div className="mt-4 space-y-2 text-sm text-slate-300">
                        <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
                          <span>导入第一条内容</span>
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        </div>
                        <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
                          <span>首次 AI 整理</span>
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        </div>
                        <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
                          <span>完成今日复习</span>
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_0.92fr]">
                  <Card className="p-6">
                    <SectionTitle title="最近笔记" subtitle="按最近打开时间与知识沉淀质量综合排序" />
                    <div className="grid gap-3 md:grid-cols-2">
                      {notesSeed.map((note) => (
                        <button
                          key={note.id}
                          onClick={() => { setSelectedNoteId(note.id); setPage('note'); }}
                          className="rounded-[28px] border border-white/10 bg-white/5 p-5 text-left transition hover:border-violet-400/30 hover:bg-violet-500/8"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="font-medium">{note.title}</div>
                              <div className="mt-1 text-sm text-slate-400">{note.source} · {note.updatedAt}</div>
                            </div>
                            <Badge className={cn('shrink-0', note.tagColor)}>{note.status}</Badge>
                          </div>
                          <div className="mt-4 line-clamp-3 text-sm leading-7 text-slate-300">{note.summary}</div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {note.tags.map((tag) => (
                              <Badge key={tag} className="border-white/10 bg-white/5 text-slate-300">{tag}</Badge>
                            ))}
                          </div>
                          <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-violet-200">
                            查看详情 <ArrowRight className="h-4 w-4" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-6">
                    <SectionTitle title="AI 整理流水线" subtitle="让用户一眼知道系统正在处理什么" />
                    <div className="space-y-3">
                      {aiTimeline.map((item) => (
                        <div key={item.title} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                          <div className="pt-1">
                            {item.done ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <Clock3 className="h-5 w-5 text-amber-300" />}
                          </div>
                          <div>
                            <div className="font-medium">{item.title}</div>
                            <div className="mt-1 text-sm text-slate-400">{item.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 rounded-[28px] border border-violet-400/20 bg-gradient-to-br from-violet-500/12 to-emerald-500/10 p-5">
                      <div className="flex items-center gap-2 font-medium text-violet-100">
                        <BellRing className="h-4 w-4" /> 今日复习入口
                      </div>
                      <div className="mt-3 text-sm leading-7 text-slate-300">
                        系统已为你生成 12 条回顾任务，涵盖问答卡片、重点提炼和旧新知识对比。
                      </div>
                      <button onClick={() => setPage('review')} className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-violet-500 px-4 py-3 text-sm font-medium text-white">
                        进入今日复习 <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </Card>
                </div>

                <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr_0.8fr]">
                  <Card className="p-6">
                    <SectionTitle title="快速录入" subtitle="把首页入口做成一眼可点的操作区" />
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                      {[
                        { key: 'audio', label: '录音转写', desc: '实时记录课堂与会议', icon: FileAudio },
                        { key: 'image', label: '图片 OCR', desc: '课件、白板与拍照识别', icon: FileImage },
                        { key: 'video', label: '视频转文字', desc: '课程视频与访谈摘录', icon: FileVideo },
                        { key: 'text', label: '文字速记', desc: '临时灵感和片段想法', icon: FileText },
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <button key={item.key} onClick={() => setCaptureType(item.key)}
                            className={cn("rounded-[24px] border p-4 text-left transition",
                              captureType === item.key ? "border-violet-400/30 bg-violet-500/12" : "border-white/10 bg-white/5 hover:bg-white/8"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-violet-100">
                                <Icon className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="font-medium">{item.label}</div>
                                <div className="mt-1 text-sm text-slate-400">{item.desc}</div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </Card>

                  <Card className="p-6">
                    <SectionTitle title="知识沉淀概览" subtitle="首页直接展示 AI 对内容的组织结果" />
                    <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                      <div className="rounded-[28px] border border-white/10 bg-slate-950/25 p-5">
                        <div className="flex items-center gap-2 font-medium">
                          <Brain className="h-4 w-4 text-violet-300" /> AI 生成摘要
                        </div>
                        <div className="mt-4 text-sm leading-8 text-slate-300">
                          本周输入的内容主要集中在课堂复习、增长实验和写作素材三个主题，系统已自动形成大纲、标签和关联笔记，方便后续检索与回顾。
                        </div>
                        <div className="mt-5 flex flex-wrap gap-2">
                          {['操作系统', '增长实验', '课堂重点', '考研英语', '会议纪要'].map((tag, idx) => (
                            <Badge key={tag} className={cn(idx % 2 === 0 ? 'border-violet-400/20 bg-violet-500/15 text-violet-100' : 'border-emerald-400/20 bg-emerald-500/15 text-emerald-100')}>
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                          <div className="flex items-center gap-2 font-medium">
                            <Tags className="h-4 w-4 text-violet-300" /> 高频主题
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {['线程', '复盘', '教育公平', '高并发', '写作模板', 'AI 搜索'].map((tag) => (
                              <Badge key={tag} className="border-white/10 bg-white/5 text-slate-300">#{tag}</Badge>
                            ))}
                          </div>
                        </div>
                        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                          <div className="flex items-center gap-2 font-medium">
                            <Link2 className="h-4 w-4 text-violet-300" /> 关联知识推荐
                          </div>
                          <div className="mt-4 space-y-3">
                            {knowledgeLinks.map((link) => (
                              <div key={link.title} className="rounded-2xl bg-slate-950/20 px-4 py-3">
                                <div className="font-medium">{link.title}</div>
                                <div className="mt-1 text-sm text-slate-400">{link.reason}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <SectionTitle title="最近 AI 搜索" subtitle="主页保留检索入口和继续追问" />
                    <div className="space-y-3">
                      {[
                        '我上周关于面试准备的内容有哪些？',
                        '帮我总结最近和增长相关的笔记',
                        '之前记录过哪些关于线程调度的知识点？',
                      ].map((item) => (
                        <button key={item} onClick={() => { setSearchQuery(item); setSearchMode('ai'); setPage('search'); }}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-sm text-slate-300 transition hover:bg-white/8"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </Card>
                </div>
              </motion.div>
            )}

            {page === "note" && (
              <motion.div key="note" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_360px]"
              >
                <Card className="p-5">
                  <SectionTitle title="笔记目录" subtitle="桌面端三栏结构" />
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400">搜索笔记 / 标签</div>
                  <div className="mt-4 space-y-2">
                    {notesSeed.map((note) => (
                      <button key={note.id} onClick={() => setSelectedNoteId(note.id)}
                        className={cn("w-full rounded-2xl border p-4 text-left transition",
                          selectedNoteId === note.id ? "border-violet-400/30 bg-violet-500/12" : "border-white/10 bg-white/5 hover:bg-white/8"
                        )}
                      >
                        <div className="font-medium">{note.title}</div>
                        <div className="mt-1 text-xs text-slate-400">{note.updatedAt}</div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {note.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} className="border-white/10 bg-white/5 text-slate-300">{tag}</Badge>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/25 p-4">
                    <div className="text-sm font-medium">知识沉淀评分</div>
                    <div className="mt-3 flex items-end justify-between">
                      <div className="text-4xl font-semibold text-violet-200">{selectedNote.knowledgeScore}</div>
                      <div className="text-sm text-slate-400">由结构完整度 / 标签质量 / 关联度综合计算</div>
                    </div>
                    <div className="mt-4"><ProgressBar value={selectedNote.knowledgeScore} /></div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="text-sm text-slate-400">{selectedNote.source} · 最后更新 {selectedNote.updatedAt}</div>
                      <div className="mt-2 text-3xl font-semibold tracking-tight">{selectedNote.title}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200">原文 / 整理稿</button>
                      <button className="rounded-2xl bg-violet-500 px-4 py-3 text-sm font-medium text-white">AI 整理</button>
                      <button className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200">导出</button>
                    </div>
                  </div>
                  <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1fr]">
                    <div className="space-y-4">
                      <div>
                        <div className="mb-2 text-sm font-medium text-slate-300">原始内容</div>
                        <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 text-sm leading-8 text-slate-300">{selectedNote.original}</div>
                      </div>
                      <div>
                        <div className="mb-2 text-sm font-medium text-slate-300">整理后正文</div>
                        <div className="rounded-[24px] border border-violet-400/20 bg-violet-500/8 p-5 text-sm leading-8 text-slate-100 whitespace-pre-line">{selectedNote.cleaned}</div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                          <Brain className="h-4 w-4 text-violet-300" /> AI 摘要
                        </div>
                        <div className="mt-3 text-sm leading-8 text-slate-300">{selectedNote.summary}</div>
                      </div>
                      <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                          <ListIcon /> 自动大纲
                        </div>
                        <div className="mt-3 space-y-2">
                          {selectedNote.outline.map((item, idx) => (
                            <div key={item} className="flex gap-3 rounded-2xl bg-slate-950/20 px-4 py-3 text-sm text-slate-300">
                              <span className="text-violet-300">0{idx + 1}</span>
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-5">
                  <SectionTitle title="AI 面板" subtitle="摘要 / 标签 / 关联笔记 / 复习卡片" />
                  <div className="space-y-4">
                    <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2 font-medium">
                        <Tags className="h-4 w-4 text-violet-300" /> 推荐标签
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedNote.tags.map((tag, idx) => (
                          <Badge key={tag} className={cn(idx % 2 === 0 ? "border-violet-400/20 bg-violet-500/15 text-violet-100" : "border-emerald-400/20 bg-emerald-500/15 text-emerald-100")}>
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2 font-medium">
                        <Link2 className="h-4 w-4 text-violet-300" /> 关联笔记
                      </div>
                      <div className="mt-3 space-y-3">
                        {knowledgeLinks.map((link) => (
                          <div key={link.title} className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                            <div className="font-medium">{link.title}</div>
                            <div className="mt-1 text-sm text-slate-400">{link.reason}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-violet-500/14 to-emerald-500/10 p-4">
                      <div className="flex items-center gap-2 font-medium">
                        <BellRing className="h-4 w-4 text-violet-200" /> 一键生成复习卡片
                      </div>
                      <div className="mt-2 text-sm leading-7 text-slate-300">当前笔记可直接生成问答卡片、重点回顾和旧新知识对比卡。</div>
                      <button className="mt-4 w-full rounded-2xl bg-violet-500 px-4 py-3 text-sm font-medium text-white">生成 3 张复习卡片</button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {page === "search" && (
              <motion.div key="search" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_340px]"
              >
                <Card className="p-5">
                  <SectionTitle title="筛选器" subtitle="普通搜索 / AI 问答切换" />
                  <div className="space-y-3">
                    {["最近 7 天", "课堂内容", "会议纪要", "标签：增长", "标签：操作系统", "敏感内容隐藏"].map((item, idx) => (
                      <div key={item} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                        <span>{item}</span>
                        {idx < 2 ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="text-sm text-slate-400">AI 搜索页</div>
                      <div className="mt-1 text-2xl font-semibold tracking-tight">自然语言找回 + 总结 + 推荐</div>
                    </div>
                    <div className="flex gap-2 rounded-2xl border border-white/10 bg-white/5 p-1">
                      {[{ key: "keyword", label: "普通搜索" }, { key: "ai", label: "AI 问答" }].map((item) => (
                        <button key={item.key} onClick={() => setSearchMode(item.key)}
                          className={cn("rounded-2xl px-4 py-2 text-sm font-medium transition", searchMode === item.key ? "bg-violet-500 text-white" : "text-slate-300")}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-5 rounded-[24px] border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/25 px-4 py-3">
                      <Search className="h-4 w-4 text-slate-400" />
                      <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
                        placeholder="问：我上周关于面试准备的内容有哪些？"
                      />
                    </div>
                    <div className="mt-5 rounded-[24px] border border-violet-400/20 bg-violet-500/10 p-5">
                      <div className="flex items-center gap-2 font-medium text-violet-100">
                        <Sparkles className="h-4 w-4" /> AI 回答
                      </div>
                      <div className="mt-3 text-sm leading-8 text-slate-100">
                        最近与你"增长"主题最相关的笔记主要集中在产品周会实验复盘。系统从 3 条笔记中召回 1 条高相关结果，并建议继续追问"首次 AI 整理提示是否影响留存"或"近 2 周与增长有关的待办项"。
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 space-y-3">
                    {filteredSearchResults.map((item, idx) => (
                      <div key={item.title} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="font-medium">{item.title}</div>
                            <div className="mt-2 text-sm leading-7 text-slate-400">{item.excerpt}</div>
                          </div>
                          <Badge className="border-emerald-400/20 bg-emerald-500/15 text-emerald-100">
                            {(item.score * 100).toFixed(0)}%
                          </Badge>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {item.tags.map((tag) => (
                            <Badge key={tag} className="border-white/10 bg-white/5 text-slate-300">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-5">
                  <SectionTitle title="关联推荐" subtitle="支持继续追问与知识链路浏览" />
                  <div className="space-y-3">
                    {["继续追问：近两周与增长有关的待办项", "推荐主题：新手引导转化率", "推荐笔记：首条笔记完成率优化"].map((item, idx) => (
                      <button key={item} className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-sm text-slate-300 hover:bg-white/8">
                        {item}
                      </button>
                    ))}
                  </div>
                  <div className="mt-6 rounded-[24px] border border-white/10 bg-slate-950/20 p-4">
                    <div className="flex items-center gap-2 font-medium">
                      <Database className="h-4 w-4 text-violet-300" /> 检索策略
                    </div>
                    <div className="mt-3 space-y-3 text-sm text-slate-400">
                      <div>1. 关键词召回 + 向量召回混合排序</div>
                      <div>2. 命中 note_chunks 后聚合到原笔记</div>
                      <div>3. 由 LLM 汇总并生成可追问答案</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {page === "review" && (
              <motion.div key="review" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]"
              >
                <div className="grid gap-4">
                  <Metric label="今日待复习" value="12" hint="问答卡片 8 张，重点提炼 4 张" accent="violet" />
                  <Metric label="已完成" value={String(reviewDone)} hint="预计还需 3 分钟" accent="emerald" />
                  <Card className="p-6">
                    <SectionTitle title="回顾形式" subtitle="更轻量，但保留间隔重复逻辑" />
                    <div className="space-y-3 text-sm text-slate-300">
                      {["问答卡片", "考点提炼", "重点摘要", "旧笔记与新笔记对比"].map((item) => (
                        <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">{item}</div>
                      ))}
                    </div>
                  </Card>
                </div>

                <Card className="p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="text-sm text-slate-400">今日复习页</div>
                      <div className="mt-1 text-2xl font-semibold tracking-tight">低成本完成回顾，自动更新下次复习时间</div>
                    </div>
                    <Badge className="border-amber-400/20 bg-amber-500/15 text-amber-100">当前卡片：{currentCard.type}</Badge>
                  </div>
                  <div className="mt-6">
                    <motion.button layout onClick={() => setShowAnswer((v) => !v)}
                      className="w-full rounded-[32px] border border-white/10 bg-gradient-to-br from-violet-500/14 to-emerald-500/10 p-8 text-left"
                    >
                      <div className="text-sm text-slate-400">{showAnswer ? "答案" : "问题"}</div>
                      <div className="mt-5 min-h-[180px] text-2xl font-semibold leading-10 md:text-3xl">
                        {showAnswer ? currentCard.answer : currentCard.question}
                      </div>
                      <div className="mt-8 flex items-center justify-between text-sm text-slate-300">
                        <span>{showAnswer ? "点击可翻回问题" : "点击查看答案"}</span>
                        <span>{currentCard.due}</span>
                      </div>
                    </motion.button>
                  </div>
                  <div className="mt-6 grid gap-3 md:grid-cols-3">
                    <button onClick={() => rateReviewCard(1)} className="rounded-2xl border border-rose-400/20 bg-rose-500/15 px-4 py-4 text-sm font-medium text-rose-100">忘记了</button>
                    <button onClick={() => rateReviewCard(2)} className="rounded-2xl border border-amber-400/20 bg-amber-500/15 px-4 py-4 text-sm font-medium text-amber-100">有印象</button>
                    <button onClick={() => rateReviewCard(3)} className="rounded-2xl border border-emerald-400/20 bg-emerald-500/15 px-4 py-4 text-sm font-medium text-emerald-100">已掌握</button>
                  </div>
                  <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-5">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">今日进度</div>
                      <div className="text-sm text-slate-400">{reviewDone}/12</div>
                    </div>
                    <div className="mt-4"><ProgressBar value={(reviewDone / 12) * 100} /></div>
                    <div className="mt-4 text-sm leading-7 text-slate-400">
                      评分会影响下一次复习时间，并同步回写 review_logs / review_tasks。这个原型已预留轻量 SM2 扩展位。
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {page === "privacy" && (
              <motion.div key="privacy" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                className="grid gap-4 xl:grid-cols-[1fr_0.8fr]"
              >
                <Card className="p-6">
                  <SectionTitle title="设置与隐私" subtitle="建立用户对 AI 处理链路的信任" />
                  <div className="grid gap-4">
                    <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                      <div className="font-medium">数据处理模式</div>
                      <div className="mt-1 text-sm text-slate-400">敏感内容默认本地优先，可选开启云增强。</div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {[{ value: "本地优先", icon: Lock }, { value: "云增强", icon: Sparkles }].map((item) => {
                          const Icon = item.icon;
                          return (
                            <button key={item.value} onClick={() => setPrivacyState((prev) => ({ ...prev, processingMode: item.value }))}
                              className={cn("inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition",
                                privacyState.processingMode === item.value ? "border-transparent bg-violet-500 text-white" : "border-white/10 bg-white/5 text-slate-300"
                              )}
                            >
                              <Icon className="h-4 w-4" /> {item.value}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <Toggle enabled={privacyState.allowCloudAi} onChange={(enabled) => setPrivacyState((prev) => ({ ...prev, allowCloudAi: enabled }))}
                      label="允许云端 AI 增强" description="用于更强摘要、检索和关联分析。关闭后仅使用本地能力。"
                    />
                    <Toggle enabled={privacyState.encryptCache} onChange={(enabled) => setPrivacyState((prev) => ({ ...prev, encryptCache: enabled }))}
                      label="自动加密本地缓存" description="保护转写片段、摘要结果和索引缓存。"
                    />
                    <Toggle enabled={privacyState.sensitiveLock} onChange={(enabled) => setPrivacyState((prev) => ({ ...prev, sensitiveLock: enabled }))}
                      label="敏感笔记额外锁定" description="敏感笔记默认隐藏搜索摘要，并要求二次确认后打开。"
                    />
                    <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                      <div className="font-medium">自动清理本地缓存</div>
                      <div className="mt-1 text-sm text-slate-400">当前策略：{privacyState.autoDeleteDays} 天未访问自动清理缓存</div>
                      <input type="range" min={7} max={90} step={1} value={privacyState.autoDeleteDays}
                        onChange={(e) => setPrivacyState((prev) => ({ ...prev, autoDeleteDays: Number(e.target.value) }))}
                        className="mt-4 w-full"
                      />
                    </div>
                  </div>
                </Card>

                <div className="grid gap-4">
                  <Card className="p-6">
                    <SectionTitle title="安全说明" subtitle="适合官网与设置页联动展示" />
                    <div className="space-y-3">
                      {[
                        { icon: Lock, title: "默认本地处理", desc: "原始录音和敏感内容可不出本机。" },
                        { icon: EyeOff, title: "敏感笔记隔离", desc: "摘要、检索和推荐都可单独关闭。" },
                        { icon: ShieldCheck, title: "缓存加密", desc: "本地索引、转写片段与临时结果可加密。" },
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <div className="flex items-center gap-3">
                              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-500/12 text-violet-200">
                                <Icon className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="font-medium">{item.title}</div>
                                <div className="mt-1 text-sm text-slate-400">{item.desc}</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>

                  <Card className="p-6">
                    <SectionTitle title="数据控制" subtitle="导出、删除、清理都放在同一屏" />
                    <div className="space-y-3">
                      <button className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left">
                        <div className="flex items-center gap-3">
                          <Download className="h-4 w-4 text-slate-300" /> <span>导出我的笔记数据</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-400" />
                      </button>
                      <button className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left">
                        <div className="flex items-center gap-3">
                          <Trash2 className="h-4 w-4 text-slate-300" /> <span>清除本地缓存</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-400" />
                      </button>
                      <button className="flex w-full items-center justify-between rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-4 text-left text-rose-100">
                        <div className="flex items-center gap-3">
                          <Settings2 className="h-4 w-4" /> <span>删除账户与所有数据</span>
                        </div>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </AppShell>
  );
}

function ListIcon() {
  return <BookOpen className="h-4 w-4 text-violet-300" />;
}
