# Campus Problem Reporting and Resolution System

A full-stack, enterprise-grade web application built to streamline facilities maintenance and problem resolution across college campuses. The system enables students to report issues with photo attachments, administrators to triage and assign tickets, and department staff to resolve problems with verified resolution logs.

---

## Architecture Overview

```
                      +-----------------------------+
                      |   React.js 18 (Vite SPA)    |
                      |  Bootstrap 5 + React Router |
                      +--------------+--------------+
                                     |  HTTP / REST (Axios)
                                     |  JWT Bearer Auth
                                     v
                      +-----------------------------+
                      |  Spring Boot 3.3.4 (Java 21)|
                      |  Spring Security + JWT      |
                      |  Spring Data JPA / Hibernate|
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |     PostgreSQL Database     |
                      |    (Relational Schemas)     |
                      +-----------------------------+
```

---

## Key Features

1. **Role-Based Access Control**:
   - **STUDENT**: Submit complaints with photo attachments, track status, view notifications, cancel unassigned tickets.
   - **ADMIN**: Centralized oversight, triage, department & staff management, assign tickets to technicians, system analytics.
   - **STAFF**: Departmental queue, accept work, update status to *In Progress*, submit *Resolved* notes.
2. **Three-Tier Problem Lifecycle**:
   - `Reported` &rarr; `In Progress` &rarr; `Resolved` (with cancellation support for pending tickets).
3. **Immutable Audit History**:
   - Every assignment or status change generates an audit history entry with performer, timestamp, and action description.
4. **Secure Image Attachments**:
   - Validates MIME types (JPG, PNG, WEBP, GIF), enforces a 10MB limit, prevents path traversal, and safely isolates file storage.
5. **Real-Time Database Analytics**:
   - Live KPI cards, category breakdowns, and technician workload distributions calculated directly from database records.
6. **In-App Notification Dispatcher**:
   - Automatic notification dispatch for submissions, assignments, and resolution events with unread counters.

---

## Technology Stack

- **Backend**: Java 21, Spring Boot 3.3.4, Spring Web, Spring Data JPA, Hibernate, Spring Security, JJWT 0.12.5, Bean Validation, PostgreSQL Driver.
- **Frontend**: React.js 18, Vite, React Router 6, Axios, Bootstrap 5, Bootstrap Icons.
- **Database**: PostgreSQL with indexed relational tables (`departments`, `users`, `complaints`, `complaint_attachments`, `complaint_status_history`, `notifications`).
- **Testing**: JUnit 5, Mockito, Spring Boot Test, MockMvc, H2 (test profile).

---

## Project Structure

```
CampusProblemReportingSystem/
├── backend/                  # Java 21 Spring Boot Backend
│   ├── src/
│   │   ├── main/java/com/campus/reporting/
│   │   │   ├── config/       # Security, CORS, Swagger, DataInitializer
│   │   │   ├── controller/   # REST Controllers
│   │   │   ├── dto/          # Request & Response DTOs
│   │   │   ├── entity/       # JPA Entities & Enums
│   │   │   ├── exception/    # Global Exception Handlers
│   │   │   ├── repository/   # Spring Data JPA Repositories
│   │   │   ├── security/     # JWT Token Provider, Filters, UserDetails
│   │   │   ├── service/      # Business Logic Services
│   │   │   └── util/         # DTO Entity Mappers
│   │   └── resources/        # application.properties
│   └── pom.xml
├── frontend/                 # React.js Vite Frontend
│   ├── src/
│   │   ├── api/              # Centralized Axios & API endpoints
│   │   ├── components/       # Navbar, Sidebar, Badges, Modals
│   │   ├── context/          # AuthContext & Session Provider
│   │   ├── pages/            # Public, Student, Staff, Admin screens
│   │   ├── App.jsx           # Top Router
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── database/
│   ├── schema.sql            # PostgreSQL DDL table schemas & indexes
│   └── sample-data.sql       # Seed data for demo accounts and complaints
├── docs/
│   ├── README.md             # Project overview
│   ├── SETUP_GUIDE.md        # Beginner-friendly setup instructions
│   └── API_DOCUMENTATION.md  # Comprehensive REST API reference
└── .env.example              # Environment variables template
```

---

## Quick Start (PowerShell)

### 1. Database Setup
```powershell
psql -U postgres -c "CREATE DATABASE campus_problem_db;"
psql -U postgres -d campus_problem_db -f "database\schema.sql"
psql -U postgres -d campus_problem_db -f "database\sample-data.sql"
```

### 2. Run Backend
```powershell
cd backend
mvn spring-boot:run
```
*API running at [http://localhost:8080](http://localhost:8080) & Swagger at [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)*

### 3. Run Frontend
```powershell
cd frontend
npm run dev
```
*Web application available at [http://localhost:3000](http://localhost:3000)*

---

## Demo Credentials

- **Admin**: `admin` / `Admin@123`
- **Electrical Staff**: `staff_elec` / `Staff@123`
- **Plumbing Staff**: `staff_plumb` / `Staff@123`
- **Student (John)**: `student_john` / `Student@123`
