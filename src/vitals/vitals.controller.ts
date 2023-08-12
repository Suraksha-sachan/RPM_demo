import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  getValidationSchema,
  UuIdValidationPipe,
  YupValidationPipe,
} from 'src/utils/validation.pipes';
import { VitalNote } from './vitalNotes/vitalNotes.entity';
import { VitalNoteDto } from './vitalNotes/vitalNotes.dto';
import { VitalNotesService } from './vitalNotes/vitalNotes.service';
import {
  DeleteDTO,
  FindVitalQueryDto,
  FindVitaReportQueryDto,
  VitalDto,
} from './vitals.dto';
import { Vital } from './vitals.entity';
import { VitalsService } from './vitals.service';
import {
  deleteParamsValidationSchema,
  vitalNoteValidationSchema,
  vitalsQueryParamsValidationSchema,
  vitalValidationSchema,
} from './vitals.validation.schema';
import { IExpandRequestObject } from 'src/types/common';

@Controller('vitals')
export class VitalsController {
  constructor(
    private readonly vitalsService: VitalsService,
    private readonly vitalNotesService: VitalNotesService,
  ) {}
  @ApiBearerAuth()
  @Get('/')
  @ApiOperation({ summary: 'Find vitals' })
  @ApiResponse({
    status: 200,
    description: 'Found vitals',
    type: Vital,
    isArray: true,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    type: FindVitalQueryDto,
  })
  async findVitals(
    @Query(
      new YupValidationPipe(
        getValidationSchema(vitalsQueryParamsValidationSchema),
      ),
    )
    query: FindVitalQueryDto,
    @Req() req: IExpandRequestObject,
  ) {
    return await this.vitalsService.findVitals(query, req);
  }
  //
  @ApiBearerAuth()
  @Get('/report')
  @ApiOperation({ summary: 'Find vitals' })
  @ApiResponse({
    status: 200,
    description: 'Found vitals',
    type: Vital,
    isArray: true,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    type: FindVitaReportQueryDto,
  })
  async findReports(
    @Query(
      new YupValidationPipe(
        getValidationSchema(vitalsQueryParamsValidationSchema),
      ),
    )
    query: FindVitaReportQueryDto,
    @Req() req: IExpandRequestObject,
  ) {
    return await this.vitalsService.findVitalsReport(query, req);
  }
  //
  @Post('/')
  @ApiOperation({ summary: 'Create vital' })
  @ApiResponse({
    status: 201,
    description: 'Vital',
    type: Vital,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  async createVital(
    @Body(new YupValidationPipe(getValidationSchema(vitalValidationSchema)))
    data: VitalDto,
    @Req() req: IExpandRequestObject,
  ) {
    return await this.vitalsService.createVital(data, req);
  }
  //
  @Post('/vital-note')
  @ApiOperation({ summary: 'Create vital note' })
  @ApiResponse({
    status: 201,
    description: 'Vital note',
    type: VitalNote,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  async createVitalNote(
    @Body(new YupValidationPipe(getValidationSchema(vitalNoteValidationSchema)))
    data: VitalNoteDto,
    @Req() req: IExpandRequestObject,
  ) {
    return await this.vitalNotesService.createVitalNote(data, req);
  }
  //
  @Patch('/:id')
  @ApiOperation({ summary: 'Update vital' })
  @ApiResponse({
    status: 201,
    description: 'Vital',
    type: Vital,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  async updateVital(
    @Body(new YupValidationPipe(getValidationSchema(vitalValidationSchema)))
    data: VitalDto,
    @Param('id', new UuIdValidationPipe({ id: 'vital id is not valid' }))
    id: string,
    @Req() req: IExpandRequestObject,
  ) {
    return await this.vitalsService.updateVital(id, data, req);
  }
  @ApiBearerAuth()
  @Get('/:id')
  @ApiOperation({ summary: 'Find vital' })
  @ApiResponse({
    status: 200,
    description: 'Found vitals',
    type: Vital,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  async findVital(
    @Param('id', new UuIdValidationPipe({ id: 'vital id is not valid' }))
    id: string,
    @Req() req: IExpandRequestObject,
  ) {
    return await this.vitalsService.findVital(id, req);
  }
  @ApiBearerAuth()
  @Delete('/:id')
  @ApiOperation({ summary: 'Delete vital' })
  @ApiResponse({
    status: 200,
    description: 'Deleted vital',
    type: Vital,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  async deleteVital(
    @Param('id', new UuIdValidationPipe({ id: 'vital id is not valid' }))
    id: string,
    @Query(
      new YupValidationPipe(getValidationSchema(deleteParamsValidationSchema)),
    )
    query: DeleteDTO,
    @Req() req: IExpandRequestObject,
  ) {
    return await this.vitalsService.deleteVital(id, query, req);
  }
  //
}
