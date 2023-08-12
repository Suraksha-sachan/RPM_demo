import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientController } from './client.controller';

import { Client } from './client.entity';
import { ClientService } from './client.service';
import { ClientRepresentative } from './clientRepresentative/clientRepresentative.entity';
import { ClientRepresentativeContactPoint } from './clientRepresentativeContactPoint/clientRepresentativeContactPoint.entity';
import { ClientEntitiesController } from './clientEntities/clientEntitites.controller';
import { AddressModule } from 'src/address/address.module';
import { HumanNameModule } from 'src/humanName/humanName.module';
import { ContactPointModule } from 'src/contactPoint/contactPoint.module';
import { ClientEntitiesService } from './clientEntities/clientEntities.service';
import { ClientRepresentativeContactPointService } from './clientRepresentativeContactPoint/clientRepresentativeContactPoint.service';
import { ClientRepresentativeService } from './clientRepresentative/clientRepresentative.service';
import { AuditModule } from 'src/audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Client,
      ClientRepresentative,
      ClientRepresentativeContactPoint,
    ]),
    forwardRef(() => AddressModule),
    forwardRef(() => HumanNameModule),
    forwardRef(() => ContactPointModule),
    forwardRef(() => AuditModule),
  ],
  controllers: [ClientController, ClientEntitiesController],
  providers: [
    ClientService,
    ClientRepresentativeContactPointService,
    ClientRepresentativeService,
    ClientEntitiesService,
  ],
  exports: [ClientService, ClientEntitiesService],
})
export class ClientModule {}
