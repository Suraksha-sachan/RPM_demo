import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  getValidationSchema,
  YupValidationPipe,
} from 'src/utils/validation.pipes';
import { FindPatientsDto } from './patient.dto';
import { Patient } from './patient.entity';
import { findPatientsValidationSchema } from './patient.schema';

import { PatientsService } from './patient.service';

@Controller('/patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}
  @Get('/')
  @ApiOperation({ summary: 'Get patients' })
  @ApiResponse({
    status: 200,
    description: 'Get patients',
    type: Patient,
    isArray: true,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @ApiResponse({
    status: 400,
    description: 'bad request',
  })
  @ApiResponse({
    status: 404,
    description: 'not found',
  })
  async findPatients(
    @Query(
      new YupValidationPipe(getValidationSchema(findPatientsValidationSchema)),
    )
    query: FindPatientsDto,
  ) {
    return await this.patientsService.findPatients(query);
  }
  @Get('/:id')
  @ApiOperation({ summary: 'Get patient' })
  @ApiResponse({
    status: 200,
    description: 'Get patients',
    type: Patient,
    isArray: true,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @ApiResponse({
    status: 400,
    description: 'bad request',
  })
  @ApiResponse({
    status: 404,
    description: 'not found',
  })
  async findPatient(
    @Param('id')
    id: string,
  ) {
    return await this.patientsService.findPatientById(id);
  }
}
