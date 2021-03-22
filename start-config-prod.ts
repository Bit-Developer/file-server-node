import fs from 'fs';
import { ConsoleUtil } from './src/utils';

const port = process.env.PORT ?? 5000;
const root_dir = process.env.ROOT_DIR || '.';
const web_root = process.env.WEB_ROOT || '.';
const request_delay = process.env.REQUEST_DELAY || 0; // unit: seconds, 0: no delay
const edit_mode = process.env.EDIT_MODE || "true"; // true: editable, false: read-only

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
