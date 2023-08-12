import { addressValidationSchema } from 'src/address/address.validation.schema';
import { contactPointValidationSchema } from 'src/contactPoint/contactPoint.validation.schema';
import { humanNameValidationSchema } from 'src/humanName/humanName.validation.schema';
import { GadgetDeviceType, InsuranceType, IPatient } from 'src/types';
import { parseDateString } from 'src/utils/common';
import { checkIfValidUUID } from 'src/utils/validation.pipes';
import * as yup from 'yup';
import { PatientEntitiesDto } from './patient.dto';
import { allowedFieldsToSort } from './patient.service';

const insuranceList: InsuranceType[] = [
  'medicare',
  'advantage',
  'medicaid',
  'private',
  'self-pay',
];

const deviceTypeList: GadgetDeviceType[] = ['android', 'ios'];

const commonPatientValidationSchema: {
  [key in keyof IPatient]?: yup.AnySchema;
} = {
  dateOfBirth: yup.date().transform(parseDateString).required(),
  healthCondition: yup.string().required(),
  services: yup.string().required(),
  programName: yup.string(),
  device: yup.string().oneOf(deviceTypeList).required(),
  deceased: yup.boolean().required(),
  height: yup.number().required(),
  active: yup.boolean().required(),
  insuranceT: yup.string().oneOf(insuranceList).required(),
  client: yup
    .string()
    .test('id', 'client is not uuid', function (value) {
      if (value) {
        return checkIfValidUUID(value);
      }
      return true;
    })
    .required(),
};

export const patientValidationSchema: {
  [key in keyof IPatient]?: yup.AnySchema;
} = {
  assets: yup
    .mixed()
    .oneOf(
      ['null', ''],
      'if you would like to remove avatar - accepted values are null or empty string',
    ),
  address: yup.string().test('id', 'address is not uuid', function (value) {
    if (value) {
      return checkIfValidUUID(value);
    }
    return true;
  }),
  ...commonPatientValidationSchema,
};

export const patientEntitiesValidationSchema: {
  [key in keyof PatientEntitiesDto]?: yup.AnySchema;
} = {
  humanName: yup.object(humanNameValidationSchema).required(),
  address: yup.object(addressValidationSchema).required(),
  patientContactPoints: yup
    .array(yup.object(contactPointValidationSchema))
    .required(),
  ...commonPatientValidationSchema,
};

export const updatePatientEntitiesValidationSchema: {
  [key in keyof PatientEntitiesDto]?: yup.AnySchema;
} = {
  ...patientEntitiesValidationSchema,
  phone: yup.string(),
};

export const findPatientsValidationSchema = {
  name: yup.string(),
  city: yup.string().trim(),
  state: yup.string().trim(),
  client: yup.string().test('id', 'client is not uuid', function (value) {
    if (value) {
      return checkIfValidUUID(value);
    }
    return true;
  }),
  status: yup.string().trim().oneOf(['active', 'inactive']),
  programName: yup.string().trim(),
  sort: yup.string().test('sort', 'wrong sort param', function (value: string) {
    if (value && !allowedFieldsToSort.includes(value.replace(/^-/, ''))) {
      return false;
    }
    return true;
  }),
  isAlert: yup.string().oneOf(['true']),
};
