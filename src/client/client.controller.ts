import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  getValidationSchema,
  UuIdValidationPipe,
  YupValidationPipe,
} from 'src/utils/validation.pipes';
import { FindClientDto } from './client.dto';
import { Client } from './client.entity';

import { ClientService } from './client.service';
import { findClientValidationSchema } from './client.schema';

@Controller('clients')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}
  // @Post('/')
  // @ApiOperation({ summary: 'Create client' })
  // @ApiResponse({
  //   status: 201,
  //   description: 'Client',
  //   type: Client,
  // })
  // @ApiResponse({
  //   status: 500,
  //   description: 'Internal server error',
  // })
  // @ApiResponse({
  //   status: 400,
  //   description: 'Validation error',
  // })
  // async createClient(
  //   @Body(new YupValidationPipe(getValidationSchema(clientValidationSchema)))
  //   data: ClientDto,
  // ) {
  //   return await this.clientService.createClient(data);
  // }

  @ApiBearerAuth()
  @Get('/')
  @ApiOperation({ summary: 'Find clients' })
  @ApiResponse({
    status: 200,
    description: 'Found client',
    type: Client,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  /**
   * @param query - query params
   */
  async findClients(
    @Query(
      new YupValidationPipe(getValidationSchema(findClientValidationSchema)),
    )
    query: FindClientDto,
  ) {
    return await this.clientService.findClients(query);
  }

  @ApiBearerAuth()
  @Get('/:id')
  @ApiOperation({ summary: 'Find client' })
  @ApiResponse({
    status: 200,
    description: 'Found client',
    type: Client,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async findClient(
    @Param('id', new UuIdValidationPipe({ id: ' id is not valid' }))
    id: string,
  ) {
    return await this.clientService.findClientById(id);
  }
}
