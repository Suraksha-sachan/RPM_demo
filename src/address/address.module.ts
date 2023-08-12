import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressController } from './address.controller';

import { Address } from './address.entity';
import { AddressService } from './address.service';
import { ZipCode } from './zipCode.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Address, ZipCode])],
  controllers: [AddressController],
  providers: [AddressService],
  exports: [AddressService],
})
export class AddressModule {}
