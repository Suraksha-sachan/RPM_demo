import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { IAddress } from 'src/types';

export class AddressDTO implements Partial<IAddress> {
  @ApiProperty({ description: 'text' })
  @IsString()
  text: string;
  @ApiProperty({ description: 'line' })
  @IsString()
  line: string;
  @ApiProperty({ description: 'city' })
  @IsString()
  city: string;
  @ApiProperty({ description: 'state' })
  @IsString()
  state: string;
  @ApiProperty({ description: 'postal code' })
  @IsString()
  postalCode?: string;
}

export class FindZipCodeQueryDto {
  @ApiProperty({ description: 'zip code' })
  @IsString()
  zipCode: string;
}
