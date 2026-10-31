#!/bin/bash
# HireHub Backend Setup Script
set -e

echo "📦 Installing Python dependencies..."
pip3 install django djangorestframework djangorestframework-simplejwt django-cors-headers psycopg2-binary python-dotenv Pillow drf-spectacular PyPDF2 python-docx gunicorn

echo ""
echo "✅ Dependencies installed!"
echo ""
echo "🗄️  Running migrations..."
cd "$(dirname "$0")"
python3 manage.py makemigrations
python3 manage.py migrate

echo ""
echo "✅ Database ready!"
echo ""
echo "🚀 Starting Django server on http://localhost:8000"
python3 manage.py runserver
