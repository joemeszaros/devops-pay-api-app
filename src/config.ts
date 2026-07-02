const DEFAULT_PORT = 3000;
const DEFAULT_HOST = "0.0.0.0";
const DEFAULT_LOG_LEVEL = "info";
const DEFAULT_VERSION = "0.1.0";

function readPort(rawValue: string | undefined): number {
  if (rawValue === undefined) {
    return DEFAULT_PORT;
  }

  const parsed = Number.parseInt(rawValue, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    throw new Error(`Invalid PORT value: ${rawValue}`);
  }

  return parsed;
}

export interface AppConfig {
  host: string;
  port: number;
  logLevel: string;
  version: string;
}

export function loadConfig(): AppConfig {
  return {
    host: process.env.HOST ?? DEFAULT_HOST,
    port: readPort(process.env.PORT),
    logLevel: process.env.LOG_LEVEL ?? DEFAULT_LOG_LEVEL,
    version: process.env.APP_VERSION ?? DEFAULT_VERSION
  };
}
