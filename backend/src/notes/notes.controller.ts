import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { NotesService } from './notes.service';
import { CreateAudioSummaryDto } from './dto/create-audio-summary.dto';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post('audio-summary')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/audio',
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname) || '.webm'}`;
          cb(null, unique);
        },
      }),
    }),
  )
  createAudioSummary(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateAudioSummaryDto,
  ) {
    return this.notesService.createFromAudio(file, dto);
  }
}
