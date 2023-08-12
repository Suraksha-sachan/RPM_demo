import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { AnySchema } from 'yup';
import * as yup from 'yup';
import { yupToFormErrors } from './yupToFormErrors';

/**
 * @constructor takes @param schema (yup schema)
 * **/

@Injectable()
export class YupValidationPipe implements PipeTransform<any> {
  /**
   *
   * @param schema - yup schema
   */
  constructor(private schema: AnySchema, private isMessage?: boolean) {}
  /**
   *
   * @param value - body value
   * @param metadata - metadata (dto validation schema maybe)
   * @returns value or error
   */
  async transform(value: any) {
    try {
      await this.validate(value);
    } catch (errors: any) {
      const transformed = this.isMessage
        ? { message: errors.message }
        : yupToFormErrors(errors);
      throw new BadRequestException(transformed);
    }
    return value; // this is important to return value
  }
  /**
   *
   * @param value - body value
   * @returns - promise
   */
  private async validate(value: any) {
    return this.schema?.validate(value, { abortEarly: false });
  }
}

/*
 * @param schema - yup schema to validate, by default - gameValidationSchema
 * @returns Yup ObjectSchema
 */
export function getValidationSchema(schema: yup.AnyObject) {
  return yup.object(schema);
}

@Injectable()
export class UuIdValidationPipe implements PipeTransform<any> {
  constructor(private message: any) {}
  /**
   *
   * @param value - body value
   * @param metadata - metadata (dto validation schema maybe)
   * @returns value or error
   */
  transform(value: string) {
    this.validate(value);
    return value; // this is important to return value
  }

  /**
   *
   * @param value - body value
   *
   */
  private validate(value: any) {
    if (!checkIfValidUUID(value)) {
      throw new BadRequestException(this.message);
    }
  }
}

export function checkIfValidUUID(str) {
  const regexExp =
    /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;

  return regexExp.test(str);
}

export function getIsDateValidationSchema() {
  return yup
    .string()
    .test(
      'createdAt',
      'string must be the date format ',
      function (value: string) {
        if (value && !Date.parse(value)) {
          return false;
        }
        return true;
      },
    );
}
