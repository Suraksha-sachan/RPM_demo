import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class PaginationDto {
  @ApiProperty({ description: 'page' })
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiProperty({ description: 'limit' })
  @IsNumber()
  @IsOptional()
  limit?: number;
  @ApiProperty({ description: 'offset' })
  @IsNumber()
  @IsOptional()
  offset?: number;
}
