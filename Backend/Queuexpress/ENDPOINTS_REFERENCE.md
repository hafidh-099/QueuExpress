# QueueXpress API Quick Reference

## All Endpoints at a Glance

### 📍 Base URL

```
http://localhost:8000/api
```

---

## Authentication Endpoints

| Method | Endpoint       | Auth | Description                            |
| ------ | -------------- | ---- | -------------------------------------- |
| POST   | `/login/`      | ❌   | Login (username OR work_id + password) |
| GET    | `/check-auth/` | ✅   | Verify current user is authenticated   |

---

## Customer APIs (Public - No Authentication)

| Method | Endpoint                    | Description                    |
| ------ | --------------------------- | ------------------------------ |
| POST   | `/join/`                    | Customer joins queue           |
| GET    | `/queue/status/<queue_id>/` | Check queue status & wait time |
| POST   | `/feedback/`                | Submit feedback (rating 1-5)   |

---

## Staff APIs (Protected - role='staff')

| Method | Endpoint                   | Description                |
| ------ | -------------------------- | -------------------------- |
| POST   | `/staff/call-next/`        | Call next waiting customer |
| POST   | `/staff/serve/<queue_id>/` | Mark customer as served    |
| POST   | `/staff/skip/<queue_id>/`  | Mark customer as skipped   |
| GET    | `/staff/queue-list/`       | View all waiting customers |

---

## Admin APIs (Protected - role='admin')

### Dashboard & Reports

| Method | Endpoint           | Description                                   |
| ------ | ------------------ | --------------------------------------------- |
| GET    | `/admin/report/`   | Dashboard (served, waiting, skipped, ratings) |
| GET    | `/admin/feedback/` | View all customer feedback                    |
| PUT    | `/admin/settings/` | Update batch_size & reset_time                |

### Service Management

| Method | Endpoint                        | Description         |
| ------ | ------------------------------- | ------------------- |
| GET    | `/admin/services/`              | List all services   |
| POST   | `/admin/services/`              | Create new service  |
| GET    | `/admin/services/<service_id>/` | Get service details |
| PUT    | `/admin/services/<service_id>/` | Update service      |
| DELETE | `/admin/services/<service_id>/` | Delete service      |

### Staff Management

| Method | Endpoint                   | Description             |
| ------ | -------------------------- | ----------------------- |
| GET    | `/admin/staff/`            | List all staff members  |
| POST   | `/admin/staff/create/`     | Create new staff member |
| GET    | `/admin/staff/<staff_id>/` | Get staff details       |
| PUT    | `/admin/staff/<staff_id>/` | Update staff member     |
| DELETE | `/admin/staff/<staff_id>/` | Delete staff member     |

### Queue Monitoring

| Method | Endpoint         | Description                    |
| ------ | ---------------- | ------------------------------ |
| GET    | `/admin/queues/` | List all queues (with filters) |

---

## Quick Request Examples

### Join Queue

```bash
POST /api/join/
Content-Type: application/json

{
  "phone_number": "+1234567890",
  "service_id": 1
}
```

### Login (Admin)

```bash
POST /api/login/
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

### Login (Staff)

```bash
POST /api/login/
Content-Type: application/json

{
  "work_id": "EMP001",
  "password": "password123"
}
```

### Call Next (Staff)

```bash
POST /api/staff/call-next/
Authorization: Bearer <token>
```

### Get Status

```bash
GET /api/queue/status/42/
```

### Submit Feedback

```bash
POST /api/feedback/
Content-Type: application/json

{
  "queue_id": 42,
  "rating": 5,
  "message": "Great service!"
}
```

### Get Report (Admin)

```bash
GET /api/admin/report/
Authorization: Bearer <token>
```

### Create Service (Admin)

```bash
POST /api/admin/services/
Authorization: Bearer <token>
Content-Type: application/json

{
  "service_name": "Bill Payment",
  "description": "Pay bills"
}
```

### Create Staff (Admin)

```bash
POST /api/admin/staff/create/
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "staff001",
  "password": "secure123",
  "password_confirm": "secure123",
  "full_name": "John Doe",
  "work_id": "EMP001"
}
```

### List Waiting Queues (Staff)

```bash
GET /api/staff/queue-list/
Authorization: Bearer <token>
```

### View All Queues (Admin)

```bash
GET /api/admin/queues/
Authorization: Bearer <token>

# With filters:
GET /api/admin/queues/?status=served&date=2026-05-06
```

---

## Response Formats

### Success Response

```json
{
  "field": "value",
  "nested": {
    "related_field": "value"
  }
}
```

### Error Response

```json
{
  "detail": "Error message"
}
```

### Validation Error Response

```json
{
  "field_name": ["Error message"],
  "another_field": ["Error 1", "Error 2"]
}
```

---

## Status Codes Reference

| Code | Meaning      | When Used                               |
| ---- | ------------ | --------------------------------------- |
| 200  | OK           | GET, POST (update), PUT successful      |
| 201  | Created      | POST (new resource) successful          |
| 204  | No Content   | DELETE successful                       |
| 400  | Bad Request  | Invalid input data                      |
| 401  | Unauthorized | Invalid/missing JWT token               |
| 403  | Forbidden    | User lacks permission (not staff/admin) |
| 404  | Not Found    | Resource doesn't exist                  |
| 500  | Server Error | Unexpected server error                 |

---

## Authentication Header Format

```
Authorization: Bearer <access_token>
```

Example:

```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

