import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from 'src/abstract';

import { Asset } from './assets.entity';
import { IAsset, IFullPatient, IPatientAsset } from 'src/types';
import { S3 } from 'aws-sdk';

export class AssetsService extends BaseService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetsRepository: Repository<Asset>,
  ) {
    super();
  }
  //
  async findByPath(path: string) {
    try {
      const result = (await this.assetsRepository.findOne({
        where: { path },
        relations: [
          'patientAssets',
          'patientAssets.patient',
          'patientAssets.patient.client',
        ],
      })) as unknown as IAsset<IPatientAsset<Partial<IFullPatient>>>;

      return result;
    } catch (err) {
      console.log(err);
      this._getInternalServerError(err.message);
    }
  }
  //
  async findById(id: string) {
    try {
      return await this.assetsRepository.findOne({ where: { id } });
    } catch (err) {
      this._getInternalServerError(err.message);
    }
  }
  async deleteAssets(id: string) {
    try {
      const found = await this.assetsRepository.findOne({ where: { id } });
      if (!found) {
        return this._getBadRequestError("this asset did't find");
      }
      await this._removeFile(found.location);
      await this.assetsRepository.delete(id);
      return found;
    } catch (error) {
      this._getInternalServerError(error.message);
    }
  }
}
