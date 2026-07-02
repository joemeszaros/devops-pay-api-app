# GitHub setup

Ez a repo helyben már kész, de a GitHub oldali automatizmusokhoz a következőket kell beállítani.

## 1. Repo létrehozás

1. Hozd létre a `pay-api-app` GitHub repót.
2. Add hozzá a helyi repót remote-ként.
3. Pushold a `main` ágat.

Példa:

```bash
git remote add origin git@github.com:<ORG>/pay-api-app.git
git add .
git commit -m "feat: bootstrap pay-api app"
git push -u origin main
```

## 2. Branch protection

Állítsd védettre a `main` ágat:

- kötelező PR
- legalább 1 review
- kötelező zöld workflow

## 3. Environment

Hozz létre egy `prod` GitHub environmentet, és tegyél rá approval szabályokat.

## 4. Variables

Repository `Variables`:

- `AWS_REGION`
- `AWS_ROLE_ARN`
- `ECR_REPOSITORY`
- `GITOPS_REPOSITORY`
- `GITOPS_VALUES_FILE`

Javasolt értékek:

- `AWS_REGION=eu-central-1`
- `ECR_REPOSITORY=pay-api`
- `GITOPS_REPOSITORY=<ORG>/pay-api-gitops`
- `GITOPS_VALUES_FILE=apps/pay-api-prod/values-prod.yaml`

## 5. Secrets

Repository `Secrets`:

- `GITOPS_REPO_TOKEN`

Ez egy olyan PAT vagy fine-grained token legyen, ami tud branchet írni és PR-t nyitni a `pay-api-gitops` repóban.
