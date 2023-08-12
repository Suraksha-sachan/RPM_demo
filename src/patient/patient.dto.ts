import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { AddressDTO } from 'src/address/address.dto';
import { HumanNameDTO } from 'src/humanName/humanName.dto';

import {
  GadgetDeviceType,
  GenderType,
  IContactPoint,
  InsuranceType,
  IPatient,
  DeviceProvidedByType,
  DEVICE_TYPE,
} from 'src/types';

export class PatientDevicesDto {
  @IsString()
  @ApiProperty({ description: 'patient ' })
  patient: string;
  @IsString()
  @ApiProperty({ description: 'providedBy' })
  providedBy: DeviceProvidedByType;
  @IsString()
  @ApiProperty({ description: 'identifier' })
  identifier: string;
  @IsString()
  @ApiProperty({ description: 'sim number' })
  simNumber: string;
  @IsString()
  @ApiProperty({ description: 'type' })
  type: DEVICE_TYPE;
}

export class PatientDto
  implements
    Partial<
      Omit<IPatient, 'address' | 'patientContactPoints' | 'healthCondition'>
    >
{
  @IsString()
  @ApiProperty({ description: 'assets ' })
  assets: string[];

  @IsString()
  @ApiProperty({ description: 'human name ' })
  humanName: string;

  @IsString()
  @ApiProperty({ description: 'address ' })
  address: string;

  @IsString()
  @ApiProperty({ description: 'dateOfBirth ' })
  dateOfBirth: string;

  @IsString()
  @ApiProperty({ description: 'healthCondition ' })
  healthCondition: string;

  @IsString()
  @ApiProperty({ description: 'services ' })
  services: string;

  @IsString()
  @ApiProperty({ description: 'programName ' })
  programName: string;

  @IsString()
  @ApiProperty({ description: 'device ' })
  device: GadgetDeviceType;

  @IsString()
  @ApiProperty({ description: 'deceased ' })
  deceased: boolean;

  @IsString()
  @ApiProperty({ description: 'height ' })
  height: number;

  @IsString()
  @ApiProperty({ description: 'active ' })
  active: boolean;

  @IsString()
  @ApiProperty({ description: 'active ' })
  gender: GenderType;

  @IsString()
  @ApiProperty({ description: 'insuranceT ' })
  insuranceT?: InsuranceType;

  @IsString()
  @ApiProperty({ description: 'phone ' })
  phone?: string;

  @IsString()
  @ApiProperty({ description: 'client ' })
  client: string;
}

export class PatientEntitiesDto {
  humanName: HumanNameDTO;
  address: AddressDTO;
  patientContactPoints: Partial<IContactPoint>[];
  patientDevices: PatientDevicesDto[];

  @IsString()
  @ApiProperty({ description: 'assets ' })
  assets: string[];

  @IsString()
  @ApiProperty({ description: 'date of bird ' })
  dateOfBirth: string;

  @IsString()
  @ApiProperty({ description: 'health condition ' })
  healthCondition: string;

  @IsString()
  @ApiProperty({ description: 'services ' })
  services: string;

  @IsString()
  @ApiProperty({ description: 'program name ' })
  programName: string;

  @IsString()
  @ApiProperty({ description: 'device ' })
  device: GadgetDeviceType;

  @IsString()
  @ApiProperty({ description: 'deceased ' })
  deceased: boolean;

  @IsNumber()
  @ApiProperty({ description: 'height ' })
  height: number;

  @IsBoolean()
  @ApiProperty({ description: 'is active ' })
  active: boolean;

  @IsString()
  @ApiProperty({ description: 'gender ' })
  gender: GenderType;

  @IsString()
  @ApiProperty({ description: 'insuranceT' })
  insuranceT: InsuranceType;

  @IsString()
  @ApiProperty({ description: 'phone' })
  phone: string;

  @IsString()
  @ApiProperty({ description: 'client' })
  client: string;
}

export class FindPatientsDto {
  @ApiProperty({ description: 'limit', required: false })
  @IsNumber()
  limit: number;

  @ApiProperty({ description: 'page', required: false })
  @IsNumber()
  page: number;

  @ApiProperty({ description: 'sort', required: false })
  @IsString()
  sort: string;

  @ApiProperty({
    description: 'Name',
    required: false,
  })
  @IsString()
  name: string;
  @ApiProperty({
    description: 'Status',
    required: false,
  })
  @IsString()
  active: 'active' | 'inactive';

  @ApiProperty({
    description: 'client',
    required: false,
  })
  @IsString()
  client: string;

  city: string;
  @ApiProperty({
    description: 'State',
    required: false,
  })
  @IsString()
  state: string;
  @ApiProperty({
    description: 'Name',
    required: false,
  })
  @IsString()
  programName: string;

  @ApiProperty({
    description: 'Name',
    required: false,
  })
  @IsString()
  status: 'active' | 'inactive';

  @ApiProperty({
    description: 'Is Alerted',
    required: false,
  })
  @IsString()
  isAlert: 'true';
}
