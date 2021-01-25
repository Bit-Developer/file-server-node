import { NextFunction } from 'express';
import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import * as express from 'express';
import { buildValidationError } from '../utils';

import { HTTP_STATUS_CODE, REQUEST_PATH } from '../models';
import HttpException from './http.exception';
import { ConsoleUtil } from '../utils';

export function validationMiddleware<T>(type: any, path: REQUEST_PATH = REQUEST_PATH.Body): express.RequestHandler {
  return (req, res, next) => {
    let location = '';
    if (path == REQUEST_PATH.Body) {
      location = 'body';
      validate(plainToClass(type, req.body))
        .then((errors: ValidationError[]) => {
          handleError(errors, location, next);
        })
        .catch((err) => {
          ConsoleUtil.log(err);
        });
    } else if (path == REQUEST_PATH.Params) {
      location = 'params';
      validate(plainToClass(type, req.params))
        .then((errors: ValidationError[]) => {
          handleError(errors, location, next);
        })
        .catch((err) => {
          ConsoleUtil.log(err);
        });
    } else {
      location = 'body';
      validate(plainToClass(type, req.body))
        .then((errors: ValidationError[]) => {
          handleError(errors, location, next);
        })
        .catch((err) => {
          ConsoleUtil.log(err);
        });
    }
  };
}

function handleError(errors: ValidationError[], location: string, next: NextFunction) {
  if (errors.length > 0) {
    const exception = new HttpException(HTTP_STATUS_CODE.Validation_Error, '');
    exception.setErrors(buildValidationError(location, errors));
    next(exception);
    /*
      res
        .status(HTTP_STATUS_CODE.Validation_Error)
        .send({
          errors: 
        })*/
  } else {
    next();
  }
}
