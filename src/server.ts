import fs from 'fs';
import path from 'path';

import appRoot from 'app-root-path';

import App from './app';

const uploadDirectory = path.resolve(`${appRoot.path}`, `uploads`);
fs.existsSync(uploadDirectory) || fs.mkdirSync(uploadDirectory);

const app = new App();

app.listen();
