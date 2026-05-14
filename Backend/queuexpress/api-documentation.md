Perfect! Here's the complete API documentation for your QueueXpress backend.

# QueueXpress API Documentation

## Base URL
```
http://localhost:8000/api/
```

## Authentication
Most endpoints require JWT token. Include in header:
```
Authorization: Bearer <your_access_token>
```

---

## 1. Authentication APIs

### Login (Admin or Staff)
**POST** `/api/login/`

**Request Body (Admin):**
```json
{
    "username": "admin",
    "password": "admin123"
}
```

**Request Body (Staff):**
```json
{
    "work_id": "STF001",
    "password": "staff123"
}
```

**Response:**
```json
{
    "refresh": "eyJhbGciOiJIUzI1NiIs...",
    "access": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
        "id": 1,
        "username": "admin",
        "full_name": "Admin User",
        "role": "admin",
        "work_id": null
    }
}
```

### Refresh Token
**POST** `/api/token/refresh/`

**Request Body:**
```json
{
    "refresh": "your_refresh_token"
}
```

**Response:**
```json
{
    "access": "new_access_token"
}
```

---

## 2. Customer APIs (Public)

### Join Queue
**POST** `/api/join/`

**Request Body:**
```json
{
    "phone_number": "08123456789",
    "service_id": 1
}
```

**Response:**
```json
{
    "queue_id": 5,
    "queue_number": 5,
    "batch_number": 1,
    "estimated_time": 40,
    "service_name": "General Inquiry"
}
```

### Check Queue Status
**GET** `/api/queue/status/<queue_id>/`

**Response:**
```json
{
    "queue_number": 5,
    "status": "waiting",
    "people_ahead": 4,
    "estimated_time": 40
}
```

### Submit Feedback
**POST** `/api/feedback/`

**Request Body:**
```json
{
    "queue_id": 1,
    "rating": 5,
    "message": "Excellent service!"
}
```

**Response:**
```json
{
    "feedback_id": 1,
    "queue_id": 1,
    "rating": 5,
    "message": "Excellent service!",
    "created_at": "2026-05-14T10:30:00Z",
    "phone_number": "08123456789"
}
```

---

## 3. Staff APIs (Requires Staff Role)

### Call Next Customer
**POST** `/api/staff/call-next/`

**Response:**
```json
{
    "queue_id": 5,
    "queue_number": 5,
    "phone_number": "08123456789",
    "service_name": "General Inquiry"
}
```

### Serve Customer
**POST** `/api/staff/serve/<queue_id>/`

**Response:**
```json
{
    "message": "Queue marked as served",
    "queue_id": 5,
    "queue_number": 5
}
```

### Skip Customer
**POST** `/api/staff/skip/<queue_id>/`

**Response:**
```json
{
    "message": "Queue skipped",
    "queue_id": 5,
    "queue_number": 5
}
```

### Get Queue List (Waiting & Called)
**GET** `/api/staff/queue-list/`

**Response:**
```json
{
    "count": 3,
    "queues": [
        {
            "queue_id": 5,
            "queue_number": 5,
            "batch_number": 1,
            "service_name": "General Inquiry",
            "phone_number": "08123456789",
            "status": "waiting",
            "created_at": "2026-05-14T10:00:00Z"
        },
        {
            "queue_id": 6,
            "queue_number": 6,
            "batch_number": 1,
            "service_name": "Bill Payment",
            "phone_number": "08987654321",
            "status": "called",
            "created_at": "2026-05-14T10:05:00Z"
        }
    ]
}
```

---

## 4. Admin APIs (Requires Admin Role)

### Get System Report
**GET** `/api/admin/report/`

**Response:**
```json
{
    "total_served": 45,
    "total_waiting": 12,
    "total_skipped": 3
}
```

### Get All Feedback
**GET** `/api/admin/feedback/`

**Response:**
```json
[
    {
        "feedback_id": 1,
        "queue_id": 1,
        "rating": 5,
        "message": "Excellent service!",
        "created_at": "2026-05-14T10:30:00Z",
        "phone_number": "08123456789"
    },
    {
        "feedback_id": 2,
        "queue_id": 2,
        "rating": 4,
        "message": "Good, but had to wait long",
        "created_at": "2026-05-14T11:00:00Z",
        "phone_number": "08987654321"
    }
]
```

### Update System Settings
**PUT** `/api/admin/settings/`

**Request Body:**
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
    "updated_at": "2026-05-14T12:00:00Z"
}
```

### Manage Services

**GET** `/api/admin/services/` - Get all services
```json
[
    {
        "service_id": 1,
        "service_name": "General Inquiry"
    },
    {
        "service_id": 2,
        "service_name": "Bill Payment"
    }
]
```

**POST** `/api/admin/services/` - Create new service
```json
{
    "service_name": "New Service"
}
```

### Manage Staff

**GET** `/api/admin/staff/` - Get all staff
```json
[
    {
        "id": 2,
        "username": "staff_john",
        "full_name": "John Doe",
        "work_id": "STF001",
        "role": "staff",
        "profile_image": null,
        "is_active": true
    }
]
```

**POST** `/api/admin/staff/` - Create new staff
```json
{
    "username": "staff_jane",
    "password": "staff123",
    "full_name": "Jane Smith",
    "work_id": "STF002",
    "profile_image": null
}
```

---

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |

## Queue Status Values

| Status | Description |
|--------|-------------|
| waiting | Customer waiting in queue |
| called | Customer called to counter |
| served | Service completed |
| skipped | Customer skipped |

## Business Rules

1. **Queue Numbering:** Auto-increments daily
2. **Batch Size:** Default 10 customers per batch
3. **Estimated Time:** Each customer = 10 minutes
4. **Feedback:** Only allowed for served queues
5. **Rating:** 1-5 stars only
6. **Access Control:**
   - Customer: Public endpoints only
   - Staff: Staff endpoints + public
   - Admin: All endpoints

---

This documentation covers all endpoints in your QueueXpress system. You can use it for:
- Frontend development reference
- Final year project documentation
- API testing with Postman

Let me know when you're ready to discuss the frontend implementation! 🚀