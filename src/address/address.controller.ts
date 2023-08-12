import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  getValidationSchema,
  UuIdValidationPipe,
  YupValidationPipe,
} from 'src/utils/validation.pipes';
import { AddressService } from './address.service';
import {
  addressValidationSchema,
  zipCodeParamsValidationSchema,
} from './address.validation.schema';
import { Address } from './address.entity';
import { AddressDTO, FindZipCodeQueryDto } from './address.dto';

@Controller('addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}
  @Post('/')
  @ApiOperation({ summary: 'Create address' })
  @ApiResponse({
    status: 201,
    description: 'Address',
    type: Address,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  async createAudit(
    @Body(new YupValidationPipe(getValidationSchema(addressValidationSchema)))
    data: AddressDTO,
  ) {
    return await this.addressService.createAddress(data);
  }

  @Get('/zip-codes')
  @ApiOperation({ summary: 'Find by zip code' })
  @ApiResponse({
    status: 200,
    description: 'Found places',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @ApiResponse({
    status: 404,
    description: 'not found',
  })
  async findZipCodes(
    @Query(
      new YupValidationPipe(getValidationSchema(zipCodeParamsValidationSchema)),
    )
    query: FindZipCodeQueryDto,
  ) {
    return await this.addressService.findZipCodes(Number(query.zipCode));
  }

  @Get('/states')
  @ApiOperation({ summary: 'Find states' })
  @ApiResponse({
    status: 200,
    description: 'Found states',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @ApiResponse({
    status: 404,
    description: 'not found',
  })
  async findStates() {
    return await this.addressService.findStates();
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Find address' })
  @ApiResponse({
    status: 200,
    description: 'Found address',
    type: Address,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @ApiResponse({
    status: 404,
    description: 'not found',
  })
  async findAddress(
    @Param(
      'id',
      new UuIdValidationPipe({ id: 'contact point id is not valid' }),
    )
    id: string,
  ) {
    return await this.addressService.findAddressById(id);
  }
}
