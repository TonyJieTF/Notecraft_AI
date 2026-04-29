const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export async function uploadAudioAndSummarize({ file, userId, title }) {
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
