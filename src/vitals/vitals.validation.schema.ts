import {
  CIRCUMSTANCES,
  DEVICE_TYPE,
  MEASUREMENT_TYPE,
  VITAL_TYPE,
} from 'src/types';
import {
  checkIfValidUUID,
  getIsDateValidationSchema,
} from 'src/utils/validation.pipes';
import * as yup from 'yup';
import { VitalNote } from './vitalNotes/vitalNotes.entity';
import { Vital } from './vitals.entity';
import { allowedFieldsToSort } from './vitals.service';

export const vitalValidationSchema: {
  [key in keyof Vital & {
    restore?: boolean;
  }]?: yup.AnySchema;
} = {
  restore: yup.bool(),
  patient: yup.string().when('restore', {
    is: true, // alternatively: (val) => val == true
    then: (schema) => schema,
    otherwise: (schema) => schema.required(),
  }),
  deviceType: yup.string().when('restore', {
    is: true, // alternatively: (val) => val == true
    then: (schema) => schema,
    otherwise: (schema) => schema.oneOf(Object.values(DEVICE_TYPE)).required(),
  }),
  type: yup.string().when('restore', {
    is: true, // alternatively: (val) => val == true
    then: (schema) => schema,
    otherwise: (schema) => schema.oneOf(Object.values(VITAL_TYPE)),
  }),
  isManually: yup.bool(),
  takenAt: yup.string(),
  circumstances: yup.string().oneOf(Object.values(CIRCUMSTANCES)),
  measurements: yup.array().when('restore', {
    is: true, // alternatively: (val) => val == true
    then: (schema) => schema,
    otherwise: (
      schema, // apply validation if restore is false
    ) =>
      schema //check device type
        .when('deviceType', (data: any, schema: any) => {
          if (
            data === DEVICE_TYPE.DEVICE_BP || // if bp - there should be proper measurement type
            data === DEVICE_TYPE.DEVICE_BP_CELLULAR
          ) {
            return schema
              .of(
                yup.object({
                  value: yup.number().required(),
                  type: yup
                    .string()
                    .oneOf([
                      MEASUREMENT_TYPE.BLOOD_PRESSURE_DIA,
                      MEASUREMENT_TYPE.BLOOD_PRESSURE_SYS,
                      MEASUREMENT_TYPE.BLOOD_PRESSURE_HB,
                    ])
                    .required(),
                }),
              )
              .length(3)
              .test('unique', "type shouldn't repeat", function (list) {
                const set = new Set(list?.map((item) => item.type));
                const isUniq = list?.length === set.size;
                if (!isUniq) {
                  list?.forEach((element, key) => {
                    if (set.has(element.type)) {
                      throw this.createError({
                        path: `${this.path}[${key}].type`,
                      });
                    }
                  });
                }
                return true;
              })
              .required();
          }
          if (
            data === DEVICE_TYPE.DEVICE_T ||
            data === DEVICE_TYPE.DEVICE_T_CELLULAR
          ) {
            return schema
              .of(
                yup.object({
                  value: yup.number().required(),
                  type: yup
                    .string()
                    .oneOf(Object.values([MEASUREMENT_TYPE.THERMOMETER_C]))
                    .required(),
                }),
              )
              .length(1)
              .required();
          }
          if (
            data === DEVICE_TYPE.DEVICE_GL ||
            data === DEVICE_TYPE.DEVICE_GL_CELLULAR
          ) {
            return schema
              .of(
                yup.object({
                  value: yup.number().required(),
                  type: yup
                    .string()
                    .oneOf(Object.values([MEASUREMENT_TYPE.BLOOD_GLUCOSE_BG]))
                    .required(),
                }),
              )
              .length(1)
              .required();
          }
          if (
            data === DEVICE_TYPE.DEVICE_PO ||
            data === DEVICE_TYPE.DEVICE_PO_CELLULAR
          ) {
            return schema
              .of(
                yup.object({
                  value: yup.number().required(),
                  type: yup
                    .string()
                    .oneOf(Object.values([MEASUREMENT_TYPE.PULSE_OXIMETER_O]))
                    .required(),
                }),
              )
              .length(1)
              .required();
          }
          if (
            data === DEVICE_TYPE.DEVICE_SC ||
            data === DEVICE_TYPE.DEVICE_SC_CELLULAR
          ) {
            return schema
              .of(
                yup.object({
                  value: yup.number().required(),
                  type: yup
                    .string()
                    .oneOf(Object.values([MEASUREMENT_TYPE.BODY_SCALE]))
                    .required(),
                }),
              )
              .length(1)
              .required();
          }
          return schema;
        })
        .nullable(),
  }),
};

export const vitalsQueryParamsValidationSchema: {
  [key: string]: yup.AnySchema;
} = {
  onlyDeleted: yup.bool(),
  isCleared: yup.string().oneOf(['true', 'false']),
  isAlert: yup.string().oneOf(['true']),
  page: yup.number().positive(),
  limit: yup.number().positive(),
  name: yup.string(),
  startDate: getIsDateValidationSchema(),
  endDate: getIsDateValidationSchema(),
  sort: yup.string().test('sort', 'wrong sort param', function (value: string) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    if (value && !allowedFieldsToSort.includes(value.replace(/^-/, ''))) {
      return false;
    }
    return true;
  }),
};

export const deleteParamsValidationSchema: {
  [key: string]: yup.AnySchema;
} = {
  type: yup.string().oneOf(['soft']),
};

export const vitalsReportQueryParamsValidationSchema: {
  [key: string]: yup.AnySchema;
} = {
  ...vitalsQueryParamsValidationSchema,
  patient: yup.string(),
  client: yup.string(),
};

export const vitalNoteValidationSchema: {
  [key in keyof VitalNote & {
    restore?: boolean;
  }]?: yup.AnySchema;
} = {
  journalNote: yup
    .string()
    .test('id', 'journal note is not uuid', function (value) {
      if (value) {
        return checkIfValidUUID(value);
      }
      return true;
    })
    .required(),
  vital: yup
    .string()
    .test('id', 'vital is not uuid', function (value) {
      if (value) {
        return checkIfValidUUID(value);
      }
      return true;
    })
    .required(),
};
