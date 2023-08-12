import { forwardRef, Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from 'src/abstract';
import * as express from 'express';

import { Audit } from './audit.entity';
import {
  ACTIONS,
  AUDIT_GROUPS,
  AUDIT_STATUS,
  DecodedUser,
  ENTITY,
  ENTITY_USER_TYPE,
  IAudit,
  ROLES,
} from 'src/types';
import { FindAuditQueryDto } from './audit.dto';
import { REQUEST } from '@nestjs/core';

const allowedFieldsToSort = [
  'createdAt',
  'action',
  'status',
  'auditGroup',
  'updatedAt',
  'credentials', //TODO  - ADD SORT BY NAME
] as (keyof IAudit)[];

interface IApiAudit<TAction = ACTIONS, TNewValues = any, TPrevValues = any> {
  action: TAction;
  payload: any;
  newValues: TNewValues;
  prevValues: TPrevValues;
  entityUserType: ENTITY_USER_TYPE;
  entity: string;
  entityUser: string;
  entityType: ENTITY;
}

@Injectable({ scope: Scope.REQUEST })
export class AuditService extends BaseService {
  constructor(
    @InjectRepository(Audit)
    private readonly auditRepository: Repository<Audit>,
    @Inject(REQUEST) private readonly request: Request & { user?: DecodedUser },
  ) {
    super();
  }

  async findAuditById(id: string, response: express.Response) {
    const found = await this.auditRepository.findOne({ where: { id } });
    if (!found) {
      return response.status(400).json({ email: 'audit not found' });
    }
    return response.send(found);
  }
  async createAudit(data: Partial<IAudit>) {
    try {
      //TODO - CHECK ON ROLES?
      const created = await this.auditRepository.create(data);
      const saved = await this.auditRepository.save(created);
      return saved;
    } catch (error) {
      this._getBadRequestError(error.message);
    }
  }
  async findAudits(data: FindAuditQueryDto) {
    try {
      this.checkDecodedUserOnPermission({
        requiredRole: ROLES.SUPER_ADMIN,
        user: this.request?.user,
      });
      const qr = this.auditRepository.createQueryBuilder('audit');
      qr.leftJoinAndMapOne(
        'audit.entityUser',
        'entityUser',
        'entityUser.id = audit.entityUser', //TODO - ADD PATIENT OR CLIENT IF NEEDED
      );
      if (data.auditGroup) {
        qr.andWhere('audit.auditGroup = :auditGroup', {
          auditGroup: data.auditGroup,
        });
      }
      if (data.sort) {
        const param = this.buildSortParams<IAudit>(data.sort); //check if param is one of keys
        if (allowedFieldsToSort.includes(param[0])) {
          qr.orderBy(`audit.${param[0]}`, param[1]);
        }
      } else {
        qr.orderBy(`audit.createdAt`, 'DESC');
      }

      if (data.startDate || data.endDate) {
        if (data.startDate) {
          qr.andWhere('audit.createdAt >= :startDate', {
            startDate: data.startDate,
          });
        }
        if (data.endDate) {
          qr.andWhere('audit.createdAt <= :endDate', {
            endDate: data.endDate,
          });
        }
      }
      if (data.credentials) {
        qr.andWhere('audit.credentials ILIKE :credentials', {
          credentials: '%' + data.credentials + '%',
        });
      }

      return this._paginate<IAudit>(qr, {
        limit: data.limit || 10,
        page: data.page || 1,
      });
    } catch (err) {
      this._getInternalServerError(err.message);
    }
  }

  async createApiAudit<T extends IApiAudit>(data: T) {
    await this.createAudit({
      action: data.action,
      status: AUDIT_STATUS.SUCCESS,
      params: JSON.stringify(data.payload),
      entityType: data.entityType,
      entityUser: data.entityUser,
      entity: data.entity,
      entityUserType: data.entityUserType,
      auditGroup: AUDIT_GROUPS.API,
      prevValues: JSON.stringify(data.prevValues),
      newValues: JSON.stringify(data.newValues),
    });
  }
}
