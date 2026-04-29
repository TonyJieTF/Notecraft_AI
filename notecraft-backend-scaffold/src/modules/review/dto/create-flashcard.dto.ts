import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateFlashcardDto {
  @IsUUID()
  noteId!: string;

  @IsUUID()
  userId!: string;

  @IsString()
  question!: string;

  @IsString()
  answer!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  difficulty?: number;
}
