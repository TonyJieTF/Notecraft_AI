import { Module } from '@nestjs/common';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { AiGatewayService } from '../ai/ai-gateway.service';

@Module({
  controllers: [NotesController],
  providers: [NotesService, AiGatewayService],
  exports: [NotesService],
})
export class NotesModule {}
