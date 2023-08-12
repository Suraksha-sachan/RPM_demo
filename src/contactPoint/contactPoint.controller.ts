import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  getValidationSchema,
  UuIdValidationPipe,
  YupValidationPipe,
} from 'src/utils/validation.pipes';
import { ContactPointDTO } from './contactPoint.dto';
import { ContactPoint } from './contactPoint.entity';
import { ContactPointService } from './contactPoint.service';
import { contactPointValidationSchema } from './contactPoint.validation.schema';

@Controller('contact-points')
export class ContactPointController {
  constructor(private readonly auditService: ContactPointService) {}
  @Post('/')
  @ApiOperation({ summary: 'Create contact point' })
  @ApiResponse({
    status: 201,
    description: 'Contact point',
    type: ContactPoint,
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
    @Body(
      new YupValidationPipe(getValidationSchema(contactPointValidationSchema)),
    )
    data: ContactPointDTO,
  ) {
    return await this.auditService.createContactPoint(data);
  }

  @ApiBearerAuth()
  @Get('/:id')
  @ApiOperation({ summary: 'Find contact point' })
  @ApiResponse({
    status: 200,
    description: 'Found contact point',
    type: ContactPoint,
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
    return await this.auditService.findContactPointById(id);
  }
}