---

## Query Parameters

### List Queues (Admin)

```
GET /api/admin/queues/?status=served&service_id=1&date=2026-05-06

Parameters:
- status: (waiting | called | served | skipped)
- service_id: (integer)
- date: (YYYY-MM-DD)
```

---

## Role-Based Access

### Public (No Auth)

- ❌ Authentication NOT required
- ✅ Anyone can access

### Staff (role='staff')

- ✅ Authentication required (JWT)
- ✅ `user.role == 'staff'`
- ❌ Admin endpoints blocked

### Admin (role='admin')

- ✅ Authentication required (JWT)
- ✅ `user.role == 'admin'`
- ❌ Staff-only endpoints accessible but need different logic

---

## Common API Workflows

### Workflow 1: Customer Journey

1. `POST /api/join/` → Get queue_number, batch_number, estimated_time
2. `GET /api/queue/status/<queue_id>/` → Check current position
3. `POST /api/feedback/` → Submit rating after service

### Workflow 2: Staff Operations

1. `POST /api/login/` → Get JWT token (work_id + password)
2. `GET /api/staff/queue-list/` → See waiting customers
3. `POST /api/staff/call-next/` → Call next customer
4. `POST /api/staff/serve/<queue_id>/` → Mark as served

### Workflow 3: Admin Dashboard

1. `POST /api/login/` → Get JWT token (username + password)
2. `GET /api/admin/report/` → Get dashboard stats
3. `GET /api/admin/feedback/` → Review customer feedback
4. `GET /api/admin/queues/?date=2026-05-06` → View today's queues
5. `PUT /api/admin/settings/` → Update settings

---

## Test with cURL

### Join Queue

```bash
curl -X POST http://localhost:8000/api/join/ \
  -H "Content-Type: application/json" \
  -d '{"phone_number":"+1234567890","service_id":1}'
```

### Check Status

```bash
curl http://localhost:8000/api/queue/status/1/
```

### Login

```bash
curl -X POST http://localhost:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

### Call Next (with token)

```bash
TOKEN="eyJ0eXAiOiJKV1Q..."
curl -X POST http://localhost:8000/api/staff/call-next/ \
  -H "Authorization: Bearer $TOKEN"
```

### Get Report (with token)

```bash
TOKEN="eyJ0eXAiOiJKV1Q..."
curl http://localhost:8000/api/admin/report/ \
  -H "Authorization: Bearer $TOKEN"
```

---

## Test with Python

```python
import requests
import json

BASE_URL = 'http://localhost:8000/api'

# 1. Join Queue
response = requests.post(f'{BASE_URL}/join/', json={
    'phone_number': '+1234567890',
    'service_id': 1
})
queue = response.json()
print(f"Joined as Queue #{queue['queue_number']}")

# 2. Check Status
response = requests.get(f"{BASE_URL}/queue/status/{queue['queue_id']}/")
status = response.json()
print(f"Status: {status['status']}, Wait Time: {status['estimated_time']} min")

# 3. Login (Admin)
response = requests.post(f'{BASE_URL}/login/', json={
    'username': 'admin',
    'password': 'password'
})
token = response.json()['access']
headers = {'Authorization': f'Bearer {token}'}

# 4. Get Report
response = requests.get(f'{BASE_URL}/admin/report/', headers=headers)
report = response.json()
print(f"Served: {report['total_served']}, Waiting: {report['total_waiting']}")

# 5. Submit Feedback
response = requests.post(f'{BASE_URL}/feedback/', json={
    'queue_id': queue['queue_id'],
    'rating': 5,
    'message': 'Great service!'
})
print(f"Feedback submitted: {response.status_code}")
```

---

## Endpoint Parameters Reference

### POST /api/join/

```
Required:
- phone_number (string, max 20)
- service_id (integer)
```

### POST /api/feedback/

```
Required:
- queue_id (integer)
- rating (integer, 1-5)

Optional:
- message (string)
```

### POST /api/login/

```
Required:
- password (string)

One of:
- username (string) - for admin
- work_id (string) - for staff
```

### POST /api/admin/staff/create/

```
Required:
- username (string)
- password (string)
- password_confirm (string)
- full_name (string)
- work_id (string)

Optional:
- profile_image (file)
```

### PUT /api/admin/settings/

```
Optional:
- batch_size (integer)
- reset_time (string, HH:MM:SS)
```

### POST /api/admin/services/

```
Required:
- service_name (string)

Optional:
- description (string)
```

---

## Token Expiration

- **Access Token**: Expires in **1 hour**
- **Refresh Token**: Expires in **7 days**
- **Refresh Endpoint**: `POST /api/token/refresh/` (if configured)

After access token expires:

1. Use refresh token to get new access token, OR
2. Login again with credentials

---

## Environment Variables (.env)

```
DB_NAME=queuexpress
DB_USER=mysql_user
DB_PASSWORD=mysql_password
DB_HOST=localhost
DB_PORT=3306
```

---

## Admin Dashboard URL

```
http://localhost:8000/admin/
```

Login with superuser credentials created with:

```bash
python manage.py createsuperuser
```

---

## Summary

- **28+ Total Endpoints**
- **3 Functional Areas**: Customer, Staff, Admin
- **Role-Based Access**: Public, Staff, Admin
- **JWT Authentication**: Secure token-based auth
- **Database**: MySQL with optimized queries
- **Documentation**: Comprehensive and up-to-date

**Ready to use! 🚀**
