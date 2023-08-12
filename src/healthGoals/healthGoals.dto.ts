import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { MEASUREMENT_TYPE, IHealthGoal, CIRCUMSTANCES } from 'src/types';

export class HealthGoalDto implements Partial<IHealthGoal> {
  @ApiProperty({ description: 'Border line min' })
  @IsNumber()
  borderLineMin: number;

  @ApiProperty({ description: 'Normal min threshold' })
  @IsNumber()
  normalMinThreshold: number;

  @ApiProperty({ description: 'Normal hight' })
  @IsNumber()
  normalHight: number;

  @ApiProperty({ description: 'Borderline hight' })
  @IsNumber()
  borderlineHight: number;

  @ApiProperty({ description: 'Measurement type' })
  @IsNumber()
  measurementType: MEASUREMENT_TYPE;

  @ApiProperty({ description: 'Circumstances' })
  @IsString()
  circumstances: CIRCUMSTANCES;
}
