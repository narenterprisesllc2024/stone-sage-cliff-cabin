#!/usr/bin/env bash
# Captain's Log — interactive VPS installer.
# Run from the unpacked source (or a git clone):
#   sudo bash install.sh
set -euo pipefail

bold() { printf '\033[1m%s\033[0m\n' "$*"; }
note() { printf '  %s\n' "$*"; }
die() { printf 'Error: %s\n' "$*" >&2; exit 1; }

if [[ ${EUID:-$(id -u)} -ne 0 ]]; then
  die "Run this as root so it can create folders and talk to Docker. Try: sudo bash install.sh"
fi

SRC="$(cd "$(dirname "$0")" && pwd)"
[[ -f "$SRC/docker-compose.yml" && -f "$SRC/Dockerfile" ]] || die "Run this from the Captain's Log source folder."

bold "Captain's Log — VPS installer"
note "This creates folders, generates login secrets, starts Postgres,"
note "and optionally puts HTTPS in front of your subdomain."
echo

default_dir="/opt/captains-log"
read -r -p "Install directory [${default_dir}]: " INSTALL_DIR
INSTALL_DIR="${INSTALL_DIR:-$default_dir}"
INSTALL_DIR="${INSTALL_DIR%/}"

read -r -p "Public subdomain (example: log.yourdomain.com): " DOMAIN
DOMAIN="${DOMAIN#http://}"
DOMAIN="${DOMAIN#https://}"
DOMAIN="${DOMAIN%%/*}"
DOMAIN="${DOMAIN%.}"
[[ -n "$DOMAIN" ]] || die "A subdomain is required so login cookies work."

echo
bold "How should HTTPS be handled?"
note "Login requires HTTPS. A raw IP over HTTP will not keep you signed in."
note "  1) Caddy (recommended) — installs a proxy and gets a certificate"
note "  2) I already have Nginx / Caddy / Traefik on this host"
note "  3) Skip proxy for now (app listens on 127.0.0.1:3000 only)"
read -r -p "Choice [1]: " TLS_CHOICE
TLS_CHOICE="${TLS_CHOICE:-1}"

COMPOSE_PROFILES=""
case "$TLS_CHOICE" in
  1) TLS_MODE="caddy"; COMPOSE_PROFILES="caddy" ;;
  2) TLS_MODE="existing" ;;
  3) TLS_MODE="none" ;;
  *) die "Choose 1, 2, or 3." ;;
esac

echo
note "Creating ${INSTALL_DIR}"
mkdir -p "$INSTALL_DIR"

if [[ "$SRC" != "$INSTALL_DIR" ]]; then
  note "Copying application files"
  if command -v rsync >/dev/null 2>&1; then
    rsync -a \
      --exclude node_modules \
      --exclude .output \
      --exclude screenshots \
      --exclude artifacts \
      --exclude .git \
      --exclude .env \
      --exclude '*.zip' \
      "$SRC"/ "$INSTALL_DIR"/
  else
    tar -C "$SRC" --exclude=node_modules --exclude=.output --exclude=screenshots \
      --exclude=artifacts --exclude=.git --exclude=.env \
      -cf - . | tar -C "$INSTALL_DIR" -xf -
  fi
fi

cd "$INSTALL_DIR"

if ! command -v docker >/dev/null 2>&1; then
  bold "Installing Docker"
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -y
  apt-get install -y docker.io docker-compose-v2 ca-certificates curl
  systemctl enable --now docker
fi

if docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE=(docker-compose)
else
  die "Docker Compose is not available. Install docker-compose-v2 and re-run."
fi

AUTH_SECRET="$(openssl rand -hex 32)"
DB_PASSWORD="$(openssl rand -hex 16)"
AUTH_URL="https://${DOMAIN}"

if [[ -f .env ]]; then
  note "Keeping existing .env (delete it first if you want new secrets)"
else
  cat > .env <<EOF
DOMAIN=${DOMAIN}
BETTER_AUTH_URL=${AUTH_URL}
BETTER_AUTH_SECRET=${AUTH_SECRET}
POSTGRES_PASSWORD=${DB_PASSWORD}
BIND_APP=127.0.0.1:3000
EOF
  chmod 600 .env
  note "Wrote login secrets to ${INSTALL_DIR}/.env"
fi

if [[ -n "$COMPOSE_PROFILES" ]]; then
  if grep -q '^COMPOSE_PROFILES=' .env 2>/dev/null; then
    sed -i "s/^COMPOSE_PROFILES=.*/COMPOSE_PROFILES=${COMPOSE_PROFILES}/" .env
  else
    printf '\nCOMPOSE_PROFILES=%s\n' "$COMPOSE_PROFILES" >> .env
  fi
fi

bold "Building and starting services"
"${COMPOSE[@]}" up -d --build

echo
bold "Captain's Log is installed."
note "Files:     ${INSTALL_DIR}"
note "Database:  Docker volume pgdata (Postgres)"
note "App URL:   ${AUTH_URL}"
echo
note "Create an officer account on the access panel:"
note "  Request clearance → email + access code (8+ characters) → Authorize"
note "Each officer gets their own journals. Sign out from Config → End shift."
echo

case "$TLS_MODE" in
  caddy)
    note "Caddy is handling HTTPS for ${DOMAIN}."
    note "Point the subdomain's DNS A/AAAA record at this server, then wait for the certificate."
    note "Logs:  ${COMPOSE[*]} logs -f caddy"
    ;;
  existing)
    note "The console is bound to 127.0.0.1:3000."
    note "Proxy your subdomain to that address. An Nginx snippet is at:"
    note "  ${INSTALL_DIR}/deploy/nginx.conf.example"
    note "Replace YOUR_SUBDOMAIN with ${DOMAIN}, then issue a certificate if you need one:"
    note "  sudo certbot --nginx -d ${DOMAIN}"
    ;;
  none)
    note "No public proxy was installed. The console is at 127.0.0.1:3000."
    note "Login cookies need HTTPS, so put a reverse proxy on ${DOMAIN} before sharing the app."
    ;;
esac

echo
note "Useful commands (from ${INSTALL_DIR}):"
note "  ${COMPOSE[*]} logs -f app"
note "  ${COMPOSE[*]} restart app"
note "  ${COMPOSE[*]} down"
echo
note "Do not commit .env — it holds the session secret and database password."
