# Campus Problem Reporting and Resolution System
## Comprehensive Beginner-Friendly Setup & Execution Guide (Windows)

This guide takes you through installing required software, setting up PostgreSQL, compiling and starting the Spring Boot backend, running the React frontend, and demonstrating the complete issue lifecycle.

---

## 1. System Requirements & Software Installation

Ensure the following tools are installed on your Windows machine:

### A. Java Development Kit (JDK 21 or later)
- Verify installation in PowerShell:
  ```powershell
  java -version
  ```
- If not installed, download **Oracle JDK 21 LTS** or **Eclipse Temurin JDK 21** from [Adoptium](https://adoptium.net/) and ensure `JAVA_HOME` is added to your Environment Variables.

### B. Apache Maven (3.9+)
- Verify installation in PowerShell:
  ```powershell
  mvn -version
  ```
- If not installed, download Apache Maven from [maven.apache.org](https://maven.apache.org/download.cgi) and add its `bin` folder to your Windows `Path`.

### C. Node.js & npm (v18 or later)
- Verify installation in PowerShell:
  ```powershell
  node -v
  npm -v
  ```
- If not installed, download **Node.js LTS** from [nodejs.org](https://nodejs.org/).

### D. PostgreSQL & pgAdmin 4
- Download the official Windows installer from [EnterpriseDB PostgreSQL](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads).
- During installation, set the default port to `5432` and choose a master password for user `postgres` (e.g., `postgres` or your custom password).

---

## 2. PostgreSQL Database Setup

### Option 1: Using pgAdmin 4 (GUI)
1. Open **pgAdmin 4** from your Windows Start Menu.
2. Enter your master password to unlock the server.
3. In the left navigation tree, expand **Servers** &rarr; **PostgreSQL**.
4. Right-click on **Databases** &rarr; **Create** &rarr; **Database...**
5. In the **Database** field, enter: `campus_problem_db` and click **Save**.
6. Click on `campus_problem_db`, click the **Tools** menu at the top, and select **Query Tool**.
7. Open and run the DDL schema script:
   - Click the folder icon, navigate to `CampusProblemReportingSystem/database/schema.sql`, and click **Execute** (Play button or press `F5`).
8. Next, open and run the sample data script:
   - Open `CampusProblemReportingSystem/database/sample-data.sql` and click **Execute** (`F5`).

### Option 2: Using `psql` (PowerShell Command Line)
Run the following commands in Windows PowerShell:
```powershell
# Connect to PostgreSQL and create the database
psql -U postgres -c "CREATE DATABASE campus_problem_db;"

# Execute schema tables and indexes
psql -U postgres -d campus_problem_db -f "C:\Users\hemanth\OneDrive\Desktop\campus_problem\CampusProblemReportingSystem\database\schema.sql"

# Execute seed data
psql -U postgres -d campus_problem_db -f "C:\Users\hemanth\OneDrive\Desktop\campus_problem\CampusProblemReportingSystem\database\sample-data.sql"
```

---

## 3. Backend Configuration

The backend is configured in `CampusProblemReportingSystem/backend/src/main/resources/application.properties`.

By default, it reads your database credentials from environment variables or uses standard local defaults:
- Host: `localhost`
- Port: `5432`
- Database Name: `campus_problem_db`
- Username: `postgres`
- Password: `${DB_PASSWORD:postgres}`

### Configuring Custom Database Password:
If your PostgreSQL password is not `postgres`, you can provide it when starting Maven:
```powershell
$env:DB_PASSWORD="your_actual_postgres_password"
```
Or create a `.env` file in `CampusProblemReportingSystem/` based on `.env.example`.

---

## 4. Starting the Backend (Spring Boot)

Open a Windows PowerShell terminal, navigate to the `backend` folder, and run:

```powershell
# Navigate to the backend directory
cd "C:\Users\hemanth\OneDrive\Desktop\campus_problem\CampusProblemReportingSystem\backend"

# Run the Spring Boot application
mvn spring-boot:run
```

### Successful Startup Output:
When the backend starts successfully, you will see output ending with:
```
Started CampusReportingApplication in 4.xxx seconds (process running for ...)
Initialized default administrator account: admin
```

### Interactive API Documentation (Swagger / OpenAPI):
With the backend running, open your web browser to:
- **Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **OpenAPI JSON**: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

---

## 5. Starting the Frontend (React.js + Vite)

Open a **separate** Windows PowerShell terminal window, navigate to the `frontend` folder, and run:

```powershell
# Navigate to the frontend directory
cd "C:\Users\hemanth\OneDrive\Desktop\campus_problem\CampusProblemReportingSystem\frontend"

# Start Vite React development server
npm run dev
```

### Successful Startup Output:
```
  VITE v5.4.6  ready in 320 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

Now open [http://localhost:3000](http://localhost:3000) in your web browser!

---

## 6. Pre-Configured Demo Accounts

For instant testing and evaluation, demo accounts are pre-seeded in the database:

| Role | Username | Password | Purpose |
|---|---|---|---|
| **Administrator** | `admin` | `Admin@123` | System oversight, department creation, staff management, assigning tickets |
| **Electrical Staff** | `staff_elec` | `Staff@123` | Technician for power, wiring, lights, and projectors |
| **Plumbing Staff** | `staff_plumb` | `Staff@123` | Technician for leaks, washrooms, and pipes |
| **Network Staff** | `staff_it` | `Staff@123` | Technician for Wi-Fi and network infrastructure |
| **Student** | `student_john` | `Student@123` | Student John Doe (CS Department) |
| **Student** | `student_jane` | `Student@123` | Student Jane Smith (BioTech Department) |

> **Tip**: On the Login page (`http://localhost:3000/login`), click any of the **Demo Account Quick-Fill Buttons** to log in with a single click!

---

## 7. Complete End-to-End Workflow Demonstration

Follow this step-by-step checklist to test the entire system lifecycle:

### Step 1: Student Lodges a Complaint
1. Open [http://localhost:3000/login](http://localhost:3000/login).
2. Click **Student (John)** to autofill credentials and click **Sign In**.
3. In the sidebar, click **Report a Problem**.
4. Fill in:
   - **Title**: `Ceiling fan making clicking sound and running slow`
   - **Category**: `Electrical`
   - **Location**: `Engineering Block A, Room 301`
   - **Priority**: `HIGH`
   - **Description**: `The ceiling fan regulator sparks and makes a loud noise during classes.`
   - **Attach Photo**: Select any JPG/PNG file from your computer (optional).
5. Click **Submit Complaint**.
6. Note the generated Reference Number (e.g., `CMP-20261012-XXXXX`).
7. Click **My Complaints** in the sidebar to view the complaint in `Reported` status.

### Step 2: Administrator Assigns Complaint
1. Click the top-right profile avatar &rarr; **Log Out**.
2. On the Login page, click **Admin** and click **Sign In**.
3. In the Admin Dashboard or **All Complaints** page, locate the new complaint.
4. Click **Assign**.
5. Select:
   - **Department**: `Electrical Maintenance`
   - **Technician**: `Robert Spark (Electrical)`
   - **Priority**: `CRITICAL`
   - **Notes**: `Please inspect before 2 PM tutorial session.`
6. Click **Confirm Assignment**.
7. The status immediately updates to `In Progress` and an audit history entry is recorded.

### Step 3: Staff Technician Resolves the Task
1. Log out of Admin and sign in as **Electrical Staff** (`staff_elec` / `Staff@123`).
2. Notice the task displayed in the Staff Dashboard under **Active Assigned Tasks**.
3. Click **Update** on the complaint.
4. In the modal:
   - Set **Select New Status**: `Resolved`
   - Enter **Resolution Description**: `Replaced worn motor capacitor and tightened blade brackets. Tested speed settings safely.`
5. Click **Save Status Update**.

### Step 4: Student Verifies Resolution & Audit History
1. Log out of Staff and sign back in as **Student (John)**.
2. Notice the in-app notification icon (bell icon) with the unread badge.
3. Click **Notifications** &rarr; view: *"Your complaint CMP-... has been resolved"*.
4. Open **My Complaints** &rarr; click **View Details** on the resolved ticket.
5. Review the **Resolution Notes** and inspect the **Status History Audit Trail** displaying the exact transition timestamps and responsible users.

---

## 8. Common Errors & Troubleshooting

### Issue 1: `Connection to localhost:5432 refused`
- **Cause**: The PostgreSQL service is not running on your machine.
- **Solution**:
  1. Press `Win + R`, type `services.msc`, and press Enter.
  2. Locate `postgresql-x64-XX`.
  3. Right-click and select **Start**.

### Issue 2: `Port 8080 already in use`
- **Cause**: Another application is using port 8080.
- **Solution**:
  In PowerShell, run:
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess | Stop-Process -Force
  ```
  Or change the port in `backend/src/main/resources/application.properties`:
  ```properties
  server.port=8081
  ```

### Issue 3: `Port 3000 already in use`
- **Solution**: Vite will automatically offer to run on port 3001, or you can specify another port in `frontend/vite.config.js`.

### Issue 4: `401 Unauthorized / Expired JWT`
- **Solution**: JWT tokens expire after 24 hours. Simply log out and log back in, or clear your browser's local storage in DevTools (`F12` &rarr; Application &rarr; Local Storage &rarr; Clear).
