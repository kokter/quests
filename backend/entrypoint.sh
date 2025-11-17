#!/bin/sh
set -euo pipefail

if [ "$1" = "gunicorn" ]; then
  python manage.py migrate --noinput

  if [ "${COLLECT_STATIC:-1}" = "1" ]; then
    python manage.py collectstatic --noinput
  fi
fi

exec "$@"
