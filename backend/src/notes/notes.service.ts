import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiGatewayService } from '../ai/ai-gateway.service';
import { CreateAudioSummaryDto } from './dto/create-audio-summary.dto';

@Injectable()
export class NotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiGatewayService,
  ) {}

  async createFromAudio(file: Express.Multer.File, dto: CreateAudioSummaryDto) {
    // Ensure the demo user exists before writing any FK-dependent rows
    await this.prisma.user.upsert({
      where: { id: dto.userId },
      update: {},
      create: {
        id: dto.userId,
        email: `demo-${dto.userId}@notecraft.local`,
        passwordHash: 'demo',
        displayName: 'Demo User',
        plan: 'free',
      },
    });

    const note = await this.prisma.note.create({
      data: {
        userId: dto.userId,
        title: dto.title ?? `录音笔记 ${new Date().toLocaleString('zh-CN')}`,
        status: 'processing',
        sourceSummary: '由录音生成',
      },
    });

    const mediaAsset = await this.prisma.mediaAsset.create({
      data: {
        userId: dto.userId,
        noteId: note.id,
        assetType: 'audio',
        storageKey: file.filename,
        fileUrl: `/uploads/audio/${file.filename}`,
        fileSize: BigInt(file.size),
      },
    });

    await this.prisma.noteSource.create({
      data: {
        noteId: note.id,
        sourceKind: 'audio',
        sourceName: file.originalname,
        sourceUri: `/uploads/audio/${file.filename}`,
        mimeType: file.mimetype,
      },
    });

    const asrJob = await this.prisma.aiJob.create({
      data: { userId: dto.userId, noteId: note.id, jobType: 'asr', inputSource: 'audio', status: 'processing' },
    });

    const transcription = await this.ai.transcribeAudio(file.path);

    const asrResult = await this.prisma.asrResult.create({
      data: {
        mediaAssetId: mediaAsset.id,
        noteId: note.id,
        language: transcription.language,
        fullText: transcription.transcript,
        speakerCount: 1,
        status: 'success',
        finishedAt: new Date(),
      },
    });

    if (transcription.segments.length > 0) {
      await this.prisma.asrSegment.createMany({
        data: transcription.segments.map((s) => ({
          asrResultId: asrResult.id,
          startMs: s.startMs,
          endMs: s.endMs,
          speakerLabel: s.speakerLabel,
          content: s.content,
          confidence: s.confidence,
          sortOrder: s.sortOrder,
        })),
      });
    }

    await this.prisma.aiJob.update({
      where: { id: asrJob.id },
      data: { status: 'success', resultJson: { transcript: transcription.transcript }, finishedAt: new Date() },
    });

    const summaryJob = await this.prisma.aiJob.create({
      data: { userId: dto.userId, noteId: note.id, jobType: 'summarize', inputSource: 'audio', status: 'processing' },
    });

    const aiResult = await this.ai.summarizeTranscript(transcription.transcript);

    await this.prisma.note.update({
      where: { id: note.id },
      data: {
        originalText: transcription.transcript,
        aiSummary: aiResult.summary,
        outlineJson: aiResult.outline,
        status: 'ready',
      },
    });

    for (const tagName of aiResult.tags) {
      const tag = await this.prisma.tag.upsert({
        where: { userId_name: { userId: dto.userId, name: tagName } },
        update: {},
        create: { userId: dto.userId, name: tagName },
      });
      await this.prisma.noteTag.upsert({
        where: { noteId_tagId: { noteId: note.id, tagId: tag.id } },
        update: {},
        create: { noteId: note.id, tagId: tag.id },
      });
    }

    await this.prisma.aiJob.update({
      where: { id: summaryJob.id },
      data: {
        status: 'success',
        resultJson: { summary: aiResult.summary, outline: aiResult.outline, tags: aiResult.tags },
        finishedAt: new Date(),
      },
    });

    return {
      noteId: note.id,
      mediaAssetId: mediaAsset.id,
      transcript: transcription.transcript,
      summary: aiResult.summary,
      outline: aiResult.outline,
      tags: aiResult.tags,
      status: 'ready',
    };
  }
}
