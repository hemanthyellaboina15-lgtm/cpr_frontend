# Campus Problem Reporting and Resolution System
## REST API Reference Documentation

**Base API URL**: `http://localhost:8080/api`  
**Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)  
**OpenAPI Specification**: `http://localhost:8080/v3/api-docs`

---

## Authentication & Headers

Protected endpoints require the HTTP Authorization header:
```http
Authorization: Bearer <jwt_access_token>
```

---

## 1. Authentication Endpoints

### 1.1 User Login
- **Endpoint**: `POST /api/auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "username": "student_john",
    "password": "Student@123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1IiwidXNlcm5hbWUiOiJzdHVkZW50X2pvaG4iLCJlbWFpbCI6ImpvaG4uZG9lQHN0dWRlbnQuY2FtcHVzLmVkdSIsInJvbGUiOiJST0xFX1NUVURFTlQifQ...",
    "tokenType": "Bearer",
    "user": {
      "id": 5,
      "username": "student_john",
      "email": "john.doe@student.campus.edu",
      "fullName": "John Doe (CS Student)",
      "phoneNumber": "+1-555-0005",
      "role": "ROLE_STUDENT",
      "department": null,
      "active": true,
      "createdAt": "2026-10-12T16:00:00Z"
    }
  }
  ```

### 1.2 Student Registration
- **Endpoint**: `POST /api/auth/register`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "username": "sarah_w",
    "email": "sarah@student.campus.edu",
    "password": "Password@123",
    "fullName": "Sarah Williams",
    "phoneNumber": "+1-555-8833"
  }
  ```
- **Response (200 OK)**: Returns `AuthResponse` containing JWT token and registered student user profile.

### 1.3 Get Current User Session
- **Endpoint**: `GET /api/auth/me`
- **Access**: Authenticated (Any Role)
- **Response (200 OK)**: Returns current `UserDto`.

---

## 2. Complaint Management Endpoints

### 2.1 Submit New Complaint (Multipart with Optional Images)
- **Endpoint**: `POST /api/complaints`
- **Access**: `ROLE_STUDENT`
- **Content-Type**: `multipart/form-data`
- **Form Parameters**:
  - `title` (String, required): Brief title of the issue
  - `description` (String, required): Detailed description
  - `category` (String, required): e.g. `Electrical`, `Plumbing and Water Leakage`, `Furniture`, `Cleanliness`, `Wi-Fi and Network`, `Classroom Maintenance`, `Laboratory Equipment`, `Safety and Security`, `Other`
  - `location` (String, required): Building, block, room or area
  - `priority` (String, optional, default: `MEDIUM`): `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`
  - `files` (MultipartFile[], optional): JPG, PNG, WEBP, or GIF images (max 10MB each)
- **Response (201 Created)**: Returns created `ComplaintDto`.

### 2.2 Get Filtered & Paginated Complaints
- **Endpoint**: `GET /api/complaints`
- **Access**: Authenticated (Role-scoped):
  - `STUDENT`: Automatically restricted to own complaints
  - `STAFF`: Automatically restricted to department or assigned tasks
  - `ADMIN`: Access to all campus complaints
- **Query Parameters**:
  - `status`: `Reported`, `In Progress`, `Resolved`, `Cancelled`
  - `category`: Category name
  - `departmentId`: Department ID
  - `priority`: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`
  - `search`: Search query string
  - `page`: Page index (default: `0`)
  - `size`: Page size (default: `10`)
  - `sortBy`: Field name (default: `createdAt`)
  - `direction`: `asc` or `desc` (default: `desc`)
- **Response (200 OK)**: Returns `PagedResponse<ComplaintDto>`.

### 2.3 Get Complaint Details
- **Endpoint**: `GET /api/complaints/{id}`
- **Access**: Authenticated (Authorized roles)
- **Response (200 OK)**:
  ```json
  {
    "id": 1,
    "referenceNo": "CMP-20261010-A101",
    "title": "Water pipe leaking under sink in Science Block Room 204",
    "description": "Water has been continuously dripping and pooling on the washroom floor.",
    "category": "Plumbing and Water Leakage",
    "location": "Science Block, 2nd Floor, Room 204 Washroom",
    "priority": "HIGH",
    "status": "In Progress",
    "student": {
      "id": 5,
      "username": "student_john",
      "fullName": "John Doe (CS Student)"
    },
    "department": {
      "id": 2,
      "name": "Plumbing & Water Supply",
      "code": "PLUMB"
    },
    "assignedStaff": {
      "id": 3,
      "fullName": "David Water (Plumbing)",
      "email": "plumb.staff@campus.edu"
    },
    "attachments": [],
    "statusHistory": [
      {
        "id": 1,
        "newStatus": "Reported",
        "actionType": "SUBMITTED",
        "performedByName": "John Doe (CS Student)",
        "createdAt": "2026-10-10T09:30:00Z"
      },
      {
        "id": 2,
        "newStatus": "In Progress",
        "actionType": "ASSIGNED",
        "notes": "Assigned to Plumbing Department and technician David Water",
        "performedByName": "System Administrator",
        "createdAt": "2026-10-11T10:00:00Z"
      }
    ]
  }
  ```

