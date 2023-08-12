import { forwardRef, Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from 'src/abstract';

import { Client } from './client.entity';
import {
  DecodedUser,
  IAddress,
  IClient,
  IClientRepresentative,
  IClientRepresentativeContactPoint,
  IContactPoint,
  IHumanName,
  ROLES,
} from 'src/types';
import { ClientDto, FindClientDto } from './client.dto';
import { REQUEST } from '@nestjs/core';

export const allowedFieldsToSort = [
  'title',
  'state',
  'city', //TODO  - ADD SORT BY NAME
  'name',
];

@Injectable({ scope: Scope.REQUEST })
export class ClientService extends BaseService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @Inject(REQUEST) private readonly request: Request & { user?: DecodedUser },
  ) {
    super();
  }

  async findClientById(id: string) {
    this.checkDecodedUserOnPermission({
      requiredRole: ROLES.SUPER_ADMIN,
      user: this.request?.user,
    });
    return await this.findClient(id);
  }
  //
  async findClient(id: string) {
    try {
      const found = await this.clientRepository.findOne({
        relations: [
          'address',
          'clientRepresentative',
          'clientRepresentative.humanName',
          'clientRepresentative.clientRepresentativeContactPoints',
          'clientRepresentative.clientRepresentativeContactPoints.contactPoint',
        ],
        where: { id },
      });
      if (!found) {
        return this._getNotFoundError('client not found');
      }
      return found as unknown as IClient<
        IClientRepresentative<
          IHumanName,
          IClientRepresentativeContactPoint<IContactPoint>
        >,
        IAddress
      >;
    } catch (err) {
      return this._getInternalServerError(err.message);
    }
  }
  //

  async createClient(data: ClientDto) {
    try {
      this.checkDecodedUserOnPermission({
        requiredRole: ROLES.SUPER_ADMIN,
        user: this.request?.user,
      });
      const created = await this.clientRepository.create(data);
      const saved = await this.clientRepository.save(created);
      return saved;
    } catch (error) {
      this._getBadRequestError(error.message);
    }
  }

  async updateClient(id: string, data: ClientDto) {
    try {
      this.checkDecodedUserOnPermission({
        requiredRole: ROLES.SUPER_ADMIN,
        user: this.request?.user,
      });
      const founded = await this.findClient(id);
      if (!founded) {
        return this._getNotFoundError('client not found');
      }
      const saved = await this.clientRepository.save({ id, ...data });
      return saved;
    } catch (error) {
      this._getBadRequestError(error.message);
    }
  }

  async deleteClient(id: string) {
    try {
      this.checkDecodedUserOnPermission({
        requiredRole: ROLES.SUPER_ADMIN,
        user: this.request?.user,
      });
      const founded = await this.findClient(id);
      if (!founded) {
        return this._getNotFoundError('client not found');
      }
      await this.clientRepository.delete(id);
      return founded;
    } catch (error) {
      this._getBadRequestError(error.message);
    }
  }

  async findClients(data: FindClientDto) {
    try {
      const qr = this.clientRepository.createQueryBuilder('client');
      qr.leftJoinAndSelect('client.address', 'address');
      qr.leftJoinAndSelect(
        'client.clientRepresentative',
        'clientRepresentative',
      );
      qr.leftJoinAndSelect('clientRepresentative.humanName', 'humanName');
      qr.leftJoinAndSelect(
        'clientRepresentative.clientRepresentativeContactPoints',
        'clientRepresentativeContactPoints',
      );
      qr.leftJoinAndSelect(
        'clientRepresentativeContactPoints.contactPoint',
        'contactPoint',
      );
      if (data.sort) {
        const param = this.buildSortParams<{
          title: string;
          city: string;
          state: string;
          name: string;
        }>(data.sort); //check if param is one of keys
        if (allowedFieldsToSort.includes(param[0])) {
          if (param[0] === 'title') {
            qr.orderBy(`client.${param[0]}`, param[1]);
          }
          if (param[0] === 'state' || param[0] === 'city') {
            qr.orderBy(`address.${param[0]}`, param[1]);
          }
          if (param[0] === 'name') {
            qr.orderBy(`humanName.text`, param[1]);
          }
        }
      }
      if (data.city) {
        //
        qr.andWhere('address.city ILIKE :city', {
          city: '%' + data.city + '%',
        });
      }
      if (data.state) {
        //
        qr.andWhere('address.state ILIKE :state', {
          state: '%' + data.state + '%',
        });
      }
      if (data.name) {
        //
        qr.andWhere('humanName.text ILIKE :name', {
          name: '%' + data.name + '%',
        });
      }

      if (data.title) {
        //
        qr.andWhere('client.title ILIKE :title', {
          title: '%' + data.title + '%',
        });
      }

      if (data.search) {
        if (data.search) {
          qr.andWhere(
            'client.title ILIKE :search OR humanName.text ILIKE :search OR address.state ILIKE :search OR address.city ILIKE :search',
            {
              search: '%' + data.search + '%',
            },
          );
        }
      }

      return this._paginate<IClient>(qr, {
        limit: data.limit || 10,
        page: data.page || 1,
      });
    } catch (err) {
      this._getInternalServerError(err.message);
    }
  }
}
