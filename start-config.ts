import fs from 'fs';
import * as dotenvflow from 'dotenv-flow';
import { ConsoleUtil } from './src/utils';

dotenvflow.config({ path: './env/' });

ConsoleUtil.log('config PORT:', process.env.PORT);
ConsoleUtil.log('config ROOT_DIR:', process.env.ROOT_DIR);
ConsoleUtil.log('config WEB_ROOT:', process.env.WEB_ROOT);
ConsoleUtil.log('config REQUEST_DELAY:', process.env.REQUEST_DELAY);
ConsoleUtil.log('config EDIT_MODE:', process.env.EDIT_MODE);

const port = process.env.PORT ?? 5000;
const root_dir = process.env.ROOT_DIR || '.';
const web_root = process.env.WEB_ROOT || '.';
const request_delay = process.env.REQUEST_DELAY || 0; // unit: seconds, 0: no delay
const edit_mode = process.env.EDIT_MODE || 0; // unit: seconds, 0: no delay

// path of the config file
const envConfigFile = `./src/config/env.config.ts`;

// content of the config file
const configContent = `
const config = {
  port: ${port},
  rootDir: '${root_dir}',
  webDir: '${web_root}',
  request_delay: ${request_delay},
  edit_mode: ${edit_mode}
};

export default config;
`;

// write the content to config.json file now
fs.writeFile(envConfigFile, configContent, (err) => {
  if (err) {
    ConsoleUtil.error(err);
  }
  ConsoleUtil.log(`Env config file was generated at ${envConfigFile}`);
});
