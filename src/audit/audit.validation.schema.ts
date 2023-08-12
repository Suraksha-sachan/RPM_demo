import {
  ACTIONS,
  AUDIT_GROUPS,
  AUDIT_STATUS,
  ENTITY,
  ENTITY_USER_TYPE,
} from 'src/types';
import {
  checkIfValidUUID,
  getIsDateValidationSchema,
} from 'src/utils/validation.pipes';
import * as yup from 'yup';
import { Audit } from './audit.entity';

export const auditValidationSchema: {
  [key in keyof Audit]?: yup.AnySchema;
} = {
  action: yup
    .string()
    .oneOf(Object.values(ACTIONS))
    .required('action is required'),
  credentials: yup.string().trim(),
  status: yup.string().oneOf(Object.values(AUDIT_STATUS)),
  params: yup.string(),
  entityType: yup.string().oneOf(Object.values(ENTITY)),
  entity: yup.string().test('id', 'audit id is not uuid', function (value) {
    if (value) {
      return checkIfValidUUID(value);
    }
    return true;
  }),
  entityUserType: yup.string().oneOf(Object.values(ENTITY_USER_TYPE)),
  entityUser: yup.string(),
  newValues: yup.string(),
  prevValues: yup.string(),
  auditGroup: yup
    .string()
    .oneOf([AUDIT_GROUPS.LOGIN])
    .required('action group is required'),
};

export const auditsQueryParamsValidationSchema: {
  [key: string]: yup.AnySchema;
} = {
  page: yup.number().positive(),
  limit: yup.number().positive(),
  auditGroup: yup.string().oneOf(Object.values(AUDIT_GROUPS)),
  startDate: getIsDateValidationSchema(),
  endDate: getIsDateValidationSchema(),
  credentials: yup.string().trim(),
};
