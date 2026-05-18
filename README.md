# 🚀 AtomQuest — Enterprise KPI & Goal Governance Portal

## 🏆 AtomQuest Hackathon 1.0 Submission

A modern enterprise-grade KPI governance and employee performance tracking platform designed to streamline organizational goal setting, approvals, quarterly reviews, and analytics.

---

# 🌐 Live Demo

Frontend URL:  
https://atomquest-portal-zeta-liard.vercel.app

GitHub Repository:  
https://github.com/vijayramadoss/atomquest-portal

---

# 📌 Project Overview

Organizations often struggle with fragmented goal management systems involving spreadsheets, emails, and disconnected review cycles.

AtomQuest solves this by providing a centralized web-based portal for:

- Goal creation & tracking
- Role-based workflows
- Quarterly achievement check-ins
- Approval governance
- KPI visibility
- Real-time analytics dashboards

The platform supports complete workflows for:

- Employee
- Manager
- Admin / HR Teams

---

# ✨ Core Features

## 🔐 Authentication & Role Management

- Secure JWT-based authentication
- Role-based access control
- Separate dashboards for:
  - Employee
  - Manager
  - Admin

---

## 👨‍💼 Employee Workspace

Employees can:

- Create KPI goal sheets
- Define:
  - Goal title
  - Description
  - Thrust area
  - Weightage
  - Targets
  - Measurement types
- Submit goals for approval
- Track quarterly achievements
- Update progress status:
  - Not Started
  - On Track
  - Completed

### Validation Rules Implemented

- Total goal weightage must equal 100%
- Minimum goal weightage: 10%
- Maximum goals allowed: 8

---

## 🧑‍💼 Manager Approval Center

Managers can:

- Review employee submissions
- Approve or reject goals
- Request rework
- Monitor review queues
- Track team review performance
- Add quarterly review feedback
- Monitor KPI completion progress

---

## 🛡️ Admin Governance Console

Admins can:

- Monitor organization-wide KPIs
- Track quarterly completion trends
- View governance analytics
- Push shared organizational goals
- Manage approval workflows
- View escalation modules
- Access reporting dashboards

---

# 📊 Analytics & Insights

The platform includes:

- Quarterly completion tracking
- Goal performance analytics
- Approval metrics
- Governance dashboards
- Team KPI monitoring
- Review activity tracking

---

# 🏗️ Tech Stack

## Frontend
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Lucide Icons
- Zustand State Management
- shadcn/ui

## Backend
- Node.js
- Express.js
- TypeScript

## Database
- MongoDB Atlas

## Authentication
- JWT Authentication

## Deployment
- Vercel (Frontend)
- Render (Backend)

---

# 🧠 System Architecture

```text
Frontend (Next.js + React)
            ↓
Backend API (Node.js + Express)
            ↓
MongoDB Atlas Database
```

---

# 👥 Demo Credentials

## Employee

```text
Email: realemployee@test.com
Password: employee123
```

## Manager

```text
Email: manager@test.com
Password: manager123
```

## Admin

```text
Email: admin@test.com
Password: admin123
```

---

# ⚙️ Local Setup Instructions

## 1. Clone Repository

```bash
git clone https://github.com/vijayramadoss/atomquest-portal.git
```

---

## 2. Install Dependencies

### Frontend

```bash
cd services/frontend
npm install
```

### Backend

```bash
cd services/backend
npm install
```

---

## 3. Configure Environment Variables

### Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=YOUR_BACKEND_URL
```

### Backend `.env`

```env
MONGODB_URI=YOUR_MONGODB_URI
JWT_SECRET=YOUR_SECRET
PORT=5000
```

---

## 4. Run Development Servers

### Frontend

```bash
npm run dev
```

### Backend

```bash
npm run dev
```

---

# 📂 Project Structure

```text
atomquest-portal/
│
├── services/
│   ├── frontend/
│   └── backend/
│
└── README.md
```

---

# 🎯 Hackathon Requirements Covered

- Goal Creation & Submission
- Goal Validation Rules
- Quarterly Achievement Tracking
- Role-Based Dashboards
- Manager Approval Workflow
- Admin Governance Console
- Analytics Dashboard
- KPI Tracking
- Shared Goal Governance
- Responsive UI
- Live Deployment

---

# 🚀 Future Enhancements

- Microsoft Entra ID Integration
- Email Notifications
- Microsoft Teams Integration
- Advanced Analytics Engine
- AI-powered KPI Suggestions
- Automated Escalation Workflows
- Department Hierarchy Mapping
- Exportable Reports (CSV / Excel)

---

# 👨‍💻 Developer

## Vijay Ramadoss

Solo Hackathon Project Submission for:

### 🏆 AtomQuest Hackathon 1.0

---

# 📄 License

This project is developed for educational and hackathon purposes.
