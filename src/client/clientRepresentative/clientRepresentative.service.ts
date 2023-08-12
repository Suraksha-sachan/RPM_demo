import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from 'src/abstract';

import { ClientRepresentativeDto } from '../client.dto';
import { ClientRepresentative } from './clientRepresentative.entity';
import { HumanNameService } from 'src/humanName/humanName.service';

@Injectable()
export class ClientRepresentativeService extends BaseService {
  constructor(
    @InjectRepository(ClientRepresentative)
    private readonly clientRepresentativeRepository: Repository<ClientRepresentative>,
    @Inject(forwardRef(() => HumanNameService))
    private readonly humanNameService: HumanNameService,
  ) {
    super();
  }

  async findClientRepresentativeById(id: string) {
    try {
      const found = await this.clientRepresentativeRepository.findOne({
        where: { id },
      });
      if (!found) {
        return this._getBadRequestError('client representative not found');
      }
      return found;
    } catch (error: any) {
      return this._getInternalServerError(error.message);
    }
  }

  async createClientRepresentative(data: ClientRepresentativeDto) {
    try {
      const created = await this.clientRepresentativeRepository.create(data);
      const saved = await this.clientRepresentativeRepository.save(created);
      return saved;
    } catch (error) {
      this._getBadRequestError(error.message);
    }
  }
  async deleteClientRepresentative(id: string) {
    try {
      const found = await this.clientRepresentativeRepository.findOne({
        where: { id },
      });
      if (!found) {
        return this._getNotFoundError('');
      }
      if (found?.humanName) {
        await this.humanNameService.deleteHumanName(found.humanName);
      }
      await this.clientRepresentativeRepository.delete(id);
      return found;
    } catch (error) {
      this._getBadRequestError(error.message);
    }
  }
}
