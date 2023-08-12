import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthUser } from 'src/decorators';
import { DecodedUser } from 'src/types';
import {
  getValidationSchema,
  UuIdValidationPipe,
  YupValidationPipe,
} from 'src/utils/validation.pipes';
import { ClientEntitiesDto } from '../client.dto';
import {
  clientEntitiesValidationSchema,
  updateClientEntitiesValidationSchema,
} from '../client.schema';

import { ClientEntitiesService } from './clientEntities.service';

@Controller('client-entities')
export class ClientEntitiesController {
  constructor(private readonly clientService: ClientEntitiesService) {}
  @Post('/')
  @ApiOperation({ summary: 'Create client with related entities' })
  @ApiResponse({
    status: 201,
    description: 'Client entities',
    type: ClientEntitiesDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  async createClientWithEntities(
    @Body(
      new YupValidationPipe(
        getValidationSchema(clientEntitiesValidationSchema),
      ),
    )
    data: ClientEntitiesDto,
    @AuthUser() user: DecodedUser,
  ) {
    return await this.clientService.createClientEntities(data, user);
  }

  @Patch('/:id')
  @ApiOperation({ summary: 'Update client with related entities' })
  @ApiResponse({
    status: 201,
    description: 'Update client entities',
    type: ClientEntitiesDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  async updateClientWithEntities(
    @Body(
      new YupValidationPipe(
        getValidationSchema(updateClientEntitiesValidationSchema),
      ),
    )
    data: ClientEntitiesDto,
    @Param('id', new UuIdValidationPipe({ id: 'action group id is not valid' }))
    id: string,
    @AuthUser() user: DecodedUser,
  ) {
    return await this.clientService.updateClientEntities(id, data, user);
  }
}
