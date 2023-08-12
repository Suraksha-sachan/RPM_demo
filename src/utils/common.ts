import { transform, isEqual, isArray, isObject, compact } from 'lodash';
import { parse, isDate } from 'date-fns';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import imageExtensionsList from 'image-extensions';

import {
  DEVICE_TYPE,
  IHealthGoal,
  IMeasurement,
  ROLES,
  USER_ROLES_BY_ACCESS_LEVEL,
  VITAL_TYPE,
} from 'src/types';
//https://davidwells.io/snippets/get-difference-between-two-objects-javascript
/**
 * Find difference between two objects
 * @param  {object} origObj - Source object to compare newObj against
 * @param  {object} newObj  - New object with potential changes
 * @return {object} differences
 */
export function difference(
  origObj,
  newObj,
  selectorByKey?: (key: string | number | symbol) => boolean,
) {
  function changes(newObj, origObj) {
    let arrayIndexCounter = 0;
    return transform(newObj, function (result, value, key) {
      if (!isEqual(value, origObj[key])) {
        const resultKey = isArray(origObj) ? arrayIndexCounter++ : key;
        if (selectorByKey && selectorByKey(resultKey)) {
          result[resultKey] =
            isObject(value) && isObject(origObj[key])
              ? changes(value, origObj[key])
              : value;
        }
        if (!selectorByKey) {
          result[resultKey] =
            isObject(value) && isObject(origObj[key])
              ? changes(value, origObj[key])
              : value;
        }
      }
    });
  }
  return changes(newObj, origObj);
}

export function getRootRoleAccessLevel(roles: ROLES[] = []) {
  return compact(roles).reduce((result, role) => {
    const priority = USER_ROLES_BY_ACCESS_LEVEL[role];

    if (result < priority) {
      return priority;
    }
    return result;
  }, 0);
}

export function parseDateString(value, originalValue) {
  const parsedDate = isDate(originalValue)
    ? originalValue
    : parse(originalValue, 'yyyy-MM-dd', new Date());

  return parsedDate;
}

export function isImageSrc(file: string): boolean {
  if (typeof file === 'string' && file.length) {
    const fileExtension = file.toLowerCase().split('.').pop();
    return imageExtensionsList?.includes(fileExtension || '');
  }
  return false;
}

export function getVitalTypeByDeviceType(deviceType: DEVICE_TYPE): VITAL_TYPE {
  if (
    deviceType === DEVICE_TYPE.DEVICE_BP ||
    deviceType === DEVICE_TYPE.DEVICE_BP_CELLULAR
  ) {
    return VITAL_TYPE.BLOOD_PRESSURE;
  }
  if (
    deviceType === DEVICE_TYPE.DEVICE_GL ||
    deviceType === DEVICE_TYPE.DEVICE_GL_CELLULAR
  ) {
    return VITAL_TYPE.GLUCOSE;
  }

  if (
    deviceType === DEVICE_TYPE.DEVICE_PO ||
    deviceType === DEVICE_TYPE.DEVICE_PO_CELLULAR
  ) {
    return VITAL_TYPE.OXYGEN_SATURATION;
  }

  if (
    deviceType === DEVICE_TYPE.DEVICE_SC ||
    deviceType === DEVICE_TYPE.DEVICE_SC_CELLULAR
  ) {
    return VITAL_TYPE.WEIGHT;
  }
  if (
    deviceType === DEVICE_TYPE.DEVICE_T ||
    deviceType === DEVICE_TYPE.DEVICE_T_CELLULAR
  ) {
    return VITAL_TYPE.TEMPERATURE;
  }
}

export function checkIfIsAlert(
  healthGoals: IHealthGoal[] | undefined,
  measurements: Partial<IMeasurement>[] | undefined,
  prevValue = false,
) {
  let isAlert = prevValue;
  if (healthGoals?.length && measurements?.length) {
    measurements.forEach((measurement) => {
      const healthGoal = healthGoals.find(
        (i) => i?.measurementType === measurement?.type,
      );
      if (
        Number(healthGoal?.borderLineMin) >= Number(measurement?.value) || //lower than min borderline
        Number(healthGoal?.borderlineHight) <= Number(measurement?.value) //or higher than max borderline
      ) {
        isAlert = true;
      }
    });
  }
  return isAlert;
}
