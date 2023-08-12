import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
export class DeviceTokenDto {
  @ApiProperty({ description: 'patient' })
  @IsString()
  patient: string;

  @ApiProperty({ description: 'title' })
  @IsString()
  token: string;
}

export class FindDeviceTokensDto {
  @ApiProperty({
    description: 'patient',
  })
  @IsString()
  patient: string;
}
