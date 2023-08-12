import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/dto/pagination.dto';

export class VitalNoteDto {
  @ApiProperty({ description: 'Vital' })
  @IsOptional()
  @IsString()
  vital: string;

  @ApiProperty({ description: 'journal note' })
  @IsOptional()
  @IsString()
  journalNote: string;
}

export class VitalNoteQueryDto extends PaginationDto {
  @ApiProperty({ description: 'Vital id' })
  @IsOptional()
  @IsString()
  vitalId: string;
}
