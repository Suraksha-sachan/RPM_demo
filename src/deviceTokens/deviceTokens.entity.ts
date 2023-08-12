import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityWithId } from 'src/abstract';
import { Patient } from 'src/patient/patient.entity';
import { IDeviceToken } from 'src/types';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

@Entity()
export class DeviceToken extends BaseEntityWithId implements IDeviceToken {
  @ApiProperty({ description: 'Token device patient' })
  @OneToOne(() => Patient, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  patient: string;

  @ApiProperty({ description: 'Token id' })
  @Column({ type: 'varchar', length: 500, default: null, unique: true })
  token: string;
}
