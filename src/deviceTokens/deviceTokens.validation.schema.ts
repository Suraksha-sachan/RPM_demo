import { IDeviceToken } from 'src/types';
import * as yup from 'yup';

export const deviceTokenValidationSchema: {
  [key in keyof IDeviceToken]?: yup.AnySchema;
} = {
  patient: yup.string().required(),
  token: yup.string().max(500).required(),
};

export const findDeviceTokensValidationSchema: {
  [key: string]: yup.AnySchema;
} = {
  patient: yup.string(),
};
