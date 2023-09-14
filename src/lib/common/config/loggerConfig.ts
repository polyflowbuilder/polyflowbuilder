import util from 'util';
import { format, createLogger, transports } from 'winston';
import type { LoggerOptions } from 'winston';

// see https://github.com/winstonjs/winston/issues/1427#issuecomment-811184784
const combineMessageAndSplatFormat = format((info) => {
  //combine message and args if any
  info.message = util.formatWithOptions(
    { colors: true },
    info.message,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    ...(info[Symbol.for('splat')] || [])
  );
  return info;
});

function createLoggerConfig(source: string): LoggerOptions {
  return {
    level: 'verbose',
    transports: [new transports.Console()],
    format: format.combine(
      combineMessageAndSplatFormat(),
      format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      ...(process.env.NODE_ENV === 'production'
        ? [format.uncolorize()]
        : [
            format.colorize({
              level: true
            })
          ]),
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
