import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/dto/pagination.dto';
import { DEVICE_TYPE, IMeasurement } from 'src/types';

export class MeasurementDto implements Partial<IMeasurement> {
  @ApiProperty({ description: 'Device type' })
  @IsOptional()
  @IsString()
  deviceType?: DEVICE_TYPE;

  @ApiProperty({ description: 'Value' })
  @IsOptional()
  @IsString()
  value: number;

  @ApiProperty({ description: 'Vital' })
  @IsOptional()
  @IsString()
  vital: string;
}

export class FindMeasurementQueryDto extends PaginationDto {
  @ApiProperty({ description: 'Vital id' })
  @IsOptional()
  @IsString()
  vitalId: string;
}
