import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsDateString, IsOptional } from 'class-validator';
import { CreateNoteDto } from './create-note.dto';

export class UpdateNoteDto extends PartialType(CreateNoteDto) {
  @IsOptional()
  @IsBoolean()
  touchLastOpened?: boolean;

  @IsOptional()
  @IsDateString()
  lastReviewedAt?: string;
}
