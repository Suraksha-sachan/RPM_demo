import { Inject } from '@nestjs/common';

import { BaseService } from 'src/abstract';

import {
  ACTIONS,
  ENTITY,
  ENTITY_USER_TYPE,
  IFullVital,
  NOTIFICATION_TYPE,
  ROLES,
  VITAL_TYPE,
} from 'src/types';
import { PatientsService } from 'src/patient/patient.service';
import { AuditService } from 'src/audit/audit.service';
import {
  DeleteDTO,
  FindVitalQueryDto,
  FindVitaReportQueryDto,
  VitalDto,
} from './vitals.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Vital } from './vitals.entity';
import { Repository } from 'typeorm';
import { MeasurementsService } from './measurements/measurement.service';
import { HealthGoalsService } from 'src/healthGoals/healthGoals.service';
import { checkIfIsAlert, getVitalTypeByDeviceType } from 'src/utils/common';
import { DeviceTokensService } from 'src/deviceTokens/deviceTokens.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { IExpandRequestObject } from 'src/types/common';

const VITAL_TYPE_TITLES = {
  [VITAL_TYPE.BLOOD_PRESSURE]: 'blood pressure',
  [VITAL_TYPE.GLUCOSE]: 'glucose level',
  [VITAL_TYPE.OXYGEN_SATURATION]: 'oxygen saturation',
  [VITAL_TYPE.WEIGHT]: 'weight',
  [VITAL_TYPE.TEMPERATURE]: 'temperature',
};

export const allowedFieldsToSort = [
  'createdAt',
  'takenAt',
  'value',
  'deviceType',
  'patient',
] as string[];
export class VitalsService extends BaseService {
  constructor(
    @Inject(MeasurementsService)
    private readonly measurementsService: MeasurementsService,
    @Inject(PatientsService)
    private readonly patientsService: PatientsService,
    @Inject(AuditService)
    private readonly auditService: AuditService,
    @Inject(HealthGoalsService)
    private readonly healthGoalsService: HealthGoalsService,
    @InjectRepository(Vital)
    private readonly vitalRepository: Repository<Vital>,
    // @Inject(AuthService)
    // private readonly authService: AuthService,
    @Inject(DeviceTokensService)
    private readonly deviceTokensService: DeviceTokensService,

    //
    @Inject(NotificationsService)
    private readonly notificationsService: NotificationsService, //
  ) {
    super();
  }

