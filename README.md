# pay-api-app

Leegyszerűsített `pay-api` mintaalkalmazás a 12. fejezethez. Ez a repo az alkalmazáskódot, a Docker buildet és a GitHub Actions CI/release pipeline-t tartalmazza.

## Funkció

Az alkalmazás szándékosan állapotmentes. A cél nem üzleti teljesség, hanem egy kicsi, de valódi REST API végigvitele a teljes DevOps láncon.

Végpontok:

- `GET /health`
- `GET /ready`
- `GET /metrics`
- `POST /payments/quote`

Példa `POST /payments/quote` kérés:

```json
{
  "amountMinor": 15001,
  "currency": "HUF",
  "installments": 6
}
```

## Helyi futtatás

```bash
npm install
npm test
npm run build
npm run dev
```

## GitHub Actions logika

- `ci.yml`: PR és `main` build, type check, teszt, Docker smoke build
- `release.yml`: image push ECR-be, majd PR nyitás a külön GitOps repóba

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

## Következő lépés

A GitHub oldali bekötés lépésenként itt van: [docs/github-setup.md](docs/github-setup.md)
