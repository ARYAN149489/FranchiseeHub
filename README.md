# 🏢 FranchiseeHub

A comprehensive, enterprise-grade Franchise Management & Sales Tracking System. Built using the MERN stack and designed for modern, multi-location franchise networks to streamline applicant onboarding, franchisee sales reporting, and admin analytics.

**Live Frontend Application:** [https://main.d1fgrmpmh0h0hv.amplifyapp.com/](https://main.d1fgrmpmh0h0hv.amplifyapp.com/)  
**Secure Backend API Endpoint:** [https://franchiseehub-api.duckdns.org/](https://franchiseehub-api.duckdns.org/)

---

## 🚀 Cloud Infrastructure & DevOps Architecture

FranchiseeHub is designed with a modern, decoupled production architecture on Amazon Web Services (AWS) to maximize scalability, security, and developer velocity.

```
                      ┌──────────────────────────────────────┐
                      │            AWS Amplify               │
                      │  - React 19 Frontend Hosting         │
                      │  - Automated GitHub CI/CD Pipeline   │
                      └──────────────────┬───────────────────┘
                                         │
                                         │ HTTPS (Port 443)
                                         ▼
                      ┌──────────────────────────────────────┐
                      │        AWS EC2 (Ubuntu Server)       │
                      │  - Nginx Reverse Proxy (SSL)         │
                      │  - PM2 Process Manager (Node backend)│
                      └──────────────────┬───────────────────┘
                                         │
                                         │ Mongoose Driver
                                         ▼
                      ┌──────────────────────────────────────┐
                      │          MongoDB Atlas Cloud         │
                      │  - Document Store Database           │
                      └──────────────────────────────────────┘
```

### 1. Frontend Hosting: AWS Amplify
* **Continuous Integration / Continuous Deployment (CI/CD)**: Integrated with GitHub to trigger automated build pipelines on every git push to the `main` branch.
* **Environment Configuration**: Secure injection of runtime environment variables (`VITE_API_URL`) during build time to direct frontend queries to the production API.

### 2. Backend Hosting: AWS EC2 & Nginx
* **Server Infrastructure**: Virtual server running on an Ubuntu 24.04 LTS instance.
* **Reverse Proxy**: **Nginx** handles secure SSL termination, routes HTTP traffic to HTTPS, and forwards API requests internally to the Express service.
* **SSL/TLS Security**: Configured with Let's Encrypt certificates via **Certbot** for full end-to-end data encryption.
* **Process Management**: Powered by **PM2** to manage the Node.js application process with zero-downtime reloads and automatic restarts on system boot.

### 3. Database: MongoDB Atlas
* Cloud-native, managed database cluster ensuring high availability, automatic scaling, and secure document storage.

---

## 💎 Features & Role-Based Workflows

The application supports three distinct user roles, each with custom dashboards and workflows:

### 💼 1. Admin & Super Admin Dashboard
* **Applicant Pipeline**: Review incoming applications, accept/reject submissions, and dynamically generate secure login credentials for approved franchisees.
* **Franchise Management**: Manage the active franchisee directory, modify profiles, and monitor operational parameters.
* **Sales Analytics**: Visualize system-wide revenue, track high-performing locations, and query specific sales histories by date range.

### 🥼 2. Franchisee Portal
* **Daily Sales Entry**: Streamlined interface for entering daily revenue figures.
* **Interactive Charting**: Location-specific dashboard containing weekly, monthly, and year-to-date sales comparisons (powered by Recharts).
* **Historical Auditing**: Date-filtered transaction tables allowing owners to track historical performances.

### 📝 3. Applicant Interface
* **Onboarding Portal**: Multi-step application form collecting personal information, proposed business locations, financial statements, and operational experience.
* **Status Checker**: Email-linked dashboard showing real-time feedback of the application review status (`pending`, `accepted`, `rejected`, `granted`).

---

## 🛠️ Technical Stack & Engineering Patterns

### Frontend
* **React 19** (Functional Components, Hooks)
* **Vite** (Optimized bundler and development environment)
* **Tailwind CSS** (Utility-first responsive layouts)
* **Recharts** (Declarative data visualization charts)
* **Lucide React** (Vector iconography library)

### Backend
* **Node.js** & **Express.js** (REST API)
* **Mongoose** (Object Document Mapper for schema enforcement)
* **Nodemailer** (Transporter for system notification emails)
* **Bcrypt** (Secure 10-salt hashing for password verification)
* **Express Session** (Secure cookie-based state validation)

### Production-Grade Design Patterns
* **MVC (Model-View-Controller)**: Separation of structural data models, client presentation, and server business logic.
* **CORS Guardrails**: Configured CORS middleware to dynamically evaluate request origins, blocking unauthorized clients in production while maintaining development accessibility.
* **Input Validation & Safety**: Server-side checks to prevent injection, sanitizing body payloads before database interaction.

---

## 📂 Project Directory Structure

```
FranchiseeHub/
├── backend/                # Node.js + Express REST API
│   ├── controllers/        # Business logic & route handlers
│   ├── models/            # Mongoose MongoDB schemas
│   ├── routes/            # Express endpoint routers
│   ├── config/            # Server & database environment configs
│   ├── utils/             # Helper libraries (e.g. Email service)
│   ├── Dockerfile         # Production backend container build
│   └── server.js          # API entry point
├── frontend/              # React 19 Single Page Application (SPA)
│   ├── src/
│   │   ├── components/    # Reusable & layout UI components
│   │   ├── pages/         # Dashboard & login views
│   │   └── config/        # API client configs
│   ├── Dockerfile         # Frontend asset builder & web server container
│   └── vite.config.js     # Bundler configuration
└── docker-compose.yml     # Multi-container local orchestration script
```

---

## 🏃 Quick Start Guide

### Option A: Local Run with Docker (Recommended)
Make sure you have Docker and Docker Compose installed.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ARYAN149489/FranchiseeHub.git
   cd FranchiseeHub
   ```
2. **Set up local Environment variables:**
   Create a `.env` file in the `backend/` directory based on `backend/.env.example`.
3. **Launch the containers:**
   ```bash
   docker compose up --build
   ```
4. **Access the app:**
   * Frontend App: `http://localhost`
   * Backend API: `http://localhost:2016`

---

### Option B: Manual Local Installation
#### 1. Start Backend API
```bash
cd backend
npm install
npm run dev
```
*(Runs by default on port `2016`)*

#### 2. Start Frontend App
```bash
cd ../frontend
npm install
npm run dev
```
*(Runs by default on port `5173`)*

---

## 🔐 Credentials for Interviewers / Reviewers

Use these credentials to log in and test the system immediately without going through the sign-up flow:

### Admin Dashboard (Super Admin)
* **URL**: [https://main.d1fgrmpmh0h0hv.amplifyapp.com/admin/login](https://main.d1fgrmpmh0h0hv.amplifyapp.com/admin/login)
* **Email**: `admin@franchisehub.com`
* **Password**: `Aryan@113`

### Franchisee Dashboard
* **URL**: [https://main.d1fgrmpmh0h0hv.amplifyapp.com/login](https://main.d1fgrmpmh0h0hv.amplifyapp.com/login)
* **Email**: `rajesh.kumar@gmail.com`
* **Password**: `FranchiseHub@123`

---

## 📬 Contact & Contributions

* **Aryan Kansal** - Lead Developer & Systems Architect  
  Email: [aryankansal113@gmail.com](mailto:aryankansal113@gmail.com) | GitHub: [@ARYAN149489](https://github.com/ARYAN149489)
* **Kalpana** - Full-Stack Developer  
  Email: [kalpana_kalpana@sfu.ca](mailto:kalpana_kalpana@sfu.ca) | GitHub: [@kkkalpana](https://github.com/kkkalpana)
