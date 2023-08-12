import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityWithId } from 'src/abstract';
import { IHumanName } from 'src/types';
import { Column, Entity, Index } from 'typeorm';

@Entity()
export class HumanName extends BaseEntityWithId implements IHumanName {
  @ApiProperty({ description: 'text' }) //TODO - CHANGE TO RELATION
  @Index()
  @Column({ type: 'varchar', length: 100, default: null })
  text: string;

  @ApiProperty({ description: 'given' })
  @Column({ type: 'varchar', length: 100, default: null })
  given: string;

  @ApiProperty({ description: 'is email verified' })
  @Column({ type: 'varchar', length: 100, default: null })
  family: string;
}
