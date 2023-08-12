import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  getValidationSchema,
  YupValidationPipe,
} from 'src/utils/validation.pipes';
import { DeviceTokenDto } from './deviceTokens.dto';
import { DeviceToken } from './deviceTokens.entity';
import { DeviceTokensService } from './deviceTokens.service';
import { deviceTokenValidationSchema } from './deviceTokens.validation.schema';

@Controller('device-tokens')
export class DeviceTokensController {
  constructor(private readonly deviceTokensService: DeviceTokensService) {}
  //
  @Post('/')
  @ApiOperation({ summary: 'Create journal note' })
  @ApiResponse({
    status: 201,
    description: 'Create journal note',
    isArray: true,
    type: DeviceToken,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  async createDeviceToken(
    @Body(
      new YupValidationPipe(getValidationSchema(deviceTokenValidationSchema)),
    )
    data: DeviceTokenDto,
  ) {
    return await this.deviceTokensService.createDeviceToken(data);
  }
  //
}
