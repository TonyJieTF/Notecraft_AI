import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { NotesModule } from './notes/notes.module';

@Module({
  imports: [PrismaModule, NotesModule],
})
export class AppModule {}
