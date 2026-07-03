import { loadCurrencyExchangeConfig } from "./config.js";
import { startTelemetry, stopTelemetry } from "./telemetry.js";

async function main(): Promise<void> {
  const config = loadCurrencyExchangeConfig();
  await startTelemetry(config);

  const { createCurrencyExchangeServer } = await import("./currency-exchange-server.js");
  const server = createCurrencyExchangeServer({
    logLevel: config.logLevel,
    version: config.version
  });

  const shutdown = async (signal: string): Promise<void> => {
    server.log.info({ signal }, "Shutting down currency-exchange.");
    await server.close();
    await stopTelemetry();
  };

  process.once("SIGINT", () => {
    void shutdown("SIGINT");
  });

  process.once("SIGTERM", () => {
    void shutdown("SIGTERM");
  });

  try {
    await server.listen({
      host: config.host,
      port: config.port
    });
  } catch (error) {
    server.log.error(error);
    await stopTelemetry();
    process.exitCode = 1;
  }
}

void main();
