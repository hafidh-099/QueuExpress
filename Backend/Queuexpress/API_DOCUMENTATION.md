# QueueXpress Backend - Complete Setup Guide

## Project Overview

QueueXpress is a clean, scalable Queue Management System backend built with Django, MySQL, Django REST Framework, and JWT authentication. The system handles customer queuing, staff management, and administrative operations.

---

## Installation & Setup

### 1. Prerequisites

- Python 3.8+
- MySQL Server
- Virtual Environment (recommended)

### 2. Install Dependencies

```bash
cd /path/to/Queuexpress
pip install -r requirements.txt
```

Or install manually:

```bash
pip install Django==4.2.7
pip install djangorestframework
pip install mysqlclient
pip install djangorestframework-simplejwt
pip install django-cors-headers
pip install Pillow
pip install python-dotenv
```

### 3. Database Configuration

Update `.env` file with your MySQL credentials:

```
DB_NAME=queuexpress
DB_USER=your_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306
```

### 4. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Create Superuser

```bash
python manage.py createsuperuser
```

### 6. Create Initial Settings

Run Django shell to create default settings:

```bash
python manage.py shell
```

```python
from queues.models import Settings
Settings.objects.create(batch_size=10, reset_time='00:00:00')
exit()
```

### 7. Run Development Server

```bash
python manage.py runserver
```

Server runs on: `http://localhost:8000`

---

## Project Structure

```
Queuexpress/
├── Queuexpress/          # Main project settings
│   ├── __init__.py
│   ├── settings.py       # Configuration
│   ├── urls.py          # Main URL routing
│   ├── asgi.py
│   └── wsgi.py
│
├── accounts/             # User management app
│   ├── models.py        # Custom User model
│   ├── serializers.py   # User serializers
│   ├── views.py         # Auth endpoints
│   ├── urls.py          # Auth routes
│   ├── admin.py         # Admin interface
│   └── apps.py
│
├── queues/              # Queue system app
│   ├── models.py        # Queue models (Service, Batch, Queue, etc.)
│   ├── serializers.py   # Queue serializers
│   ├── views.py         # Queue endpoints
│   ├── urls.py          # Queue routes
│   ├── admin.py         # Admin interface
│   └── apps.py
│
├── manage.py
├── .env                 # Environment variables
└── media/               # Uploaded files (created on first upload)
```

---

## Database Models

### User Model (Custom)

```python
Fields:
- id (AutoField)
- username (CharField, unique)
- password (CharField)
- full_name (CharField)
- work_id (CharField, unique, nullable)
- role (CharField, choices: 'admin', 'staff')
- profile_image (ImageField, optional)
- created_at (DateTimeField, auto_now_add)
- updated_at (DateTimeField, auto_now)
```

### Service Model

```python
Fields:
- service_id (AutoField, PK)
- service_name (CharField, unique)
- description (TextField, nullable)
- created_at (DateTimeField)
- updated_at (DateTimeField)
```

### Batch Model

```python
Fields:
- batch_id (AutoField, PK)
- batch_number (IntegerField, unique)
- batch_limit (IntegerField)
- created_at (DateTimeField)
```

### Settings Model

```python
Fields:
- setting_id (AutoField, PK)
- batch_size (IntegerField, default=10)
- reset_time (TimeField, default='00:00:00')
- updated_at (DateTimeField, auto_now)
```

### Queue Model

```python
Fields:
- queue_id (AutoField, PK)
- queue_number (IntegerField)
- batch (ForeignKey to Batch)
- service (ForeignKey to Service)
- phone_number (CharField)
- status (CharField, choices: 'waiting', 'called', 'served', 'skipped')
- created_at (DateTimeField)
- served_at (DateTimeField, nullable)
- served_by (ForeignKey to User, nullable)
- updated_at (DateTimeField)
```

### Feedback Model

```python
Fields:
- feedback_id (AutoField, PK)
- queue (OneToOneField to Queue)
- rating (IntegerField, 1-5)
- message (TextField, nullable)
- created_at (DateTimeField)
```

---

## Configuration Details

### JWT Configuration (settings.py)

- **Access Token Lifetime**: 1 hour
- **Refresh Token Lifetime**: 7 days
- **Algorithm**: HS256
- **Automatic Refresh**: Disabled

### CORS Configuration

Currently: `CORS_ALLOW_ALL_ORIGINS = True`

