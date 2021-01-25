export class ConsoleUtil {
  static log(message?: any, ...params: any[]) {
    if (params.length == 0) {
      console.log(message); // eslint-disable-line no-console
    } else {
      console.log(message, params.join()); // eslint-disable-line no-console
    }
  }

  static debug(message: any) {
    console.debug(message); // eslint-disable-line no-console, no-restricted-syntax
  }

  static info(message: any) {
    console.info(message); // eslint-disable-line no-console, no-restricted-syntax
  }

  static warn(message: any) {
    console.warn(message); // eslint-disable-line no-console
  }

  static error(message: any) {
    console.error(message); // eslint-disable-line no-console
  }
}
