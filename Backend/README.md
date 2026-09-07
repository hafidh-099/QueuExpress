# 🚀 QueueXpress

### A Digital Queue Management System for Yas Telecommunication Service Center

QueueXpress is a digital queue management system designed to replace manual paper-based ticketing with a modern, QR-code-driven solution. Customers can join queues using their smartphones, track their position in real time, and receive alerts when their turn approaches. Staff manage queue operations through a responsive dashboard, while administrators configure system settings and generate performance reports.

> 🎓 **Final Year Project** — Bachelor of Information Technology and Business Management, State University of Zanzibar (SUZA)

---

## 📋 Table of Contents

- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [System Workflow](#-system-workflow)
- [Installation & Setup](#-installation--setup)
- [API Endpoints](#-api-endpoints)
- [Testing](#-testing)
- [Key Metrics](#-key-metrics)
- [Security](#-security)
- [Documentation](#-documentation)
- [Contributors](#-contributors)
- [License](#-license)
- [Acknowledgements](#-acknowledgements)

---

## 🎯 Key Features

### 👤 Customer

- ✅ **QR Code Scanning** — Join a queue by scanning a QR code
- ✅ **Real-Time Queue Status** — View queue number, batch, people ahead, and estimated waiting time
- ✅ **Haptic/Vibration Feedback** — Receive physical alerts when the queue status changes
- ✅ **Feedback Submission** — Rate the service after completion
- ✅ **Multilingual Support** — English and Swahili
- ✅ **Light/Dark Mode** — Accessibility and user preference options

### 👨‍💼 Staff

- ✅ **Queue Control** — Call next, serve, or skip customers
- ✅ **Real-Time Dashboard** — View waiting and called customers
- ✅ **Timestamp Tracking** — Track `called_at` and `served_at` for performance analytics
- ✅ **Profile Management** — Update personal information

### 👨‍💻 Administrator

- ✅ **Staff Management** — Create, read, update, and delete staff accounts
- ✅ **Service Management** — Manage available service types
- ✅ **System Configuration** — Configure batch size and queue reset time
- ✅ **Reports & Analytics** — Generate Excel reports with multiple sheets
- ✅ **Feedback Management** — Search and filter customer feedback
- ✅ **QR Management** — Generate QR codes with dynamic IP configuration

### ⚙️ Technical Features

- ✅ **Real-Time Updates** — Polling every 5 seconds
- ✅ **Duplicate Prevention** — Only one active queue is allowed per phone number
- ✅ **Average Response Time** — Staff performance metric
- ✅ **Cross-Platform** — Web and mobile applications
- ✅ **58 Automated/Structured Tests** — Functional, integration, non-functional, and user acceptance testing

---

## 🛠️ Technology Stack

### Backend

| Technology | Version | Purpose |
|---|---:|---|
| Django REST Framework | 6.0 | API development |
| Python | 3.11+ | Programming language |
| MySQL | 8.0 | Database |
| JWT | — | Authentication |

### Web Frontend

| Technology | Version | Purpose |
|---|---:|---|
| React.js | 18.x | Frontend framework |
| Vite | 5.x | Build tool |
| Tailwind CSS | 4.0 | Styling |
| React Query | 5.x | Data fetching and server-state management |
| Axios | — | HTTP client |

### Mobile Application

| Technology | Version | Purpose |
|---|---:|---|
| React Native | 0.73 | Mobile framework |
| Expo | 50.x | Development platform |
| Expo Camera | — | QR code scanning |
| Expo Haptics | — | Vibration feedback |
| AsyncStorage | — | Local storage |

---

## 📁 Project Structure

```text
QueueXpress/
├── Backend/
│   └── queuexpress/
│       ├── accounts/          # Authentication & user management
│       ├── queues/            # Core queue management
│       └── queuexpress/        # Project settings
│
├── Admin/
│   └── queuexpress-frontend/   # Admin & Staff Dashboard
│       ├── src/
│       │   ├── api/            # API client
│       │   ├── components/     # Reusable components
│       │   ├── context/        # React context
│       │   ├── layouts/        # Layout components
│       │   ├── pages/          # Page components
│       │   └── translations/   # Internationalization files
│       └── .env                # Environment variables
│
├── Web/
│   └── queuexpress-web/        # Customer Web Join Page
│       ├── src/
│       │   ├── api/            # API client
│       │   ├── components/     # UI components
│       │   ├── context/        # Theme & language
│       │   └── translations/   # Internationalization files
│       └── .env                # Environment variables
│
└── Mobile/
    └── queuexpressmobile_js/   # React Native Mobile App
        ├── src/
        │   ├── api/            # API client
        │   ├── components/     # Reusable components
        │   ├── context/        # Theme context
        │   ├── navigation/     # Navigation setup
        │   ├── screens/        # Application screens
        │   ├── services/       # Notification service
        │   ├── storage/        # AsyncStorage utilities
        │   └── translations/   # Internationalization files
        └── app.json            # Expo configuration
```

---

## 🔄 System Workflow

### 👤 Customer Journey

```text
Arrive
  ↓
Scan QR Code
  ↓
Select Service
  ↓
Enter Phone Number
  ↓
Join Queue
  ↓
Track Queue Status
(auto-refresh every 5 seconds)
  ↓
Staff Calls Customer
(haptic/vibration alert)
  ↓
Receive Service
  ↓
Feedback Form
  ↓
Submit Feedback
```

### 👨‍💼 Staff Workflow

```text
View Waiting Customers
  ↓
Click "Call Next"
  ↓
Customer Status: waiting → called
  ↓
Customer Arrives
  ↓
Click "Serve"
  ↓
Customer Status: called → served

If customer is absent:
Click "Skip"
```

---

## 🚀 Installation & Setup

### Prerequisites

Make sure the following are installed:

- Python 3.11+
- Node.js 18+
- MySQL 8.0+
- Expo CLI / Expo tooling
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/queuexpress.git
cd queuexpress
```

> Replace `yourusername` with the GitHub account that owns this repository.

### 2. Backend Setup

```bash
cd Backend/queuexpress

# Create a virtual environment
python -m venv venv

# Linux/macOS
source venv/bin/activate

# Windows
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env

# Edit .env and add your database credentials

# Create and apply migrations
python manage.py makemigrations
python manage.py migrate

# Create an administrator account
python manage.py createsuperuser

# Start the backend server
python manage.py runserver 0.0.0.0:8000
```

### 3. Admin Dashboard Setup

Open a new terminal:

```bash
cd Admin/queuexpress-frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Edit .env and configure the API URL

# Start the development server
npm run dev -- --host 0.0.0.0
```

### 4. Web Join Page Setup

Open a new terminal:

```bash
cd Web/queuexpress-web

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Edit .env and configure the API URL

# Start the development server
npm run dev -- --host 0.0.0.0 --port 5174
```

### 5. Mobile Application Setup

Open a new terminal:

```bash
cd Mobile/queuexpressmobile_js

# Install dependencies
npm install

# Configure the API URL in src/api/client.js
```

Example:

```javascript
const API_URL = 'http://YOUR_IP_ADDRESS:8000/api';
```

Then start Expo:

```bash
npx expo start --clear
```

### 6. Build Android APK

From the mobile application directory:

```bash
# Generate the Android native project
npx expo prebuild --platform android --clean

# Build the debug APK
cd android
./gradlew assembleDebug
```

The generated APK can be found at:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🔌 API Endpoints

### Public Endpoints

These endpoints do not require authentication.

| Endpoint | Method | Description |
|---|---|---|
| `/api/join/` | POST | Customer joins a queue |
| `/api/queue/status/<queue_id>/` | GET | Get queue status |
| `/api/feedback/` | POST | Submit customer feedback |
| `/api/public/services/` | GET | Get available services |

### Staff Endpoints

**JWT authentication required — `role=staff`**

| Endpoint | Method | Description |
|---|---|---|
| `/api/staff/call-next/` | POST | Call the next customer |
| `/api/staff/serve/<queue_id>/` | POST | Serve a customer |
| `/api/staff/skip/<queue_id>/` | POST | Skip a customer |
| `/api/staff/queue-list/` | GET | View waiting and called queues |

### Admin Endpoints

**JWT authentication required — `role=admin`**

| Endpoint | Method | Description |
|---|---|---|
| `/api/admin/profile/` | GET | Get administrator profile |
| `/api/admin/staff/` | GET/POST | Manage staff |
| `/api/admin/staff/<id>/` | PUT/DELETE | Update or delete staff |
| `/api/admin/services/` | GET/POST | Manage services |
| `/api/admin/services/<id>/` | PUT/DELETE | Update or delete service |
| `/api/admin/settings/` | GET/PUT | Manage system settings |
| `/api/admin/report/` | GET | Get statistics and reports |
| `/api/admin/feedback/` | GET | View customer feedback |
| `/api/admin/dashboard-stats/` | GET | Get dashboard statistics |
| `/api/admin/change-password/` | POST | Change administrator password |

---

## 🧪 Testing

### Test Results Summary

| Category | Tests | Passed | Pass Rate |
|---|---:|---:|---:|
| Functional | 35 | 35 | 100% |
| Integration | 8 | 8 | 100% |
| Non-functional | 10 | 10 | 100% |
| User Acceptance | 5 | 5 | 100% |
| **Total** | **58** | **58** | **100%** |

### Run Backend Tests

```bash
cd Backend/queuexpress
python manage.py test
```

### Run Frontend Tests

If frontend tests are implemented:

```bash
cd Admin/queuexpress-frontend
npm test
```

---

## 📊 Key Metrics

| Metric | Target | Actual | Status |
|---|---:|---:|---|
| API Response Time | < 10s | < 1s | ✅ Pass |
| Queue Update Interval | 5s | 5s | ✅ Pass |
| App Load Time | < 5s | < 3s | ✅ Pass |
| QR Scan Time | < 3s | < 2s | ✅ Pass |
| Mobile Compatibility | Android 10+ | Android 10–13 | ✅ Pass |
| Browser Compatibility | Modern browsers | Chrome, Firefox, Edge | ✅ Pass |
| Language Support | English/Swahili | 100% coverage | ✅ Pass |

---

## 🔒 Security

QueueXpress implements several security measures:

- **Authentication** — JWT-based authentication with 24-hour token expiry
- **Authorization** — Role-based access control for Admin, Staff, and Public users
- **Password Hashing** — PBKDF2 with salt
- **Input Validation** — Server-side validation using Django serializers
- **SQL Injection Protection** — Django ORM parameterized queries
- **CSRF Protection** — Django CSRF middleware
- **Data Protection** — Sensitive configuration stored through environment variables

> **Security note:** Never commit real credentials, secret keys, database passwords, or production environment variables to the repository.

---

## 📚 Documentation

The project documentation includes:

- **SRS** — Software Requirements Specification
- **SDD** — Software Design Document
- **Final Report** — Complete project documentation
- **User Manual** — Instructions for end users
- **Installation Guide** — Setup and deployment instructions

---

## 🤝 Contributors

| Name | Role | Contribution |
|---|---|---|
| **Hafidh Mwita Haji** | Developer | Full-stack development, system design, testing, and documentation |
| **Dr. Abdulrahman Haroun Ali** | Supervisor | Project guidance and evaluation |

---

## 📄 License

This project was developed for academic purposes as a final year project at the **State University of Zanzibar (SUZA)**.

---

## 🙏 Acknowledgements

Special thanks to:

- **Dr. Abdulrahman Haroun Haji** — Project Supervisor
- **Yas Telecommunication Service Center** — Requirements and testing environment
- **State University of Zanzibar (SUZA)** — Academic support
- **All lecturers and colleagues** — Guidance and feedback

---

## 📬 Contact

**Hafidh Mwita Haji**

- Email: `hafidhmwita@gmail.com`
- Phone: `+255 623 101 586`

---

## ⭐ Project Highlights

QueueXpress brings together:

- 📱 Mobile queue access
- 🌐 Web-based customer access
- 👨‍💼 Staff queue management
- 👨‍💻 Administrative management
- 📊 Reports and analytics
- 🔐 Role-based security
- 📲 QR-code-based queue joining
- 🌍 English and Swahili support
- ⚡ Real-time queue status updates

---

**Built with ❤️ for Yas Telecommunication Service Center** 🚀
