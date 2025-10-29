#!/bin/sh

echo "⏳ Waiting for PostgreSQL to be ready..."
/usr/local/bin/wait-for-it.sh db:5432 --timeout=30 --strict -- echo "✅ Database is up!"

echo "🚀 Running migrations..."
uv run manage.py migrate

echo "👤 Creating superuser..."
# Create superuser non-interactively
echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser(email='admin@example.com', password='fintrack') if not User.objects.filter(email='admin@example.com').exists() else None" | uv run manage.py shell