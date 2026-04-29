import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { NotesModule } from './modules/notes/notes.module';
import { SearchModule } from './modules/search/search.module';
import { ReviewModule } from './modules/review/review.module';
import { AiJobsModule } from './modules/ai-jobs/ai-jobs.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    NotesModule,
    SearchModule,
    ReviewModule,
    AiJobsModule,
  ],
})
export class AppModule {}
