import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityWithId } from 'src/abstract';
import { IAddress } from 'src/types';
import { Column, Entity, Index } from 'typeorm';

@Entity()
export class Address extends BaseEntityWithId implements IAddress {
  @ApiProperty({ description: 'text' }) //TODO - CHANGE TO RELATION
  @Index()
  @Column({ type: 'varchar', length: 100, default: null })
  text: string;

  @ApiProperty({ description: 'line' })
  @Column({ type: 'varchar', length: 100, default: null })
  @Index()
  line: string;

  @ApiProperty({ description: 'city' })
  @Index()
  @Column({ type: 'varchar', length: 100, default: null })
  city: string;

  @ApiProperty({ description: 'state' })
  @Column({ type: 'varchar', length: 100, default: null })
  @Index()
  state: string;

  @ApiProperty({ description: 'postal code' })
  @Column({ type: 'varchar', length: 100, default: null })
  postalCode: string;
}
