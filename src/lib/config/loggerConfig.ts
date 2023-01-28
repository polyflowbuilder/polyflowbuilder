import util from 'util';
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

function createLoggerConfig(source: string): LoggerOptions {
  return {
    level: 'verbose',
    transports: [new transports.Console()],
    format: format.combine(
      combineMessageAndSplatFormat(),
      format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      format.colorize({
        level: true
      }),
      format.printf((info) => `[${info.level}] [${source}] [${info.timestamp}]: ${info.message}`)
    )
  };
}

export function initLogger(source: string) {
  const loggerConfig = createLoggerConfig(source);
  return createLogger(loggerConfig);
}
