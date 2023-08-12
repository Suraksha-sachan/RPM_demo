import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { IHumanName } from 'src/types';

export class HumanNameDTO implements Partial<IHumanName> {
  @ApiProperty({ description: 'text' })
  @IsOptional()
  @IsString()
  text: string;

  @ApiProperty({ description: 'given' })
  @IsOptional()
  @IsString()
  given?: string;

  @ApiProperty({ description: 'family' })
  @IsOptional()
  @IsString()
  family?: string;
}
