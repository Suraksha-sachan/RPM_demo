import { BaseService } from 'src/abstract';

import { IFullVital, IMeasurement, IVital } from 'src/types';
import { Repository } from 'typeorm';

import { InjectRepository } from '@nestjs/typeorm';
import { Measurement } from './measurement.entity';
import { FindMeasurementQueryDto, MeasurementDto } from './measurement.dto';

export class MeasurementsService extends BaseService {
  constructor(
    @InjectRepository(Measurement)
    private readonly measurementRepository: Repository<Measurement>,
  ) {
    super();
  }

  async findMeasurement(id: string) {
    try {
      const foundVital = (await this.measurementRepository.findOne({
        where: { id },
        relations: ['vital'],
      })) as unknown as IFullVital;

      return foundVital;
    } catch (error) {
      this._getBadRequestError(error.message);
    }
    //
  }
  async deleteMeasurement(id: string) {
    try {
      const foundVital = await this.findMeasurement(id);

      await this.measurementRepository.delete(id);

      return foundVital;
    } catch (error) {
      this._getBadRequestError(error.message);
    }
    //
  }
  async createMeasurement(data: MeasurementDto) {
    try {
      const created = this.measurementRepository.create(data);
      const saved = await this.measurementRepository.save(created);
      const newValues = await this.findMeasurement(saved.id);

      return newValues;
    } catch (error) {
      this._getBadRequestError(error.message);
    }
  }
  async updateMeasurement(id: string, data: MeasurementDto) {
    try {
      const saved = await this.measurementRepository.save({ id, ...data });
      const updated = await this.findMeasurement(saved.id);

      return updated;
    } catch (error) {
      this._getBadRequestError(error.message);
    }
  }
  async findMeasurements(query: FindMeasurementQueryDto) {
    try {
      const qr = this.measurementRepository.createQueryBuilder('measurement');
      qr.leftJoinAndSelect('measurement.vital', 'vital');
      return this._paginate<IMeasurement<IVital>>(qr, {
        limit: query.limit || 10,
        page: query.page || 1,
      });
    } catch (err) {
      this._getInternalServerError(err.message);
    }
  }
}
