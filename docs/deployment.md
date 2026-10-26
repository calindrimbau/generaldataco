# Deployment

## Architecture

The production site is one assets-only Cloudflare Worker named `generaldataco`. Next.js writes the static export to `out/`, and Workers Static Assets serves that directory. There is no Worker script and there are no bindings.

Wrangler uses `not_found_handling = "404-page"` so an unmatched request returns the nearest exported `404.html` with a 404 status. The custom domains are `generaldataco.com` and `www.generaldataco.com`. Cloudflare custom domains create and manage their DNS records and certificates automatically.

## Pipeline

`.github/workflows/deploy.yml` verifies and deploys the site on every push to `main`. A manual workflow dispatch runs the same install, lint, build, and Wrangler dry-run checks, but never publishes.

`npm run deploy` is the single real deploy command for CI and intentional local deployments.

## GitHub Actions secrets

| Secret | Purpose |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | A scoped token with account-level Workers Scripts: Edit and zone-level Workers Routes: Edit for `generaldataco.com`. |
| `CLOUDFLARE_ACCOUNT_ID` | The Cloudflare account that owns the Worker and zone. |

Account and zone IDs are identifiers, not credentials. The API token is a credential and must never be committed.

## Local checks

Build and smoke-test the Worker locally:

```sh
npm run build && npx wrangler dev
```

Stream production logs:

```sh
npx wrangler tail generaldataco
```

## Static export constraints

The deployed site cannot use Next.js server features, including server actions, request-time rendering, or Next.js API routes. Any runtime API must live in a separate module Worker. `next/image` must remain configured with `unoptimized: true` because the Next.js image optimizer is not available in a static export.