### 2.4 Track Complaint by Reference Number
- **Endpoint**: `GET /api/complaints/ref/{referenceNo}`
- **Access**: Authenticated (or Public tracking)
- **Response (200 OK)**: Returns full `ComplaintDto` with status history.

### 2.5 Assign Complaint to Department / Staff
- **Endpoint**: `PUT /api/complaints/{id}/assign`
- **Access**: `ROLE_ADMIN`
- **Request Body**:
  ```json
  {
    "departmentId": 2,
    "staffId": 3,
    "priority": "CRITICAL",
    "notes": "Urgent repair needed before lab session."
  }
  ```
- **Response (200 OK)**: Returns updated `ComplaintDto` in `In Progress` status.

### 2.6 Update Complaint Status & Resolve
- **Endpoint**: `PUT /api/complaints/{id}/status`
- **Access**: `ROLE_STAFF` or `ROLE_ADMIN`
- **Request Body (Marking Resolved)**:
  ```json
  {
    "status": "Resolved",
    "resolutionNotes": "Replaced cracked gasket and tightened coupling. No further leaks detected.",
    "notes": "Completed repair"
  }
  ```
- **Response (200 OK)**: Returns updated `ComplaintDto`.

### 2.7 Cancel Complaint
- **Endpoint**: `PUT /api/complaints/{id}/cancel`
- **Access**: `ROLE_STUDENT` (Permitted only if still `Reported` and unassigned)
- **Response (200 OK)**: Returns cancelled `ComplaintDto`.

---

## 3. Department Management Endpoints

- `GET /api/departments`: List active departments (Public/Authenticated)
- `GET /api/departments/all`: List all departments including deactivated (`ROLE_ADMIN`)
- `GET /api/departments/{id}`: Get department details
- `POST /api/departments`: Create department (`ROLE_ADMIN`)
  ```json
  {
    "name": "HVAC & Air Conditioning",
    "code": "HVAC",
    "description": "Central cooling and lecture hall duct maintenance",
    "contactEmail": "hvac@campus.edu",
    "contactPhone": "+1-555-0107"
  }
  ```
- `PUT /api/departments/{id}`: Update department (`ROLE_ADMIN`)
- `DELETE /api/departments/{id}`: Deactivate department (`ROLE_ADMIN`)

---

## 4. User & Staff Management Endpoints

- `GET /api/users/profile`: Get current profile (`Authenticated`)
- `PUT /api/users/profile`: Update profile (full name, phone, password)
- `GET /api/admin/users`: List all system users (`ROLE_ADMIN`)
- `GET /api/admin/users/role/{role}`: Filter users by role (`ROLE_ADMIN`)
- `POST /api/admin/staff`: Create new staff account (`ROLE_ADMIN`)
  ```json
  {
    "username": "tech_smith",
    "email": "smith@campus.edu",
    "password": "Staff@123",
    "fullName": "Alan Smith",
    "phoneNumber": "+1-555-0199",
    "departmentId": 1
  }
  ```
- `PATCH /api/admin/users/{id}/status?active={true|false}`: Toggle active status (`ROLE_ADMIN`)
- `GET /api/users/staff/department/{departmentId}`: Get staff members of a department

---

## 5. Dashboard Statistics Endpoints

- `GET /api/dashboard/admin`: Complete campus metrics, workload, and category distribution (`ROLE_ADMIN`)
- `GET /api/dashboard/student`: Student's complaint summary counts and recent reports (`ROLE_STUDENT`)
- `GET /api/dashboard/staff`: Staff assigned task counts and active queue (`ROLE_STAFF`)

---

## 6. Notifications Endpoints

- `GET /api/notifications`: List current user's notifications (paginated)
- `GET /api/notifications/unread-count`: Get count of unread notifications
- `PATCH /api/notifications/{id}/read`: Mark notification as read
- `PATCH /api/notifications/read-all`: Mark all notifications as read

---

## 7. File Attachments Endpoint

- `GET /api/attachments/{fileName}`: Download or inline view of uploaded image file.
