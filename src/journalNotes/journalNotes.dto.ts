import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { IJournalNote } from 'src/types';

export class JournalNoteDto implements Partial<IJournalNote> {
  @ApiProperty({ description: 'provider' })
  @IsString()
  provider: string;

  @ApiProperty({ description: 'patient' })
  @IsString()
  patient: string;

  @ApiProperty({ description: 'title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'details' })
  @IsString()
  details: string;
}

export class FindJournalNotesDto {
  @ApiProperty({ description: 'page', required: false })
  @IsString()
  page: number;

  @ApiProperty({ description: 'limit', required: false })
  @IsString()
  limit: number;

  @ApiProperty({ description: 'sort', required: false })
  @IsString()
  sort: string;

  @ApiProperty({
    description: 'title',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'patient',
  })
  @IsString()
  patient: string;

  @ApiProperty({
    description: 'provider',
  })
  @IsString()
  provider: string;
}
