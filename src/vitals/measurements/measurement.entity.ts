import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityWithId } from 'src/abstract';
import { IMeasurement, MEASUREMENT_TYPE } from 'src/types';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Vital } from '../vitals.entity';

@Entity()
export class Measurement extends BaseEntityWithId implements IMeasurement {
  @ApiProperty({ description: 'Device type' })
  @Column({ type: 'varchar', length: 30, nullable: true })
  type: MEASUREMENT_TYPE;
  @ApiProperty({ description: 'value' })
  @Column({ type: 'float', nullable: true })
  value: number;
  @ApiProperty({ description: 'Measurement' })
  @ManyToOne(() => Vital, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  vital: string;
  @Column({ type: 'varchar', length: 30, nullable: true, default: null })
  unitOfMeasurement: string;
}
