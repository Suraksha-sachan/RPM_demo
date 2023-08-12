import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/dto/pagination.dto';
import {
  IVital,
  DEVICE_TYPE,
  IMeasurement,
  MEASUREMENT_TYPE,
  VITAL_TYPE,
  CIRCUMSTANCES,
} from 'src/types';

export class MeasurementDTO implements Partial<IMeasurement> {
  @ApiProperty({ description: 'Device type' })
  @IsOptional()
  @IsString()
  type?: MEASUREMENT_TYPE;
  @ApiProperty({ description: 'Value' })
  @IsOptional()
  @IsNumber()
  value: number;
}

export class VitalDto implements Omit<Partial<IVital>, 'measurements'> {
  @ApiProperty({ description: 'Device type' })
  @IsOptional()
  @IsString()
  deviceType?: DEVICE_TYPE;

  @ApiProperty({ description: 'Patient' })
  @IsOptional()
  @IsString()
  patient: string;

  @ApiProperty({ description: 'Is Alert' })
  @IsOptional()
  @IsBoolean()
  isAlert?: boolean;

  @ApiProperty({ description: 'Is Cleared' })
  @IsOptional()
  @IsBoolean()
  isCleared?: boolean;

  @ApiProperty({ description: 'Is Deleted' })
  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;

  @ApiProperty({ description: 'Taken at' })
  @IsOptional()
  @IsString()
  takenAt?: string;

  @ApiProperty({ description: 'circumstances' })
  @IsOptional()
  @IsString()
  circumstances?: CIRCUMSTANCES;

  @ApiProperty({ description: 'restore' })
  @IsOptional()
  @IsBoolean()
  restore?: boolean;

  @ApiProperty({ description: 'Measurements', isArray: true })
  @IsOptional()
  measurements?: MeasurementDTO[];
}

export class FindVitalQueryDto extends PaginationDto {
  @ApiProperty({
    description:
      'sort parameter: should be "createdAt": ?sort=-createdAtn - descending, ?sort=createdAt - ascending',
    required: false,
  })
  sort?: string;

  @ApiProperty({ description: 'start Date param', required: false })
  @IsString()
  startDate: string;

  @ApiProperty({
    description: 'end Date param',
    required: false,
  })
  @IsString()
  endDate: string;

  @ApiProperty({
    description: 'name',
    required: false,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Device type',
    required: false,
  })
  @IsString()
  deviceType: DEVICE_TYPE;

  @ApiProperty({
    description: 'Vital type',
    required: false,
  })
  @IsString()
  type: VITAL_TYPE;

  @ApiProperty({
    description: 'type',
    required: false,
  })
  @IsString()
  onlyDeleted: boolean;

  @ApiProperty({
    description: 'Is cleared',
    required: false,
  })
  @IsString()
  isCleared: 'true' | 'false';

  @ApiProperty({
    description: 'Is alert',
    required: false,
  })
  @IsString()
  isAlert: 'true';

  @ApiProperty({
    description: 'patient',
    required: false,
  })
  @IsString()
  patient: string;
}

export class DeleteDTO {
  @ApiProperty({ description: 'Delete type' })
  @IsOptional()
  @IsString()
  type?: 'soft';
}

export class FindVitaReportQueryDto extends FindVitalQueryDto {
  @ApiProperty({
    description: 'patient id',
    required: false,
  })
  @IsString()
  patient: string;
  //
  @ApiProperty({
    description: 'patient id',
    required: false,
  })
  @IsString()
  client: string;
}
