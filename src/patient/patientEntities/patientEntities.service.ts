import { Inject, Injectable, Scope } from '@nestjs/common';

import { BaseService } from 'src/abstract';
import {
  ACTIONS,
  DecodedUser,
  ENTITY,
  ENTITY_USER_TYPE,
  IAsset,
  IContactPoint,
  IFullPatient,
  IPatient,
  IPatientAsset,
  IPatientContactPoint,
  IPatientDevice,
  ROLES,
} from 'src/types';
import { AuditService } from 'src/audit/audit.service';

import { ContactPointService } from 'src/contactPoint/contactPoint.service';
import { HumanNameService } from 'src/humanName/humanName.service';

import { PatientsService } from '../patient.service';
import { PatientContactPointService } from '../patientContactPoint/patientContactPoint.service';
import { PatientEntitiesDto } from '../patient.dto';
import { Patient } from '../patient.entity';
import { AddressService } from 'src/address/address.service';
import { PatientDevicesService } from '../patientDevices/patientAssets.service';
import { REQUEST } from '@nestjs/core';

@Injectable({ scope: Scope.REQUEST })
export class PatientEntitiesService extends BaseService {
  constructor(
    @Inject(AuditService)
    private readonly auditService: AuditService,
    @Inject(PatientsService)
    private readonly patientsService: PatientsService,
    @Inject(REQUEST) private readonly request: Request & { user?: DecodedUser },

    @Inject(PatientDevicesService)
    private readonly patientDevicesService: PatientDevicesService,
    @Inject(ContactPointService)
    private readonly contactPointService: ContactPointService,
    @Inject(HumanNameService)
    private readonly humanNameService: HumanNameService,
    @Inject(AddressService)
    private readonly addressService: AddressService,
    @Inject(PatientContactPointService)
    private readonly patientContactPointService: PatientContactPointService,
  ) {
    super();
  }

  // async createPatientEntities(
  //   { patientContactPoints, patientDevices, ...data }: PatientEntitiesDto,
  //   files: Express.Multer.File[],
  // ) {
  //   this.checkDecodedUserOnPermission({
  //     requiredRole: ROLES.SUPER_ADMIN,
  //     user: this.request?.user,
  //   });

  //   const address = await this.addressService.createAddress(data.address);
  //   const humanName = await this.humanNameService.createHumanName(
  //     data.humanName,
  //   );

  //   const patient = await this.patientsService.createPatient({
  //     ...data,
  //     humanName: humanName.id,
  //     address: address.id,
  //   });
  //   if (!patient) {
  //     this._getInternalServerError("Can't create patient");
  //   }

  //   const createdPatient = patient as unknown as Patient;
  //   await this.patientsService.uploadPatientAssets(files, createdPatient.id);
  //   await this.createPatientsContacts(createdPatient.id, patientContactPoints);

  //   await this.createPatientDevices(createdPatient.id, patientDevices);

  //   const newValues = await this.patientsService.findPatientById(
  //     createdPatient.id,
  //   );

  //   if (newValues && patient) {
  //     await this.auditService.createApiAudit({
  //       action: ACTIONS.PATIENT_CREATED,
  //       payload: data,
  //       newValues: newValues || {}, //must be an object
  //       prevValues: {},
  //       entityUserType: ENTITY_USER_TYPE.PROVIDER,
  //       entity: patient.id,
  //       entityUser: this.patientsService.getDecodedUser().uid,
  //       entityType: ENTITY.PATIENT,
  //     });
  //   }

  //   return newValues;
  // }

  // async updatePatientEntities(
  //   id: string,
  //   payload: PatientEntitiesDto,
  //   files: Express.Multer.File[],
  // ) {
  //   const {
  //     patientContactPoints,
  //     humanName,
  //     address,
  //     assets = [],
  //     patientDevices,
  //     ...data
  //   } = payload;
  //   const user = this.patientsService.getDecodedUser();
  //   const foundPatient = await this.patientsService.findPatientById(id);
  //   const isOwner = user.uid === id;

  //   if (!isOwner) {
  //     if (
  //       //this must be ma the same client
  //       user.client.id !== foundPatient.client.id &&
  //       !this.checkRoleOnPermission({
  //         requiredRole: ROLES.SUPER_ADMIN,
  //         role: user.role,
  //       })
  //     ) {
  //       return this._getBadRequestError(
  //         'You do not allowed for updating this patient',
  //       );
  //     }
  //   }

  //   const patientData: Omit<
  //     Partial<PatientEntitiesDto>,
  //     | 'humanName'
  //     | 'patientContactPoints'
  //     | 'address'
  //     | 'assets'
  //     | 'patientDevices'
  //   > = { ...data };

  //   const updatedPatient = await this.patientsService.updatePatient(
  //     id,
  //     patientData,
  //   );
  //   if (!foundPatient) {
  //     return this._getNotFoundError('patient not found');
  //   }

