import { addressValidationSchema } from 'src/address/address.validation.schema';
import { contactPointValidationSchema } from 'src/contactPoint/contactPoint.validation.schema';
import { humanNameValidationSchema } from 'src/humanName/humanName.validation.schema';
import { checkIfValidUUID } from 'src/utils/validation.pipes';
import * as yup from 'yup';
import { FindClientDto } from './client.dto';
import { Client } from './client.entity';
import { allowedFieldsToSort } from './client.service';

export const clientValidationSchema: {
  [key in keyof Client]?: yup.AnySchema;
} = {
  title: yup.string().trim().required(),
  address: yup.string().test('id', 'address is not uuid', function (value) {
    if (value) {
      return checkIfValidUUID(value);
    }
    return true;
  }),
};

export const findClientValidationSchema: {
  [key in keyof FindClientDto]?: yup.AnySchema;
} = {
  title: yup.string().trim(),
  city: yup.string().trim(),
  state: yup.string().trim(),
  sort: yup.string().test('sort', 'wrong sort param', function (value: string) {
    if (value && !allowedFieldsToSort.includes(value.replace(/^-/, ''))) {
      return false;
    }
    return true;
  }),
  search: yup.string().trim(),
};

export const clientEntitiesValidationSchema = {
  client: yup.object(clientValidationSchema).required(),
  address: yup.object(addressValidationSchema).required(),
  contacts: yup
    .array(
      yup
        .object({
          humanName: yup.object(humanNameValidationSchema).required(),
          contactPoints: yup
            .array(yup.object(contactPointValidationSchema))
            .required(),
        })
        .required(),
    )
    .required(),
};

export const updateClientEntitiesValidationSchema = {
  client: yup.object(clientValidationSchema),
  address: yup.object(addressValidationSchema),
};
