import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from 'src/audit/audit.module';
import { DeviceTokensModule } from 'src/deviceTokens/deviceTokens.module';
import { HealthGoalsModule } from 'src/healthGoals/healthGoals.module';
import { JournalNotesModule } from 'src/journalNotes/journalNotes.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { PatientModule } from 'src/patient/patient.module';
import { Measurement } from './measurements/measurement.entity';
import { MeasurementsService } from './measurements/measurement.service';
import { VitalNote } from './vitalNotes/vitalNotes.entity';
import { VitalNotesService } from './vitalNotes/vitalNotes.service';

import { VitalsController } from './vitals.controller';
import { Vital } from './vitals.entity';
import { VitalsService } from './vitals.service';

@Global()
@Module({
  controllers: [VitalsController],
  providers: [VitalsService, MeasurementsService, VitalNotesService],
  exports: [VitalsService],
  imports: [
    PatientModule,
    AuditModule,
    TypeOrmModule.forFeature([Vital, Measurement, VitalNote]),
    JournalNotesModule,
    HealthGoalsModule,
    DeviceTokensModule,
    NotificationsModule,
  ],
})
export class VitalsModule {}
