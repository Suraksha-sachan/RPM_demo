import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from 'src/abstract';

import { IHumanName } from 'src/types';
import { HumanName } from './humanName.entity';

@Injectable()
export class HumanNameService extends BaseService {
  constructor(
    @InjectRepository(HumanName)
    private readonly humanNameRepository: Repository<HumanName>,
  ) {
    super();
  }

  async findHumanNameById(id: string) {
    try {
      const found = await this.humanNameRepository.findOne({ where: { id } });
      if (!found) {
        return this._getNotFoundError('contact point not found');
      }
      return found;
    } catch (e) {
      return this._getInternalServerError(e.message);
    }
  }
  async createHumanName(data: Partial<IHumanName>) {
    try {
      const payload: Partial<IHumanName> = { ...data };

      if (!data.text) {
        payload.text = (data?.given + ' ' + data?.family || '').trim();
      }
      const created = await this.humanNameRepository.create(payload);
      const saved = await this.humanNameRepository.save(created);
      return saved;
    } catch (error) {
      this._getBadRequestError(error.message);
    }
  }
  async updateHumanName(id: string, data: Partial<IHumanName>) {
    try {
      const found = await this.humanNameRepository.findOne({ where: { id } });
      if (!found) {
        return this._getNotFoundError('human name not found');
      }
      const payload: Partial<IHumanName> = { id, ...data };

      if (!data.text) {
        payload.text = (data?.given + ' ' + data?.family || '').trim();
      }
      const saved = await this.humanNameRepository.save(payload);
      return saved;
    } catch (error) {
      this._getBadRequestError(error.message);
    }
  }
  async deleteHumanName(id: string) {
    try {
      const found = await this.humanNameRepository.findOne({ where: { id } });
      if (!found) {
        return this._getNotFoundError('human name not found');
      }
      await this.humanNameRepository.delete(found.id);

      return found;
    } catch (error) {
      this._getBadRequestError(error.message);
    }
  }
}
