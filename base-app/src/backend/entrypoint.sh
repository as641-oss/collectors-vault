#!/bin/sh

echo "Waiting for database..."

while ! nc -z mysql 3306; do
  sleep 1
done

echo "Database ready"

npm start