For production, update to specific domains:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://yourdomain.com",
]
```

### REST Framework Configuration

- Authentication: JWT (SimplJWT)
- Permission: Authenticated (can override per view)
- Pagination: 100 items per page

---

## API Documentation

### Authentication

All staff and admin endpoints require JWT tokens in the Authorization header:

```
Authorization: Bearer <access_token>
```

---

## API Endpoints

### 1. AUTHENTICATION ENDPOINTS

#### Login

**POST** `/api/login/`

Login for both admin and staff users.

**Request (Admin):**

```json
{
  "username": "admin",
  "password": "password123"
}
```

**Request (Staff):**

```json
{
  "work_id": "EMP001",
  "password": "password123"
}
```

**Response:**

```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "username": "admin",
    "full_name": "Admin User",
    "work_id": null,
    "role": "admin",
    "profile_image": null,
    "created_at": "2026-01-01T10:00:00Z"
  }
}
```

**Status Codes:**

- 200: Login successful
- 401: Invalid credentials

---

#### Check Authentication

**GET** `/api/check-auth/`

Verify current user is authenticated.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response:**

```json
{
  "authenticated": true,
  "user": {
    "id": 1,
    "username": "admin",
    "full_name": "Admin User",
    "work_id": null,
    "role": "admin",
    "profile_image": null,
    "created_at": "2026-01-01T10:00:00Z"
  }
}
```

---

### 2. CUSTOMER APIs (PUBLIC - NO AUTHENTICATION)

#### Join Queue

**POST** `/api/join/`

Customer joins the queue.

**Request:**

```json
{
  "phone_number": "+1234567890",
  "service_id": 1
}
```

**Response:**

```json
{
  "queue_id": 42,
  "queue_number": 15,
  "batch_number": 2,
  "estimated_time": 140
}
```

**Status Codes:**

- 201: Queue created successfully
- 400: Invalid input

**Business Logic:**

1. Gets last queue_number (today)
2. queue_number = last + 1
3. Gets batch_size from Settings
4. Calculates batch_number = ceil(queue_number / batch_size)
5. Creates/finds batch
6. Saves queue entry

---

#### Get Queue Status

**GET** `/api/queue/status/<queue_id>/`

Get current status of a queue entry.

**Response:**

```json
{
  "queue_id": 42,
  "queue_number": 15,
  "batch_number": 2,
  "status": "waiting",
  "phone_number": "+1234567890",
  "service_name": "General Inquiry",
  "people_ahead": 5,
  "estimated_time": 50,
  "created_at": "2026-05-06T10:15:00Z"
}
```

**Status Codes:**

- 200: Success
- 404: Queue not found

**Time Calculation:**

- Each customer = 10 minutes
- Estimated Time = (people_ahead) × 10 minutes

---

#### Submit Feedback

**POST** `/api/feedback/`

Submit feedback after being served.

**Request:**

```json
{
  "queue_id": 42,
  "rating": 5,
  "message": "Great service!"
}
```

**Response:**

```json
{
  "feedback_id": 15,
  "queue_id": 42,
  "phone_number": "+1234567890",
  "rating": 5,
  "message": "Great service!",
  "created_at": "2026-05-06T10:30:00Z"
}
```

**Status Codes:**

- 201: Feedback created
- 200: Feedback updated
- 400: Invalid input

**Validation:**

- Rating must be 1-5
- Queue must have status 'served'

---

### 3. STAFF APIs (PROTECTED - REQUIRES role='staff')

#### Call Next Customer

**POST** `/api/staff/call-next/`

Get and call the next waiting customer.

**Headers:**

```
Authorization: Bearer <staff_token>
```

**Response:**

```json
{
  "queue_id": 42,
  "queue_number": 15,
  "batch_number": 2,
  "status": "called",
  "phone_number": "+1234567890",
  "service_name": "General Inquiry",
  "created_at": "2026-05-06T10:15:00Z",
  "served_at": null,
  "served_by_name": null,
  "updated_at": "2026-05-06T10:20:00Z"
}
```

**Status Codes:**

- 200: Customer called or no waiting customers
- 403: Unauthorized (not staff)

---

#### Serve Customer

**POST** `/api/staff/serve/<queue_id>/`

Mark customer as served.

**Headers:**

```
Authorization: Bearer <staff_token>
```

**Request:**

```json
{}
```

**Response:**

```json
{
  "queue_id": 42,
  "queue_number": 15,
  "batch_number": 2,
  "status": "served",
  "phone_number": "+1234567890",
  "service_name": "General Inquiry",
  "created_at": "2026-05-06T10:15:00Z",
  "served_at": "2026-05-06T10:25:00Z",
  "served_by_name": "John Doe",
  "updated_at": "2026-05-06T10:25:00Z"
}
```

**Status Codes:**

- 200: Marked as served
- 400: Invalid queue status
- 403: Unauthorized
- 404: Queue not found

---

#### Skip Customer

**POST** `/api/staff/skip/<queue_id>/`

Mark customer as skipped.

**Headers:**

```
Authorization: Bearer <staff_token>
```

**Response:**

```json
{
  "queue_id": 42,
  "queue_number": 15,
  "batch_number": 2,
  "status": "skipped",
  ...
}
```

**Status Codes:**

- 200: Marked as skipped
- 400: Invalid queue status
- 403: Unauthorized
- 404: Queue not found

---

#### Get Waiting Queue List

**GET** `/api/staff/queue-list/`

Get all waiting customers in order.

**Headers:**

```
Authorization: Bearer <staff_token>
```

**Response:**

```json
{
  "count": 8,
  "queues": [
    {
      "queue_id": 35,
      "queue_number": 8,
      "batch_number": 1,
      "status": "waiting",
      "phone_number": "+1111111111",
      "service_name": "General Inquiry",
      "created_at": "2026-05-06T10:00:00Z"
    },
    {
      "queue_id": 42,
      "queue_number": 15,
      "batch_number": 2,
      "status": "waiting",
      "phone_number": "+1234567890",
      "service_name": "Bill Payment",
      "created_at": "2026-05-06T10:15:00Z"
    }
  ]
}
```

**Status Codes:**

- 200: Success
- 403: Unauthorized

---

### 4. ADMIN APIs (PROTECTED - REQUIRES role='admin')

#### Get Dashboard Report

**GET** `/api/admin/report/`

Get dashboard statistics.

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Response:**

```json
{
  "total_served": 245,
  "total_waiting": 12,
  "total_skipped": 8,
  "avg_rating": 4.52,
  "today_transactions": 67
}
```

**Status Codes:**

- 200: Success
- 403: Unauthorized

---

#### Get All Feedback

**GET** `/api/admin/feedback/`

View all customer feedback.

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Query Parameters:**

- (none - returns all feedback)

**Response:**

```json
{
  "count": 203,
  "feedback": [
    {
      "feedback_id": 1,
      "queue_id": 42,
      "phone_number": "+1234567890",
      "rating": 5,
      "message": "Excellent service!",
      "created_at": "2026-05-06T10:30:00Z"
    }
  ]
}
```

**Status Codes:**

- 200: Success
- 403: Unauthorized

---

#### Update Settings

**PUT** `/api/admin/settings/`

Update queue system settings.

**Headers:**

```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request:**

