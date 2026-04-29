import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSearchSessionDto } from './dto/create-search-session.dto';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(dto: CreateSearchSessionDto) {
    return this.prisma.searchSession.create({
      data: {
        userId: dto.userId,
        queryText: dto.queryText,
        searchMode: dto.searchMode,
        answerSummary: dto.answerSummary,
        searchHits: dto.hits?.length
          ? {
              create: dto.hits.map((hit, index) => ({
                noteId: hit.noteId,
                rankOrder: hit.rankOrder ?? index + 1,
                score: hit.score,
              })),
            }
          : undefined,
      },
      include: {
        searchHits: {
          include: {
            note: {
              select: {
                id: true,
                title: true,
                aiSummary: true,
              },
            },
          },
          orderBy: { rankOrder: 'asc' },
        },
      },
    });
  }

  async getRecentSessions(userId: string, take = 10) {
    return this.prisma.searchSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take,
      include: {
        searchHits: {
          include: {
            note: {
              select: { id: true, title: true },
            },
          },
          orderBy: { rankOrder: 'asc' },
        },
      },
    });
  }
}
