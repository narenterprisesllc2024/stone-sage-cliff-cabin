# Captain's Log

A personal log terminal with voice dictation, stardates, and an LCARS-inspired
console. Each officer signs in; journals stay private to that account.

## Run it on your VPS

Copy this folder to the server (or push it to GitHub and clone there), then:

```bash
sudo bash install.sh
```

The installer creates the folders, writes login secrets, starts Postgres, and
can put Caddy in front of your subdomain with HTTPS. Full options are in
**[DEPLOY.md](DEPLOY.md)**.

Quick path if the files are already on the VPS:

```bash
docker compose --profile caddy up -d --build
```

Then open `https://YOUR_SUBDOMAIN` and **Request clearance** for the first
officer account.

## Run it on your computer

Needs Node 22.

```bash
npm ci
npm run dev
```

Then open `http://localhost:8080` and sign in (or create clearance). Preview
data lives in the local embedded database and resets when the dev server
restarts.