```json
{
  "batch_size": 15,
  "reset_time": "08:00:00"
}
```

**Response:**

```json
{
  "setting_id": 1,
  "batch_size": 15,
  "reset_time": "08:00:00",
  "updated_at": "2026-05-06T11:00:00Z"
}
```

**Status Codes:**

- 200: Updated
- 400: Invalid input
- 403: Unauthorized

---

#### Manage Services

##### List/Create Services

**GET/POST** `/api/admin/services/`

**GET - List all services:**

**Response:**

```json
[
  {
    "service_id": 1,
    "service_name": "General Inquiry",
    "description": "General customer inquiries",
    "created_at": "2026-01-01T10:00:00Z"
  }
]
```

**POST - Create service:**

**Request:**

```json
{
  "service_name": "Bill Payment",
  "description": "Pay bills"
}
```

**Response:**

```json
{
  "service_id": 2,
  "service_name": "Bill Payment",
  "description": "Pay bills",
  "created_at": "2026-05-06T11:00:00Z"
}
```

**Status Codes:**

- 200/201: Success
- 403: Unauthorized

---

##### Get/Update/Delete Service

**GET/PUT/DELETE** `/api/admin/services/<service_id>/`

**GET:**

```json
{
  "service_id": 1,
  "service_name": "General Inquiry",
  "description": "General customer inquiries",
  "created_at": "2026-01-01T10:00:00Z"
}
```

**PUT:**

```json
{
  "service_name": "New Name",
  "description": "Updated description"
}
```

**DELETE:**

```json
{
  "detail": "Service deleted successfully."
}
```

**Status Codes:**

- 200: Success (GET/PUT)
- 204: Deleted (DELETE)
- 403: Unauthorized
- 404: Not found

---

#### Manage Staff

##### Create Staff Member

**POST** `/api/admin/staff/create/`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Request:**

```json
{
  "username": "staff001",
  "password": "securepass123",
  "password_confirm": "securepass123",
  "full_name": "John Doe",
  "work_id": "EMP001",
  "profile_image": null
}
```

**Response:**

```json
{
  "id": 2,
  "username": "staff001",
  "full_name": "John Doe",
  "work_id": "EMP001",
  "role": "staff",
  "profile_image": null,
  "created_at": "2026-05-06T11:00:00Z"
}
```

**Status Codes:**

- 201: Created
- 400: Invalid input
- 403: Unauthorized

---

##### List Staff Members

**GET** `/api/admin/staff/`

**Response:**

```json
[
  {
    "id": 2,
    "username": "staff001",
    "full_name": "John Doe",
    "work_id": "EMP001",
    "profile_image": null,
    "created_at": "2026-05-06T11:00:00Z"
  }
]
```

