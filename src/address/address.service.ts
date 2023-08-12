import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from 'src/abstract';

import { IAddress } from 'src/types';
import { Address } from './address.entity';
import { ZipCode } from './zipCode.entity';

@Injectable()
export class AddressService extends BaseService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(ZipCode)
    private readonly zipCodesRepository: Repository<ZipCode>,
  ) {
    super();
  }

  async findAddressById(id: string) {
    const found = await this.addressRepository.findOne({ where: { id } });
    if (!found) {
      return this._getNotFoundError('contact point not found');
    }
    return found;
  }
  async createAddress(data: Partial<IAddress>) {
    try {
      let text = data.text || '';
      if (!data.text) {
        if (data.state) {
          text = text ? text + ', ' + data.state : data.state;
        }
        if (data.city) {
          text = text ? text + ', ' + data.city : data.city;
        }
        if (data.line) {
          text = text ? text + ', ' + data.line : data.line;
        }
        if (data.postalCode) {
          text = text ? text + ', ' + data.postalCode : data.postalCode;
        }
      }
      const created = await this.addressRepository.create({ ...data, text });
      const saved = await this.addressRepository.save(created);
      return saved;
    } catch (error) {
      this._getBadRequestError(error.message);
    }
  }

  async updateAddress(id: string, data: Partial<IAddress>) {
    try {
      const found = this.findAddressById(id);
      if (!found) {
        return this._getBadRequestError('address not found');
      }

      let text = data.text || '';
      if (!data.text) {
        if (data.state) {
          text = text ? text + ', ' + data.state : data.state;
        }
        if (data.city) {
          text = text ? text + ', ' + data.city : data.city;
        }
        if (data.line) {
          text = text ? text + ', ' + data.line : data.line;
        }
        if (data.postalCode) {
          text = text ? text + ', ' + data.postalCode : data.postalCode;
        }
      }

      const saved = await this.addressRepository.save({ id, ...data, text });
      return saved;
    } catch (error) {
      this._getBadRequestError(error.message);
    }
  }
  async deleteAddress(id: string) {
    try {
      const found = this.findAddressById(id);
      if (!found) {
        return this._getBadRequestError('address not found');
      }
      await this.addressRepository.delete({ id });
      return found;
    } catch (error) {
      this._getBadRequestError(error.message);
    }
  }
  async findStates() {
    const qr = this.addressRepository.createQueryBuilder('address');
    qr.select('state');
    qr.groupBy('state');
    return (await qr.getRawMany()).map((item) => item.state);
  }
  async findZipCodes(zipCode: number) {
    try {
      const result = await this.zipCodesRepository.find({
        where: { zipCode },
      });
      return result;
    } catch (err) {
      return this._getBadRequestError(err.message);
    }
  }
}
