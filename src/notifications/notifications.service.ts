import { Inject, Injectable, Scope } from '@nestjs/common';

import { BaseService } from 'src/abstract';

import { IFullPatient, INotification, IPatient, ROLES } from 'src/types';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Notification } from './notifications.entity';
import { FindNotificationsDto, NotificationDto } from './notifications.dto';
import { PatientsService } from 'src/patient/patient.service';
import { IExpandRequestObject } from 'src/types/common';

export const allowedFieldsToSort = ['createdAt'] as (keyof INotification)[];

@Injectable({ scope: Scope.REQUEST })
export class NotificationsService extends BaseService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
    @Inject(PatientsService)
    private readonly patientsService: PatientsService,
    @Inject(REQUEST)
    private readonly request: IExpandRequestObject,
  ) {
    super();
  }
  async checkOnPermission(
    patient: string,
    message = 'You are not allowed to do this action',
  ) {
    let allowed = false;
    // 1. if this is super admin - allow
    if (this.request.user.role === ROLES.SUPER_ADMIN) {
      allowed = true;
    }
    // 2. if this is owner - allow
    if (patient && this.request.user.id === patient) {
      allowed = true;
    }
    // 3. if this is provider with the same client

    if (patient) {
      const found = await this.patientsService.findPatientById(patient);
      if (!found) {
        this._getBadRequestError("Can't find patient");
      }
      if (found.client.id === this.request.user.client.id) {
        allowed = true;
      }
    }
    if (!allowed) {
      this._getForbiddenError(message);
    }
  }
  //
  async findNotificationById(id: string) {
    try {
      const qr =
        this.notificationsRepository.createQueryBuilder('notification');
      qr.leftJoinAndSelect('notification.patient', 'patient');
      qr.leftJoinAndSelect('patient.client', 'client');

      qr.andWhere('notification.id = :id', {
        id: id,
      });

      const found = (await qr.getOne()) as unknown as INotification<
        Partial<IFullPatient>
      >;
      await this.checkOnPermission(found.patient.id);

      return found;
    } catch (error) {
      this._getInternalServerError(error.message);
    }
  }

  async findNotifications(params: FindNotificationsDto) {
    //
    try {
      await this.checkOnPermission(params.patient);

      const qr =
        this.notificationsRepository.createQueryBuilder('notification');
      qr.leftJoinAndSelect('notification.patient', 'patient');
      qr.leftJoinAndSelect('patient.client', 'client');

      if (params.patient) {
        qr.andWhere('patient.id = :id', {
          id: params.patient,
        });
      }
      if (params.sort) {
        const param = this.buildSortParams<{
          createdAt: string;
        }>(params.sort); //check if param is one of keys
        if (allowedFieldsToSort.includes(param[0])) {
          if (param[0] === 'createdAt') {
            qr.orderBy(`notification.${param[0]}`, param[1]);
          }
        }
      }
      return this._paginate<INotification<IPatient>>(qr, {
        limit: params?.limit || 10,
        page: params?.page || 1,
      });
    } catch (error) {
      this._getInternalServerError(error.message);
    }
  }

  async createNotification(notification: NotificationDto) {
    try {
      await this.checkOnPermission(notification.patient);
      const created = this.notificationsRepository.create(notification);
      const saved = await this.notificationsRepository.save(created);
      return saved;
    } catch (error) {
      this._getBadRequestError(error.message);
    }
  }
}
