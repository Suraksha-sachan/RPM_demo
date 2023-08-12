import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';
import { AddressDTO } from 'src/address/address.dto';
import { ContactPointDTO } from 'src/contactPoint/contactPoint.dto';
import { PaginationDto } from 'src/dto/pagination.dto';
import { HumanNameDTO } from 'src/humanName/humanName.dto';
import {
  IClientRepresentative,
  IClientRepresentativeContactPoint,
} from 'src/types';

export class ClientEntitiesDto {
  client: ClientDto;
  address: AddressDTO;
  contacts: {
    position: string;
    humanName: HumanNameDTO;
    contactPoints: ContactPointDTO[];
  }[];
}

export class ClientDto {
  @ApiProperty({ description: 'title' })
  @IsString()
  title: string;
  @ApiProperty({ description: 'address' })
  @IsString()
  address: string;

  @ApiProperty({ description: 'is active flag' })
  @IsBoolean()
  active: boolean;
}

export class ClientRepresentativeDto implements Partial<IClientRepresentative> {
  @ApiProperty({ description: 'client' })
  @IsString()
  client: string;

  @ApiProperty({ description: 'humanName' })
  @IsString()
  humanName: string;

  @ApiProperty({ description: 'position' })
  @IsString()
  position: string;
}

export class ClientRepresentativeContactPointDto
  implements Partial<IClientRepresentativeContactPoint>
{
  @ApiProperty({ description: 'client representative' })
  @IsString()
  clientRepresentative: string;

  @ApiProperty({ description: 'contact point' })
  @IsString()
  contactPoint: string;
}
export class FindClientDto extends PaginationDto {
  @ApiProperty({ description: 'sort', required: false })
  @IsString()
  sort: string;
  @ApiProperty({
    description: 'Title',
    required: false,
  })
  @IsString()
  title: string;
  @ApiProperty({
    description: 'City',
    required: false,
  })
  @IsString()
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
  name: string;
  //
  @ApiProperty({
    description: 'Search',
    required: false,
  })
  @IsString()
  search: string;
}
