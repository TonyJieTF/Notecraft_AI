import { useMemo, useState } from 'react';
import { Brain, Mic, RefreshCcw, Square, Pause, Play } from 'lucide-react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { uploadAudioAndSummarize } from '../lib/noteApi';

function formatSec(sec) {
  const mm = String(Math.floor(sec / 60)).padStart(2, '0');
  const ss = String(sec % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

const DEMO_USER_ID = 'b537afb4-dc07-46ec-a466-04945ac75609';

export function AudioSummaryRecorder({ onClose }) {
  const {
    status,
    audioBlob,
    audioUrl,
    durationSec,
    error,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    reset,
  } = useAudioRecorder();

  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const canUpload = useMemo(() => !!audioBlob && status === 'stopped', [audioBlob, status]);

  const handleUpload = async () => {
    if (!audioBlob) return;
    try {
      setUploading(true);
      const data = await uploadAudioAndSummarize({
        file: audioBlob,
        userId: DEMO_USER_ID,
        title: `录音笔记 ${new Date().toLocaleString('zh-CN')}`,
      });
      setResult(data);
    } catch (e) {
      alert(e.message || '生成总结失败');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    reset();
    setResult(null);
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-[#131b2f]/90 p-6 shadow-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-500/15 text-violet-200">
            <Mic className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold">录音 AI 总结</div>
            <div className="text-sm text-slate-400">录音结束后自动生成笔记摘要</div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-400 hover:text-slate-200">
            关闭
          </button>
        )}
      </div>

      <div className="mt-6 flex items-center gap-5">
        <div className={cn(
          'text-5xl font-semibold tabular-nums tracking-tight',
          status === 'recording' ? 'text-violet-300' : 'text-slate-200'
        )}>
          {formatSec(durationSec)}
        </div>
        <div className="flex flex-col gap-1">
          <div className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
            status === 'recording' && 'bg-rose-500/15 text-rose-300',
            status === 'paused' && 'bg-amber-500/15 text-amber-300',
            status === 'stopped' && 'bg-emerald-500/15 text-emerald-300',
            status === 'idle' && 'bg-slate-500/15 text-slate-400',
          )}>
            {status === 'recording' && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" />}
            {{ idle: '待机', recording: '录音中', paused: '已暂停', stopped: '录音完成' }[status]}
          </div>
        </div>
      </div>

      {error && <div className="mt-3 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</div>}

      <div className="mt-5 flex flex-wrap gap-3">
        {status === 'idle' && (
          <button onClick={startRecording}
            className="inline-flex items-center gap-2 rounded-2xl bg-violet-500 px-5 py-3 text-sm font-medium text-white shadow-[0_8px_24px_rgba(109,94,249,0.4)]">
            <Mic className="h-4 w-4" /> 开始录音
          </button>
        )}

        {status === 'recording' && (
          <>
            <button onClick={pauseRecording}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-slate-200">
              <Pause className="h-4 w-4" /> 暂停
            </button>
            <button onClick={stopRecording}
              className="inline-flex items-center gap-2 rounded-2xl bg-rose-500 px-5 py-3 text-sm font-medium text-white">
              <Square className="h-4 w-4" /> 停止
            </button>
          </>
        )}

        {status === 'paused' && (
          <>
            <button onClick={resumeRecording}
              className="inline-flex items-center gap-2 rounded-2xl bg-violet-500 px-5 py-3 text-sm font-medium text-white">
              <Play className="h-4 w-4" /> 继续
            </button>
            <button onClick={stopRecording}
              className="inline-flex items-center gap-2 rounded-2xl bg-rose-500 px-5 py-3 text-sm font-medium text-white">
              <Square className="h-4 w-4" /> 结束录音
            </button>
          </>
        )}

        {status === 'stopped' && (
          <>
            <button onClick={handleUpload} disabled={!canUpload || uploading}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-medium text-white disabled:opacity-60">
              <Brain className="h-4 w-4" />
              {uploading ? 'AI 总结中...' : '生成 AI 总结'}
            </button>
            <button onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-slate-200">
              <RefreshCcw className="h-4 w-4" /> 重新录音
            </button>
          </>
        )}
      </div>

      {audioUrl && (
        <div className="mt-5">
          <audio controls src={audioUrl} className="w-full rounded-2xl" />
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-4 rounded-3xl border border-white/10 bg-slate-950/30 p-5">
          <div>
            <div className="mb-2 text-sm font-medium text-slate-400">转写全文</div>
            <div className="text-sm leading-8 text-slate-200">{result.transcript}</div>
          </div>
          <div className="border-t border-white/10 pt-4">
            <div className="mb-2 text-sm font-medium text-slate-400">AI 摘要</div>
            <div className="text-sm leading-8 text-slate-200">{result.summary}</div>
          </div>
          <div className="border-t border-white/10 pt-4">
            <div className="mb-2 text-sm font-medium text-slate-400">AI 大纲</div>
            <ul className="space-y-2">
              {(result.outline || []).map((item, idx) => (
                <li key={idx} className="flex gap-3 rounded-2xl bg-slate-950/20 px-4 py-3 text-sm text-slate-200">
                  <span className="text-violet-300">0{idx + 1}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          {result.tags?.length > 0 && (
            <div className="border-t border-white/10 pt-4">
              <div className="mb-2 text-sm font-medium text-slate-400">自动标签</div>
              <div className="flex flex-wrap gap-2">
                {result.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center rounded-full border border-violet-400/20 bg-violet-500/15 px-3 py-1 text-xs font-medium text-violet-100">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="border-t border-white/10 pt-4 text-xs text-slate-500">
            笔记 ID：{result.noteId}
          </div>
        </div>
      )}
    </div>
  );
}
