import { ReturnObject } from '../interfaces/returnobject.interface';

export class MessageUtil {
  static success(message: string, data: any, status = 'success'): ReturnObject {
    const obj: ReturnObject = {
      status,
      data, // eslint-disable-line @typescript-eslint/no-unsafe-assignment
      message,
    };
    return obj;
  }
  static error(message: string, data: any, status = 'error'): ReturnObject {
    const obj: ReturnObject = {
      status,
      data, // eslint-disable-line @typescript-eslint/no-unsafe-assignment
      message,
    };
    return obj;
  }
}
