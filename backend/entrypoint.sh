#!/usr/bin/env sh
set -eu

python scripts/init_db.py
python scripts/sync.py

exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
