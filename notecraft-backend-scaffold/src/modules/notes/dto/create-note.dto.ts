import { NoteStatus, SourceKindType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

class CreateNoteSourceDto {
  @IsEnum(SourceKindType)
  sourceKind!: SourceKindType;

  @IsOptional()
  @IsString()
  sourceUri?: string;

  @IsOptional()
  @IsString()
  sourceName?: string;

  @IsOptional()
  @IsString()
  mimeType?: string;
}

export class CreateNoteDto {
  @IsUUID()
  userId!: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsEnum(NoteStatus)
  status?: NoteStatus;

  @IsOptional()
  @IsString()
  originalText?: string;

  @IsOptional()
  @IsString()
  cleanedText?: string;

  @IsOptional()
  @IsString()
  aiSummary?: string;

  @IsOptional()
  outlineJson?: Record<string, unknown> | Array<unknown>;

  @IsOptional()
  @IsString()
  sourceSummary?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  knowledgeScore?: number;

  @IsOptional()
  @IsBoolean()
  isSensitive?: boolean;

  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateNoteSourceDto)
  sources?: CreateNoteSourceDto[];
}
