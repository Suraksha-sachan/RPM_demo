import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from 'src/abstract';

import { ContactPoint } from './contactPoint.entity';
import { IContactPoint } from 'src/types';

@Injectable()
export class ContactPointService extends BaseService {
  constructor(
    @InjectRepository(ContactPoint)
    private readonly contactPointRepository: Repository<ContactPoint>,
  ) {
    super();
  }

  async findContactPointById(id: string) {
    const found = await this.contactPointRepository.findOne({ where: { id } });
    if (!found) {
      return this._getNotFoundError('contact point not found');
    }
    return found;
  }
  async createContactPoint(data: Partial<IContactPoint>) {
    try {
      const created = await this.contactPointRepository.create(data);
      const saved = await this.contactPointRepository.save(created);
      return saved;
    } catch (error) {
      this._getBadRequestError(error.message);
    }
  }
  async deleteContactPoint(id: string) {
    try {
      const found = await this.contactPointRepository.findOne({
        where: { id },
      });
      if (!found) {
        return this._getNotFoundError('contact point not found');
      }
      await this.contactPointRepository.delete(id);
      return found;
    } catch (err) {
      return this._getInternalServerError(err.message);
    }
  }
}
