import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityWithId } from 'src/abstract';
import {
  ACTIONS,
  AUDIT_GROUPS,
  AUDIT_STATUS,
  ENTITY,
  ENTITY_USER_TYPE,
  IAudit,
} from 'src/types';
import { Column, Entity } from 'typeorm';

@Entity()
export class Audit extends BaseEntityWithId implements IAudit {
  @ApiProperty({ description: 'Audit' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  action: ACTIONS;
  @ApiProperty({ description: 'Email' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  credentials: string;
  @ApiProperty({ description: 'Status' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  status: AUDIT_STATUS;
  @ApiProperty({ description: 'Params' })
  @Column({ type: 'jsonb', nullable: true, default: null })
  params: string;
  @ApiProperty({ description: 'Entity type' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  entityType: ENTITY; //
  @ApiProperty({ description: 'Entity' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  entity: string;
  @ApiProperty({ description: 'Entity user type' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  entityUserType: ENTITY_USER_TYPE;
  @ApiProperty({ description: 'Entity user' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  entityUser: string;
  @ApiProperty({ description: 'New values' })
  @Column({ type: 'jsonb', nullable: true, default: null })
  newValues: string;
  @ApiProperty({ description: 'Prev values' })
  @Column({ type: 'jsonb', nullable: true, default: null })
  prevValues: string;
  @Column({ type: 'varchar', length: 100, nullable: true, default: null })
  auditGroup: AUDIT_GROUPS;
}
