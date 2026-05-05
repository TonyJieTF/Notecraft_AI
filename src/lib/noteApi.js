const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true' || !import.meta.env.VITE_API_BASE_URL;

const MOCK_RESULT = {
  noteId: 'demo-note-' + Math.random().toString(36).slice(2, 8),
  mediaAssetId: 'demo-asset-001',
  status: 'ready',
  transcript:
    '同学们好，今天我们来讲一下信息系统在企业管理中的应用。首先，信息系统可以帮助企业实现数据的集中管理，提高决策效率。其次，通过 ERP、CRM 等系统的整合，企业可以打通各部门之间的信息壁垒，实现协同办公。最后，数据分析与可视化工具让管理层能够实时掌握业务动态，做出更精准的战略判断。',
  summary:
    '本次录音围绕信息系统在企业管理中的核心价值展开，涵盖数据集中管理、跨部门协同以及数据驱动决策三个维度，强调了 ERP/CRM 系统整合对提升组织效率的重要性。',
  outline: [
    '信息系统实现企业数据集中管理，提升决策效率',
    'ERP、CRM 整合打通部门信息壁垒，支持协同办公',
    '数据分析与可视化助力管理层实时掌握业务动态',
  ],
  tags: ['信息系统', 'ERP', '企业管理', '数据分析', '协同办公'],
};

export async function uploadAudioAndSummarize({ file, userId, title }) {
  if (DEMO_MODE) {
    await new Promise((r) => setTimeout(r, 1500));
    return { ...MOCK_RESULT, noteId: 'demo-note-' + Math.random().toString(36).slice(2, 8) };
  }

  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const formData = new FormData();
  formData.append('file', file, `record-${Date.now()}.webm`);
  formData.append('userId', userId);
  if (title) formData.append('title', title);

  const res = await fetch(`${API_BASE}/notes/audio-summary`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || '录音上传失败');
  }

  return res.json();
}
