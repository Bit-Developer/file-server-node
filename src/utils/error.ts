import { IValidationError } from '../interfaces/validation';
import HttpException from '../middleware/http.exception';
import { ValidationError } from 'class-validator';

export class ErrorUtil {
  static buildError(message: string) {
    const error: IValidationError = {
      location: 'location',
      msg: message,
      param: 'param',
      value: 'value',
    };
    return error;
  }

  static createHttpError(message: string, status = 400) {
    return new HttpException(status, message);
  }
}

export function buildValidationError(location: string, errs: ValidationError[]) {
  const errors: IValidationError[] = [];

  for (let i = 0; i < errs.length; i++) {
    const err = errs[i];

    for (const key in err.constraints) {
      if (key === 'isString') {
        continue;
      }
      if (Object.prototype.hasOwnProperty.call(err.constraints, key)) {
        const msg = err.constraints[key];
        const newError: IValidationError = {
          location: location,
          msg: msg,
          param: err.property,
          value: String(err.value),
        };
        errors.push(newError);
      }
    }
  }

  return errors;
  /*let arr = errors.map((error: ValidationError) => {
        return {
            location: error.property,
            msg: "aaaa",
            param: error.property,
            value: error.value
        };
    });

    return arr;*/
}

export function buildAuthError(msg: string, location = 'body', param = 'param', value = '') {
  const errors: IValidationError[] = [];

  const newError = {
    location: location,
    msg: msg,
    param: param,
    value: value,
  };
  errors.push(newError);

  return errors;
}
