import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  getValidationSchema,
  YupValidationPipe,
} from 'src/utils/validation.pipes';
import { FindJournalNotesDto, JournalNoteDto } from './journalNotes.dto';
import { JournalNote } from './journalNotes.entity';
import { JournalNotesService } from './journalNotes.service';
import {
  findJournalNotesValidationSchema,
  journalNoteValidationSchema,
} from './journalNotes.validation.schema';

@Controller('journal-notes')
export class JournalNotesController {
  constructor(private readonly journalNotesService: JournalNotesService) {}
  //
  @Post('/')
  @ApiOperation({ summary: 'Create journal note' })
  @ApiResponse({
    status: 201,
    description: 'Create journal note',
    isArray: true,
    type: JournalNote,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  async createJournalNote(
    @Body(
      new YupValidationPipe(getValidationSchema(journalNoteValidationSchema)),
    )
    data: JournalNoteDto,
  ) {
    return await this.journalNotesService.createJournalNote(data);
  }
  //
  @Patch('/:id')
  @ApiOperation({ summary: 'Update journal note' })
  @ApiResponse({
    status: 201,
    description: 'Update health goals',
    isArray: true,
    type: JournalNote,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  async updateJournalNote(
    @Body(
      new YupValidationPipe(getValidationSchema(journalNoteValidationSchema)),
    )
    data: JournalNoteDto,
    @Param('id')
    id: string,
  ) {
    return await this.journalNotesService.updateJournalNote(data, id);
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get journal note by id' })
  @ApiResponse({
    status: 201,
    description: 'Journal note',
    isArray: true,
    type: JournalNote,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  async findJournalNotesById(
    @Param('id')
    id: string,
  ) {
    return await this.journalNotesService.findJournalNote(id);
  }
  //
  @Get('/')
  @ApiOperation({ summary: 'Find journal notes' })
  @ApiResponse({
    status: 201,
    description: 'Journal note',
    isArray: true,
    type: JournalNote,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  async findJournalNotes(
    @Query(
      new YupValidationPipe(
        getValidationSchema(findJournalNotesValidationSchema),
      ),
    )
    query: FindJournalNotesDto,
  ) {
    return await this.journalNotesService.findJournalNotes(query);
  }

  //
  @Delete('/:id')
  @ApiOperation({ summary: 'Delete journal note' })
  @ApiResponse({
    status: 201,
    description: 'Health goals',
    isArray: true,
    type: JournalNote,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  async deleteJournalNote(
    @Param('id')
    id: string,
  ) {
    return await this.journalNotesService.deleteJournalNote(id);
  }
}
