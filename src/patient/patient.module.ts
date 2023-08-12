import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressModule } from 'src/address/address.module';
import { AssetModule } from 'src/assets/assets.module';
import { ClientModule } from 'src/client/client.module';
import { ContactPointModule } from 'src/contactPoint/contactPoint.module';
import { HumanNameModule } from 'src/humanName/humanName.module';

import { PatientsController } from './patient.controller';
import { Patient } from './patient.entity';
import { PatientsService } from './patient.service';
import { PatientAsset } from './patientAssets/patientAssets.entity';
import { PatientAssetsService } from './patientAssets/patientAssets.service';
import { PatientContactPoint } from './patientContactPoint/patientContactPoint.entity';
import { PatientContactPointService } from './patientContactPoint/patientContactPoint.service';
import { PatientDevice } from './patientDevices/patientAssets.entity';
import { PatientDevicesService } from './patientDevices/patientAssets.service';
import { PatientEntitiesService } from './patientEntities/patientEntities.service';
import { PatientEntitiesController } from './patientEntities/patientEntitites.controller';
import { PatientsMediaController } from './patientMedia.controller';

@Module({
  providers: [
    PatientsService,
    PatientAssetsService,
    PatientContactPointService,
    PatientEntitiesService,
    PatientDevicesService,
  ],
  exports: [
    PatientsService,
    PatientAssetsService,
    PatientContactPointService,
    PatientEntitiesService,
    PatientDevicesService,
  ],
  imports: [
    TypeOrmModule.forFeature([
      Patient,
      PatientAsset,
      PatientContactPoint,
      PatientDevice,
    ]),
    AssetModule,
    ContactPointModule,
    HumanNameModule,
    AddressModule,
    ClientModule,
  ],
  controllers: [
    PatientsController,
    PatientsMediaController,
    PatientEntitiesController,
  ],
})
export class PatientModule {}
