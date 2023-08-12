import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from 'src/abstract';
import { PatientContactPoint } from './patientContactPoint.entity';
import { DEVICE_TYPE } from 'src/types';

@Injectable()
export class PatientContactPointService extends BaseService {
  constructor(
    @InjectRepository(PatientContactPoint)
    private readonly patientRepository: Repository<PatientContactPoint>,
  ) {
    super();
  }

  async findPatientContactPointById(id: string) {
    try {
      const found = await this.patientRepository.findOne({
        where: { id },
      });
      return found;
    } catch (err) {
      return this._getBadRequestError(err.message);
    }
  }

  async createPatientContactPoint(data: {
    patient: string;
    contactPoint: string;
    device?: DEVICE_TYPE;
  }) {
    try {
      const created = await this.patientRepository.create(data);
      const saved = await this.patientRepository.save(created);
      return saved;
    } catch (error) {
      this._getBadRequestError(error.message);
    }
  }

  async deletePatientContactPoint(id: string) {
    try {
      const found = await this.patientRepository.findOne({
        where: { id },
      });
      if (!found) {
        return this._getNotFoundError(
          'Client representative contact point name not found',
        );
      }
      await this.patientRepository.delete(found.id);

      return found;
    } catch (error) {
      this._getBadRequestError(error.message);
    }
  }
}
