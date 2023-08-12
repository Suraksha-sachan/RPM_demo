import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityWithId } from 'src/abstract';
import { DeviceProvidedByType, IPatientDevice, DEVICE_TYPE } from 'src/types';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Patient } from '../patient.entity';

@Entity()
export class PatientDevice extends BaseEntityWithId implements IPatientDevice {
  @ManyToOne(() => Patient, {
    nullable: true,
    onDelete: 'CASCADE',
    cascade: true,
  })
  @JoinColumn()
  patient: string;

  @ApiProperty({ description: 'device' })
  @Column({ type: 'varchar', length: 50, nullable: true })
  type: DEVICE_TYPE;

  @ApiProperty({ description: 'Provided by' })
  @Column({ type: 'varchar', length: 50, nullable: true })
  providedBy: DeviceProvidedByType;

  @ApiProperty({ description: 'Identifier' })
  @Column({ type: 'varchar', length: 50, nullable: true })
  identifier: string;
  @ApiProperty({ description: 'Phone number' })
  @Column({ type: 'varchar', length: 50, nullable: true })
  simNumber: string;
}
