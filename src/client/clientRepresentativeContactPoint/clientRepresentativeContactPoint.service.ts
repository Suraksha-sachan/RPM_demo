import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from 'src/abstract';

import { ClientRepresentativeContactPointDto } from '../client.dto';
import { ClientRepresentativeContactPoint } from './clientRepresentativeContactPoint.entity';

@Injectable()
export class ClientRepresentativeContactPointService extends BaseService {
  constructor(
    @InjectRepository(ClientRepresentativeContactPoint)
    private readonly clientRepresentativeContactPointRepository: Repository<ClientRepresentativeContactPoint>,
  ) {
    super();
  }

  async findClientRepresentativeContactPointById(id: string) {
    try {
      const found =
        await this.clientRepresentativeContactPointRepository.findOne({
          where: { id },
        });
      return found;
    } catch (err) {
      return this._getBadRequestError(err.message);
    }
  }

  async createClientRepresentativeContactPoint(
    data: ClientRepresentativeContactPointDto,
  ) {
    try {
      const created =
        await this.clientRepresentativeContactPointRepository.create(data);
      const saved = await this.clientRepresentativeContactPointRepository.save(
        created,
      );
      return saved;
    } catch (error) {
      this._getBadRequestError(error.message);
    }
  }

  async deleteClientPoint(id: string) {
    try {
      const found =
        await this.clientRepresentativeContactPointRepository.findOne({
          where: { id },
        });
      if (!found) {
        return this._getNotFoundError(
          'Client representative contact point name not found',
        );
      }
      await this.clientRepresentativeContactPointRepository.delete(found.id);

      return found;
    } catch (error) {
      this._getBadRequestError(error.message);
    }
  }
}
