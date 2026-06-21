#!/bin/bash

echo "Starting all services..."

# Start Django Backend
cd /path/to/queuexpress/backend
python manage.py runserver 0.0.0.0:8000 &

# Start Admin Dashboard
cd /path/to/queuexpress-frontend
npm run dev &

# Start Web Join Page
cd /path/to/queuexpress-web
npm run dev -- --port 5174 &

echo "All services started!"
echo "Django: http://localhost:8000"
echo "Admin: http://localhost:5173"
echo "Web Join: http://localhost:5174"
