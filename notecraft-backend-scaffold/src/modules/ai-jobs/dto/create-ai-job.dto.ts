import { JobStatusType, JobTypeType, SourceKindType } from '@prisma/client';
import { IsEnum, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAiJobDto {
  @IsUUID()
  userId!: string;

  @IsOptional()
  @IsUUID()
  noteId?: string;

  @IsEnum(JobTypeType)
  jobType!: JobTypeType;

  @IsOptional()
  @IsEnum(SourceKindType)
  inputSource?: SourceKindType;

  @IsOptional()
  @IsEnum(JobStatusType)
  status?: JobStatusType;

  @IsOptional()
  @IsObject()
  resultJson?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  errorMessage?: string;
}
