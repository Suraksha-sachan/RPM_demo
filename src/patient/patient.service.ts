import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from 'src/abstract';
import { Patient } from './patient.entity';
import { FindPatientsDto, PatientDto } from './patient.dto';
import { NextFunction, Request, Response } from 'express';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { AssetsService } from 'src/assets/assets.service';
import { PatientAssetsService } from './patientAssets/patientAssets.service';
import {
  ACTIONS,
  ENTITY,
  ENTITY_USER_TYPE,
  IClient,
  IFullPatient,
  IPatient,
  ROLES,
} from 'src/types';
import { REQUEST } from '@nestjs/core';
import { ClientService } from 'src/client/client.service';
import { DecodedUser } from 'src/types';
import { AuditService } from 'src/audit/audit.service';
import { Vital } from 'src/vitals/vitals.entity';
import { IExpandRequestObject } from 'src/types/common';

export const allowedFieldsToSort = [
  'name',
  'dateOfBirth',
  'city',
  'active',
  'client',
  'active',
  'city',
  'state',
];

@Injectable({ scope: Scope.REQUEST })
export class PatientsService extends BaseService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientsRepository: Repository<Patient>,

    @Inject(AssetsService)
    private readonly assetsService: AssetsService,
    @Inject(PatientAssetsService)
    private readonly patientsAssetsService: PatientAssetsService,
    @Inject(ClientService)
    private readonly clientService: ClientService,
    @Inject(AuditService)
    private readonly auditService: AuditService,
    @Inject(REQUEST)
    private readonly request: IExpandRequestObject,
  ) {
    super();
  }
  //done
  async findPatients(query: FindPatientsDto) {
    try {
      //1. if you are not provider or less than MA
      if (
        this.request.user.entityType !== ENTITY_USER_TYPE.PROVIDER ||
        !this.checkRoleOnPermission({
          role: this.request.user.role,
          requiredRole: ROLES.MA,
        })
      ) {
        this._getForbiddenError("You can't get list of patients");
      }

      const qr = this.patientsRepository.createQueryBuilder('patient');
      this.addRelationsToPatient(qr);
      if (query.name) {
        qr.andWhere('humanName.text ILIKE :text', {
          text: '%' + query.name + '%',
        });
      }

      if (query.status) {
        qr.andWhere('patient.active = :active', {
          active: query.status === 'active' ? true : false,
        });
      }

      if (query.city) {
        qr.andWhere('address.city ILIKE :city', {
          city: '%' + query.city + '%',
        });
      }
      if (query.state) {
        qr.andWhere('address.state ILIKE :state', {
          state: '%' + query.state + '%',
        });
      }
      if (query.programName) {
        qr.andWhere('patient.programName ILIKE :name', {
          name: '%' + query.programName + '%',
        });
      }

      if (query.sort) {
        const param = this.buildSortParams<{
          name: string;
          dateOfBirth: string;
          city: string;
          state: string;
          client: string;
          active: boolean;
        }>(query.sort); //check if param is one of keys
        if (allowedFieldsToSort.includes(param[0])) {
          if (param[0] === 'name') {
            qr.orderBy('humanName.text', param[1]);
          }
          if (param[0] === 'state' || param[0] === 'city') {
            qr.orderBy(`address.${param[0]}`, param[1]);
          }
          if (param[0] === 'client') {
            qr.orderBy(`client.title`, param[1]);
          }
          if (param[0] === 'dateOfBirth') {
            qr.orderBy(`patient.dateOfBirth`, param[1]);
          }
          if (param[0] === 'active') {
            qr.orderBy(`patient.active`, param[1]);
          }
        }
      }

      if (
        // use client filter if super admin
        this.checkRoleOnPermission({
          role: this.request.user?.role,
          requiredRole: ROLES.SUPER_ADMIN,
        })
      ) {
        //if you are super admin - you can use client filter
        if (query.client) {
          qr.andWhere('client.id = :client', {
            client: query.client,
          });
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

      if (query.isAlert === 'true') {
        qr.innerJoinAndMapOne(
          'patient.vitalAlert',
          Vital,
          'vital',
          'vital.patient = patient.id AND vital.isCleared = false AND vital.isAlert = true', //difference
        );
      } else {
        qr.leftJoinAndMapOne(
          'patient.vitalAlert',
          Vital,
          'vital',
          'vital.patient = patient.id AND vital.isCleared = false AND vital.isAlert = true', //difference
        );
      }

      return this._paginate<IFullPatient>(qr, {
        limit: query.limit || 10,
        page: query.page || 1,
      });
    } catch (error) {
      this._getInternalServerError(error.message);
    }
  }
  //done
  async findPatientById(id: string) {
    if (id) {
      const isOwner = id === this.getDecodedUser()?.uid;
      const qr = this.patientsRepository.createQueryBuilder('patient');
      this.addRelationsToPatient(qr);
      qr.andWhere('patient.id = :id', { id });

      qr.leftJoinAndMapOne(
        'patient.vitalAlert',
        Vital,
        'vital',
        'vital.patient = patient.id AND vital.isCleared = false',
      );

      const found = await qr.getOne();
      if (!found) {
        this._getNotFoundError('Patient not found');
      }
      const response = found as unknown as IFullPatient;
      //1 if you are owner send response
      if (isOwner) {
        return response;
      }
      //2 if you are super admin response
      if (
        this.checkRoleOnPermission({
          role: this.request.user.role,
          requiredRole: ROLES.SUPER_ADMIN,
        })
      ) {
        return response;
      }
      //3 if you are ma you have to have the same client
      if (
        this.checkRoleOnPermission({
          role: this.request.user.role,
          requiredRole: ROLES.MA,
        }) &&
        this.request.user.client.id === response.client.id
      ) {
        return response;
      }
      this._getBadRequestError("You don't allowed to see this patient");
    }
  }
  addRelationsToPatient(qr) {
    qr.leftJoinAndSelect('patient.address', 'address');
    qr.leftJoinAndSelect('patient.humanName', 'humanName');
    qr.leftJoinAndSelect('patient.patientDevices', 'patientDevices');
    qr.leftJoinAndSelect(
      'patient.patientContactPoints',
      'patientContactPoints',
    ); //patientContactPoints
    qr.leftJoinAndSelect('patientContactPoints.contactPoint', 'contactPoint');
    qr.leftJoinAndSelect('patient.assets', 'assets');
    qr.leftJoinAndSelect('assets.asset', 'asset');
    qr.leftJoinAndSelect('patient.client', 'client');
    return qr;
  }
  async findPatientByPhone(phone: string) {
    if (phone) {
      if (phone !== this.getDecodedUser()?.phone_number) {
        this.checkDecodedUserOnPermission({
          requiredRole: ROLES.SUPER_ADMIN,
          user: this.request?.user,
        });
      }
      const qr = this.patientsRepository.createQueryBuilder('patient');
      this.addRelationsToPatient(qr);
      qr.andWhere('patient.phone = :phone', { phone });

      const found = await qr.getOne();
      return found as unknown as IFullPatient;
    }
  }
  //done
  async createPatient({ assets, ...payload }: Partial<PatientDto>) {
    try {
      //1. if you are not provider - get error
      if (this.request.user.entityType !== ENTITY_USER_TYPE.PROVIDER) {
        this._getForbiddenError("You can't create patient");
      }
      //2. if you les than ma - get error
      this.checkDecodedUserOnPermission({
        user: this.request.user,
        requiredRole: ROLES.MA,
      });

      const found = await this.findPatientByPhone(payload.phone);
      const foundClient = await this.clientService.findClient(payload.client);
      if (found) {
        return this._getBadRequestError(
          'This number already exist in database',
        );
      }
      if (!foundClient) {
        return this._getBadRequestError("can't find the client");
      }

      if (
        // 3. if you are not super admin and you are trying to create patient with client different yours - get an error
        !this.checkRoleOnPermission({
          role: this.request.user.role,
          requiredRole: ROLES.SUPER_ADMIN,
        }) &&
        foundClient.id !== this.request.user.client.id
      ) {
        this._getForbiddenError(
          "You can't create patient with client different yours",
        );
      }

      const created = this.patientsRepository.create({
        ...payload,
      });

      const patient = await this.patientsRepository.save(created);

      return await this.findPatientById(patient.id);
    } catch (error) {
      this._getInternalServerError(error.message);
    }
  }
  //done
  async updatePatient(id: string, { assets, ...payload }: Partial<PatientDto>) {
    //
    if (
      !this.checkRoleOnPermission({
        // only super admin can change client
        role: this.request.user?.role,
        requiredRole: ROLES.SUPER_ADMIN,
      })
    ) {
      if (payload.client !== this.request.user.client.id) {
        this._getForbiddenError("You can't update patient client");
      }
    }
    try {
      //1. if you are not provider - get error
      if (this.request.user.entityType !== ENTITY_USER_TYPE.PROVIDER) {
        this._getForbiddenError("You can't update patient");
      }
      //2. if you les than ma - get error
      this.checkDecodedUserOnPermission({
        user: this.request.user,
        requiredRole: ROLES.MA,
      });

      const found = await this.findPatientById(id);
      const foundClient = await this.clientService.findClient(payload.client);
      ///
      if (
        // 3. if you are not super admin and you are trying to create patient with client different yours - get an error
        !this.checkRoleOnPermission({
          role: this.request.user.role,
          requiredRole: ROLES.SUPER_ADMIN,
        }) &&
        foundClient &&
        foundClient?.id !== this.request.user.client.id
      ) {
        this._getForbiddenError(
          "You can't create patient with client different yours",
        );
      }
      if (!found) {
        return this._getBadRequestError("can't find patient");
      }

      if (!foundClient) {
        return this._getBadRequestError("can't find the client");
      }
      await this.patientsRepository.save({
        id,
        ...payload,
      });

      return await this.findPatientById(id);
    } catch (error) {
      this._getInternalServerError(error.message);
    }
  }
  async getInsuranceMedia(req: Request, res: Response, next: NextFunction) {
    //https://github.com/dvonlehman/s3-proxy/issues/21#issuecomment-718587690
    // req.baseUrl = '/media/profile';
    // //
    // const getProxy = () =>
    //   this.s3Proxy('profile')(req, res, () => {
    //     return next();
    //   });
    // const result = await this.assetsService.findByPath(
    //   req.path.replace(/^\/media\//, ''),
    // );
    // //1. if this is owner
    // if (this.request.user.id === result.patientAssets.patient.id) {
    //   return getProxy();
    // }
    // //2. if this is provider of the same client
    // if (
    //   this.request.user.entityType === ENTITY_USER_TYPE.PROVIDER &&
    //   this.request.user.client.id === result.patientAssets.patient.client.id
    // ) {
    //   return getProxy();
    // }
    // //3. if super admin
    // if (
    //   this.request.user.entityType === ENTITY_USER_TYPE.PROVIDER &&
    //   this.request.user.role === ROLES.SUPER_ADMIN
    // ) {
    //   return getProxy();
    // }

    // return this._getForbiddenError("you can't get assets of this patient");
    //
  }
  getDecodedUser(): DecodedUser | undefined {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const user = this?.request?.user as unknown as DecodedUser;
    return user;
  }
  //done
  async deletePatientAsset(id: string) {
    try {
      await this.assetsService.deleteAssets(id);
    } catch (err: any) {
      this._getInternalServerError(err.message);
    }
  }
  //done
  async deletePatient(id: string) {
    try {
      const found = await this.findPatientById(id);
      if (!found) {
        return this._getBadRequestError("can't find patient");
      }
      //1. if you are not provider - get error
      if (this.request.user.entityType !== ENTITY_USER_TYPE.PROVIDER) {
        this._getForbiddenError("You can't create patient");
      }
      //2. if you les than ma - get error
      this.checkDecodedUserOnPermission({
        user: this.request.user,
        requiredRole: ROLES.MA,
      });

      if (
        // 3. if you are not super admin and you are trying to create patient with client different yours - get an error
        !this.checkRoleOnPermission({
          role: this.request.user.role,
          requiredRole: ROLES.SUPER_ADMIN,
        }) &&
        found.client.id !== this.request.user.client.id
      ) {
        this._getForbiddenError(
          "You can't delete patient with client different yours",
        );
      }
      //
      await this.patientsRepository.delete(id);
      await this.auditService.createApiAudit({
        action: ACTIONS.PATIENT_DELETED,
        payload: {},
        newValues: {}, //must be an object
        prevValues: found,
        entityUserType: this.request.user.entityType,
        entity: found.id,
        entityUser: this.request.user.id,
        entityType: ENTITY.PATIENT,
      });
      return found;
    } catch (err: any) {
      this._getInternalServerError(err.message);
    }
  }
  async checkIfPatientExists(id: string) {
    const found = await this.patientsRepository.findOne({
      where: { id },
      relations: ['client'],
    });
    return found as unknown as IPatient<
      string,
      string,
      string,
      string,
      IClient
    >;
  }
}
