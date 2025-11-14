import winston from 'winston';
import { config } from '../config/env';

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(logColors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}${
      info.error ? `\n${info.error}` : ''
    }${
      Object.keys(info).filter(key => !['timestamp', 'level', 'message', 'error'].includes(key)).length > 0
        ? `\n${JSON.stringify(
            Object.fromEntries(
              Object.entries(info).filter(([key]) => !['timestamp', 'level', 'message', 'error'].includes(key))
            ),
            null,
            2
          )}`
        : ''
    }`
  )
);

const transports = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),
  new winston.transports.File({ filename: 'logs/combined.log' }),
];

export const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  levels: logLevels,
  format,
  transports,
});

// Stream for Morgan HTTP logger
export const morganStream = {
  write: (message: string): void => {
    logger.http(message.trim());
  },
};
