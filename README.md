# Doctor Appointment Booking System (MedBook)

Full-stack application built with **ASP.NET Core Web API (.NET 10)** backend and **Angular 21** frontend following clean architecture principles.

## Architecture

### Backend (Clean Architecture)
```
Backend/
├── src/
│   ├── DoctorAppointment.Core/          # Entities, Enums, Interfaces
│   ├── DoctorAppointment.Application/   # DTOs, Services, Validators, Mappings
│   ├── DoctorAppointment.Infrastructure/# EF Core, Repositories, JWT, Gemini AI Service
│   └── DoctorAppointment.API/           # Controllers, Middleware, SignalR Hubs
└── DoctorAppointment.sln
```

### Frontend (Angular Modular)
```
Frontend/doctor-appointment/src/app/
├── core/           # Services, Guards, Interceptors, Models
├── shared/         # Sidebar, TopNavbar, MedAI Chat, Profile, Video Call
├── auth/           # Login, Register
├── admin/          # Dashboard, Manage Doctors, Hospitals, Appointments, Users, Feedback, Profile
├── doctor/         # Dashboard, Chat, Video Call, Profile
└── patient/        # Dashboard, Search Doctors, Book Appointment, Chat, Video Call, Profile
```

## Features

### Roles
- **Admin**: Manage doctors (with specialization dropdown), manage hospitals (City/State/Country), view all appointments/users/feedback, profile management
- **Doctor**: View/approve/reject appointments, real-time chat, video consultations, profile management (specialization, experience)
- **Patient**: Search doctors (nearby/filtered), book appointments, real-time notifications, chat, video call, MedAI health assistant

### Key Features
- **MedAI Chat Assistant** – AI-powered health assistant using Google Gemini API with 4-model fallback chain, conversation persistence, fullscreen/expanded/minimized modes, and smart scrolling (hidden on admin/doctor routes, visible on patient/auth/find pages)
- **JWT Authentication** with role-based authorization
- **Real-time Notifications & Chat** via SignalR
- **WebRTC Video Consultations** (peer-to-peer)
- **Profile Management** – Backend-persisted profiles for all roles (Admin, Doctor, Patient)
- **Hospital Management** – Name, City, State, Country (all required)
- **Doctor Management** – Specialization dropdown (20 options + custom), City/State fields
- Pagination & filtering
- Global error handling middleware
- Serilog structured logging
- FluentValidation input validation
- AutoMapper DTO mapping
- Angular Material UI
- Lazy-loaded routes with route guards

## Prerequisites

- .NET 10 SDK
- Node.js 18+
- SQL Server (LocalDB or full instance)
- Angular CLI (`npm install -g @angular/cli`)

## Setup Instructions

### 1. Backend

```bash
cd Backend

# Restore packages
dotnet restore

# Update connection string in src/DoctorAppointment.API/appsettings.json
# Default: Server=(localdb)\mssqllocaldb;Database=DoctorAppointmentDb

# Apply migrations
dotnet ef database update --project src/DoctorAppointment.Infrastructure --startup-project src/DoctorAppointment.API

# Run the API
dotnet run --project src/DoctorAppointment.API
```

The API will start at `http://localhost:5229`.  
Swagger UI: `http://localhost:5229/swagger`

### 2. Frontend

```bash
cd Frontend/doctor-appointment

# Install dependencies
npm install

# Update API URL in src/environments/environment.ts if needed
# Default: http://localhost:5229/api

# Run development server
ng serve
```

The app will be available at `http://localhost:4200`

### 3. Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gmail.com | (set during registration) |

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | Public | Register (Patient) |
| POST | /api/auth/login | Public | Login (all roles) |
| GET | /api/auth/profile | Authenticated | Get user profile |
| PUT | /api/auth/profile | Authenticated | Update user name |

### Doctors
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/doctors | Public | Get all doctors |
| GET | /api/doctors/search | Public | Search with filters |
| GET | /api/doctors/nearby | Public | Nearby doctors (lat/lng) |
| GET | /api/doctors/profile | Doctor | Get own profile |
| PUT | /api/doctors/profile | Doctor | Update own profile |
| POST | /api/doctors | Admin | Create doctor |
| PUT | /api/doctors/{id} | Admin | Update doctor |
| DELETE | /api/doctors/{id} | Admin | Delete doctor |

### Hospitals
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/hospitals | Public | Get all hospitals |
| POST | /api/hospitals | Admin | Create hospital |
| PUT | /api/hospitals/{id} | Admin | Update hospital |
| DELETE | /api/hospitals/{id} | Admin | Delete hospital |

### Appointments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/appointments | Admin | Get all (paged) |
| GET | /api/appointments/my-appointments | Doctor/Patient | Get own appointments |
| POST | /api/appointments | Patient | Book appointment |
| PUT | /api/appointments/{id}/status | Doctor/Admin | Update status |

### Patients
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/patients/profile | Patient | Get patient profile |
| PUT | /api/patients/profile | Patient | Update patient profile |

### MedAI Chat
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/medai/chat | Public | Guest chat (no persistence) |
| GET | /api/medai/conversations | Authenticated | List conversations |
| GET | /api/medai/conversations/{id} | Authenticated | Get conversation messages |
| POST | /api/medai/conversations | Authenticated | Create new conversation |
| POST | /api/medai/conversations/{id}/messages | Authenticated | Send message |
| PUT | /api/medai/conversations/{id}/rename | Authenticated | Rename conversation |
| DELETE | /api/medai/conversations/{id} | Authenticated | Delete conversation |

### Chat
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/chat/send | Authenticated | Send message |
| GET | /api/chat/conversation/{userId} | Authenticated | Get conversation |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/admin/users | Admin | Get all users |

## SignalR Hubs

| Hub | Path | Events |
|-----|------|--------|
| Chat | /hubs/chat | ReceiveMessage |
| Notification | /hubs/notification | ReceiveNotification |
| Video | /hubs/video | UserJoined, UserLeft, ReceiveSignal, ReceiveIceCandidate |

## Deployment (Azure)

### Backend → Azure App Service
```bash
dotnet publish src/DoctorAppointment.API -c Release -o ./publish
# Deploy ./publish folder to Azure App Service
```

### Frontend → Azure Static Web Apps
```bash
cd Frontend/doctor-appointment
ng build --configuration production
# Deploy dist/doctor-appointment/ to Azure Static Web Apps
```

### Database → Azure SQL
Update the connection string in Azure App Service configuration.

## Technologies

| Layer | Technology |
|-------|-----------|
| Backend | ASP.NET Core Web API (.NET 10) |
| ORM | Entity Framework Core 10 (Code First + Auto-Migrations) |
| Database | SQL Server (LocalDB) |
| Auth | JWT Bearer Tokens |
| Real-time | SignalR (Chat, Notifications, Video signaling) |
| Video | WebRTC (peer-to-peer) |
| AI | Google Gemini API (4-model fallback: gemini-2.5-flash → 2.0-flash-lite → 2.0-flash → 1.5-flash) |
| Validation | FluentValidation |
| Mapping | AutoMapper |
| Logging | Serilog (structured, console + file) |
| API Docs | Swagger/OpenAPI |
| Frontend | Angular 21.2.7 (Standalone Components) |
| UI | Angular Material 21.2.6 |
| Secrets | .NET User Secrets (API keys) |

## Project Info

- **Student**: Bibhuti Ranjan
- **ID**: EMPN2197
