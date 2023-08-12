import { ApiProperty } from '@nestjs/swagger';
import { IZipCode } from 'src/types';
import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity()
export class ZipCode implements IZipCode {
  @ApiProperty({ description: 'text' }) //TODO - CHANGE TO RELATION
  @Index()
  @PrimaryColumn({ type: 'int4' })
  id: number;

  @ApiProperty({ description: 'zip code' })
  @Column({ type: 'int4', default: null })
  @Index()
  zipCode: number;

  @ApiProperty({ description: 'city' })
  @Index()
  @Column({ type: 'varchar', length: 50, default: null })
  primaryCity: string;

  @ApiProperty({ description: 'state' })
  @Column({ type: 'varchar', length: 5, default: null })
  @Index()
  state: string;
}
