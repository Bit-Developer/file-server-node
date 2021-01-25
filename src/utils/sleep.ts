import config from '../config/env.config';
import { ConsoleUtil } from './console';

export class SleepUtil {
  static sleep(seconds = 0) {
    const delay = seconds || config.request_delay;
    if (delay && delay > 0) {
      ConsoleUtil.log('sleep for seconds:', delay);
      //sleepNode.sleep(delay);
      this.msleep(delay * 1000);
    }
  }

  static msleep(miliseconds: number) {
    //https://www.npmjs.com/package/sleep
    //When using nodejs 9.3 or higher it's better to use Atomics.wait which doesn't require compiling this C++ module.
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, miliseconds);
  }
}
