# QueueXpress System Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          QueueXpress Backend                             │
│                        (Django + DRF + MySQL)                            │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                     HTTP Clients (Web/Mobile)                             │
├──────────────────────────────────────────────────────────────────────────┤
│  Customer Interface  │  Staff Interface  │  Admin Dashboard              │
└──────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                      Django REST API (Port 8000)                          │
├──────────────────────────────────────────────────────────────────────────┤
│  [CORS Middleware] → [JWT Authentication] → [Permission Checks]         │
└──────────────────────────────────────────────────────────────────────────┘
        │
        ├─────────────────────────────────────┬──────────────────────┐
        │                                      │                      │
        ▼                                      ▼                      ▼
┌─────────────────────┐  ┌──────────────────────────┐  ┌──────────────────┐
│  ACCOUNTS APP       │  │     QUEUES APP           │  │   Admin Interface│
├─────────────────────┤  ├──────────────────────────┤  ├──────────────────┤
│ • Custom User Model │  │ • Service Model          │  │ • Django Admin   │
│ • Login/Auth        │  │ • Batch Model            │  │ • Staff Mgmt     │
│ • Staff Management  │  │ • Settings Model         │  │ • Monitoring     │
│ • JWT Tokens        │  │ • Queue Model            │  │                  │
│                     │  │ • Feedback Model         │  │                  │
│ FBV Endpoints:      │  │ • Queue Status Logic     │  │                  │
│ • /api/login/       │  │ • Wait Time Calculation  │  │                  │
│ • /api/check-auth/  │  │                          │  │                  │
│ • /api/admin/staff/ │  │ FBV Endpoints:           │  │                  │
│                     │  │ • /api/join/ (public)    │  │                  │
│                     │  │ • /api/queue/status/     │  │                  │
│                     │  │ • /api/feedback/         │  │                  │
│                     │  │ • /api/staff/*           │  │                  │
│                     │  │ • /api/admin/*           │  │                  │
└─────────────────────┘  └──────────────────────────┘  └──────────────────┘
        │                         │
        └─────────────┬───────────┘
                      │
                      ▼
        ┌─────────────────────────────────┐
        │    Database Layer (MySQL)       │
        ├─────────────────────────────────┤
        │ Tables:                         │
        │ • User (Custom)                 │
        │ • Service                       │
        │ • Batch                         │
        │ • Settings                      │
        │ • Queue                         │
        │ • Feedback                      │
        └─────────────────────────────────┘
```

---

## Request Flow Diagram

### 1. Customer Joining Queue

```
Customer              Frontend API          Backend               Database
   │                     │                    │                     │
   │─ Join Queue ───────→│                    │                     │
   │                     │─ POST /api/join/──→│                     │
   │                     │  phone_number      │ Validate input      │
   │                     │  service_id        ├─ Get next number   │
   │                     │                    ├─ Calculate batch    │
   │                     │                    ├─ Get/Create batch  ─┤
   │                     │                    │  Save queue        ─┤
   │                     │  queue_number      │                     │
   │                     │  batch_number◄─────┤                     │
   │                     │  estimated_time    │                     │
   │←──────────────────────────────────────   │                     │
   │  Shows position                          │                     │
```

### 2. Staff Calling Next Customer

```
Staff App             Frontend API           Backend              Database
   │                     │                    │                     │
   │─ Call Next ────────→│                    │                     │
   │                     │─ POST /api/staff/call-next/              │
   │                     │  (with JWT token)  │ Verify JWT          │
   │                     │                    ├─ Check role=staff  │
   │                     │                    ├─ Get first waiting ─┤
   │                     │                    ├─ Update status    ─┤
   │                     │  queue details     │                     │
   │                     │◄─────────────────  │                     │
   │←──────────────────────────────────────   │                     │
   │  Shows customer                          │                     │
```

### 3. Admin Viewing Report

```
Admin Dashboard      Frontend API           Backend              Database
   │                   │                     │                    │
   │─ View Report ────→│                     │                    │
   │                   │─ GET /api/admin/report/                  │
   │                   │  (with JWT token)   │ Verify JWT         │
   │                   │                     ├─ Check role=admin  │
   │                   │                     ├─ Count served    ──┤
   │                   │                     ├─ Count waiting   ──┤
   │                   │                     ├─ Count skipped   ──┤
   │                   │                     ├─ Avg rating      ──┤
   │                   │ {stats}             │                    │
   │                   │◄─────────────────── │                    │
   │←──────────────────────────────────────  │                    │
   │  Dashboard updated                      │                    │
```

---

## Data Model Relationships

```
┌────────────────────────────────────────────────────────────────────┐
│                       Database Schema                               │
├────────────────────────────────────────────────────────────────────┤

accounts.User (Custom)
├─ id (PK)
├─ username (unique)
├─ password (hashed)
├─ full_name
├─ work_id (unique, nullable)
├─ role (admin | staff)
├─ profile_image
├─ created_at
└─ updated_at
   │
   └──→ (Reverse: Queue.served_by)

queues.Service
├─ service_id (PK)
├─ service_name (unique)
├─ description
├─ created_at
└─ updated_at
   │
   └──→ (Reverse: Queue.service)

queues.Batch
├─ batch_id (PK)
├─ batch_number (unique)
├─ batch_limit
└─ created_at
   │
   └──→ (Reverse: Queue.batch)

queues.Settings
├─ setting_id (PK)
├─ batch_size
├─ reset_time
└─ updated_at

queues.Queue (Core)
├─ queue_id (PK)
├─ queue_number
├─ batch_id (FK) ─────→ Batch
├─ service_id (FK) ────→ Service
├─ phone_number
├─ status (waiting|called|served|skipped)
├─ created_at
├─ served_at
├─ served_by (FK) ─────→ User (nullable)
├─ updated_at
└─ Methods:
   ├─ get_people_ahead()
   └─ get_estimated_time()
   │
   └──→ (Reverse: Feedback.queue OneToOne)

queues.Feedback
├─ feedback_id (PK)
├─ queue_id (OneToOne FK) ──→ Queue
├─ rating (1-5)
├─ message
└─ created_at

```

---

## API Endpoint Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                    /api/ (Root)                                 │
├─────────────────────────────────────────────────────────────────┤
│
├─ AUTHENTICATION
│  ├─ POST   /api/login/                      [public, no JWT]
│  └─ GET    /api/check-auth/                 [protected]
│
├─ CUSTOMER (PUBLIC)
│  ├─ POST   /api/join/                       [no auth]
│  ├─ GET    /api/queue/status/<id>/          [no auth]
│  └─ POST   /api/feedback/                   [no auth]
│
├─ STAFF (role='staff')
│  ├─ POST   /api/staff/call-next/            [JWT required]
│  ├─ POST   /api/staff/serve/<id>/           [JWT required]
│  ├─ POST   /api/staff/skip/<id>/            [JWT required]
│  └─ GET    /api/staff/queue-list/           [JWT required]
│
├─ ADMIN (role='admin')
│  ├─ GET    /api/admin/report/               [JWT required]
│  ├─ GET    /api/admin/feedback/             [JWT required]
│  ├─ PUT    /api/admin/settings/             [JWT required]
│  │
│  ├─ SERVICES
│  │  ├─ GET    /api/admin/services/          [JWT required]
│  │  ├─ POST   /api/admin/services/          [JWT required]
│  │  ├─ GET    /api/admin/services/<id>/     [JWT required]
│  │  ├─ PUT    /api/admin/services/<id>/     [JWT required]
│  │  └─ DELETE /api/admin/services/<id>/     [JWT required]
│  │
│  ├─ STAFF MANAGEMENT
│  │  ├─ GET    /api/admin/staff/             [JWT required]
│  │  ├─ POST   /api/admin/staff/create/      [JWT required]
│  │  ├─ GET    /api/admin/staff/<id>/        [JWT required]
│  │  ├─ PUT    /api/admin/staff/<id>/        [JWT required]
│  │  └─ DELETE /api/admin/staff/<id>/        [JWT required]
│  │
│  └─ QUEUE MONITORING
│     └─ GET    /api/admin/queues/            [JWT required]
│        └─ Query: ?status=X&service_id=Y&date=Z
│
└─────────────────────────────────────────────────────────────────┘
```

---

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    JWT Authentication Flow                       │
└─────────────────────────────────────────────────────────────────┘

1. LOGIN
   POST /api/login/
   {
     "username": "admin",        // For admin
     OR
     "work_id": "EMP001",        // For staff
     "password": "password"
   }
   ↓
   Backend validates credentials
   ↓
   Response: { access_token, refresh_token, user }

2. USE TOKEN
   GET /api/staff/queue-list/
   Headers:
   {
     "Authorization": "Bearer <access_token>"
   }
   ↓
   Backend verifies JWT signature
   ↓
   Backend checks token expiration (1 hour)
   ↓
   Backend checks user.role == 'staff'
   ↓
   Response: { data }

3. REFRESH TOKEN
   POST /api/token/refresh/
   {
     "refresh": "<refresh_token>"
   }
   ↓
   Response: { new_access_token }

4. TOKEN EXPIRATION
   After 1 hour: Use refresh token to get new access token
   After 7 days: Login again
```

---

## Queue Status Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Queue Status Lifecycle                         │
└─────────────────────────────────────────────────────────────────┘

          ┌─────────────┐
          │   WAITING   │  ← Customer joins with POST /api/join/
          └──────┬──────┘
                 │ Staff calls next with POST /api/staff/call-next/
                 ▼
          ┌─────────────┐
          │   CALLED    │  ← Customer waiting to be served
          └──────┬──────┘
                 │
         ┌───────┴───────┐
         │               │
         │ (Option 1)    │ (Option 2)
         ▼               ▼
    ┌─────────┐      ┌────────┐
    │ SERVED  │      │ SKIPPED│  ← Staff skips with POST /api/staff/skip/
    └────┬────┘      └────────┘
         │
         │ Customer can submit feedback
         ▼
    ┌──────────┐
    │ FEEDBACK │  ← POST /api/feedback/
    └──────────┘

    Estimated Time = Number of WAITING customers × 10 minutes
```

---

## Batch Calculation Example

```
Settings: batch_size = 10

Queue Sequence (Today):
┌─────────────────────────────────────────────────────────┐
│ Queue # │ Batch # │ Calculation                          │
├─────────────────────────────────────────────────────────┤
│ 1       │ 1       │ ceil(1 / 10) = ceil(0.1)   = 1      │
│ 2       │ 1       │ ceil(2 / 10) = ceil(0.2)   = 1      │
│ ...     │ ...     │ ...                                  │
│ 9       │ 1       │ ceil(9 / 10) = ceil(0.9)   = 1      │
│ 10      │ 1       │ ceil(10 / 10) = ceil(1)    = 1      │
│ 11      │ 2       │ ceil(11 / 10) = ceil(1.1)  = 2      │
│ 12      │ 2       │ ceil(12 / 10) = ceil(1.2)  = 2      │
│ ...     │ ...     │ ...                                  │
│ 20      │ 2       │ ceil(20 / 10) = ceil(2)    = 2      │
│ 21      │ 3       │ ceil(21 / 10) = ceil(2.1)  = 3      │
└─────────────────────────────────────────────────────────┘
```

---

## Wait Time Calculation Example

```
Customer Queue #15, Batch #2
Current Status: WAITING

Queue Distribution (TODAY):
├─ Queue #1-10:   SERVED ✓
├─ Queue #11-13:  CALLED
├─ Queue #14:     WAITING ← 1 person ahead
├─ Queue #15:     WAITING ← This customer (2 people ahead including self)
└─ Queue #16-20:  WAITING

People Ahead: 1 (Queue #14 is waiting, #11-13 are called but haven't finished)

Wait Time = 1 person × 10 minutes/person = 10 minutes

Formula:
wait_time = count(Queue where status='waiting' AND created_at < this.created_at) × 10
```

---

## Permission & Role-Based Access Control

```
┌────────────────────────────────────────────────────────┐
│              Role-Based Access Control                 │
├────────────────────────────────────────────────────────┤

Public Endpoints (No Auth Required)
├─ POST   /api/join/              ← Anyone can join
├─ GET    /api/queue/status/<id>/ ← Check own queue
└─ POST   /api/feedback/          ← Submit feedback

Protected - ADMIN ONLY
├─ GET    /api/admin/report/
├─ GET    /api/admin/feedback/
├─ PUT    /api/admin/settings/
├─ GET/POST    /api/admin/services/
├─ DELETE /api/admin/services/<id>/
├─ GET/POST/PUT/DELETE /api/admin/staff/*
└─ GET    /api/admin/queues/

Protected - STAFF ONLY
├─ POST   /api/staff/call-next/
├─ POST   /api/staff/serve/<id>/
├─ POST   /api/staff/skip/<id>/
└─ GET    /api/staff/queue-list/

Protected - BOTH (ADMIN & STAFF)
└─ GET    /api/check-auth/        ← Verify current user

Authentication Check:
request.user.role == 'admin'  → Admin endpoints OK
request.user.role == 'staff'  → Staff endpoints OK
Otherwise: 403 Forbidden
```

---

## Response Status Codes

```
┌─────────────────────────────────────────────────────┐
│            HTTP Status Codes Used                    │
├─────────────────────────────────────────────────────┤

200 OK
├─ GET requests successful
├─ POST requests with idempotent updates
└─ PUT/PATCH requests successful

201 Created
├─ Customer joins queue
├─ Create service
├─ Create staff member
└─ Create feedback

204 No Content
└─ DELETE successful (no response body)

400 Bad Request
├─ Invalid phone number
├─ Invalid rating (not 1-5)
├─ Missing required fields
└─ Service not found

401 Unauthorized
├─ Missing JWT token
├─ Invalid token signature
├─ Token expired
└─ Invalid credentials

403 Forbidden
├─ Not staff (accessing staff endpoint)
├─ Not admin (accessing admin endpoint)
└─ User lacks permission

404 Not Found
├─ Queue not found
├─ Service not found
├─ Staff member not found
└─ Feedback not found

500 Internal Server Error
└─ Unexpected server error
```

---

## Scalability Considerations

```
Current Design Optimization:
├─ Database Indexes
│  ├─ Queue.status, Queue.created_at
│  ├─ Queue.phone_number
│  ├─ User.work_id, User.role
│  └─ Service.service_name
│
├─ Query Optimization
│  ├─ Serializer method fields (no extra queries)
│  ├─ Efficient counting queries
│  └─ Proper FK relationships
│
├─ Pagination
│  └─ 100 items per page (configurable)
│
├─ Connection Pooling
│  └─ MySQL connection pooling enabled
│
└─ Caching (Optional Future)
   ├─ Cache settings object
   ├─ Cache service list
   └─ Cache user roles

For high-traffic deployments:
├─ Add Redis cache
├─ Implement rate limiting
├─ Use CDN for static files
├─ Database read replicas
└─ Load balancing
```

---

## Deployment Architecture

```
┌────────────────────────────────────────────────────────┐
│              Production Deployment                     │
└────────────────────────────────────────────────────────┘

    ┌──────────────────────────────────────┐
    │         Load Balancer (Optional)     │
    └───────────────┬──────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
    ┌────────┐  ┌────────┐  ┌────────┐
    │ Gunicorn   │ Gunicorn   │ Gunicorn   │
    │ Worker 1   │ Worker 2   │ Worker N   │
    │ :8000      │ :8001      │ :800N      │
    └─────┬──────┘──────┬─────┘──────┬────┘
          │            │             │
          └────────────┼─────────────┘
                       ▼
        ┌──────────────────────────────┐
        │    Nginx Reverse Proxy       │
        │    (Port 80/443)             │
        └──────────┬───────────────────┘
                   │
        ┌──────────┼──────────┐
        │          │          │
        ▼          ▼          ▼
    ┌────────────────────────────────┐
    │     MySQL Master/Slave         │
    │     (Primary Database)         │
    └────────────────────────────────┘
        │
        ├─ Django ORM Queries
        └─ Connection Pooling
```

---

This architecture provides a solid foundation for a scalable queue management system!
