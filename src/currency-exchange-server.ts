import Fastify, { type FastifyInstance } from "fastify";
import {
  recordCurrencyExchangeConversion,
  recordCurrencyExchangeHttpRequest,
  renderCurrencyExchangeMetrics
} from "./currency-exchange-metrics.js";
import { resolveExchangeRate } from "./currency-exchange-rates.js";

const convertQuerySchema = {
  querystring: {
    type: "object",
    additionalProperties: false,
    required: ["from", "to", "amountMinor"],
    properties: {
      from: { type: "string", pattern: "^[A-Z]{3}$" },
      to: { type: "string", pattern: "^[A-Z]{3}$" },
      amountMinor: { type: "integer", minimum: 1 }
    }
  }
} as const;

interface ConvertQuery {
  from: string;
  to: string;
  amountMinor: number;
}

export interface CreateCurrencyExchangeServerOptions {
  logLevel: string;
  version: string;
}

export function createCurrencyExchangeServer(
  options: CreateCurrencyExchangeServerOptions
): FastifyInstance {
  const server = Fastify({
    logger: {
      level: options.logLevel
    }
  });

  server.addHook("onRequest", async () => {
    recordCurrencyExchangeHttpRequest();
  });

  server.get("/health", async () => ({
    status: "ok"
  }));

  server.get("/ready", async () => ({
    status: "ready",
    version: options.version
  }));

  server.get("/metrics", async (_request, reply) => {
    reply.header("content-type", "text/plain; version=0.0.4");
    return renderCurrencyExchangeMetrics();
  });

  server.get<{ Querystring: ConvertQuery }>(
    "/exchange-rates/convert",
    { schema: convertQuerySchema },
    async (request) => {
      recordCurrencyExchangeConversion();

      const exchangeRate = resolveExchangeRate(request.query.from, request.query.to);
      const targetAmountMinor = Math.round(request.query.amountMinor * exchangeRate);

      return {
        sourceCurrency: request.query.from,
        sourceAmountMinor: request.query.amountMinor,
        targetCurrency: request.query.to,
        targetAmountMinor,
        exchangeRate,
        rateTimestamp: new Date().toISOString(),
        provider: "currency-exchange"
      };
    }
  );

  return server;
}
