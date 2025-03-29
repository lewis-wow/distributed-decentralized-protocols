import { Logger, LogLevel } from '@repo/logger';
import { name } from '../package.json';

export const log = new Logger(name.replace('@repo/', ''), {
  logLevel: LogLevel.INFO,
});