---

##### Get/Update/Delete Staff

**GET/PUT/DELETE** `/api/admin/staff/<staff_id>/`

Similar structure to services endpoints.

---

#### Manage Queues (Admin View)

**GET** `/api/admin/queues/`

Get all queues with filters.

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Query Parameters:**

- `status`: Filter by status (waiting, called, served, skipped)
- `service_id`: Filter by service
- `date`: Filter by date (YYYY-MM-DD)

**Examples:**

```
GET /api/admin/queues/
GET /api/admin/queues/?status=served
GET /api/admin/queues/?service_id=1&date=2026-05-06
```

**Response:**

```json
{
  "count": 67,
  "queues": [
    {
      "queue_id": 42,
      "queue_number": 15,
      "batch_number": 2,
      "status": "served",
      "phone_number": "+1234567890",
      "service_name": "General Inquiry",
      "created_at": "2026-05-06T10:15:00Z",
      "served_at": "2026-05-06T10:25:00Z",
      "served_by_name": "John Doe",
      "updated_at": "2026-05-06T10:25:00Z"
    }
  ]
}
```

**Status Codes:**

- 200: Success
- 400: Invalid date format
- 403: Unauthorized

---

## Error Responses

All error responses follow this format:

```json
{
  "detail": "Error message here"
}
```

Or for validation errors:

```json
{
  "field_name": ["Error message"],
  "another_field": ["Error 1", "Error 2"]
}
```

### Common Error Codes

- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: User lacks permission (not staff/admin)
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

---

## Testing Examples

### Using cURL

#### Login (Admin)

```bash
curl -X POST http://localhost:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

#### Join Queue

```bash
curl -X POST http://localhost:8000/api/join/ \
  -H "Content-Type: application/json" \
  -d '{"phone_number":"+1234567890","service_id":1}'
```

#### Check Queue Status

```bash
curl http://localhost:8000/api/queue/status/42/
```

#### Call Next (Staff)

```bash
curl -X POST http://localhost:8000/api/staff/call-next/ \
  -H "Authorization: Bearer <access_token>"
```

#### Get Dashboard Report (Admin)

```bash
curl http://localhost:8000/api/admin/report/ \
  -H "Authorization: Bearer <access_token>"
```

### Using Python Requests

```python
import requests

BASE_URL = 'http://localhost:8000/api'

# Login
response = requests.post(f'{BASE_URL}/login/', json={
    'username': 'admin',
    'password': 'password'
})
token = response.json()['access']

# Join queue
response = requests.post(f'{BASE_URL}/join/', json={
    'phone_number': '+1234567890',
    'service_id': 1
})
queue = response.json()

# Get status
response = requests.get(f"{BASE_URL}/queue/status/{queue['queue_id']}/")
status = response.json()

# Call next (staff)
headers = {'Authorization': f'Bearer {token}'}
response = requests.post(f'{BASE_URL}/staff/call-next/', headers=headers)
current = response.json()
```

---

## Performance Considerations

1. **Database Indexing**: All frequently queried fields are indexed
2. **Query Optimization**: Uses select_related and prefetch_related where needed
3. **Pagination**: Default 100 items per page
4. **Connection Pooling**: Configured in MySQL settings

---

## Security Notes

1. **JWT Tokens**: Secure, time-limited access
2. **Password Hashing**: Django's built-in PBKDF2
3. **CORS**: Currently open for development (restrict in production)
4. **SQL Injection**: Protected by Django ORM
5. **CSRF**: Enabled for form submissions

---

## Deployment Checklist

- [ ] Set DEBUG = False in settings.py
- [ ] Set secure SECRET_KEY
- [ ] Configure allowed HOSTS
- [ ] Set CORS_ALLOWED_ORIGINS to specific domains
- [ ] Use environment variables for sensitive data
- [ ] Set up HTTPS/SSL
- [ ] Configure proper logging
- [ ] Run database migrations
- [ ] Collect static files: `python manage.py collectstatic`
- [ ] Use production database (not SQLite)
- [ ] Set up proper error monitoring

---

## Support & Troubleshooting

### Common Issues

**Issue**: "No database"

- **Solution**: Ensure MySQL is running and credentials in .env are correct

**Issue**: "JWT token not found"

- **Solution**: Include token in Authorization header: `Bearer <token>`

**Issue**: "Permission denied"

- **Solution**: Check user role (staff/admin) matches endpoint requirements

**Issue**: "File upload fails"

- **Solution**: Ensure media/ directory exists and is writable

---

## Conclusion

QueueXpress backend is now fully configured and ready for use. All endpoints are functional, models are optimized, and the system follows Django best practices.

For questions or issues, refer to the Django and DRF documentation.
