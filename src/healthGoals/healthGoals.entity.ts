import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityWithId } from 'src/abstract';
import { Patient } from 'src/patient/patient.entity';
import { CIRCUMSTANCES, IHealthGoal, MEASUREMENT_TYPE } from 'src/types';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class HealthGoals extends BaseEntityWithId implements IHealthGoal {
  @ApiProperty({ description: 'Health goals' })
  @ManyToOne(() => Patient, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  patient: string;

  @ApiProperty({ description: 'Measurement type' })
  @Column({ type: 'varchar', default: null })
  measurementType: MEASUREMENT_TYPE;

  @ApiProperty({ description: 'Border line min' })
  @Column({ type: 'float', default: null })
  borderLineMin: number;

  @ApiProperty({ description: 'Normal min threshold' })
  @Column({ type: 'float', default: null })
  normalMinThreshold: number;

  @ApiProperty({ description: 'Normal hight' })
  @Column({ type: 'float', default: null })
  normalHight: number;

  @ApiProperty({ description: 'Border line high' })
  @Column({ type: 'float', default: null })
  borderlineHight: number;

  @ApiProperty({ description: 'Type ' })
  @Column({ type: 'varchar', length: 50, default: null })
  circumstances: CIRCUMSTANCES;
}
