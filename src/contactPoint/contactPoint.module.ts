import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactPointController } from './contactPoint.controller';
import { ContactPoint } from './contactPoint.entity';
import { ContactPointService } from './contactPoint.service';

@Module({
  imports: [TypeOrmModule.forFeature([ContactPoint])],
  controllers: [ContactPointController],
  providers: [ContactPointService],
  exports: [ContactPointService],
})
export class ContactPointModule {}
