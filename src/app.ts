import path from 'path';
import * as bodyParser from 'body-parser';
import favicon from 'serve-favicon';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { LoggerStream } from './config/winston-config-rotate';
import express from 'express';
import listEndpoints from 'express-list-endpoints';
import { ConsoleUtil } from './utils';

import config from './config/env.config';

import errorMiddleware from './middleware/error.middleware';
import routers from './routers';

class App {
  public app;

  constructor() {
    this.app = express();

    this.initializeConfig();
    this.initializeMiddlewares();
    this.initializeResponseHeader();
    this.initializeRouters();
    this.initializeErrorHandling();
  }

  public listen() {
    this.app.listen(config.port, () => {
      ConsoleUtil.log(
        `App is listening on port ${config.port}, open your browser on http://localhost:${config.port}/ `,
      );
    });
  }

  private initializeConfig() {
    ConsoleUtil.log('initializeConfig...');
    ConsoleUtil.log(config);
  }
  private initializeMiddlewares() {
    // logging
    this.app.use(morgan('short'));
    this.app.use(morgan('combined', { stream: new LoggerStream() }));

    this.app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
    this.app.use(cookieParser());
    // configure app to use bodyParser(), this will let us get the data from a POST
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
  }

  private initializeResponseHeader() {
    this.app.use(function (req, res, next) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,PATCH,DELETE');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('preflightContinue', 'false');
      next();
    });
  }

  private initializeRouters() {
    ConsoleUtil.log('initializeRouters...');
    // Use the root routes when path starts with /api
    this.app.use('/api', routers);
    // serve static files
    this.app.use('/static', express.static(config.rootDir));
    // serve angular frontend
    this.app.use(express.static(config.webDir));

    // fix 404 error after refresh page built with angular,
    // see https://stackoverflow.com/questions/54715105/getting-404-page-on-page-refresh-using-node-and-angular-ap
    this.app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../../www/index.html'));
    });
    ConsoleUtil.log(listEndpoints(this.app));
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }
}

export default App;
