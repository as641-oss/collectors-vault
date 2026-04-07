#!/bin/bash
set -e

echo "=== Collectors Vault backend starting ==="

max_attempts=30
attempt=1
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-3306}

while ! nc -z "$DB_HOST" "$DB_PORT"; do
  if [ "$attempt" -eq "$max_attempts" ]; then
    echo "❌ Database timeout after $max_attempts attempts"
    exit 1
  fi

  echo "Attempt $attempt/$max_attempts: waiting for database at $DB_HOST:$DB_PORT..."
  sleep 2
  attempt=$((attempt + 1))
done

echo "✅ Database ready"

if npm run | grep -q "migrate"; then
  echo "Running migrations..."
  npm run migrate
fi

if [ "${SEED_MODE}" = "private" ]; then
  if npm run | grep -q "seed:private"; then
    echo "Running private seed..."
    npm run seed:private
  fi
else
  if npm run | grep -q "seed:public"; then
    echo "Running public seed..."
    npm run seed:public
  fi
fi

echo "Starting backend..."
exec npm start