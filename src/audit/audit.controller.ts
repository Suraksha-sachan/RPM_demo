import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  getValidationSchema,
  YupValidationPipe,
} from 'src/utils/validation.pipes';
import { AuditDto, FindAuditQueryDto } from './audit.dto';

import { Audit } from './audit.entity';
import { AuditService } from './audit.service';
import {
  auditsQueryParamsValidationSchema,
  auditValidationSchema,
} from './audit.validation.schema';

@Controller('audits')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}
  @Post('/')
  @ApiOperation({ summary: 'Create audit' })
  @ApiResponse({
    status: 201,
    description: 'Audit',
    type: Audit,
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
    @Body(new YupValidationPipe(getValidationSchema(auditValidationSchema)))
    data: AuditDto,
  ) {
    return await this.auditService.createAudit(data);
  }
  @Get('/')
  @ApiOperation({ summary: 'Find audits' })
  @ApiResponse({
    status: 200,
    description: 'Found audits',
    type: Audit,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    type: FindAuditQueryDto,
  })
  /**
   * @param query - query params
   */
  async findAudits(
    @Query(
      new YupValidationPipe(
        getValidationSchema(auditsQueryParamsValidationSchema),
      ),
    )
    query: FindAuditQueryDto,
  ) {
    return await this.auditService.findAudits(query);
  }
}
