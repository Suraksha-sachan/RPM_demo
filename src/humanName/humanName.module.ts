import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HumanNameController } from './humanName.controller';

import { HumanName } from './humanName.entity';
import { HumanNameService } from './humanName.service';

@Module({
  imports: [TypeOrmModule.forFeature([HumanName])],
  controllers: [HumanNameController],
  providers: [HumanNameService],
  exports: [HumanNameService],
})
export class HumanNameModule {}
