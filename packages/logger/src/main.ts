import chalk from 'chalk';
import uniqolor from 'uniqolor';

export enum LogLevel {
  INFO,
  ERROR,
  EXCEPTION,
  NONE,
}

export type LoggerOptions = {
  logLevel?: LogLevel;
};

export class Logger {
  private color: string;

  private opts: Required<LoggerOptions> = {
    logLevel: LogLevel.INFO,
  };

  constructor(
    private appName: string,
    opts?: LoggerOptions,
  ) {
    this.color = uniqolor(appName).color;
    Object.assign(this.opts, opts);
  }

  info(message: string, data?: Record<string, unknown>) {
    if (this.opts.logLevel.valueOf() > LogLevel.INFO) {
      return;
    }

    this.console(console.log, message, data);
  }

  error(message: string) {
    if (this.opts.logLevel.valueOf() > LogLevel.ERROR) {
      return;
    }

    this.console(console.error, message);
  }

  exception(exception: Error) {
    if (this.opts.logLevel.valueOf() > LogLevel.EXCEPTION) {
      return;
    }

    this.console(
      console.error,
      `${chalk.red('Exception:')} ${exception.message}`,
      exception.stack,
    );
  }

  private console(method: (...data: any[]) => void, ...data: any[]): void {
    method(`[${chalk.hex(this.color)(this.appName)}]`, ...data.filter(Boolean));
  }
}
