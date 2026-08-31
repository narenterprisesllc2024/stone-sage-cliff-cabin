#!/bin/sh
set -eu

if [ -z "${DATABASE_URL:-}" ]; then
  echo "[captains-log] DATABASE_URL is required"
  exit 1
fi

echo "[captains-log] waiting for database"
node --input-type=module <<'JS'
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}

const deadline = Date.now() + 60_000;

async function wait() {
  const client = new pg.Client({ connectionString: url });
  try {
    await client.connect();
    await client.end();
  } catch (err) {
    try {
      await client.end();
    } catch {
      /* ignore */
    }
    if (Date.now() > deadline) {
      console.error(err);
      process.exit(1);
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return wait();
  }
}

await wait();
JS

echo "[captains-log] applying schema"
node scripts/migrate.mjs

echo "[captains-log] starting console"
exec node .output/server/index.mjs
