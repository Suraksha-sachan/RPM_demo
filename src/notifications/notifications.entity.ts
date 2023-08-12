import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityWithId } from 'src/abstract';
import { Patient } from 'src/patient/patient.entity';
import { INotification, NOTIFICATION_TYPE } from 'src/types';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class Notification extends BaseEntityWithId implements INotification {
  @ApiProperty({ description: 'Notification patient' })
  @ManyToOne(() => Patient, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  patient: string;

  @ApiProperty({ description: 'Body' })
  @Column({ type: 'varchar', length: 500, default: null })
  body: string;

  @ApiProperty({ description: 'Title' })
  @Column({ type: 'varchar', length: 100, default: null })
  title: string;

  @ApiProperty({ description: 'Type' })
  @Column({ type: 'varchar', length: 100, default: null })
  type: NOTIFICATION_TYPE;

  @ApiProperty({ description: 'is read' })
  @Column({ type: 'boolean', default: false })
  isRead: boolean;
}
