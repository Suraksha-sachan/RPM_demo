import { Controller, UseGuards, Get, Req, Res, Next } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import { PatientsService } from './patient.service';
import { NextFunction, Request, Response } from 'express';

@Controller('/media/profile')
export class PatientsMediaController {
  constructor(private readonly patientsService: PatientsService) {}
  @Get('/*')
  @ApiOperation({ summary: 'Get media' })
  @ApiResponse({
    status: 200,
    description: 'Get media',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found',
  })
  getMedia(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    return this.patientsService.getInsuranceMedia(req, res, next);
  }
}
