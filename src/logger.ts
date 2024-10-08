export class Logger {
  static readonly colorRegex = /\[\d+m/gm;

  constructor(readonly noColor: boolean = false) {}

  log(message: string): void {
    if (!this.noColor) {
      console.log(message);
      return;
    }

    console.log(message.replace(Logger.colorRegex, ''));
  }
}
