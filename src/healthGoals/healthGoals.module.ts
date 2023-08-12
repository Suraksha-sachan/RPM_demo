import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from 'src/audit/audit.module';
import { PatientModule } from 'src/patient/patient.module';

import { HealthGoalsController } from './healthGoals.controller';
import { HealthGoalsService } from './healthGoals.service';
import { HealthGoals } from './healthGoals.entity';

@Global()
@Module({
  controllers: [HealthGoalsController],
  providers: [HealthGoalsService],
  exports: [HealthGoalsService],
  imports: [
    PatientModule,
    AuditModule,
    TypeOrmModule.forFeature([HealthGoals]),
  ],
})
export class HealthGoalsModule {}
