import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateNoteDto) {
    const noteData: Prisma.NoteCreateInput = {
      user: { connect: { id: dto.userId } },
      title: dto.title,
      status: dto.status,
      originalText: dto.originalText,
      cleanedText: dto.cleanedText,
      aiSummary: dto.aiSummary,
      outlineJson: dto.outlineJson,
      sourceSummary: dto.sourceSummary,
      knowledgeScore: dto.knowledgeScore,
      isSensitive: dto.isSensitive ?? false,
      isArchived: dto.isArchived ?? false,
      noteSources: dto.sources?.length
        ? {
            create: dto.sources.map((source) => ({
              sourceKind: source.sourceKind,
              sourceUri: source.sourceUri,
              sourceName: source.sourceName,
              mimeType: source.mimeType,
            })),
          }
        : undefined,
    };

    return this.prisma.note.create({
      data: noteData,
      include: {
        noteSources: true,
        noteTags: { include: { tag: true } },
      },
    });
  }

  async findOne(noteId: string) {
    return this.prisma.note.findUnique({
      where: { id: noteId },
      include: {
        noteSources: true,
        mediaAssets: true,
        noteTags: { include: { tag: true } },
        flashcards: true,
        outgoingLinks: {
          include: {
            targetNote: {
              select: { id: true, title: true, aiSummary: true },
            },
          },
        },
      },
    });
  }

  async listByUser(userId: string) {
    return this.prisma.note.findMany({
      where: { userId, isArchived: false },
      orderBy: [{ updatedAt: 'desc' }],
      include: {
        noteTags: { include: { tag: true } },
      },
    });
  }

  async update(noteId: string, dto: UpdateNoteDto) {
    return this.prisma.note.update({
      where: { id: noteId },
      data: {
        title: dto.title,
        status: dto.status,
        originalText: dto.originalText,
        cleanedText: dto.cleanedText,
        aiSummary: dto.aiSummary,
        outlineJson: dto.outlineJson,
        sourceSummary: dto.sourceSummary,
        knowledgeScore: dto.knowledgeScore,
        isSensitive: dto.isSensitive,
        isArchived: dto.isArchived,
        lastOpenedAt: dto.touchLastOpened ? new Date() : undefined,
        lastReviewedAt: dto.lastReviewedAt,
      },
      include: {
        noteSources: true,
        noteTags: { include: { tag: true } },
      },
    });
  }

  async attachTag(noteId: string, tagId: string) {
    return this.prisma.noteTag.upsert({
      where: {
        noteId_tagId: {
          noteId,
          tagId,
        },
      },
      update: {},
      create: {
        noteId,
        tagId,
      },
    });
  }

  async createTag(userId: string, name: string, color = '#6D5EF9') {
    return this.prisma.tag.upsert({
      where: {
        userId_name: {
          userId,
          name,
        },
      },
      update: { color },
      create: {
        userId,
        name,
        color,
      },
    });
  }
}