  //   if (humanName) {
  //     await this.humanNameService.updateHumanName(
  //       foundPatient.humanName.id,
  //       humanName,
  //     );
  //   }

  //   if (patientContactPoints) {
  //     if (foundPatient?.patientContactPoints) {
  //       await this.updatePatientContactPoint(
  //         id,
  //         foundPatient.patientContactPoints,
  //         patientContactPoints,
  //       );
  //     }
  //   }

  //   if (address) {
  //     await this.addressService.updateAddress(foundPatient.address.id, address);
  //   }

  //   await this.updateAssets(id, assets, foundPatient.assets, files);
  //   await this.updatePatientDevices(foundPatient, patientDevices);

  //   const newValues = await this.patientsService.findPatientById(id);
  //   if (updatedPatient) {
  //     await this.auditService.createApiAudit({
  //       action: ACTIONS.PATIENT_UPDATED,
  //       payload,
  //       newValues: newValues, //must be an object
  //       prevValues: foundPatient,
  //       entity: id,
  //       entityUserType: ENTITY_USER_TYPE.PROVIDER,
  //       entityUser: this.patientsService.getDecodedUser().uid,
  //       entityType: ENTITY.PATIENT,
  //     });
  //   }

  //   return newValues;
  // }

  // async updateAssets(
  //   id: string,
  //   assets: string[],
  //   prevAssets: IPatientAsset<string, IAsset>[],
  //   files: Express.Multer.File[],
  // ) {
  //   if (Array.isArray(assets)) {
  //     // remove asset if link didn't find in array of assets
  //     // if there is empty array - remove all assets
  //     if (prevAssets.length) {
  //       await Promise.all(
  //         prevAssets.map((item) => {
  //           if (!assets.includes(item.asset.id)) {
  //             return this.patientsService.deletePatientAsset(item.asset.id);
  //           }
  //         }),
  //       );
  //     }
  //   }

  //   await this.patientsService.uploadPatientAssets(files, id);
  // }
  async createPatientsContacts(
    patientId: string,
    contacts: Partial<IContactPoint>[] = [],
  ) {
    return await Promise.all(
      contacts.map(async (item) => {
        const created = await this.contactPointService.createContactPoint(item);
        return await this.patientContactPointService.createPatientContactPoint({
          contactPoint: created.id,
          patient: patientId,
        });
      }),
    );
  }
  async createPatientDevices(
    patientId: string,
    devices: Partial<IPatientDevice>[] = [],
  ) {
    return await Promise.all(
      devices?.map(async (item) => {
        return await this.patientDevicesService.createPatientDevice({
          patient: patientId,
          ...item,
        });
      }),
    );
  }

  async updatePatientDevices(
    patient: IFullPatient,
    devices: Partial<IPatientDevice>[] = [],
  ) {
    if (!devices.length) {
      return;
    }
    await Promise.all(
      patient.patientDevices.map(async (item) => {
        return await this.patientDevicesService.removePatientDevice(item.id);
      }),
    );

    return await Promise.all(
      devices?.map(async (item) => {
        return await this.patientDevicesService.createPatientDevice({
          patient: patient.id,
          ...item,
        });
      }),
    );
  }

  async updatePatientContactPoint(
    id: string,
    prevPatientContactPoints: Partial<
      IPatientContactPoint<IPatient, IContactPoint>
    >[],
    contactPoints: Partial<IContactPoint>[],
  ) {
    await Promise.all(
      //remove all
      prevPatientContactPoints.map((point) =>
        this.contactPointService.deleteContactPoint(point.contactPoint.id),
      ),
    );
    const createdContactPoints = await Promise.all(
      // create contacts
      contactPoints.map((point) =>
        this.contactPointService.createContactPoint(point),
      ),
    );
    await Promise.all(
      //create contact points
      createdContactPoints.map((contactPoint) =>
        this.patientContactPointService.createPatientContactPoint({
          patient: id,
          contactPoint: contactPoint.id,
        }),
      ),
    );
  }

  async deletePatient(id: string) {
    try {
      this.checkDecodedUserOnPermission({
        requiredRole: ROLES.MA,
        user: this.request?.user,
      });
      const found = await this.patientsService.findPatientById(id);
      if (!found) {
        return this._getBadRequestError("can't find patient");
      }
      if (found.humanName.id) {
        await this.humanNameService.deleteHumanName(found.humanName.id);
      }

      if (found.address.id) {
        await this.addressService.deleteAddress(found.address.id);
      }

      if (found.patientContactPoints.length) {
        await Promise.all(
          //remove all
          found.patientContactPoints.map((point) =>
            this.contactPointService.deleteContactPoint(point.contactPoint.id),
          ),
        );
      }

      if (found.assets.length) {
        await Promise.all(
          found.assets.map((patientAsset) => {
            return this.patientsService.deletePatientAsset(
              patientAsset.asset.id,
            );
          }),
        );
      }
      //
      await this.patientsService.deletePatient(id);

      return found;
    } catch (error) {
      this._getInternalServerError(error.message);
    }
  }
}
