import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAudioSummaryDto {
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsString()
  title?: string;
}
