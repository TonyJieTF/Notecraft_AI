import { Injectable } from '@nestjs/common';

@Injectable()
export class AiGatewayService {
  async transcribeAudio(_filePath) {
    // Stub — replace with Whisper / 讯飞 / 阿里云 ASR call
    return {
      transcript:
        '今天课堂主要讲了进程与线程的区别，线程共享地址空间但有独立栈，线程切换开销低，更适合高并发。',
      language: 'zh',
      segments: [
        { startMs: 0, endMs: 8000, speakerLabel: 'speaker_1', content: '今天课堂主要讲了进程与线程的区别。', confidence: 0.98, sortOrder: 0 },
        { startMs: 8000, endMs: 18000, speakerLabel: 'speaker_1', content: '线程共享地址空间但有独立栈，线程切换开销低，更适合高并发。', confidence: 0.96, sortOrder: 1 },
      ],
    };
  }

  async summarizeTranscript(_transcript) {
    // Stub — replace with Claude / GPT summarize call
    return {
      summary: '本段录音总结了进程与线程的区别，强调线程共享资源、切换开销更低，更适合高并发场景。',
      outline: ['进程与线程区别', '线程共享资源', '线程切换开销', '高并发场景应用'],
      tags: ['操作系统', '线程', '高并发'],
    };
  }
}
