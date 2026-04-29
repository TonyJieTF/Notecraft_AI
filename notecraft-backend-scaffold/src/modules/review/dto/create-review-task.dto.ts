import { ReviewTaskType } from '@prisma/client';
import { IsDateString, IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class CreateReviewTaskDto {
  @IsUUID()
  userId!: string;

  @IsOptional()
  @IsUUID()
  noteId?: string;

  @IsOptional()
  @IsUUID()
  flashcardId?: string;

  @IsEnum(ReviewTaskType)
  taskType!: ReviewTaskType;

  @IsDateString()
  dueAt!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  priority?: number;
}
