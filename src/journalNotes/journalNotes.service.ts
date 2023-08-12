import { Inject, Injectable, Scope } from '@nestjs/common';

import { BaseService } from 'src/abstract';

import {
  ENTITY_USER_TYPE,
  IClient,
  IHealthGoal,
  IJournalNote,
  IPatient,
  ROLES,
} from 'src/types';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { JournalNote } from './journalNotes.entity';
import { PatientsService } from 'src/patient/patient.service';
import { FindJournalNotesDto, JournalNoteDto } from './journalNotes.dto';
import { IExpandRequestObject } from 'src/types/common';

export const allowedFieldsToSort = [
  'title',
  'createdAt',
] as (keyof IJournalNote)[];

@Injectable({ scope: Scope.REQUEST })
export class JournalNotesService extends BaseService {
  constructor(
    @InjectRepository(JournalNote)
    private readonly journalNotesRepository: Repository<JournalNote>,
    @Inject(PatientsService)
    private readonly patientsService: PatientsService,
    @Inject(REQUEST)
    private readonly request: IExpandRequestObject,
  ) {
    super();
  }

  async findJournalNotes(params: FindJournalNotesDto) {
    try {
      //1. if you are not provider or less than MA
      if (
        this.request.user.entityType !== ENTITY_USER_TYPE.PROVIDER ||
        !this.checkRoleOnPermission({
          role: this.request.user.role,
          requiredRole: ROLES.MA,
        })
      ) {
        this._getForbiddenError("You can't get list of journal notes");
      }

      const qr = this.journalNotesRepository.createQueryBuilder('journalNote');
      qr.leftJoinAndSelect('journalNote.patient', 'patient');
      qr.leftJoinAndSelect('journalNote.provider', 'provider');
      qr.leftJoinAndSelect('provider.humanName', 'humanName');
      qr.leftJoinAndSelect('patient.client', 'client');
      qr.leftJoinAndSelect('journalNote.vitalNote', 'vitalNote');
      qr.leftJoinAndSelect('vitalNote.vital', 'vital');
      if (params.title) {
        qr.andWhere('journalNote.title ILIKE :title', {
          title: '%' + params.title + '%',
        });
      }

      if (params.patient) {
        qr.andWhere('patient.id = :id', {
          id: params.patient,
        });
      }
      if (params.provider) {
        qr.andWhere('provider.id = :id', {
          id: params.provider,
        });
      }

      if (params.sort) {
        const param = this.buildSortParams<{
          title: string;
          createdAt: string;
        }>(params.sort); //check if param is one of keys
        if (allowedFieldsToSort.includes(param[0])) {
          if (param[0] === 'title') {
            qr.orderBy(`journalNote.${param[0]}`, param[1]);
          }
        }
        if (allowedFieldsToSort.includes(param[0])) {
          if (param[0] === 'createdAt') {
            qr.orderBy(`journalNote.${param[0]}`, param[1]);
          }
        }
      }

      if (
        !this.checkRoleOnPermission({
          role: this.request.user?.role,
          requiredRole: ROLES.SUPER_ADMIN,
        })
      ) {
        qr.andWhere('client.id = :client', {
          client: this.request.user.client.id,
        });
      }

      return this._paginate<IJournalNote>(qr, {
        limit: params?.limit || 10,
        page: params?.page || 1,
      });
    } catch (error) {
      this._getInternalServerError(error.message);
    }
  }

  async findJournalNote(id: string) {
    try {
      const found = (await this.journalNotesRepository.findOne({
        where: { id },
        relations: ['patient', 'patient.client'],
      })) as unknown as IHealthGoal<
        IPatient<string, string, string, string, IClient>
      >;

      const isOwner =
        this.request.user.entityType === ENTITY_USER_TYPE.PATIENT &&
        this.request.user.id === found.patient.id;
      // 1 - get response when it is owner
      if (isOwner) {
        return found;
      }
      // 2 - get response when it is ma with the same client
      if (
        this.checkRoleOnPermission({
          // must be ma least
          requiredRole: ROLES.MA,
          role: this.request.user.role,
        }) &&
        this.request.user.client.id === found.patient.client.id
      ) {
        return found;
      }
      if (
        //3 or super admin
        this.checkRoleOnPermission({
          // must be ma least
          requiredRole: ROLES.SUPER_ADMIN,
          role: this.request.user.role,
        })
      ) {
        return found;
      }
      // otherwise - get error
      this._getBadRequestError("You don't allowed to see this vital");

      //if this is ma he has to have the same client
    } catch (error) {
      this._getBadRequestError(error.message);
    }
    //
  }
  async createJournalNote(data: JournalNoteDto) {
    try {
      // if this is't owner
      this.checkDecodedUserOnPermission({
        // must be ma at least
        requiredRole: ROLES.MA,
        user: this.request.user,
      });
      if (data.patient) {
        const found = await this.patientsService.checkIfPatientExists(
          data.patient,
        );
        if (!found) {
          this._getBadRequestError("Can't find patient");
        }
        //if this is ma he has to have the same client
        if (
          //if this is not super admin
          !this.checkRoleOnPermission({
            requiredRole: ROLES.SUPER_ADMIN,
            role: this.request.user.role,
          }) && // and has different client
          this.request?.user?.client.id !== found.client.id
        ) {
          this._getForbiddenError("You don't allow to get vital");
        }
      }

      const created = this.journalNotesRepository.create({
        ...data,
      });
      const saved = await this.journalNotesRepository.save(created);

      //

      return saved;
    } catch (error) {
      this._getBadRequestError(error.message);
    }
  }
  async updateJournalNote(data: JournalNoteDto, id: string) {
    try {
      const found = await this.findJournalNote(id);
      if (!found) {
        return this._getBadRequestError("Can't find journal note");
      }

      // if this is't owner
      this.checkDecodedUserOnPermission({
        // must be ma at least
        requiredRole: ROLES.MA,
        user: this.request.user,
      });
      //if this is ma he has to have the same client
      if (
        //if this is not super admin
        !this.checkRoleOnPermission({
          requiredRole: ROLES.SUPER_ADMIN,
          role: this.request.user.role,
        }) && // and has different client
        this.request?.user?.client.id !== found.patient.client.id
      ) {
        this._getForbiddenError("You don't allow to get vital");
      }

      if (data.patient) {
        const found = await this.patientsService.checkIfPatientExists(
          data.patient,
        );
        if (!found) {
          this._getBadRequestError("Can't find patient");
        }
      }

      const saved = await this.journalNotesRepository.save(data);
      const newValues = await this.findJournalNote(saved.id);
      return newValues;
    } catch (error) {
      this._getBadRequestError(error.message);
    }
  }
  //
  async deleteJournalNote(id: string) {
    try {
      const found = await this.findJournalNote(id);

      if (!found) {
        this._getBadRequestError("Can't find journal note");
      }
      if (this.request.user.id !== found.patient.id) {
        // if this is't owner
        this.checkDecodedUserOnPermission({
          // must be ma at least
          requiredRole: ROLES.MA,
          user: this.request.user,
        });
        //if this is ma he has to have the same client
        if (
          //if this is not super admin
          !this.checkRoleOnPermission({
            requiredRole: ROLES.SUPER_ADMIN,
            role: this.request.user.role,
          }) && // and has different client
          this.request?.user?.client.id !== found.patient.client.id
        ) {
          this._getForbiddenError("You don't allow to get vital");
        }
      }

      await this.journalNotesRepository.delete(id);
      return found;
    } catch (error) {
      this._getBadRequestError(error.message);
    }
  }
  //
}
