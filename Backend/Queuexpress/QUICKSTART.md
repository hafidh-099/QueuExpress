# QueueXpress Backend - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

```bash
cd /path/to/Queuexpress
pip install -r requirements.txt
```

### Step 2: Database Setup

1. Create MySQL database:

```sql
CREATE DATABASE queuexpress CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Update `.env` with your credentials:

```
DB_NAME=queuexpress
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306
```

### Step 3: Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### Step 4: Create Admin User

```bash
python manage.py createsuperuser
```

Follow prompts:

- Username: `admin`
- Email: `admin@example.com`
- Password: Choose a secure password
- Full name: (fill accordingly)
- Work ID: (leave blank for admin)
- Role: Select `admin`

### Step 5: Create Default Settings

```bash
python manage.py shell
```

Inside shell:

```python
from queues.models import Settings
Settings.objects.create(batch_size=10, reset_time='00:00:00')
exit()
```

### Step 6: Start Server

```bash
python manage.py runserver
```

✅ Server is running at: `http://localhost:8000`

---

## 📝 Quick Test

### Test API Endpoints

#### 1. Login (Get Token)

```bash
curl -X POST http://localhost:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your_password"}'
```

**Response:**

```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {...}
}
```

Save the `access` token.

#### 2. Create Service

```bash
curl -X POST http://localhost:8000/api/admin/services/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"service_name":"General Inquiry","description":"General customer inquiry"}'
```

**Response:**

```json
{
  "service_id": 1,
  "service_name": "General Inquiry",
  "description": "General customer inquiry",
  "created_at": "2026-05-06T10:00:00Z"
}
```

#### 3. Customer Joins Queue

```bash
curl -X POST http://localhost:8000/api/join/ \
  -H "Content-Type: application/json" \
  -d '{"phone_number":"+1234567890","service_id":1}'
```

**Response:**

```json
{
  "queue_id": 1,
  "queue_number": 1,
  "batch_number": 1,
  "estimated_time": 0
}
```

#### 4. Check Queue Status

```bash
curl http://localhost:8000/api/queue/status/1/
```

**Response:**

```json
{
  "queue_id": 1,
  "queue_number": 1,
  "batch_number": 1,
  "status": "waiting",
  "phone_number": "+1234567890",
  "service_name": "General Inquiry",
  "people_ahead": 0,
  "estimated_time": 0,
  "created_at": "2026-05-06T10:00:00Z"
}
```

---

## 🔐 Authentication

### Admin Login

```json
{
  "username": "admin",
  "password": "password"
}
```

### Staff Login

```json
{
  "work_id": "EMP001",
  "password": "password"
}
```

### Using Token

```
Authorization: Bearer <access_token>
```

---

## 👥 Create Staff Member (Admin Only)

```bash
curl -X POST http://localhost:8000/api/admin/staff/create/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "username": "staff001",
    "password": "securepass123",
    "password_confirm": "securepass123",
    "full_name": "John Doe",
    "work_id": "EMP001"
  }'
```

---

## 📊 Admin Dashboard

Visit: `http://localhost:8000/api/admin/report/`

**Headers:**

```
Authorization: Bearer ADMIN_TOKEN
```

**Response:**

```json
{
  "total_served": 0,
  "total_waiting": 1,
  "total_skipped": 0,
  "avg_rating": 0,
  "today_transactions": 1
}
```

---

## 🎯 Key Endpoints

### Customer (Public)

- `POST /api/join/` - Join queue
- `GET /api/queue/status/<id>/` - Check status
- `POST /api/feedback/` - Submit feedback

### Staff (Protected)

- `POST /api/staff/call-next/` - Call next
- `POST /api/staff/serve/<id>/` - Mark served
- `POST /api/staff/skip/<id>/` - Skip customer
- `GET /api/staff/queue-list/` - View waiting

### Admin (Protected)

- `GET /api/admin/report/` - Dashboard
- `GET /api/admin/feedback/` - View feedback
- `PUT /api/admin/settings/` - Update settings
- `GET/POST /api/admin/services/` - Manage services
- `POST /api/admin/staff/create/` - Create staff

---

## 🛠️ Admin Dashboard

Access Django admin: `http://localhost:8000/admin/`

- Manage Users
- View Services
- Monitor Queues
- Check Feedback
- Adjust Settings

---

## 📚 Documentation

See `API_DOCUMENTATION.md` for complete API reference.

---

## ⚠️ Development Notes

- Debug mode is ON (settings.py: `DEBUG = True`)
- CORS allows all origins (update for production)
- JWT access tokens expire in 1 hour
- Media files stored in `media/` directory

---

## 🐛 Troubleshooting

### Error: "No database"

- Check MySQL is running
- Verify .env credentials
- Run migrations: `python manage.py migrate`

### Error: "No module named 'accounts'"

- Ensure accounts app is in INSTALLED_APPS
- Run: `python manage.py makemigrations`

### Error: "Permission denied"

- Check JWT token is included
- Verify user has correct role (staff/admin)

---

## 📞 Support

For issues, check:

1. Django logs
2. MySQL connection
3. JWT token validity
4. User permissions
5. Model relationships
