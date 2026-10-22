# Kipit web — DevOps

## Branch rules

| Branch | Purpose |
|---|---|
| `main` | Production. VPS auto-deploys from here only. |
| `feat/*`, `fix/*`, `chore/*` | Work branches. Open a PR into `main`. |

Never push production changes straight to `main` — always PR → merge.

## Remotes

- `client` — **https://github.com/Kipitapp/kipit-web.git**

## Auto deploy

Merge to `main` → GitHub Actions SSH → `scripts/deploy.sh` (build + PM2 reload).

Enable with variable `ENABLE_AUTO_DEPLOY=true` after VPS secrets are set.

Coolify is optional; use either Coolify **or** GitHub Actions deploy, not both on the same folder.
