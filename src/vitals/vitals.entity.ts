import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityWithId } from 'src/abstract';
import { Patient } from 'src/patient/patient.entity';
import {
  IVital,
  DEVICE_TYPE,
  IMeasurement,
  VITAL_TYPE,
  CIRCUMSTANCES,
} from 'src/types';
import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Measurement } from './measurements/measurement.entity';
import { VitalNote } from './vitalNotes/vitalNotes.entity';

@Entity()
export class Vital
  extends BaseEntityWithId
  implements IVital<string, IMeasurement>
{
  @ApiProperty({ description: 'Device type' })
  @Column({ type: 'varchar', length: 30, nullable: true })
  deviceType: DEVICE_TYPE;
  @ApiProperty({ description: 'Vital type' })
  @Column({ type: 'varchar', length: 30, nullable: true })
  type: VITAL_TYPE;

  @ApiProperty({ description: 'Patient' }) //TODO - CHANGE TO RELATION
  @ManyToOne(() => Patient, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  patient: string;

  @ApiProperty({ description: 'Is alert' })
  @Column({ type: 'boolean', default: false })
  isAlert: boolean;

  @ApiProperty({ description: 'Is cleared' })
  @Column({ type: 'boolean', default: false })
  isCleared: boolean;

  @ApiProperty({ description: 'Is deleted' })
  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @ApiProperty({ description: 'Is manually' })
  @Column({ type: 'boolean', default: false })
  isManually: boolean;

  @ApiProperty({ description: 'Circumstances' })
  @Column({ type: 'varchar', default: null, nullable: true })
  circumstances: CIRCUMSTANCES;

  @ApiProperty({ description: 'Taken at' })
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  takenAt: string;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => Measurement, (Measurement) => Measurement.vital, {
    nullable: true,
  })
  measurements: IMeasurement[];

  @ApiProperty({ description: 'Vital Note' })
  @OneToOne(() => VitalNote, (vitalNote) => vitalNote.vital, { nullable: true })
  vitalNote: string;
}
