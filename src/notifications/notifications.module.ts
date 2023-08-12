import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientModule } from 'src/patient/patient.module';
import { NotificationsController } from './notifications.controller';
import { Notification } from './notifications.entity';
import { NotificationsService } from './notifications.service';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
  imports: [PatientModule, TypeOrmModule.forFeature([Notification])],
})
export class NotificationsModule {}
