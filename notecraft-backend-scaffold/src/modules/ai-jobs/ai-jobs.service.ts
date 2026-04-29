import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAiJobDto } from './dto/create-ai-job.dto';

@Injectable()
export class AiJobsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAiJobDto) {
    return this.prisma.aiJob.create({
      data: {
        userId: dto.userId,
        noteId: dto.noteId,
        jobType: dto.jobType,
        inputSource: dto.inputSource,
        status: dto.status,
        resultJson: dto.resultJson,
        errorMessage: dto.errorMessage,
      },
    });
  }

  async markSuccess(jobId: string, resultJson?: Record<string, unknown>) {
    return this.prisma.aiJob.update({
      where: { id: jobId },
      data: {
        status: 'success',
        finishedAt: new Date(),
        resultJson,
        errorMessage: null,
      },
    });
  }

  async markFailed(jobId: string, errorMessage: string) {
    return this.prisma.aiJob.update({
      where: { id: jobId },
      data: {
        status: 'failed',
        finishedAt: new Date(),
        errorMessage,
      },
    });
  }

  async listByNote(noteId: string) {
    return this.prisma.aiJob.findMany({
      where: { noteId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
