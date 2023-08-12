import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/dto/pagination.dto';
import {
  ACTIONS,
  AUDIT_GROUPS,
  AUDIT_STATUS,
  ENTITY,
  ENTITY_USER_TYPE,
  IAudit,
} from 'src/types';

export class AuditDto implements Partial<IAudit> {
  @ApiProperty({ description: 'action' })
  @IsOptional()
  @IsString()
  action: ACTIONS;

  @ApiProperty({ description: 'credentials' })
  @IsOptional()
  @IsString()
  credentials: string;

  @ApiProperty({ description: 'status' })
  @IsOptional()
  @IsString()
  status: AUDIT_STATUS;

  @ApiProperty({ description: 'params' })
  @IsOptional()
  @IsString()
  params: string;

  @ApiProperty({ description: 'entity type' })
  @IsOptional()
  @IsString()
  entityType: ENTITY;

  @ApiProperty({ description: 'entity' })
  @IsOptional()
  @IsString()
  entity: string;

  @ApiProperty({ description: 'entity user type' })
  @IsOptional()
  @IsString()
  entityUserType: ENTITY_USER_TYPE;

  @ApiProperty({ description: 'entity user' })
  @IsOptional()
  @IsString()
  entityUser: string;

  @ApiProperty({ description: 'new values' })
  @IsOptional()
  @IsString()
  newValues: string;

  @ApiProperty({ description: 'prev values' })
  @IsOptional()
  @IsString()
  prevValues: string;
  @ApiProperty({ description: 'action group' })
  @IsString()
  auditGroup: AUDIT_GROUPS;
}

export class FindAuditQueryDto extends PaginationDto {
  @ApiProperty({ description: 'Action group' })
  @IsString()
  auditGroup: AUDIT_GROUPS;
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
    description: 'credentials param',
    required: false,
  })
  @IsString()
  credentials: string;
}
