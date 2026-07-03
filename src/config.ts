const DEFAULT_PORT = 3000;
const DEFAULT_HOST = "0.0.0.0";
const DEFAULT_LOG_LEVEL = "info";
const DEFAULT_VERSION = "0.1.0";
const DEFAULT_TELEMETRY_ENABLED = false;
const DEFAULT_CURRENCY_EXCHANGE_BASE_URL = "http://127.0.0.1:3100";

function readBoolean(rawValue: string | undefined, defaultValue: boolean): boolean {
  if (rawValue === undefined) {
    return defaultValue;
  }

  return rawValue.toLowerCase() === "true";
}

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

export interface RuntimeConfig {
  host: string;
  port: number;
  logLevel: string;
  version: string;
  telemetryEnabled: boolean;
  otlpTracesEndpoint: string | undefined;
}

export interface AppConfig extends RuntimeConfig {
  currencyExchangeBaseUrl: string;
}

function loadRuntimeConfig(): RuntimeConfig {
  return {
    host: process.env.HOST ?? DEFAULT_HOST,
    port: readPort(process.env.PORT),
    logLevel: process.env.LOG_LEVEL ?? DEFAULT_LOG_LEVEL,
    version: process.env.APP_VERSION ?? DEFAULT_VERSION,
    telemetryEnabled: readBoolean(process.env.OTEL_ENABLED, DEFAULT_TELEMETRY_ENABLED),
    otlpTracesEndpoint: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT
  };
}

export function loadConfig(): AppConfig {
  return {
    ...loadRuntimeConfig(),
    currencyExchangeBaseUrl:
      process.env.CURRENCY_EXCHANGE_BASE_URL ?? DEFAULT_CURRENCY_EXCHANGE_BASE_URL
  };
}

export function loadCurrencyExchangeConfig(): RuntimeConfig {
  return loadRuntimeConfig();
}
