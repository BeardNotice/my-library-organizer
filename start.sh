#!/bin/bash
set -e

echo "Setting Flask application environment..."
export FLASK_APP=server/app.py

echo "Running database migrations..."
flask db upgrade

echo "Seeding the database..."
python server/seed.py

echo "Starting Gunicorn server..."
gunicorn 127.0.0.1:5555 --chdir ./server app:app