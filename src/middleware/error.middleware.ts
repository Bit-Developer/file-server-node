import { Request, Response, NextFunction } from 'express';
import HttpException from './http.exception';
import winston from '../config/winston-config-rotate';
import { combinedFormat, writeError } from '../config/winston-config-rotate';

import { HTTP_STATUS_CODE } from '../models';
import { MessageUtil } from '../utils/message';

function errorMiddleware(error: HttpException, request: Request, response: Response, next: NextFunction) {
  const status = error.status || 500;
  const message = error.message || 'Something went wrong';

  winston.error(combinedFormat(error, request, response));
  writeError(error, request, response);
  if (status == HTTP_STATUS_CODE.Validation_Error) {
    response.status(HTTP_STATUS_CODE.Validation_Error).send({
      errors: error.errors,
    });
  } else {
    /* response.status(status).send({
      status,
      message,
    }); */
    response.status(status).send(MessageUtil.error(message, null));
  }
}

export default errorMiddleware;
