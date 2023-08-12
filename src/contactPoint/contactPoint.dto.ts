import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CONTACT_POINT, IContactPoint } from 'src/types';

export class ContactPointDTO implements Partial<IContactPoint> {
  @ApiProperty({ description: 'type' })
  @IsString()
  type: CONTACT_POINT;

  @ApiProperty({ description: 'credentials' })
  @IsOptional()
  @IsString()
  text: string;
}
