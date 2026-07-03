import { SpanStatusCode, trace } from "@opentelemetry/api";

export interface CurrencyConversionResult {
  sourceCurrency: string;
  sourceAmountMinor: number;
  targetCurrency: string;
  targetAmountMinor: number;
  exchangeRate: number;
  rateTimestamp: string;
  provider: string;
}

export interface CurrencyExchangeClient {
  convert(input: {
    sourceCurrency: string;
    sourceAmountMinor: number;
    targetCurrency: string;
  }): Promise<CurrencyConversionResult>;
}

interface CreateCurrencyExchangeClientOptions {
  baseUrl: string;
  fetchImplementation?: typeof fetch;
}

export function createCurrencyExchangeClient(
  options: CreateCurrencyExchangeClientOptions
): CurrencyExchangeClient {
  const baseUrl = options.baseUrl.replace(/\/$/, "");
  const fetchImplementation = options.fetchImplementation ?? fetch;
  const tracer = trace.getTracer("pay-api");

  return {
    async convert(input) {
      return tracer.startActiveSpan("currency-exchange.convert", async (span) => {
        try {
          const query = new URLSearchParams({
            from: input.sourceCurrency,
            to: input.targetCurrency,
            amountMinor: input.sourceAmountMinor.toString()
          });

          const response = await fetchImplementation(
            `${baseUrl}/exchange-rates/convert?${query.toString()}`,
            {
              headers: {
                accept: "application/json"
              }
            }
          );

          if (!response.ok) {
            throw new Error(`Currency exchange request failed with status ${response.status}`);
          }

          const body = (await response.json()) as CurrencyConversionResult;

          span.setAttributes({
            "currency-exchange.source_currency": body.sourceCurrency,
            "currency-exchange.target_currency": body.targetCurrency,
            "currency-exchange.exchange_rate": body.exchangeRate
          });

          return body;
        } catch (error) {
          span.recordException(error as Error);
          span.setStatus({
            code: SpanStatusCode.ERROR
          });
          throw error;
        } finally {
          span.end();
        }
      });
    }
  };
}
