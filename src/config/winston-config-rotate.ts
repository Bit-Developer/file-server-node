import path from 'path';
import fs from 'fs';
import { Request, Response } from 'express';

import appRoot from 'app-root-path';
import moment from 'moment';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

import HttpException from '../middleware/http.exception';
import { ConsoleUtil } from '../utils';

// ensure log directory exists
const logDirectory = path.resolve(`${appRoot.path}`, 'logs');
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

const infofile = new DailyRotateFile({
  level: 'info',
  filename: path.resolve(logDirectory, 'application-%DATE%-info.log'),
  datePattern: 'YYYY-MM-DD-HH',
  zippedArchive: false,
  maxSize: '100m',
  maxFiles: '14d', // keep logs for 14 days
});

infofile.on('rotate', function (oldFilename: string, newFilename: string) {
  ConsoleUtil.log(`rotate error log file from [${oldFilename}] to [${newFilename}]`);
});

const errorfile = new DailyRotateFile({
  level: 'error',
  filename: path.resolve(logDirectory, 'application-%DATE%-error.log'),
  datePattern: 'YYYY-MM-DD-HH',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d', // keep logs for 30 days
});

errorfile.on('rotate', function (oldFilename: string, newFilename: string) {
  ConsoleUtil.log(`rotate error log file from [${oldFilename}] to [${newFilename}]`);
});

const logger = winston.createLogger({
  transports: [infofile, errorfile],
});

// create a stream object with a 'write' function that will be used by `morgan`. This stream is based on node.js stream https://nodejs.org/api/stream.html.
//logger.stream = new LoggerStream();
export class LoggerStream {
  write(message: string) {
    logger.info(message);
  }
}

// create a format method for winston, it is similar with 'combined' format in morgan
export function combinedFormat(err: HttpException, req: Request, res: Response): string {
  // :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"
  return `${req.ip} - - [${formatDate()}] "${req.method} ${req.originalUrl} HTTP/${req.httpVersion}" ${
    err.status || 500
  } - ${req.headers['user-agent'] || ''}`;
}

export function writeError(err: HttpException, req: Request, res: Response) {
  ConsoleUtil.error(err.stack);
  logger.error(err.stack);
}

function formatDate(): string {
  // clf format  %d/%b/%Y:%H:%M:%S %z.
  return moment(new Date()).format('DD-MMM-YYYY HH:mm:ss');
}

export default logger;
