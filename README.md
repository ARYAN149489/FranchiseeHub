# FranchiseHub 🏢

> A modern, full-stack franchise management system for streamlining applications, sales tracking, and franchisee operations.

🌐 **Live Demo:** [https://franchiseehub.netlify.app/](https://franchiseehub.netlify.app/)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v14+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4+-green.svg)](https://www.mongodb.com/)

FranchiseHub provides a unified platform for managing the complete franchise lifecycle—from application submission to daily sales tracking. Built with React, Node.js, and MongoDB.

## ✨ Key Features

**For Administrators:**
- 📋 Application management (review, accept, reject, grant)
- 👥 Franchisee monitoring and analytics
- 📊 Sales reports and performance metrics
- ⚙️ System configuration and settings

**For Franchisees:**
- 💰 Daily sales entry and tracking
- 📈 Interactive charts and analytics
- 📅 Sales history with calendar view
- 🆘 Built-in help and support system

**For Applicants:**
- 📝 Online application submission
- ✉️ Automated email notifications
- 🎨 Modern, responsive landing page


## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB (v4.4+)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/franchisehub.git
cd franchisehub
```

2. **Backend Setup**
```bash
cd nodejsbce
npm install
node initializeAdmin.js  # Creates default admin account
node server.js           # Starts on http://localhost:2016
```

3. **Frontend Setup** (in new terminal)
```bash
cd vite-project
npm install
npm run dev              # Starts on http://localhost:5173
```

4. **Default Admin Login**
```
Email: admin@franchisehub.com
Password: admin123
```

## 🛠️ Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, React Router, Chart.js  
**Backend:** Node.js, Express, JWT Authentication  
**Database:** MongoDB, Mongoose  
**Email:** Nodemailer


## 📁 Project Structure

```
FranchiseHub/
├── nodejsbce/              # Backend (Node.js + Express)
│   ├── controllers/        # Business logic
│   ├── models/            # MongoDB schemas
│   ├── routers/           # API routes
│   └── server.js          # Entry point
└── vite-project/          # Frontend (React + Vite)
    └── src/
        ├── components/
        │   ├── show applications/    # Admin Dashboard
        │   └── user_dashboard/       # Franchisee Dashboard
        └── App.jsx
```


## 🔌 API Endpoints

### Admin
- `POST /admin/login` - Admin authentication
- `GET /admin/allApplicants` - Get all applications
- `POST /admin/acceptApplicant` - Accept application
- `POST /admin/grantApplicant` - Grant franchise
- `GET /admin/franchisees` - Get all franchisees

### Applicant
- `POST /applicant/saveApplication` - Submit application
- `GET /applicant/checkStatus` - Check application status

### Franchisee
- `POST /franchisee/login` - Franchisee authentication
- `POST /franchisee/saveSales` - Save daily sales
- `GET /franchisee/getSales` - Get sales data
- `POST /franchisee/sendHelpMessage` - Contact admin

## 💾 Database Schema

**Collections:** `admins`, `applicants`, `franchise_Credentails`, `t_salesdatas`, `adminSettings`

<details>
<summary>View detailed schemas</summary>

```javascript
// Applicants
{
  fname, lname, email, phone,
  site_city, site_state, site_address,
  status: 0=Pending, 1=Accepted, 2=Granted, 3=Rejected,
  doa, experience, notes
}

// Franchisees
{
  email, password, dof,
  createdAt, updatedAt
}

// Sales Data
{
  email, date, sales, notes,
  createdAt, updatedAt
}
```
</details>

---

## 🚧 Future Enhancements

### High Priority
- 🔐 **Password Hashing** - Implement bcrypt (currently plain text)
- 📊 **Consolidated Charts** - Merge duplicate chart components
- 🔔 **Notification System** - In-app notifications and real-time updates
- 📱 **Mobile App** - React Native version
- 🛡️ **2FA & Advanced Security** - Multi-factor authentication

### Medium Priority
- 📄 **Reporting & Export** - PDF reports, CSV exports
- 🔍 **Advanced Search** - Multi-field filters and saved queries
- 💳 **Payment Integration** - Stripe/PayPal for franchise fees
- 🌍 **Multi-language** - i18n support

<details>
<summary>View all planned features</summary>

- Forgot password functionality
- File upload system for documents
- Role-based access control (RBAC)
- Audit logging and compliance
- Dark mode support
- Real-time chat between admin and franchisees
- Advanced analytics and forecasting
- Training portal and resources
- API documentation (Swagger)
- Comprehensive test coverage
</details>

## 👤 Author

**Aryan Kansal**  
📧 Email: Aryankansal113@gmail.com  
💼 GitHub: [@ARYAN149489](https://github.com/ARYAN149489)

**Kalpana**  
📧 Email: kalpana_kalpana@sfu.ca  
💼 GitHub: [@kkkalpana](https://github.com/kkkalpana)

---

<div align="center">
  
**⭐ Star this repo if you find it helpful!**

© 2026 FranchiseHub

</div>
