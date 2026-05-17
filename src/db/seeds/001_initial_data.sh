#!/usr/bin/env sh
set -eu

if [ -z "${ADMIN_PASSWORD_HASH:-}" ]; then
  if command -v bun >/dev/null 2>&1; then
    ADMIN_PASSWORD_HASH="$(ADMIN_PASSWORD="${ADMIN_PASSWORD:-adminpassword}" bun -e 'console.log(await Bun.password.hash(Bun.env.ADMIN_PASSWORD))')"
    export ADMIN_PASSWORD_HASH
  else
    echo "ADMIN_PASSWORD_HASH is required when bun is not available" >&2
    exit 1
  fi
fi

if [ -n "${DATABASE_URL:-}" ]; then
  psql "$DATABASE_URL" --file "${SEED_SQL_PATH:-src/db/seeds/001_initial_data.sql}"
else
  psql \
    --username "$POSTGRES_USER" \
    --dbname "$POSTGRES_DB" \
    --file "${SEED_SQL_PATH:-/docker-entrypoint-initdb.d/001_initial_data.sql}"
fi
