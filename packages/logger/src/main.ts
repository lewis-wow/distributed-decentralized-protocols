import chalk from 'chalk';
import uniqolor from 'uniqolor';

export class Logger {
  private color: string;

  constructor(private appName: string) {
    this.color = uniqolor(appName).color;
  }

  info(message: string, data?: Record<string, unknown>) {
    this.console(console.log, message, data);
  }

  error(message: string) {
    this.console(console.error, message);
  }

  exception(exception: Error) {
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
