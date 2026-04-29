import { IsInt, IsNumber, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class SubmitReviewDto {
  @IsUUID()
  flashcardId!: string;

  @IsUUID()
  userId!: string;

  @IsOptional()
  @IsUUID()
  reviewTaskId?: string;

  @IsInt()
  @Min(1)
  @Max(3)
  rating!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  intervalDays?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1.3)
  @Max(3)
  easinessFactor?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  repetitionCount?: number;
}
