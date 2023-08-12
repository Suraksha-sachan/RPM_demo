import { forwardRef, Inject, Injectable } from '@nestjs/common';

import { BaseService } from 'src/abstract';

import { ClientEntitiesDto } from '../client.dto';
import { AddressService } from 'src/address/address.service';
import { ContactPointService } from 'src/contactPoint/contactPoint.service';
import { ClientService } from '../client.service';
import { HumanNameService } from 'src/humanName/humanName.service';
import { ClientRepresentativeService } from '../clientRepresentative/clientRepresentative.service';
import { ClientRepresentativeContactPointService } from '../clientRepresentativeContactPoint/clientRepresentativeContactPoint.service';
import {
  ACTIONS,
  DecodedUser,
  ENTITY,
  ENTITY_USER_TYPE,
  IAddress,
  IClient,
  IClientRepresentative,
  IClientRepresentativeContactPoint,
  IContactPoint,
  IHumanName,
} from 'src/types';
import { HumanNameDTO } from 'src/humanName/humanName.dto';
import { ContactPointDTO } from 'src/contactPoint/contactPoint.dto';
import { AuditService } from 'src/audit/audit.service';

@Injectable()
export class ClientEntitiesService extends BaseService {
  constructor(
    @Inject(forwardRef(() => AuditService))
    private readonly auditService: AuditService,
    @Inject(forwardRef(() => ClientService))
    private readonly clientService: ClientService,
    @Inject(forwardRef(() => AddressService))
    private readonly addressService: AddressService,
    @Inject(forwardRef(() => ContactPointService))
    private readonly contactPointService: ContactPointService,
    @Inject(forwardRef(() => HumanNameService))
    private readonly humanNameService: HumanNameService,
    @Inject(forwardRef(() => ClientRepresentativeService))
    private readonly clientRepresentativeService: ClientRepresentativeService,
    @Inject(forwardRef(() => ClientRepresentativeContactPointService))
    private readonly clientRepresentativeContactPointService: ClientRepresentativeContactPointService,
  ) {
    super();
  }

  async createClientEntities(data: ClientEntitiesDto, user: DecodedUser) {
    try {
      const address = await this.addressService.createAddress(data.address);
      const client = await this.clientService.createClient({
        ...data.client,
        address: address.id,
      });
      const contacts = await this.createClientsContactEntitiesData(
        client.id,
        data.contacts,
      );
      const newValues = await this.clientService.findClient(client.id);
      await this.auditService.createApiAudit({
        action: ACTIONS.CLIENT_CREATED,
        payload: data,
        newValues: newValues || {}, //must be an object
        prevValues: {},
        entityUserType: ENTITY_USER_TYPE.PROVIDER,
        entity: client.id,
        entityUser: user.uid,
        entityType: ENTITY.CLIENT,
      });
      return { client, address, contacts };
    } catch (err) {
      return this._getInternalServerError(err.mess);
    }
  }
  async updateClientEntities(
    id: string,
    data: ClientEntitiesDto,
    user: DecodedUser,
  ) {
    const foundClient = await this.clientService.findClient(id);

    if (!foundClient) {
      return this._getNotFoundError('client not found');
    }
    if (Object.keys(data.client).length) {
      await this.clientService.updateClient(id, data.client);
    }

    // if there is data in address
    if (data && data.address && Object.keys(data.address).length) {
      if (foundClient && foundClient.address.id) {
        await this.addressService.updateAddress(
          foundClient.address.id,
          data.address,
        );
      }
    }
    // if there is empty an item in form, but it is an empty like "contacts": [], "contacts": null
    if (data && data.contacts) {
      //and in db are records - remove
      if (foundClient.clientRepresentative.length) {
        await this.removeContactsAndHumanNames(
          foundClient.clientRepresentative,
        );
      }

      if (data.contacts.length) {
        await this.createClientsContactEntitiesData(id, data.contacts);
      }
    }
    const updated = await this.clientService.findClient(id);
    await this.auditService.createApiAudit({
      action: ACTIONS.CLIENT_UPDATED,
      payload: data,
      newValues: updated || {}, //must be an object
      prevValues: foundClient,
      entityUserType: ENTITY_USER_TYPE.PROVIDER,
      entity: foundClient.id,
      entityUser: user.uid,
      entityType: ENTITY.CLIENT,
    });
    return updated;
  }

  async createClientsContactEntitiesData(
    clientId: string,
    contacts: {
      humanName: HumanNameDTO;
      position: string | null;
      contactPoints: ContactPointDTO[];
    }[] = [],
  ) {
    return await Promise.all(
      contacts?.map(async (contact) => {
        const humanName = await this.humanNameService.createHumanName(
          contact.humanName,
        );

        const contactPoints = await Promise.all(
          contact.contactPoints.map((item) => {
            return this.contactPointService.createContactPoint(item);
          }),
        );

        const clientRepresentative =
          await this.clientRepresentativeService.createClientRepresentative({
            client: clientId,
            humanName: humanName.id,
            position: contact.position,
          });

        await Promise.all(
          contactPoints.map((item) => {
            return this.clientRepresentativeContactPointService.createClientRepresentativeContactPoint(
              {
                contactPoint: item.id,
                clientRepresentative: clientRepresentative.id,
              },
            );
          }),
        );
        return { humanName, contactPoints };
      }),
    );
  }

  async removeContactsAndHumanNames(
    clientRepresentative: IClient<
      IClientRepresentative<
        IHumanName,
        IClientRepresentativeContactPoint<IContactPoint>
      >,
      IAddress
    >['clientRepresentative'],
  ) {
    if (clientRepresentative.length) {
      await Promise.all(
        clientRepresentative.map(async (clientRepresentative) => {
          await this.removeHumanName(clientRepresentative.humanName);
          await this.removeContactPoint(
            clientRepresentative.clientRepresentativeContactPoints,
          );
        }),
      );
    }
  }

  async removeContactPoint(
    clientRepresentativeContactPoints: Array<
      IClientRepresentativeContactPoint<IContactPoint>
    >,
  ) {
    return await Promise.all(
      clientRepresentativeContactPoints.map(async (clientPoint) => {
        if (typeof clientPoint.contactPoint === 'object') {
          await this.contactPointService.deleteContactPoint(
            clientPoint.contactPoint.id,
          );
        }
      }),
    );
  }
  async removeHumanName(humanName: IHumanName) {
    if (humanName?.id) {
      return await this.humanNameService.deleteHumanName(humanName?.id);
    }
  }
}
