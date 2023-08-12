import { IHumanName } from 'src/types';
import * as yup from 'yup';

export const humanNameValidationSchema: {
  [key in keyof IHumanName]?: yup.AnySchema;
} = {
  text: yup.string().trim(),
  given: yup.string().trim().required(),
  family: yup.string().trim().required(),
};
