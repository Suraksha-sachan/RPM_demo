import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from 'src/abstract';
import { PatientDevice } from './patientAssets.entity';
import { IPatientDevice } from 'src/types';

@Injectable()
export class PatientDevicesService extends BaseService {
  constructor(
    @InjectRepository(PatientDevice)
    private readonly patientDeviceRepository: Repository<PatientDevice>,
  ) {
    super();
  }

  async findPatientDeviceById(id: string) {
    try {
      return await this.patientDeviceRepository.findOne({ where: { id } });
    } catch (error) {
      this._getInternalServerError(error.message);
    }
  }

  async createPatientDevice(patientDevice: Partial<IPatientDevice>) {
    try {
      const created = this.patientDeviceRepository.create(patientDevice);
      const saved = await this.patientDeviceRepository.save(created);
      return saved;
    } catch (error) {
      this._getInternalServerError(error.message);
    }
  }

  async removePatientDevice(id: string) {
    try {
      return await this.patientDeviceRepository.delete(id);
    } catch (error) {
      this._getInternalServerError(error.message);
    }
  }
}
