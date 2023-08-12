import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/abstract';
import { Address } from 'src/address/address.entity';
import { Client } from 'src/client/client.entity';
import { HumanName } from 'src/humanName/humanName.entity';

import { IPatient, InsuranceType, IPatientDevice } from 'src/types';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { PatientAsset } from './patientAssets/patientAssets.entity';
import { PatientContactPoint } from './patientContactPoint/patientContactPoint.entity';
import { PatientDevice } from './patientDevices/patientAssets.entity';

@Entity()
export class Patient extends BaseEntity implements IPatient {
  @ApiProperty({ description: 'id' })
  @PrimaryColumn({ unique: true })
  id: string;

  @ApiProperty({ description: 'address' })
  @OneToOne(() => Address, {
    nullable: true,
    onDelete: 'SET NULL',
    cascade: true,
  })
  @JoinColumn()
  address: string;

  @ApiProperty({ description: 'dateOfBirth' })
  @Column({ type: 'date', nullable: true })
  dateOfBirth: string;

  @ApiProperty({ description: 'human name' })
  @OneToOne(() => HumanName, {
    nullable: true,
    onDelete: 'SET NULL',
    cascade: true,
  })
  @JoinColumn()
  humanName: string;

  @ApiProperty({ description: 'contact point' })
  @OneToMany(
    () => PatientContactPoint,
    (PatientContactPoint) => PatientContactPoint.patient,
    {
      nullable: true,
    },
  )
  @JoinColumn()
  patientContactPoints: string[];
  @ApiProperty({ description: 'health condition' })
  @Column({ type: 'varchar', length: 50, nullable: true })
  healthCondition: IPatient['healthCondition'];
  @ApiProperty({ description: 'services' })
  @Column({ type: 'varchar', length: 50, nullable: true })
  services: IPatient['services'];
  @ApiProperty({ description: 'program name' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index()
  programName?: string;
  @ApiProperty({ description: 'device' })
  @Column({ type: 'varchar', length: 50, nullable: true })
  device: IPatient['device'];
  @ApiProperty({ description: 'deceased' })
  @Column({ type: 'boolean', default: false })
  deceased: boolean;
  @ApiProperty({ description: 'height' })
  @Column({ type: 'int', nullable: true, default: null })
  height?: number;
  @ApiProperty({ description: 'active' })
  @Column({ type: 'boolean', default: false })
  active: boolean;
  @ApiProperty({ description: 'gender' })
  @Column({ type: 'varchar', default: 'unknown' })
  gender: IPatient['gender'];
  @ApiProperty({ description: 'insurance T' })
  @Column({ type: 'varchar', default: 'none', length: 50 })
  insuranceT: InsuranceType;

  @ApiProperty({ description: 'assets' })
  @Column({ type: 'varchar', length: 100, default: null })
  @OneToMany(() => PatientAsset, (patient) => patient.patient, {
    nullable: true,
  })
  @JoinColumn()
  assets: string[];

  @Column({ type: 'varchar', length: 50, unique: true })
  phone: string;

  @ApiProperty({ description: 'Client' }) //TODO - CHANGE TO RELATION
  @ManyToOne(() => Client, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  client: string;

  @OneToMany(() => PatientDevice, (device) => device.patient, {
    nullable: true,
  })
  @JoinColumn()
  patientDevices: IPatientDevice[];
}
