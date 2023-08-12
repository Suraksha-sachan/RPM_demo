import { Body, Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  getValidationSchema,
  YupValidationPipe,
} from 'src/utils/validation.pipes';
import { FindNotificationsDto } from './notifications.dto';
import { Notification } from './notifications.entity';
import { NotificationsService } from './notifications.service';
import { findNotificationValidationSchema } from './notifications.validation.schema';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}
  //
  @Get('/')
  @ApiOperation({ summary: 'Create notification' })
  @ApiResponse({
    status: 200,
    description: 'Notification',
    isArray: true,
    type: Notification,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  async findNotifications(
    @Query(
      new YupValidationPipe(
        getValidationSchema(findNotificationValidationSchema),
      ),
    )
    params: FindNotificationsDto,
  ) {
    return await this.notificationsService.findNotifications(params);
  }
  //
}
