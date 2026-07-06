# pay-api-app

Leegyszerűsített mikroszolgáltatásos minta a 12. fejezethez. Ez a repo az alkalmazáskódot, a Docker buildet és a GitHub Actions CI/release pipeline-t tartalmazza.

## Funkció

Az alkalmazások szándékosan állapotmentesek. A cél nem üzleti teljesség, hanem egy kicsi, de valódi mikroszolgáltatásos példa végigvitele a teljes DevOps láncon.

Szolgáltatások és végpontok:

- `pay-api`
  - `GET /health`
  - `GET /ready`
  - `GET /metrics`
  - `POST /payments/quote`
- `currency-exchange`
  - `GET /health`
  - `GET /ready`
  - `GET /metrics`
  - `GET /exchange-rates/convert`

Példa `POST /payments/quote` kérés:

```json
{
  "amountMinor": 15001,
  "currency": "HUF",
  "outputCurrency": "EUR",
  "installments": 6
}
```

A `pay-api` bármilyen hárombetűs pénznemkódot elfogad, és a kérésben explicit meg kell adni a kimeneti pénznemet is. A konverziót a külön `currency-exchange` mikroszolgáltatás végzi HTTP-hívással.

## Helyi futtatás

```bash
npm install
npm test
npm run build

# 1. terminál
npm run dev:currency-exchange

# 2. terminál
CURRENCY_EXCHANGE_BASE_URL=http://127.0.0.1:3100 npm run dev
```

Példa helyi kérés:

```bash
curl -X POST http://127.0.0.1:3000/payments/quote \
  -H 'content-type: application/json' \
  -d '{"amountMinor":15001,"currency":"USD","outputCurrency":"GBP","installments":6}'
```

Példa közvetlen árfolyamhívás:

```bash
curl "http://127.0.0.1:3100/exchange-rates/convert?from=USD&to=EUR&amountMinor=15001"
```

## GitHub Actions logika

- `ci.yml`: PR és `main` build, type check, teszt, két Docker smoke build
- `release.yml`: a két szolgáltatás image-einek pusholása ECR-be, majd PR nyitás a külön GitOps repóba

## GitHub beállítások

Repository variables:

- `AWS_REGION`
- `AWS_ROLE_ARN`
- `ECR_REPOSITORY`
- `GITOPS_REPOSITORY`
- `GITOPS_VALUES_FILE`

Repository secret:

- `GITOPS_REPO_TOKEN`

GitHub environment:

- `prod`

Az AWS hitelesítés OIDC-n keresztül történik. A workflow nem közvetlenül deployol EKS-re, hanem a `pay-api-gitops` repóban nyit promóciós PR-t.

## További dokumentáció

Az egyetlen, részletes, hallgatóknak szóló útmutató a GitOps repóban található, a `docs/hallgatoi-utmutato.md` fájlban.

Ez az alkalmazásrepó csak a rövid technikai áttekintést és a helyi futtatási példákat tartalmazza.
