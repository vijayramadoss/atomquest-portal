\# AtomQuest Portal



\## Overview

AtomQuest Portal is a full-stack enterprise goal management and performance tracking platform designed for Employees, Managers, and Admin/HR teams.



The system enables:

\- Goal creation and tracking

\- Quarterly performance check-ins

\- Manager review and approvals

\- Rework and rejection workflows

\- Admin governance analytics



\---



\# Features



\## Employee Features

\- Employee Login

\- Create Goals

\- Save Draft

\- Submit Goal Sheet

\- Quarterly Tracking (Q1–Q4)

\- Goal Progress Updates

\- Timeline / Numeric / Percentage goals



\## Manager Features

\- Dynamic Employee Team Dashboard

\- Review Employee Goals

\- Edit Goals

\- Weightage Validation

\- Approve Goal Sheets

\- Reject \& Request Rework

\- Quarterly Review Comments



\## Admin Features

\- Governance Dashboard

\- System-wide Analytics

\- KPI Monitoring

\- UOM Distribution Analytics



\---



\# Tech Stack



\## Frontend

\- Next.js

\- TypeScript

\- Tailwind CSS

\- Zustand



\## Backend

\- Express.js

\- Node.js

\- TypeScript

\- JWT Authentication



\## Database

\- MongoDB Atlas



\---



\# Architecture



Browser (Frontend - Next.js)

↓

Express Backend API

↓

MongoDB Atlas Database



\---



\# User Roles



\## Employee

Creates and tracks goals.



\## Manager

Reviews, edits, approves, and rejects employee goals.



\## Admin

Monitors analytics and governance dashboards.



\---



\# Installation



\## Backend



```bash

cd services/backend

npm install

npm run dev

```



\## Frontend



```bash

cd services/frontend

npm install

npm run dev

```



\---



\# Environment Variables



Backend `.env`



```env

MONGO\_URI=your\_mongodb\_uri

JWT\_SECRET=your\_secret

PORT=5005

```



\---



\# Demo Credentials



\## Employee

Email:

realemployee@test.com



Password:

employee123



\## Manager

Email:

manager@test.com



Password:

manager123



\## Admin

Email:

admin@test.com



Password:

admin123



\---





