import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { PaginationDto } from 'src/dto/pagination.dto';
import { INotification, NOTIFICATION_TYPE } from 'src/types';

export class NotificationDto implements Partial<INotification> {
  @ApiProperty({ description: 'patient' })
  @IsString()
  patient: string;

  @ApiProperty({ description: 'title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'body' })
  @IsString()
  body: string;

  @ApiProperty({ description: 'notification type' })
  @IsString()
  type: NOTIFICATION_TYPE;
}

export class FindNotificationsDto extends PaginationDto {
  @ApiProperty({
    description: 'patient',
  })
  @IsString()
  patient?: string;

  @ApiProperty({ description: 'notification type' })
  @IsString()
  type?: NOTIFICATION_TYPE;

  @ApiProperty({ description: 'sort' })
  @IsString()
  sort?: string;
}
