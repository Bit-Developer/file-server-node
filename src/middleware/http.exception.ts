import { IValidationError } from '../interfaces/validation';

class HttpException extends Error {
  status: number;
  message: string;
  errors: IValidationError[];
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.message = message;
  }

  public getErrors() {
    return this.errors;
  }
  public setErrors(errors: IValidationError[]) {
    this.errors = errors;
  }
}

export default HttpException;
