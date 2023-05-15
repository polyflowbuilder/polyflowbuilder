import util from 'util';
import DailyRotateFile from 'winston-daily-rotate-file';
import { format, createLogger, transports } from 'winston';
import type { LoggerOptions } from 'winston';

// see https://github.com/winstonjs/winston/issues/1427#issuecomment-811184784
const combineMessageAndSplatFormat = format((info) => {
  // see https://github.com/Microsoft/TypeScript/issues/24587#issuecomment-460650063
  const splatSymbol = Symbol.for('splat') as unknown as string;
  //combine message and args if any
  info.message = util.formatWithOptions(
    { colors: true },
    info.message,
    ...(info[splatSymbol] || [])
  );
  return info;
});

const dailyLogFileRotationTransport: DailyRotateFile = new DailyRotateFile({
  filename: 'polyflowbuilder-%DATE%.log',
  // NOTE: in prod, will use fallback bc env vars are not loaded early enough in envConfig
  // for LOG_DIRECTORY to be available -- will probably address in the future
  dirname: process.env['LOG_DIRECTORY'] ?? 'logs',
  zippedArchive: true,
  auditFile: 'loghistory.json',
  createSymlink: true
});

function createLoggerConfig(source: string): LoggerOptions {
  return {
    level: 'verbose',
    transports:
      process.env['NODE_ENV'] === 'production'
        ? [dailyLogFileRotationTransport]
        : [new transports.Console()],
    format: format.combine(
      combineMessageAndSplatFormat(),
      format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      format.colorize({
        level: true
      }),
      format.printf((info) => `[${info.level}] [${source}] [${info.timestamp}]: ${info.message}`)
    ),
    handleExceptions: true,
    exitOnError: false
  };
}

export function initLogger(source: string) {
  const loggerConfig = createLoggerConfig(source);
  return createLogger(loggerConfig);
}
