import { Module } from '@nestjs/common';
import { AiJobsService } from './ai-jobs.service';

@Module({
  providers: [AiJobsService],
  exports: [AiJobsService],
})
export class AiJobsModule {}
