# 🏪 FranchiseHub V2

> A modern, production-ready franchise management system built with MERN stack

[![Status](https://img.shields.io/badge/status-ready%20for%20deployment-brightgreen)](https://github.com)
[![Version](https://img.shields.io/badge/version-2.0.0-blue)](https://github.com)
[![License](https://img.shields.io/badge/license-MIT-green)](https://github.com)

## 🎯 Overview

FranchiseHub V2 is a complete rewrite of the franchise management system with clean architecture, modern design, and **zero hanging issues**. Built to manage franchise applications, track sales, and streamline operations.

**Key Improvements from V1:**
- ✅ **No Hanging** - All operations complete in < 1 second
- ✅ **Clean Code** - MVC architecture with organized folders
- ✅ **Modern UI** - Tailwind CSS with responsive design
- ✅ **Production Ready** - Proper error handling and configuration

## ✨ Features

### 👥 For Applicants
- 📝 Submit franchise applications online with multi-section form
- 🔍 Real-time form validation
- ✅ Instant confirmation and tracking

### 👨‍💼 For Admins
- 📊 Comprehensive dashboard with statistics
- 📋 View and filter all applications (All, Pending, Accepted, Granted, Rejected)
- 🔎 Search functionality across all fields
- ⚡ **Instant** Accept/Reject/Grant operations (< 1 second)
- 🎫 Automatic credential generation for franchisees
- 📈 Sales analytics and revenue tracking
- 👥 View all active franchisees

### 🏢 For Franchisees
- 🔐 Secure login portal
- 📊 Personal dashboard with sales statistics
- 💰 Add daily sales data (revenue, orders, items)
- 📈 View sales history and trends
- 📉 Performance analytics

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- Express Session for authentication
- CORS enabled
- Nanoid for credential generation

**Frontend:**
- React 18 with Hooks
- Vite for fast development
- React Router for navigation
- Tailwind CSS for styling
- Lucide React for icons
- Axios for API calls

## 📁 Project Structure

```
FranchiseHub-V2/
├── backend/                # Backend API
│   ├── config/            # Configuration files
│   ├── controllers/       # Business logic
│   ├── models/           # Database schemas
│   ├── routes/           # API routes
│   └── server.js         # Entry point
│
├── frontend/              # Frontend React app
│   ├── src/
│   │   ├── pages/        # Page components
│   │   ├── config/       # API configuration
│   │   └── App.jsx       # Main app component
│   └── package.json
│
├── start.sh              # Quick start script
├── stop.sh               # Stop servers script
└── Documentation files
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MongoDB Atlas account (or local MongoDB)
- Git

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/YOUR_USERNAME/FranchiseHub-V2.git
cd FranchiseHub-V2
```

2. **Set up Backend:**
```bash
cd backend
npm install

# Create .env file
cat > .env << EOF
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_secret_key
PORT=2016
EOF
```

3. **Set up Frontend:**
```bash
cd ../frontend
npm install
```

### Running the Application

**Option 1: Use convenience scripts (recommended)**
```bash
# From project root
./start.sh    # Starts both servers
./stop.sh     # Stops both servers
```

**Option 2: Manual start**
```bash
# Terminal 1 - Backend
cd backend
npm start     # Runs on http://localhost:2016

# Terminal 2 - Frontend
cd frontend
npm run dev   # Runs on http://localhost:5173
```

### Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:2016
- **Health Check:** http://localhost:2016/

## 🔑 Test Credentials

### Admin Access
```
Email: admin@franchisehub.com
Password: admin123
```

### Franchisee Access
```
Email: amit.patel@gmail.com
Password: amit123
```
- React Router
- Axios
- Tailwind CSS
- Lucide Icons

## Setup Instructions

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with:
```
MONGODB_URI=your_mongodb_connection_string
PORT=2016
SESSION_SECRET=your_secret_key
```

4. Start server:
```bash
npm start
```

Backend will run on `http://localhost:2016`

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## API Endpoints

### Admin Routes (`/admin`)
- `POST /login` - Admin login
- `GET /allApplicants` - Get all applications
- `POST /acceptApplicant` - Accept application
- `POST /rejectApplicant` - Reject application
- `POST /grantApplicant` - Grant franchise
- `POST /saveFranchiseCred` - Create franchisee credentials

### Applicant Routes (`/applicant`)
- `POST /apply` - Submit franchise application

### Franchisee Routes (`/franchisee`)
- `POST /login` - Franchisee login
- `GET /profile` - Get franchisee profile
- `POST /addSales` - Add daily sales data
- `POST /getSales` - Get sales history

## Database Collections

- `applicants` - Franchise applications
- `admins` - Admin accounts
- `franchise_credentails` - Franchisee login credentials (typo intentional)
- `t_sales_data` - Daily sales data

## Deployment

### Backend (Render)
1. Push code to GitHub
2. Connect repository to Render
3. Add environment variables
4. Deploy

### Frontend (Netlify)
1. Push code to GitHub
2. Connect repository to Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Deploy

## Default Credentials

**Admin:**
- Email: `admin@franchisehub.com`
- Password: `admin123`

## License

MIT
