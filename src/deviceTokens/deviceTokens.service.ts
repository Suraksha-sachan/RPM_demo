import { Inject, Injectable, Scope } from '@nestjs/common';

import { BaseService } from 'src/abstract';

import { IDeviceToken, IFullPatient } from 'src/types';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { DeviceToken } from './deviceTokens.entity';
import { DeviceTokenDto, FindDeviceTokensDto } from './deviceTokens.dto';
import { IExpandRequestObject } from 'src/types/common';

@Injectable({ scope: Scope.REQUEST })
export class DeviceTokensService extends BaseService {
  constructor(
    @InjectRepository(DeviceToken)
    private readonly deviceTokensRepository: Repository<DeviceToken>,
    @Inject(REQUEST)
    private readonly request: IExpandRequestObject,
  ) {
    super();
  }
  //
  async findDeviceTokenByPatient(params: FindDeviceTokensDto) {
    try {
      const qr = this.deviceTokensRepository.createQueryBuilder('deviceToken');
      qr.leftJoinAndSelect('deviceToken.patient', 'patient');

      if (params.patient) {
        qr.andWhere('patient.id = :id', {
          id: params.patient,
        });
      }

      return await qr.getOne();
    } catch (error) {
      this._getInternalServerError(error.message);
    }
  }
  //--->
  async findDeviceTokenById(id: string) {
    try {
      const qr = this.deviceTokensRepository.createQueryBuilder('deviceToken');
      qr.leftJoinAndSelect('deviceToken.patient', 'patient');

      qr.andWhere('deviceToken.id = :id', {
        id,
      });

      return (await qr.getOne()) as unknown as IDeviceToken<
        Partial<IFullPatient>
      >;
      //if this is ma he has to have the same client
    } catch (error) {
      this._getBadRequestError(error.message);
    }
    //
  }
  //--->
  async findDeviceTokenByToken(token: string) {
    try {
      const qr = this.deviceTokensRepository.createQueryBuilder('deviceToken');
      qr.leftJoinAndSelect('deviceToken.patient', 'patient');

      if (token) {
        qr.andWhere('deviceToken.token = :token', {
          token,
        });
      }
      return (await qr.getOne()) as unknown as IDeviceToken<
        Partial<IFullPatient>
      >;
      //if this is ma he has to have the same client
    } catch (error) {
      this._getBadRequestError(error.message);
    }
    //
  }
  //--->
  async createDeviceToken(data: DeviceTokenDto) {
    try {
      // this is owner
      // if (this.request.user.id !== data.patient) { // TODO - COMMENT OUT
      //   return this._getBadRequestError(
      //     "you don't allowed to create device token",
      //   );
      // }
      const foundByToken = await this.findDeviceTokenByToken(data.token);
      if (foundByToken) {
        await this.deleteDeviceToken(foundByToken.id);
      }

      const foundByPatient = await this.findDeviceTokenByPatient({
        patient: data.patient,
      });

      if (foundByPatient) {
        await this.deleteDeviceToken(foundByPatient.id);
      }

      const created = this.deviceTokensRepository.create({
        patient: data.patient,
        token: data.token,
      });
      const saved = await this.deviceTokensRepository.save(created);
      return saved;
    } catch (error) {
      this._getBadRequestError(error.message);
    }
  }

  async deleteDeviceToken(id: string) {
    try {
      const found = await this.findDeviceTokenById(id);

      if (!found) {
        this._getBadRequestError("Can't find device token");
      }
      // if (this.request.user.id !== found.patient.id) { // TODO - COMMENT OUT
      //   return this._getBadRequestError(
      //     "you don't allowed to delete device token",
      //   );
      // }

      await this.deviceTokensRepository.delete(id);
      return found;
    } catch (error) {
      this._getBadRequestError(error.message);
    }
  }
  //
}
