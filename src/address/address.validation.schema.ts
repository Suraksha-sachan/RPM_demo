import { IAddress, IZipCode } from 'src/types';
import * as yup from 'yup';

export const addressValidationSchema: {
  [key in keyof IAddress]?: yup.AnySchema;
} = {
  text: yup.string().trim(),
  line: yup.string().trim().required(),
  city: yup.string().trim().required(),
  state: yup.string().trim().required(),
  postalCode: yup.string().trim().required(),
};

export const zipCodeParamsValidationSchema: {
  [key in keyof IZipCode]?: yup.AnySchema;
} = {
  zipCode: yup.string().trim().required(),
};
