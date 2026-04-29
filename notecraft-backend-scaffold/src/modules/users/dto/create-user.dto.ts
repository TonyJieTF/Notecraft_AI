import { ProcessingModeType, PlanType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

class CreatePrivacySettingDto {
  @IsOptional()
  @IsEnum(ProcessingModeType)
  processingMode?: ProcessingModeType;

  @IsOptional()
  @IsBoolean()
  allowCloudAi?: boolean;

  @IsOptional()
  @IsBoolean()
  encryptLocalCache?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(365)
  autoDeleteDays?: number;
}

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  passwordHash!: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @IsOptional()
  @IsEnum(PlanType)
  plan?: PlanType;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreatePrivacySettingDto)
  privacy?: CreatePrivacySettingDto;
}