  async findVital(id: string, request: IExpandRequestObject) {
    try {
      const foundVital = (await this.vitalRepository.findOne({
        where: { id },
        relations: [
          'patient',
          'patient.humanName',
          'patient.client',
          'measurements',
          'vitalNote',
          'vitalNote.journalNote',
        ],
      })) as unknown as IFullVital;

      const isOwner =
        request.user.entityType === ENTITY_USER_TYPE.PATIENT &&
        request.user.id === foundVital.patient.id;
      // 1 - get response when it is owner
      if (isOwner) {
        return foundVital;
      }
      // 2 - get response when it is ma with the same client
      if (
        this.checkRoleOnPermission({
          // must be ma least
          requiredRole: ROLES.MA,
          role: request.user.role,
        }) &&
        request.user.client.id === foundVital.patient.client.id
      ) {
        return foundVital;
      }
      if (
        //3 or super admin
        this.checkRoleOnPermission({
          // must be ma least
          requiredRole: ROLES.SUPER_ADMIN,
          role: request.user.role,
        })
      ) {
        return foundVital;
      }
      // otherwise - get error
      this._getBadRequestError("You don't allowed to see this vital");

      //if this is ma he has to have the same client
    } catch (error) {
      this._getBadRequestError(error.message);
    }
    //
  }
  async deleteVital(
    id: string,
    query: DeleteDTO,
    request: IExpandRequestObject,
  ) {
    try {
      const foundVital = await this.findVital(id, request);
      if (request.user.id !== foundVital.patient.id) {
        // if this is't owner
        this.checkDecodedUserOnPermission({
          // must be at least ma
          requiredRole: ROLES.MA,
          user: request.user,
        });
        //if this is ma he has to have the same client
        if (
          !this.checkRoleOnPermission({
            role: request.user.role,
            requiredRole: ROLES.SUPER_ADMIN,
          }) &&
          request?.user?.client.id !== foundVital.patient.client.id
        ) {
          this._getForbiddenError("You don't allow to get vital");
        }
      }
      //https://wanago.io/2021/10/25/api-nestjs-soft-deletes-postgresql-typeorm/
      if (query?.type === 'soft') {
        await this.vitalRepository.softDelete(id);
      } else {
        await this.vitalRepository.delete(id);
      }

      await this.auditService.createApiAudit({
        action: ACTIONS.VITALS_DELETED,
        payload: query,
        newValues: {}, //must be an object
        prevValues: foundVital,
        entityUserType: request.user.entityType,
        entity: foundVital.id,
        entityUser: request.user.id,
        entityType: ENTITY.VITAL,
      });
      return foundVital;
    } catch (error) {
      this._getBadRequestError(error.message);
    }
    //
  }
  async createVital(
    { measurements, ...data }: VitalDto,
    request: IExpandRequestObject,
  ) {
    try {
      if (data.patient) {
        const found = await this.patientsService.checkIfPatientExists(
          data.patient,
        );
        if (!found) {
          this._getBadRequestError("Can't find patient");
        }
        if (request.user.id !== found.id) {
          // if this is't owner
          this.checkDecodedUserOnPermission({
            // must be ma at least
            requiredRole: ROLES.MA,
            user: request.user,
          });
          //if this is ma he has to have the same client
          if (
            //if this is not super admin
            !this.checkRoleOnPermission({
              requiredRole: ROLES.SUPER_ADMIN,
              role: request.user.role,
            }) && // and has different client
            request?.user?.client.id !== found.client.id
          ) {
            this._getForbiddenError("You don't allow to get vital");
          }
        }
      }

      //compare with health goals
      const healthGoals = await this.healthGoalsService.findHealthGoalByPatient(
        data.patient,
      );
      //--
      const isAlert = checkIfIsAlert(healthGoals, measurements);

      const created = this.vitalRepository.create({
        ...data,
        type: getVitalTypeByDeviceType(data.deviceType),
        isAlert,
      });
      const saved = await this.vitalRepository.save(created);

      //

      await Promise.all(
        measurements.map((measurement) => {
          return this.measurementsService.createMeasurement({
            vital: saved.id,
            ...measurement,
          });
        }),
      );
      //
      const newValues = await this.findVital(saved.id, request);

      await this.auditService.createApiAudit({
        action: ACTIONS.VITALS_CREATED,
        payload: data,
        newValues, //must be an object
        prevValues: {},
        entityUserType: request.user.entityType,
        entity: saved.id,
        entityUser: request.user.id,
        entityType: ENTITY.VITAL,
      });
      if (isAlert) {
        await this.notifyIfAbnormal(
          data.patient,
          getVitalTypeByDeviceType(data.deviceType),
        );
      }

      return newValues;
    } catch (error) {
      this._getBadRequestError(error.message);
    }
  }
  async updateVital(
    id: string,
    { measurements, ...data }: VitalDto,
    request: IExpandRequestObject,
  ) {
    try {
      if (data.restore) {
        const restoreResponse = await this.vitalRepository.restore(id);
        if (!restoreResponse.affected) {
          this._getBadRequestError("Cant't restore the vital");
        }
        return restoreResponse;
      }

      const found = await this.findVital(id, request);
      if (!found) {
        this._getBadRequestError('Vital not found');
      }
      if (request.user.id !== found.patient.id) {
        // if this is't owner
        this.checkDecodedUserOnPermission({
          // must be ma at least
          requiredRole: ROLES.MA,
          user: request.user,
        });
        //if this not super admin and has provider role - he has to have the same client
        if (
          !this.checkRoleOnPermission({
            requiredRole: ROLES.SUPER_ADMIN,
            role: request.user.role,
          }) &&
          request?.user?.client.id !== found.patient.client.id
        ) {
          this._getForbiddenError("You don't allow to get vital");
        }
      }
      if (data.patient) {
        // patient required
        const foundPatient = this.patientsService.findPatientById(data.patient);
        if (!foundPatient) {
          this._getBadRequestError("Can't find patient");
        }
      }

      //compare with health goals
      const healthGoals = await this.healthGoalsService.findHealthGoalByPatient(
        data.patient,
      );
      const isAlert = checkIfIsAlert(healthGoals, measurements, found.isAlert);

      const saved = await this.vitalRepository.save({
        id,
        ...data,
        type: getVitalTypeByDeviceType(data.deviceType), //type required
        isAlert,
      });
      const updated = await this.findVital(saved.id, request);

      if (measurements && measurements.length) {
        await Promise.all(
          found.measurements.map((item) =>
            this.measurementsService.deleteMeasurement(item.id),
          ),
        );

        await Promise.all(
          measurements.map((measurement) => {
            return this.measurementsService.createMeasurement({
              vital: updated.id,
              ...measurement,
            });
          }),
        );
      }

      //

      await this.auditService.createApiAudit({
        action: ACTIONS.VITALS_UPDATED,
        payload: data,
        newValues: updated, //must be an object
        prevValues: found,
        entityUserType: request.user.entityType,
        entity: saved.id,
        entityUser: request.user.id,
        entityType: ENTITY.VITAL,
      });
      if (isAlert) {
        await this.notifyIfAbnormal(
          data.patient,
          getVitalTypeByDeviceType(data.deviceType),
        );
      }
      return updated;
    } catch (error) {
      this._getBadRequestError(error.message);
    }
  }
  async findVitals(query: FindVitalQueryDto, request: IExpandRequestObject) {
    try {
      //
      const isPatient = request.user.entityType === ENTITY_USER_TYPE.PATIENT;
      const isProvider = request.user.entityType === ENTITY_USER_TYPE.PROVIDER;
      const qr = this.vitalRepository.createQueryBuilder('vital');
      qr.leftJoinAndSelect('vital.patient', 'patient');
      qr.leftJoinAndSelect('patient.humanName', 'humanName');
      qr.leftJoinAndSelect('vital.measurements', 'measurements');
      qr.leftJoinAndSelect('vital.vitalNote', 'vitalNote');
      qr.leftJoinAndSelect('vitalNote.journalNote', 'journalNote');

      //
      qr.leftJoinAndSelect('journalNote.provider', 'provider');
      qr.leftJoinAndSelect('provider.humanName', 'humanName1');
      //
      if (query.sort) {
        const param = this.buildSortParams<{
          createdAt: string;
          value: string;
          deviceType: string;
          patient: string;
          takenAt: string;
        }>(query.sort); //check if param is one of keys
        if (allowedFieldsToSort.includes(param[0])) {
          if (param[0] === 'createdAt') {
            qr.orderBy('vital.' + param[0], param[1]);
          }
          if (param[0] === 'takenAt') {
            qr.orderBy('vital.' + param[0], param[1]);
          }
          if (param[0] === 'deviceType') {
            qr.orderBy('vital.' + param[0], param[1]);
          }
          if (param[0] === 'value') {
            qr.orderBy('vital.' + param[0], param[1]);
          }
          if (param[0] === 'patient') {
            qr.orderBy('humanName.text', param[1]);
          }
        }
      } else {
        qr.orderBy('vital.takenAt', 'DESC');
      }
      //if this is patient - give only this patient vitals
      if (isPatient) {
        qr.andWhere('patient.id = :id', {
          id: request.user.id,
        });
      }
      //if this is the provider
      if (isProvider) {
        if (
          //if this is not super admin - give only the provider's client patient vitals
          !this.checkRoleOnPermission({
            role: request.user.role,
            requiredRole: ROLES.SUPER_ADMIN,
          })
        ) {
          qr.andWhere('patient.client = :client', {
            client: request.user.client.id,
          });
        }
      }
      if (query.startDate || query.endDate) {
        if (query.startDate) {
          // Set hours, minutes and seconds
          qr.andWhere('vital.takenAt >= :startDate', {
            startDate: query.startDate,
          });
        }
        if (query.endDate) {
          qr.andWhere('vital.takenAt <= :endDate', {
            endDate: query.endDate,
          });
        }
      }
      if (query.name) {
        qr.andWhere('humanName.text ILIKE :text', {
          text: '%' + query.name + '%',
        });
      }
      if (query.deviceType) {
        qr.andWhere('vital.deviceType = :deviceType', {
          deviceType: query.deviceType,
        });
      }
      if (query.type) {
        qr.andWhere('vital.type = :type', {
          type: query.type,
        });
      }

      if (query.onlyDeleted) {
        qr.withDeleted();
        qr.andWhere('vital.deletedAt is not null'); // only deleted
      }

      if (query.isCleared === 'true') {
        qr.andWhere('vital.isCleared = :isCleared', {
          isCleared: true,
        });
      }

      if (query.isCleared === 'false') {
        qr.andWhere('vital.isCleared = :isCleared', {
          isCleared: false,
        });
      }

      if (query.isAlert === 'true') {
        //
        qr.andWhere('vital.isAlert = :isAlert', {
          isAlert: true,
        });
      }

      if (query.patient) {
        qr.andWhere('patient.id = :patient', {
          patient: query.patient,
        });
      }

      return this._paginate<IFullVital>(qr, {
        limit: query.limit || 10,
        page: query.page || 1,
      });
    } catch (err) {
      this._getInternalServerError(err.message);
    }
  }
  async findVitalsReport(
    query: FindVitaReportQueryDto,
    request: IExpandRequestObject,
  ) {
    const isProvider = request.user.entityType === ENTITY_USER_TYPE.PROVIDER;
    if (!isProvider) {
      return this._getForbiddenError('This action is forbidden');
    }
    const qr = this.vitalRepository.createQueryBuilder('report');
    qr.leftJoinAndSelect('report.measurements', 'measurements');
    qr.select([
      'measurements.type',
      'measurements.value',
      'report.deviceType',
      'report.takenAt',
      'report.id',
      'report.type',
    ]);
    qr.leftJoin('report.patient', 'patient');
    qr.leftJoin('patient.client', 'client');
    //
    if (
      this.checkRoleOnPermission({
        requiredRole: ROLES.SUPER_ADMIN,
        role: request.user.role,
      })
    ) {
      if (query.client) {
        qr.andWhere('client.id = :client', {
          client: query.client,
        });
      }
    } else {
      qr.andWhere('client.id = :client', {
        client: request.user.client.id,
      });
    }

    if (query.patient) {
      qr.andWhere('patient.id = :patient', {
        patient: query.patient,
      });
    }

    if (query.deviceType) {
      qr.andWhere('report.deviceType = :deviceType', {
        deviceType: query.deviceType,
      });
    }
    if (query.type) {
      qr.andWhere('report.type = :type', {
        type: query.type,
      });
    }

    if (query.startDate || query.endDate) {
      if (query.startDate) {
        qr.andWhere('report.takenAt >= :startDate', {
          startDate: query.startDate,
        });
      }
      if (query.endDate) {
        qr.andWhere('report.takenAt <= :endDate', {
          endDate: query.endDate,
        });
      }
    }
    if (query.sort) {
      const param = this.buildSortParams<{
        value: string;
        deviceType: string;
        patient: string;
        takenAt: string;
      }>(query.sort); //check if param is one of keys
      if (allowedFieldsToSort.includes(param[0])) {
        if (param[0] === 'takenAt') {
          qr.orderBy('report.' + param[0], param[1]);
        }
        if (param[0] === 'deviceType') {
          qr.orderBy('report.' + param[0], param[1]);
        }
        if (param[0] === 'value') {
          qr.orderBy('report.' + param[0], param[1]);
        }
        if (param[0] === 'patient') {
          qr.orderBy('humanName.text', param[1]);
        }
      }
    } else {
      qr.orderBy('report.takenAt', 'DESC');
    }

    return await qr.getMany();
  }

  async notifyIfAbnormal(patientId: string, vitalType: VITAL_TYPE) {
    //
    const deviceToken = await this.deviceTokensService.findDeviceTokenByPatient(
      {
        patient: patientId,
      },
    );

    const title = 'Contact with your doctor!';
    const body = `Your ${VITAL_TYPE_TITLES[vitalType]} is abnormal!`;
    //
    // const sent = await this.authService.sendNotificationsToDevices(
    //   deviceToken.token,
    //   {
    //     notification: {
    //       title,
    //       body,
    //     },
    //   },
    // );
    // if (sent.successCount) {
    //   await this.notificationsService.createNotification({
    //     patient: patientId,
    //     title,
    //     body,
    //     type: NOTIFICATION_TYPE.ABNORMAL_VITALS,
    //   });
    // }
  }
}
