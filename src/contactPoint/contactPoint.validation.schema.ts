import { CONTACT_POINT, IContactPoint } from 'src/types';
import * as yup from 'yup';

export const contactPointValidationSchema: {
  [key in keyof IContactPoint]?: yup.AnySchema;
} = {
  text: yup.string().trim().required(),
  type: yup.string().oneOf(Object.values(CONTACT_POINT)).required(),
};
