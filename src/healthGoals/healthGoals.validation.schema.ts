import { MEASUREMENT_TYPE } from 'src/types';
import * as yup from 'yup';

export const healthGoalsValidationSchema = yup
  .array(
    yup.object({
      borderLineMin: yup.number().required(),
      normalMinThreshold: yup.number().required(),
      normalHight: yup.number().required(),
      borderlineHight: yup.number().required(),
      circumstances: yup.string(),
      measurementType: yup
        .string()
        .oneOf(Object.values(MEASUREMENT_TYPE))
        .required(),
    }),
  )
  .test('unique', "measurement type shouldn't repeat", function (list) {
    const set = new Set(
      list?.map((item) => item.measurementType + '-' + item.circumstances),
    );
    const isUniq = list?.length === set.size;
    if (!isUniq) {
      list?.forEach((element, key) => {
        if (set.has(element.measurementType)) {
          throw this.createError({
            path: `${this.path}[${key}].type`,
          });
        }
      });
    }
    return true;
  })
  .required();
