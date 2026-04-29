import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: dto.passwordHash,
        displayName: dto.displayName,
        avatarUrl: dto.avatarUrl,
        plan: dto.plan,
        privacySetting: {
          create: {
            processingMode: dto.privacy?.processingMode,
            allowCloudAi: dto.privacy?.allowCloudAi ?? false,
            encryptLocalCache: dto.privacy?.encryptLocalCache ?? true,
            autoDeleteDays: dto.privacy?.autoDeleteDays ?? 30,
          },
        },
      },
      include: {
        privacySetting: true,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        privacySetting: true,
        _count: {
          select: {
            notes: true,
            tags: true,
            flashcards: true,
          },
        },
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { privacySetting: true },
    });
  }
}
