import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityWithId } from 'src/abstract';
import { CONTACT_POINT, IContactPoint } from 'src/types';
import { Column, Entity } from 'typeorm';

@Entity()
export class ContactPoint extends BaseEntityWithId implements IContactPoint {
  @ApiProperty({ description: 'text' }) //TODO - CHANGE TO RELATION
  @Column({ type: 'varchar', length: 100, default: null })
  text: string;

  @ApiProperty({ description: 'type' })
  @Column({ type: 'varchar', length: 100, default: null })
  type: CONTACT_POINT;
}
