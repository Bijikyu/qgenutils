declare module '@bijikyu/qerrors' {
  export function qerrors(err: Error, functionName: string, context?: string): void;
}
