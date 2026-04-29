import { SearchModeType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

class SearchHitInputDto {
  @IsUUID()
  noteId!: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  rankOrder?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Max(1)
  score?: number;
}

export class CreateSearchSessionDto {
  @IsUUID()
  userId!: string;

  @IsString()
  queryText!: string;

  @IsEnum(SearchModeType)
  searchMode!: SearchModeType;

  @IsOptional()
  @IsString()
  answerSummary?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SearchHitInputDto)
  hits?: SearchHitInputDto[];
}
