import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createTypeOrmDatabaseConfig } from './database';
import { PatientModule } from './patient/patient.module';
import { VitalsModule } from './vitals/vitals.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(
    createTypeOrmDatabaseConfig({
      entities: ['dist/**/*.entity{.ts,.js}'],
      type: 'postgres',
          }),
  ),
  PatientModule,
  VitalsModule
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
