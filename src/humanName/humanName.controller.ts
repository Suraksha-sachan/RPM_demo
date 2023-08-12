import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  getValidationSchema,
  UuIdValidationPipe,
  YupValidationPipe,
} from 'src/utils/validation.pipes';
import { HumanNameDTO } from './humanName.dto';
import { HumanName } from './humanName.entity';
import { HumanNameService } from './humanName.service';
import { humanNameValidationSchema } from './humanName.validation.schema';

@Controller('human-names')
export class HumanNameController {
  constructor(private readonly humanNameService: HumanNameService) {}
  @Post('/')
  @ApiOperation({ summary: 'Create human name' })
  @ApiResponse({
    status: 201,
    description: 'Human name',
    type: HumanName,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  async createAudit(
    @Body(new YupValidationPipe(getValidationSchema(humanNameValidationSchema)))
    data: HumanNameDTO,
  ) {
    return await this.humanNameService.createHumanName(data);
  }

  @ApiBearerAuth()
  @Get('/:id')
  @ApiOperation({ summary: 'Find human name' })
  @ApiResponse({
    status: 200,
    description: 'Found contact point',
    type: HumanName,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @ApiResponse({
    status: 404,
    description: 'not found',
  })
  async findContactPoint(
    @Param(
      'id',
      new UuIdValidationPipe({ id: 'contact point id is not valid' }),
    )
    id: string,
  ) {
    return await this.humanNameService.findHumanNameById(id);
  }
}
