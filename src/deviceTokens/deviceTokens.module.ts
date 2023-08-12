import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientModule } from 'src/patient/patient.module';
import { DeviceTokensController } from './deviceTokens.controller';
import { DeviceToken } from './deviceTokens.entity';
import { DeviceTokensService } from './deviceTokens.service';

@Global()
@Module({
  controllers: [DeviceTokensController],
  providers: [DeviceTokensService],
  exports: [DeviceTokensService],
  imports: [PatientModule, TypeOrmModule.forFeature([DeviceToken])],
})
export class DeviceTokensModule {}
