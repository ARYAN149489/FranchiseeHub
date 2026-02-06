# FranchiseeHub

A franchise management system for handling applications, franchisee operations, and sales tracking.

**Live Demo:** [franchiseehub.netlify.app](https://franchiseehub.netlify.app/)

## Features

- **Admin Dashboard**: Application review, franchisee management, sales analytics
- **Franchisee Portal**: Daily sales entry, interactive charts, history tracking
- **Applicant Interface**: Online application submission, status tracking

## Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, Recharts  
**Backend:** Node.js, Express.js, Mongoose, Nodemailer  
**Database:** MongoDB Atlas  
**DevOps:** Docker, Docker Compose

## Architecture

### System Overview

```
                                    ┌──────────────────────┐
                                    │   MongoDB Atlas      │
                                    │   (Cloud Database)   │
                                    └──────────┬───────────┘
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    │                          │                          │
                    ▼                          ▼                          ▼
            ┌───────────────┐         ┌───────────────┐         ┌───────────────┐
            │   Admins      │         │  Applicants   │         │  Franchisees  │
            │  Collection   │         │  Collection   │         │  Collection   │
            └───────────────┘         └───────────────┘         └───────────────┘
                    │                          │                          │
                    └──────────────────────────┼──────────────────────────┘
                                               │
                                               ▼
                                    ┌──────────────────────┐
                                    │   Express.js API     │
                                    │   (Port 2016)        │
                                    │                      │
                                    │  - Controllers       │
                                    │  - Models (Mongoose) │
                                    │  - Routes            │
                                    │  - Middleware        │
                                    └──────────┬───────────┘
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    │                          │                          │
                    ▼                          ▼                          ▼
            ┌───────────────┐         ┌───────────────┐         ┌───────────────┐
            │  Admin Routes │         │ Applicant Rts │         │Franchisee Rts │
            │  /admin/*     │         │ /applicant/*  │         │ /franchisee/* │
            └───────┬───────┘         └───────┬───────┘         └───────┬───────┘
                    │                         │                         │
                    └─────────────────────────┼─────────────────────────┘
                                              │
                                              │ HTTP/REST
                                              │
                                              ▼
                                    ┌──────────────────────┐
                                    │   React Frontend     │
                                    │   (Port 80/5173)     │
                                    │                      │
                                    │  - Components        │
                                    │  - Pages             │
                                    │  - State Mgmt        │
                                    └──────────────────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    │                         │                         │
                    ▼                         ▼                         ▼
            ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
            │Admin         │         │Applicant     │         │Franchisee    │
            │Dashboard     │         │Landing       │         │Dashboard     │
            └──────────────┘         └──────────────┘         └──────────────┘


                                    ┌──────────────────────┐
                                    │  Gmail SMTP          │
                                    │  (Email Service)     │
                                    └──────────────────────┘
                                              ▲
                                              │
                                    (Nodemailer from API)
```

### Request Flow

**1. User Authentication**

```
User → Frontend → POST /admin|franchisee/login → Express API → MongoDB
     ← JWT ← Session Created ← Response ←
```

**2. Application Submission**

```
Applicant → Form → POST /applicant/apply → API → MongoDB (Save)
                                                → Nodemailer → Email Notification
```

**3. Sales Data Entry**

```
Franchisee → Dashboard → POST /franchisee/sales → API → MongoDB
           ← Updated Chart Data ← Sales Saved ← Response ←
```

### Design Patterns

- **MVC (Model-View-Controller)**: Separation of business logic, data models, and presentation
- **RESTful API**: Resource-based endpoints with standard HTTP methods
- **Repository Pattern**: Mongoose models abstract database operations
- **Middleware Pipeline**: Request processing through authentication, validation, error handling
- **Role-Based Access Control (RBAC)**: Three distinct user roles with protected routes

### Components

**Backend (Express.js)**

- Controllers: Handle business logic for each role
- Models: Mongoose schemas for data validation
- Routes: API endpoint definitions
- Middleware: Authentication, error handling, session management

**Frontend (React)**

- Pages: Role-specific dashboards (Admin, Franchisee, Applicant)
- Components: Reusable UI elements (forms, charts, tables)
- Config: API client and environment configuration

**Database (MongoDB)**

- Collections: admins, applicants, franchiseCredentials, salesData
- Indexes: Compound indexes on (email, date) for query optimization

## Quick Start with Docker

**Prerequisites:** Docker & Docker Compose installed

1. **Clone the repo**

   ```bash
   git clone https://github.com/kkkalpana/FranchiseeHub.git
   cd FranchiseeHub
   ```

2. **Setup environment**

   ```bash
   cp backend/.env.example backend/.env
   ```

   Edit `backend/.env` with your MongoDB Atlas URI and email settings

3. **Run**

   ```bash
   docker compose up --build
   ```

4. **Access**
   - Frontend: http://localhost
   - Backend API: http://localhost:2016

**Default Admin Login:**

```
Email: admin@franchisehub.com
Password: admin123
```

## Project Structure

```
FranchiseeHub/
├── backend/                # Node.js + Express API
│   ├── controllers/        # Business logic
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API endpoints
│   ├── config/            # Configuration
│   ├── Dockerfile         # Backend container
│   └── server.js          # Entry point
├── frontend/              # React + Vite app
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page views
│   │   └── config/        # API config
│   └── Dockerfile         # Frontend container
└── docker-compose.yml     # Multi-container setup
```

## Manual Setup (Without Docker)

### Backend

```bash
cd backend
npm install
node server.js              # Runs on port 2016
```

### Frontend

```bash
cd frontend
npm install
npm run dev                 # Runs on port 5173
```

**Environment Variables:**

- Backend: Create `backend/.env` from `.env.example`
- Frontend: Set `VITE_API_URL=http://localhost:2016`

## API Endpoints

**Admin:** `/admin/login`, `/admin/applications`, `/admin/franchisees`, `/admin/sales`  
**Applicant:** `/applicant/apply`, `/applicant/status/:email`  
**Franchisee:** `/franchisee/login`, `/franchisee/sales`, `/franchisee/sales/analytics`

## Authors

**Aryan Kansal** - [GitHub](https://github.com/ARYAN149489) • aryankansal113@gmail.com

**Kalpana** - [GitHub](https://github.com/kkkalpana) • kalpana_kalpana@sfu.ca

**Star this repo if you find it helpful!**
