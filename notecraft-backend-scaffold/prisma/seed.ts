import {
  JobStatusType,
  JobTypeType,
  NoteStatus,
  PrismaClient,
  ProcessingModeType,
  ReviewTaskType,
  SearchModeType,
  SourceKindType,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.searchHit.deleteMany();
  await prisma.searchSession.deleteMany();
  await prisma.reviewLog.deleteMany();
  await prisma.reviewTask.deleteMany();
  await prisma.flashcard.deleteMany();
  await prisma.knowledgeLink.deleteMany();
  await prisma.noteEmbedding.deleteMany();
  await prisma.noteChunk.deleteMany();
  await prisma.aiJob.deleteMany();
  await prisma.noteTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.asrSegment.deleteMany();
  await prisma.asrResult.deleteMany();
  await prisma.ocrResult.deleteMany();
  await prisma.mediaAsset.deleteMany();
  await prisma.noteSource.deleteMany();
  await prisma.note.deleteMany();
  await prisma.onboardingProgress.deleteMany();
  await prisma.reward.deleteMany();
  await prisma.privacySetting.deleteMany();
  await prisma.user.deleteMany();

  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@notecraft.ai',
      passwordHash: 'demo_hash_for_local_deploy_only',
      displayName: 'Demo User',
      plan: 'pro',
      privacySetting: {
        create: {
          processingMode: ProcessingModeType.local_first,
          allowCloudAi: false,
          encryptLocalCache: true,
          autoDeleteDays: 30,
        },
      },
      onboardingProgress: {
        create: [
          { stepKey: 'import_first_content' },
          { stepKey: 'first_ai_organize' },
          { stepKey: 'visit_today_review' },
        ],
      },
      rewards: {
        create: [
          { rewardType: 'points', rewardName: '首次整理奖励', amount: 50, sourceAction: 'organize' },
          { rewardType: 'badge', rewardName: '连续学习 3 天', amount: 1, sourceAction: 'streak' },
        ],
      },
    },
  });

  const tags = await Promise.all([
    prisma.tag.create({ data: { userId: demoUser.id, name: '操作系统', color: '#6D5EF9' } }),
    prisma.tag.create({ data: { userId: demoUser.id, name: '期末复习', color: '#19C37D' } }),
    prisma.tag.create({ data: { userId: demoUser.id, name: '线程', color: '#8B5CF6' } }),
    prisma.tag.create({ data: { userId: demoUser.id, name: '增长', color: '#10B981' } }),
    prisma.tag.create({ data: { userId: demoUser.id, name: '周会', color: '#14B8A6' } }),
    prisma.tag.create({ data: { userId: demoUser.id, name: '实验复盘', color: '#34D399' } }),
    prisma.tag.create({ data: { userId: demoUser.id, name: '考研英语', color: '#0EA5E9' } }),
    prisma.tag.create({ data: { userId: demoUser.id, name: '写作', color: '#38BDF8' } }),
    prisma.tag.create({ data: { userId: demoUser.id, name: '教育公平', color: '#7DD3FC' } }),
  ]);

  const tagMap = new Map(tags.map((tag) => [tag.name, tag]));

  const note1 = await prisma.note.create({
    data: {
      userId: demoUser.id,
      title: '操作系统：进程与线程',
      status: NoteStatus.ready,
      sourceSummary: '课堂录音',
      originalText:
        '老师先从进程和线程的定义讲起，强调进程是资源分配的基本单位，线程是 CPU 调度的基本单位。同一进程中的线程共享地址空间，但有各自独立的栈。在线程切换成本、并发模型和上下文切换方面要重点理解。',
      cleanedText:
        '1. 进程是资源分配单位，线程是调度单位。\n2. 线程共享地址空间与大部分资源，但拥有独立栈。\n3. 线程切换开销低于进程切换，更适合高并发。\n4. 用户态与内核态切换会带来额外性能损耗。',
      aiSummary:
        '解释进程与线程的定义、共享资源边界与调度模型，并补充用户态/内核态切换的性能影响。',
      outlineJson: [
        '进程与线程的定义',
        '共享资源与独立资源',
        '调度与切换成本',
        '课堂重点：用户态/内核态切换',
      ],
      knowledgeScore: 86.0,
      noteSources: {
        create: [
          {
            sourceKind: SourceKindType.audio,
            sourceName: '操作系统课堂录音.m4a',
            sourceUri: 'local://demo/os-class-audio',
            mimeType: 'audio/mp4',
          },
        ],
      },
    },
  });

  const note2 = await prisma.note.create({
    data: {
      userId: demoUser.id,
      title: '产品周会：增长实验复盘',
      status: NoteStatus.processing,
      sourceSummary: '会议录音',
      originalText:
        '本周实验主要看新用户路径，注册到首条笔记的完成率有提升，但 7 日留存变化不明显。大家认为按钮文案和首次 AI 提示的时机会影响用户是否愿意继续使用。',
      cleanedText:
        '- 首条笔记完成率提升 12%。\n- 7 日留存暂无显著提升。\n- 下周继续测试 CTA 文案与首次 AI 整理提示时机。\n- 需要补充渠道归因校验。',
      aiSummary:
        '讨论了新用户引导实验的留存变化、渠道归因偏差与下周需要继续验证的按钮文案方案。',
      outlineJson: ['实验结果', '问题归因', '待办事项', '下周计划'],
      knowledgeScore: 74.0,
      noteSources: {
        create: [
          {
            sourceKind: SourceKindType.audio,
            sourceName: '产品周会录音.m4a',
            sourceUri: 'local://demo/growth-weekly-audio',
            mimeType: 'audio/mp4',
          },
        ],
      },
    },
  });

  const note3 = await prisma.note.create({
    data: {
      userId: demoUser.id,
      title: '英语写作素材：教育公平',
      status: NoteStatus.ready,
      sourceSummary: '图片 OCR',
      originalText:
        'Education equity is not merely an ethical aspiration but also a practical necessity for social mobility...',
      cleanedText:
        '观点：教育公平提升社会流动性。\n论据：资源分配不均会放大贫富差距。\n可复用表达：bridge the gap / equal access / upward mobility。',
      aiSummary:
        '从图片中的论据提取出适合写作模板的观点、论证词组与例句，可直接用于作文练习。',
      outlineJson: ['核心观点', '论据扩展', '可复用表达', '作文应用场景'],
      knowledgeScore: 81.0,
      noteSources: {
        create: [
          {
            sourceKind: SourceKindType.image,
            sourceName: '教育公平写作素材.png',
            sourceUri: 'local://demo/education-equity-image',
            mimeType: 'image/png',
          },
        ],
      },
    },
  });

  await prisma.noteTag.createMany({
    data: [
      { noteId: note1.id, tagId: tagMap.get('操作系统')!.id },
      { noteId: note1.id, tagId: tagMap.get('期末复习')!.id },
      { noteId: note1.id, tagId: tagMap.get('线程')!.id },
      { noteId: note2.id, tagId: tagMap.get('增长')!.id },
      { noteId: note2.id, tagId: tagMap.get('周会')!.id },
      { noteId: note2.id, tagId: tagMap.get('实验复盘')!.id },
      { noteId: note3.id, tagId: tagMap.get('考研英语')!.id },
      { noteId: note3.id, tagId: tagMap.get('写作')!.id },
      { noteId: note3.id, tagId: tagMap.get('教育公平')!.id },
    ],
  });

  const audio1 = await prisma.mediaAsset.create({
    data: {
      userId: demoUser.id,
      noteId: note1.id,
      assetType: 'audio',
      storageKey: 'demo/audio/os-class-audio.m4a',
      fileUrl: 'https://example.com/demo/os-class-audio.m4a',
      durationSec: 1420,
      fileSize: BigInt(12_345_678),
    },
  });

  const audio2 = await prisma.mediaAsset.create({
    data: {
      userId: demoUser.id,
      noteId: note2.id,
      assetType: 'audio',
      storageKey: 'demo/audio/growth-weekly-audio.m4a',
      fileUrl: 'https://example.com/demo/growth-weekly-audio.m4a',
      durationSec: 2280,
      fileSize: BigInt(18_765_432),
    },
  });

  const image1 = await prisma.mediaAsset.create({
    data: {
      userId: demoUser.id,
      noteId: note3.id,
      assetType: 'image',
      storageKey: 'demo/image/education-equity.png',
      fileUrl: 'https://example.com/demo/education-equity.png',
      fileSize: BigInt(456_123),
    },
  });

  const asr1 = await prisma.asrResult.create({
    data: {
      mediaAssetId: audio1.id,
      noteId: note1.id,
      language: 'zh',
      fullText: note1.originalText,
      speakerCount: 1,
      status: JobStatusType.success,
      finishedAt: new Date(),
    },
  });

  await prisma.asrSegment.createMany({
    data: [
      {
        asrResultId: asr1.id,
        startMs: 0,
        endMs: 28000,
        speakerLabel: 'Teacher',
        content: '进程是资源分配的基本单位，线程是 CPU 调度的基本单位。',
        confidence: 0.982,
        sortOrder: 0,
      },
      {
        asrResultId: asr1.id,
        startMs: 28001,
        endMs: 62000,
        speakerLabel: 'Teacher',
        content: '同一进程中的线程共享地址空间，但有各自独立的栈。',
        confidence: 0.973,
        sortOrder: 1,
      },
      {
        asrResultId: asr1.id,
        startMs: 62001,
        endMs: 98000,
        speakerLabel: 'Teacher',
        content: '线程切换成本更低，更适合高并发任务。',
        confidence: 0.965,
        sortOrder: 2,
      },
    ],
  });

  await prisma.asrResult.create({
    data: {
      mediaAssetId: audio2.id,
      noteId: note2.id,
      language: 'zh',
      fullText: note2.originalText,
      speakerCount: 3,
      status: JobStatusType.processing,
    },
  });

  await prisma.ocrResult.create({
    data: {
      mediaAssetId: image1.id,
      noteId: note3.id,
      fullText: note3.originalText,
      layoutJson: {
        blocks: [
          { x: 30, y: 40, text: 'Education equity is not merely...' },
          { x: 30, y: 90, text: 'equal access / upward mobility' },
        ],
      },
      status: JobStatusType.success,
      finishedAt: new Date(),
    },
  });

  await prisma.aiJob.createMany({
    data: [
      {
        userId: demoUser.id,
        noteId: note1.id,
        jobType: JobTypeType.summarize,
        inputSource: SourceKindType.audio,
        status: JobStatusType.success,
        resultJson: { summaryReady: true },
        finishedAt: new Date(),
      },
      {
        userId: demoUser.id,
        noteId: note2.id,
        jobType: JobTypeType.outline,
        inputSource: SourceKindType.audio,
        status: JobStatusType.processing,
      },
      {
        userId: demoUser.id,
        noteId: note3.id,
        jobType: JobTypeType.ocr,
        inputSource: SourceKindType.image,
        status: JobStatusType.success,
        resultJson: { extractedBlocks: 2 },
        finishedAt: new Date(),
      },
    ],
  });

  const note1Chunk1 = await prisma.noteChunk.create({
    data: {
      noteId: note1.id,
      chunkIndex: 0,
      sectionTitle: '进程与线程定义',
      chunkText: '进程是资源分配单位，线程是调度单位。同一进程中的线程共享地址空间。',
      tokenCount: 48,
    },
  });

  const note2Chunk1 = await prisma.noteChunk.create({
    data: {
      noteId: note2.id,
      chunkIndex: 0,
      sectionTitle: '增长实验结论',
      chunkText: '新用户从注册到首条笔记完成率提升，但 7 日留存变化不明显。',
      tokenCount: 44,
    },
  });

  const note3Chunk1 = await prisma.noteChunk.create({
    data: {
      noteId: note3.id,
      chunkIndex: 0,
      sectionTitle: '写作素材摘录',
      chunkText: '教育公平提升社会流动性，可复用表达包括 bridge the gap 和 equal access。',
      tokenCount: 39,
    },
  });

  await prisma.noteEmbedding.createMany({
    data: [
      { noteId: note1.id, chunkId: note1Chunk1.id, modelName: 'text-embedding-3-small', vectorRef: 'vec_note1_chunk0' },
      { noteId: note2.id, chunkId: note2Chunk1.id, modelName: 'text-embedding-3-small', vectorRef: 'vec_note2_chunk0' },
      { noteId: note3.id, chunkId: note3Chunk1.id, modelName: 'text-embedding-3-small', vectorRef: 'vec_note3_chunk0' },
    ],
  });

  await prisma.knowledgeLink.createMany({
    data: [
      {
        sourceNoteId: note1.id,
        targetNoteId: note2.id,
        relationType: 'supplement',
        confidenceScore: 0.712,
        reasonText: '都包含对流程效率与切换成本的理解，可作为方法论补充。',
      },
      {
        sourceNoteId: note1.id,
        targetNoteId: note3.id,
        relationType: 'follow_up',
        confidenceScore: 0.654,
        reasonText: '适合作为不同学科场景下的复习链路示例。',
      },
      {
        sourceNoteId: note2.id,
        targetNoteId: note1.id,
        relationType: 'same_topic',
        confidenceScore: 0.601,
        reasonText: '都被系统归为“高频复习”主题簇。',
      },
    ],
  });

  const flashcard1 = await prisma.flashcard.create({
    data: {
      userId: demoUser.id,
      noteId: note1.id,
      question: '线程与进程最核心的区别是什么？',
      answer: '进程是资源分配的基本单位，线程是 CPU 调度的基本单位；同一进程内线程共享地址空间。',
      difficulty: 2,
    },
  });

  const flashcard2 = await prisma.flashcard.create({
    data: {
      userId: demoUser.id,
      noteId: note2.id,
      question: '本周增长实验最值得继续验证的变量是什么？',
      answer: '首次 AI 整理提示的时机，以及新用户 CTA 文案是否影响用户完成首条笔记后的继续使用。',
      difficulty: 3,
    },
  });

  const flashcard3 = await prisma.flashcard.create({
    data: {
      userId: demoUser.id,
      noteId: note3.id,
      question: '教育公平主题中可复用的三个英文表达是什么？',
      answer: 'bridge the gap、equal access、upward mobility。',
      difficulty: 2,
    },
  });

  const today = new Date();
  const task1 = await prisma.reviewTask.create({
    data: {
      userId: demoUser.id,
      noteId: note1.id,
      flashcardId: flashcard1.id,
      taskType: ReviewTaskType.qa,
      dueAt: today,
      priority: 5,
      status: 'pending',
    },
  });

  await prisma.reviewTask.createMany({
    data: [
      {
        userId: demoUser.id,
        noteId: note2.id,
        flashcardId: flashcard2.id,
        taskType: ReviewTaskType.qa,
        dueAt: today,
        priority: 4,
        status: 'pending',
      },
      {
        userId: demoUser.id,
        noteId: note3.id,
        flashcardId: flashcard3.id,
        taskType: ReviewTaskType.highlight,
        dueAt: today,
        priority: 3,
        status: 'pending',
      },
    ],
  });

  await prisma.reviewLog.create({
    data: {
      flashcardId: flashcard1.id,
      userId: demoUser.id,
      rating: 3,
      intervalDays: 3,
      easinessFactor: 2.6,
      repetitionCount: 2,
      nextReviewAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  });

  const searchSession1 = await prisma.searchSession.create({
    data: {
      userId: demoUser.id,
      queryText: '帮我总结最近和增长相关的笔记',
      searchMode: SearchModeType.ai_chat,
      answerSummary:
        '最近与你“增长”主题最相关的笔记主要集中在产品周会实验复盘，建议继续追问首次 AI 整理提示是否影响留存。',
    },
  });

  await prisma.searchHit.createMany({
    data: [
      { sessionId: searchSession1.id, noteId: note2.id, rankOrder: 1, score: 0.96 },
      { sessionId: searchSession1.id, noteId: note1.id, rankOrder: 2, score: 0.74 },
      { sessionId: searchSession1.id, noteId: note3.id, rankOrder: 3, score: 0.68 },
    ],
  });

  const searchSession2 = await prisma.searchSession.create({
    data: {
      userId: demoUser.id,
      queryText: '之前记录过哪些关于线程调度的知识点？',
      searchMode: SearchModeType.semantic,
      answerSummary: '你关于线程调度的知识点主要集中在“操作系统：进程与线程”这条课堂笔记。',
    },
  });

  await prisma.searchHit.create({
    data: {
      sessionId: searchSession2.id,
      noteId: note1.id,
      rankOrder: 1,
      score: 0.93,
    },
  });

  console.log('Seed complete.');
  console.log({
    userId: demoUser.id,
    noteIds: [note1.id, note2.id, note3.id],
    primaryReviewTaskId: task1.id,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
