import { INotification, NOTIFICATION_TYPE } from 'src/types';
import * as yup from 'yup';
import { allowedFieldsToSort } from './notifications.service';

export const notificationValidationSchema: {
  [key in keyof INotification]?: yup.AnySchema;
} = {
  patient: yup.string().required(),
  type: yup.string().oneOf(Object.values(NOTIFICATION_TYPE)),
  title: yup.string().max(100).required(),
  body: yup.string().max(500).required(),
};

export const findNotificationValidationSchema: {
  [key: string]: yup.AnySchema;
} = {
  patient: yup.string(),
  type: yup.string().oneOf(Object.values(NOTIFICATION_TYPE)),
  sort: yup.string().test('sort', 'wrong sort param', function (value: string) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    if (value && !allowedFieldsToSort.includes(value.replace(/^-/, ''))) {
      return false;
    }
    return true;
  }),
};
