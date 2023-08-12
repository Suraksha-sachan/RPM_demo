import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  getValidationSchema,
  YupValidationPipe,
} from 'src/utils/validation.pipes';
import { PatientEntitiesDto } from '../patient.dto';
import { Patient } from '../patient.entity';
import {
  patientEntitiesValidationSchema,
  updatePatientEntitiesValidationSchema,
} from '../patient.schema';
import { PatientEntitiesService } from './patientEntities.service';

function fileInterceptorFieldNames() {
  return new Array(5).fill('assets').map((i, key) => {
    return { name: i + `[${key}]` };
  });
}

function mapStringBoolToBoolean(data: { [key: string]: any }) {
  const returnData: { [key: string]: any } = {};
  Object.entries(data).forEach(([key, value]) => {
    let tempValue: any = value;
    if (typeof value === 'string') {
      if (value.toLowerCase() === 'true') {
        tempValue = true;
      }
      if (value.toLowerCase() === 'false') {
        tempValue = false;
      }
    }
    returnData[key] = tempValue;
  });
  return returnData;
}


@Controller('patient-entities')
export class PatientEntitiesController {
  constructor(
    private readonly patientEntitiesService: PatientEntitiesService,
  ) {}
  @Post('/')
  @UseInterceptors(FileFieldsInterceptor(fileInterceptorFieldNames()))
  @ApiOperation({ summary: 'Create patient with related entities' })
  @ApiResponse({
    status: 201,
    description: 'Patient entities',
    type: PatientEntitiesDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  // async createProviderWithEntities(
  //   @Body(
  //     new YupValidationPipe(
  //       getValidationSchema(patientEntitiesValidationSchema),
  //     ),
  //   )
  //   data: PatientEntitiesDto,
  //   @UploadedFiles()
  //   assets: { [key: string]: Express.Multer.File },
  // ) {
  //   const transformedAssets = Object.values(assets).flat();
  //   const transformedData = mapStringBoolToBoolean(data) as PatientEntitiesDto;
  //   return await this.patientEntitiesService.createPatientEntities(
  //     transformedData,
  //     transformedAssets,
  //   );
  // }

  @Put('/:id')
  @UseInterceptors(FileFieldsInterceptor(fileInterceptorFieldNames()))
  @ApiOperation({ summary: 'Create patient with related entities' })
  @ApiResponse({
    status: 201,
    description: 'Patient entities',
    type: PatientEntitiesDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  // async updateProviderWithEntities(
  //   @Param('id')
  //   id: string,
  //   @Body(
  //     new YupValidationPipe(
  //       getValidationSchema(updatePatientEntitiesValidationSchema),
  //     ),
  //   )
  //   data: PatientEntitiesDto,
  //   @UploadedFiles()
  //   assets: { [key: string]: Express.Multer.File },
  // ) {
  //   const transformedAssets = Object.values(assets).flat();
  //   const transformedData = mapStringBoolToBoolean(data) as PatientEntitiesDto;

  //   return await this.patientEntitiesService.updatePatientEntities(
  //     id,
  //     transformedData,
  //     transformedAssets,
  //   );
  // }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete patient' })
  @ApiResponse({
    status: 200,
    description: 'Delete patient',
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
  async deletePatient(
    @Param('id')
    id: string,
  ) {
    return await this.patientEntitiesService.deletePatient(id);
  }
}
