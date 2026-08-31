# Captain's Log — run it on your own server

Login is required. Journals, voice files, and settings are stored per officer
in Postgres. The access panel uses **email + password**. Google / X sign-in only
works on the original Grok-hosted preview, not on a personal subdomain.

Login cookies are `__Host-` (HTTPS only). Put a certificate in front of the
subdomain before you expect sign-in to stick.

## Fast path — installer

On the VPS, from the unpacked source (or a git clone):

```bash
sudo bash install.sh
```

It will prompt for:

1. **Install directory** — default `/opt/captains-log`
2. **Public subdomain** — e.g. `log.yourdomain.com`
3. **HTTPS** — Caddy (gets a certificate), an existing reverse proxy, or skip

Then it copies files, generates secrets into `.env`, starts Postgres + the app
in Docker, and (optionally) Caddy.

Create the first officer on the access panel: **Request clearance**.

## Option A — Docker, by hand

```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-v2
```

Create `/opt/captains-log/.env` (do not commit it):

```bash
DOMAIN=log.yourdomain.com
BETTER_AUTH_URL=https://log.yourdomain.com
BETTER_AUTH_SECRET=$(openssl rand -hex 32)
POSTGRES_PASSWORD=$(openssl rand -hex 16)
BIND_APP=127.0.0.1:3000
COMPOSE_PROFILES=caddy
```

`BETTER_AUTH_URL` must be the exact public origin (https, no trailing slash).

```bash
cd /opt/captains-log
docker compose --profile caddy up -d --build
```

Point the subdomain at the VPS. Caddy issues the certificate.

Without Caddy (you already reverse-proxy 127.0.0.1:3000):

```bash
docker compose up -d --build
```

An Nginx snippet lives in `deploy/nginx.conf.example`.

## Option B — Node + PM2 (no Docker)

You still need Postgres. Then:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

cd /opt/captains-log
npm ci
npm run build:selfhost
DATABASE_URL=postgres://… npm run db:migrate

sudo npm install -g pm2
export HOST=0.0.0.0 PORT=3000
export DATABASE_URL=postgres://…
export BETTER_AUTH_SECRET=…
export BETTER_AUTH_URL=https://log.yourdomain.com
pm2 start .output/server/index.mjs --name captains-log
pm2 save
pm2 startup
```

## After install

- Each officer's logs stay private to their account.
- Voice recordings are stored in Postgres (about 8 MB each).
- Sign out from **Config → End shift**.
- Microphone / dictation need HTTPS (or localhost).
- Chrome / Edge work best for dictation.

## Folders the installer creates

| Path | Purpose |
| --- | --- |
| `/opt/captains-log` | App source, Compose file, Caddyfile |
| `/opt/captains-log/.env` | Domain, session secret, database password |
| Docker volume `pgdata` | Postgres data (journals, accounts, audio) |
| Docker volumes `caddy_data`, `caddy_config` | Certificates (Caddy path only) |

## Notes

- Build for the VPS with `npm run build:selfhost` (Node server). The default `npm run build` is for the original host.
- Do not set `VITE_AUTH_ENABLED=false` — login is part of this build.
