import { Inject, Injectable, Scope } from '@nestjs/common';

import { BaseService } from 'src/abstract';

import {
  ACTIONS,
  DecodedUser,
  ENTITY,
  ENTITY_USER_TYPE,
  IClient,
  IHealthGoal,
  IPatient,
  MEASUREMENT_TYPE,
  ROLES,
} from 'src/types';

import { HealthGoalDto } from './healthGoals.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { HealthGoals } from './healthGoals.entity';
import { PatientsService } from 'src/patient/patient.service';
import { AuditService } from 'src/audit/audit.service';
import { IExpandRequestObject } from 'src/types/common';

@Injectable({ scope: Scope.REQUEST })
export class HealthGoalsService extends BaseService {
  constructor(
    @InjectRepository(HealthGoals)
    private readonly healthGoalRepository: Repository<HealthGoals>,
    @Inject(PatientsService)
    private readonly patientsService: PatientsService,
    @Inject(AuditService)
    private readonly auditService: AuditService,
    @Inject(REQUEST)
    private readonly request: IExpandRequestObject,
  ) {
    super();
  }
  async findHealthGoalByPatient(patientId: string) {
    try {
      const patient = await this.patientsService.findPatientById(patientId);
      if (!patient) {
        this._getBadRequestError("This patient does't exist");
      }
      //
      const isOwner =
        this.request.user.entityType === ENTITY_USER_TYPE.PATIENT &&
        this.request.user.id === patient.id;
      //
      const qr = this.healthGoalRepository.createQueryBuilder('healthGoal');
      qr.leftJoinAndSelect('healthGoal.patient', 'patient');
      qr.leftJoinAndSelect('patient.client', 'client');
      qr.andWhere('patient.id = :id', {
        id: patientId,
      });

      // 1 - get response when it is owner
      if (isOwner) {
        return await qr.getMany();
      }

      // 2 - get response when it is ma with the same client
      if (
        this.checkRoleOnPermission({
          // must be ma least
          requiredRole: ROLES.MA,
          role: this.request.user.role,
        }) &&
        this.request.user.client.id === patient.client.id
      ) {
        return await qr.getMany();
      }
      if (
        //3 or super admin
        this.checkRoleOnPermission({
          // must be ma least
          requiredRole: ROLES.SUPER_ADMIN,
          role: this.request.user.role,
        })
      ) {
        return await qr.getMany();
      }
      // otherwise - get error
      this._getBadRequestError("You don't allowed to see this vital");
    } catch (error) {
      this._getBadRequestError(error.message);
    }
    //
  }
  async findHealthGoal(id: string) {
    try {
      const found = (await this.healthGoalRepository.findOne({
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

  async findHealthGoalByMeasurementType(measurementType: MEASUREMENT_TYPE) {
    try {
      const found = (await this.healthGoalRepository.find({
        where: { measurementType },
        relations: ['patient', 'patient.client'],
      })) as unknown as IHealthGoal<
        IPatient<string, string, string, string, IClient>
      >[];
      return found;

      //if this is ma he has to have the same client
    } catch (error) {
      this._getBadRequestError(error.message);
    }
    //
  }
  async createHealthGoal(data: HealthGoalDto, patientId: string) {
    try {
      if (this.request.user.id !== patientId) {
        // if this is't owner
        this.checkDecodedUserOnPermission({
          // must be ma at least
          requiredRole: ROLES.MA,
          user: this.request.user,
        });
        if (patientId) {
          const found = await this.patientsService.checkIfPatientExists(
            patientId,
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
      }

      const foundByMeasurementType = await this.findHealthGoalByMeasurementType(
        data.measurementType,
      );

      await Promise.all(
        foundByMeasurementType.map((item) => this.deleteHealthGoal(item.id)),
      );

      const created = this.healthGoalRepository.create({
        ...data,
        patient: patientId,
      });
      const saved = await this.healthGoalRepository.save(created);

      const prevValues = foundByMeasurementType?.pop();
      //
      await this.auditService.createApiAudit({
        action: prevValues
          ? ACTIONS.HEALTH_GOALS_UPDATED
          : ACTIONS.HEALTH_GOALS_CREATED,
        payload: data,
        newValues: created || [], //must be an object
        prevValues: { ...prevValues, patient: prevValues?.patient?.id } || {},
        entityUserType: ENTITY_USER_TYPE.PROVIDER,
        entity: created.id,
        entityUser: this.patientsService.getDecodedUser().uid,
        entityType: ENTITY.HEALTH_GOAL,
      });

      return saved;
    } catch (error) {
      this._getBadRequestError(error.message);
    }
  }
  // async updateHealthGoal(data: HealthGoalDto, id: string, patientId: string) {
  //   try {
  //     const foundHealthGoal = await this.findHealthGoal(id);

  //     if (this.request.user.id !== foundHealthGoal.patient.id) {
  //       // if this is't owner
  //       this.checkDecodedUserOnPermission({
  //         // must be ma at least
  //         requiredRole: ROLES.MA,
  //         user: this.request.user,
  //       });
  //       //if this is ma he has to have the same client
  //       if (
  //         //if this is not super admin
  //         !this.checkRoleOnPermission({
  //           requiredRole: ROLES.SUPER_ADMIN,
  //           role: this.request.user.role,
  //         }) && // and has different client
  //         this.request?.user?.client.id !== foundHealthGoal.patient.client.id
  //       ) {
  //         this._getForbiddenError("You don't allow to get vital");
  //       }
  //     }

  //     if (patientId) {
  //       const found = await this.patientsService.checkIfPatientExists(
  //         patientId,
  //       );
  //       if (!found) {
  //         this._getBadRequestError("Can't find patient");
  //       }
  //     }

  //     const saved = await this.healthGoalRepository.save({
  //       ...data,
  //       patient: patientId,
  //     });
  //     const newValues = await this.findHealthGoal(saved.id);
  //     return newValues;
  //   } catch (error) {
  //     this._getBadRequestError(error.message);
  //   }
  // }
  async deleteHealthGoal(id: string) {
    try {
      const found = await this.findHealthGoal(id);

      if (!found) {
        this._getBadRequestError("Can't find patient");
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

      //
      await this.auditService.createApiAudit({
        action: ACTIONS.HEALTH_GOALS_DELETED,
        payload: id,
        newValues: {}, //must be an object
        prevValues: found,
        entityUserType: ENTITY_USER_TYPE.PROVIDER,
        entity: null,
        entityUser: this.patientsService.getDecodedUser().uid,
        entityType: ENTITY.HEALTH_GOAL,
      });

      await this.healthGoalRepository.delete(id);
      return found;
    } catch (error) {
      this._getBadRequestError(error.message);
    }
  }
  async bulkCreateHealthGoals(data: HealthGoalDto[], patientId: string) {
    if (!patientId) {
      this._getBadRequestError('patient id not provided!');
    }

    const created = await Promise.all(
      data.map((item) => this.createHealthGoal(item, patientId)),
    );

    return created;
  }
  async bulkUpdateHealthGoals(data: HealthGoalDto[], patientId: string) {
    return await Promise.all(
      data.map((item) => this.createHealthGoal(item, patientId)),
    );
  }
  async bulkDeleteHealthGoals(patientId: string) {
    const healthGoals = await this.findHealthGoalByPatient(patientId);
    await Promise.all(
      healthGoals.map((item) => this.deleteHealthGoal(item.id)),
    );
    return healthGoals;
  }
}
