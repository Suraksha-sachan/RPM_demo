import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from 'src/abstract';
import { PatientAsset } from './patientAssets.entity';

@Injectable()
export class PatientAssetsService extends BaseService {
  constructor(
    @InjectRepository(PatientAsset)
    private readonly patientAssetRepository: Repository<PatientAsset>,
  ) {
    super();
  }

  async findPatientAssetById(id: string) {
    try {
      return await this.patientAssetRepository.findOne({ where: { id } });
    } catch (error) {
      this._getInternalServerError(error.message);
    }
  }

  async createPatientAsset(data: { patient: string; asset: string }) {
    try {
      const created = this.patientAssetRepository.create(data);
      const saved = await this.patientAssetRepository.save(created);
      return saved;
    } catch (error) {
      this._getInternalServerError(error.message);
    }
  }
}
