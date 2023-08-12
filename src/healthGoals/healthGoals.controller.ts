import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { YupValidationPipe } from 'src/utils/validation.pipes';
import { HealthGoalDto } from './healthGoals.dto';
import { HealthGoals } from './healthGoals.entity';

import { HealthGoalsService } from './healthGoals.service';
import { healthGoalsValidationSchema } from './healthGoals.validation.schema';

@Controller('health-goals/bulk')
export class HealthGoalsController {
  constructor(private readonly healthGoalsService: HealthGoalsService) {}
  @Post('/:patientId')
  @ApiOperation({ summary: 'Bulk create health goal' })
  @ApiResponse({
    status: 201,
    description: 'Create health goals',
    isArray: true,
    type: HealthGoals,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  async bulkCreateHealthGoals(
    @Body(new YupValidationPipe(healthGoalsValidationSchema))
    data: HealthGoalDto[],
    @Param('patientId')
    patientId: string,
  ) {
    return await this.healthGoalsService.bulkCreateHealthGoals(data, patientId);
  }
  //
  @Put('/:patientId')
  @ApiOperation({ summary: 'Bulk create health goal' })
  @ApiResponse({
    status: 201,
    description: 'Update health goals',
    isArray: true,
    type: HealthGoals,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  async bulkUpdateHealthGoals(
    @Body(new YupValidationPipe(healthGoalsValidationSchema))
    data: HealthGoalDto[],
    @Param('patientId')
    patientId: string,
  ) {
    return await this.healthGoalsService.bulkUpdateHealthGoals(data, patientId);
  }
  //
  @Get('/:patientId')
  @ApiOperation({ summary: 'Get vitals by patient' })
  @ApiResponse({
    status: 201,
    description: 'Health goals',
    isArray: true,
    type: HealthGoals,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  async getHealthGoalsByPatient(
    @Param('patientId')
    patientId: string,
  ) {
    return await this.healthGoalsService.findHealthGoalByPatient(patientId);
  }
  //
  @Delete('/:patientId')
  @ApiOperation({ summary: 'Delete vitals by patient' })
  @ApiResponse({
    status: 201,
    description: 'Health goals',
    isArray: true,
    type: HealthGoals,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  async deleteHealthGoalsByPatient(
    @Param('patientId')
    patientId: string,
  ) {
    return await this.healthGoalsService.bulkDeleteHealthGoals(patientId);
  }
}
