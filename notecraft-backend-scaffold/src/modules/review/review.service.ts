import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { CreateReviewTaskDto } from './dto/create-review-task.dto';
import { SubmitReviewDto } from './dto/submit-review.dto';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  async createFlashcard(dto: CreateFlashcardDto) {
    return this.prisma.flashcard.create({
      data: {
        noteId: dto.noteId,
        userId: dto.userId,
        question: dto.question,
        answer: dto.answer,
        difficulty: dto.difficulty ?? 2,
      },
    });
  }

  async createTask(dto: CreateReviewTaskDto) {
    return this.prisma.reviewTask.create({
      data: {
        userId: dto.userId,
        noteId: dto.noteId,
        flashcardId: dto.flashcardId,
        taskType: dto.taskType,
        dueAt: new Date(dto.dueAt),
        priority: dto.priority ?? 2,
      },
    });
  }

  async submitReview(dto: SubmitReviewDto) {
    const reviewedAt = new Date();
    const intervalDays = dto.intervalDays ?? 1;
    const nextReviewAt = new Date(reviewedAt);
    nextReviewAt.setDate(nextReviewAt.getDate() + intervalDays);

    const reviewLog = await this.prisma.reviewLog.create({
      data: {
        flashcardId: dto.flashcardId,
        userId: dto.userId,
        rating: dto.rating,
        reviewedAt,
        nextReviewAt,
        intervalDays,
        easinessFactor: dto.easinessFactor ?? 2.5,
        repetitionCount: dto.repetitionCount ?? 1,
      },
    });

    if (dto.reviewTaskId) {
      await this.prisma.reviewTask.update({
        where: { id: dto.reviewTaskId },
        data: {
          status: 'done',
          finishedAt: reviewedAt,
        },
      });
    }

    return reviewLog;
  }

  async getTodayTasks(userId: string) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    return this.prisma.reviewTask.findMany({
      where: {
        userId,
        dueAt: {
          gte: start,
          lt: end,
        },
      },
      orderBy: [{ priority: 'desc' }, { dueAt: 'asc' }],
      include: {
        note: {
          select: { id: true, title: true },
        },
        flashcard: true,
      },
    });
  }
}
