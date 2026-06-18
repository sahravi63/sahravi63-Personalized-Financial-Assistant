# 💸 Personalized Financial Assistant

A full-stack MERN web application that helps users track income and expenses, visualize spending patterns, manage their financial health, and receive rule-based spending insights — all secured behind JWT-based authentication with role-based access control.

> **GitHub:** [sahravi63/sahravi63-Personalized-Financial-Assistant](https://github.com/sahravi63/sahravi63-Personalized-Financial-Assistant)
> **Version:** 2.0.0 · **Author:** Ravi Sah (Narayan) · SRM IST Chennai, Batch 2023–2027

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Architecture Overview](#architecture-overview)
5. [API Reference](#api-reference)
6. [Database Models](#database-models)
7. [Frontend Components](#frontend-components)
8. [Authentication & Security](#authentication--security)
9. [Environment Variables](#environment-variables)
10. [Getting Started — Local Setup](#getting-started--local-setup)
11. [Available Scripts](#available-scripts)
12. [Deployment](#deployment)
13. [Known Issues & Roadmap](#known-issues--roadmap)
14. [Contributing](#contributing)

---

## Features

### User Features
- **Sign Up / Login** with email and password (bcrypt-hashed, JWT-issued)
- **Password Reset** via emailed token link (Nodemailer)
- **Dashboard** with real-time income vs. expense bar charts (Chart.js), a savings gauge, and monthly breakdowns
- **Income Tracking** — add, list, and delete income entries with category, date, and description
- **Expense Tracking** — add, list, and delete expense entries with category, date, and description
- **Financial Insights** — Rule-based 3-month spending analysis (spend ratio, top category, savings/deficit summary)
- **Profile Management** — update display name and upload a profile picture (JPEG/PNG/GIF, max 5 MB)
- **Sidebar Navigation** — persistent collapsible sidebar shown to logged-in regular users
- **Responsive Design** — dark-theme UI that works on mobile and desktop

### Admin Features
- **Admin Login** — separate login route with admin-specific JWT
- **Admin Dashboard** — overview of all registered users
- **User Management** — view and manage the user list

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, React Router v6, Axios, Chart.js 4, react-chartjs-2, react-gauge-chart |
| **Backend** | Node.js, Express 4 |
| **Database** | MongoDB (Mongoose 8) |
| **Auth** | JSON Web Tokens (jsonwebtoken), bcrypt |
| **File Uploads** | Multer (disk storage, 5 MB limit) |
| **Email** | Nodemailer |
| **Security** | Helmet, express-rate-limit, express-validator, CORS whitelist |
| **Build Tool** | Create React App (react-scripts 5) |
| **Dev Tools** | Nodemon, ESLint (react-app + hooks) |
| **Deployment** | Vercel (backend + frontend via vercel.json) |

---

## Project Structure

```
financial-assistant-fixed/
├── backend/
│   ├── controllers/                 # removed legacy endpoint controllers; expense/income logic now lives in standalone routes
│   ├── db/
│   │   ├── config.js                # Mongoose connection helper
│   │   ├── Admin.js                 # Admin model
│   │   ├── Expense.js               # Expense model
│   │   ├── Income.js                # Income model
│   │   ├── PasswordReset.js         # Password reset token model
│   │   └── User.js                  # User model (with role, profilePic)
│   ├── middleware/
│   │   ├── authenticateToken.js     # JWT verification + user hydration
│   │   └── errorHandler.js          # Global error handler
│   ├── routes/
│   │   ├── adminRoutes.js           # Admin login + admin-only routes
│   │   ├── authRoutes.js            # Register, login, password reset
│   │   ├── expenseRoutes.js         # /api/expenses CRUD
│   │   ├── incomeRoutes.js          # /api/incomes CRUD
│   │   ├── insightsRoutes.js        # /api/insights (3-month analysis)
│   │   ├── profileRoutes.js         # /api/current-user, /api/updateProfile
│   │   ├── summaryRoutes.js         # /api/summary (monthly aggregates)
│   │   └── userRoutes.js            # /users listing
│   ├── test/
│   │   └── port.test.js             # Port startup test (Node built-in test runner)
│   ├── utils/
│   │   └── serverConfig.js          # listenWithFallback utility
│   ├── adminAuthenticate.js         # Admin JWT middleware
│   ├── index.js                     # App entry point — Express setup, DB init
│   ├── vercel.json                  # Vercel serverless config for backend
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── api.js                   # Single Axios instance (baseURL + JWT interceptor)
│   │   ├── App.js                   # Root component — routing + auth state
│   │   ├── App.css                  # Global dark-theme styles
│   │   ├── context/
│   │   │   └── UserContext.js       # React context for user state
│   │   └── components/
│   │       ├── Admin/
│   │       │   ├── AdminDashboard.js
│   │       │   ├── AdminLogin.js
│   │       │   └── Users.js
│   │       ├── DashBoard/
│   │       │   ├── dashboard.jsx        # Main dashboard page
│   │       │   ├── dashboard.css
│   │       │   ├── chart.js             # Chart configuration helpers
│   │       │   ├── NotificationsPanel.jsx
│   │       │   ├── QuickTransfer.jsx
│   │       │   ├── RemindersPanel.jsx
│   │       │   └── TasksPanel.jsx
│   │       ├── Footer/
│   │       │   ├── Footer.js
│   │       │   └── Footer.css
│   │       ├── Home/
│   │       │   ├── homepage.js
│   │       │   └── homePage.css
│   │       ├── Layout/
│   │       │   ├── Layout.js
│   │       │   ├── Sidebar.jsx          # Collapsible sidebar (logged-in users)
│   │       │   └── sidebar.css
│   │       ├── Login/
│   │       │   └── Login.js
│   │       ├── mainpage/
│   │       │   ├── mainpage.jsx         # Income + expense entry hub
│   │       │   ├── AddExpense.js
│   │       │   ├── AddIncome.js
│   │       │   ├── ExpenseList.js
│   │       │   ├── IncomeList.js
│   │       │   ├── UserForm.js
│   │       │   └── main.css
│   │       ├── Nav.js                   # Top nav (non-sidebar layout)
│   │       ├── PrivateRoute.js
│   │       ├── profile.jsx              # Profile page component
│   │       ├── profile.css
│   │       ├── ResetPassword.js
│   │       ├── ResetPasswordRequest.js
│   │       └── SignUp.js
│   └── package.json
└── package-lock.json
```

---

## Architecture Overview

```
Browser (React SPA)
        │
        │  HTTP + JWT Bearer token
        ▼
Express REST API  (port 8080 default, fallback to next free port)
        │
        ├── /api/...         ← User routes (auth, profile, income, expenses, summary, insights)
        ├── /admin/...       ← Admin routes
        └── /uploads/...     ← Static file serving (profile pictures)
                │
                ▼
        MongoDB (Mongoose)
        ├── users collection
        ├── expenses collection
        ├── incomes collection
        └── passwordresets collection
```

**Auth flow:**

1. User signs up / logs in → server issues a JWT signed with `JWT_SECRET`.
2. Frontend stores the JWT access token in `localStorage` and attaches it as `Authorization: Bearer <token>` on every Axios request via a request interceptor. Admin refresh tokens are rotated by the backend and validated on refresh requests.
3. `authenticateToken` middleware verifies the token, looks up the full User document, and attaches it to `req.user`.
4. On 401 response, the Axios response interceptor removes the token and redirects to `/login`.

---

## API Reference

All user routes are prefixed with `/api`. All routes marked 🔒 require `Authorization: Bearer <JWT>` header.

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/register` | — | Register new user. Body: `{ username, email, password }` |
| POST | `/api/login` | — | Login. Body: `{ email, password }`. Returns `{ token, user }` |
| POST | `/api/forgot-password` | — | Send password reset email. Body: `{ email }` |
| POST | `/api/reset-password/:token` | — | Reset password. Body: `{ password }` |

### Profile

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/current-user` | 🔒 | Returns `{ name, username, email, profilePic }` for the current user |
| POST | `/api/updateProfile` | 🔒 | Update display name and/or profile picture. `multipart/form-data`: `name` (string), `profilePic` (file, optional) |

### Expenses

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/expenses` | 🔒 | List all expenses for the current user |
| POST | `/api/expenses` | 🔒 | Add an expense. Body: `{ amount, category, description, date }` |
| DELETE | `/api/expenses/:id` | 🔒 | Delete an expense by ID |

### Incomes

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/incomes` | 🔒 | List all incomes for the current user |
| POST | `/api/incomes` | 🔒 | Add income. Body: `{ amount, category, description, date }` |
| DELETE | `/api/incomes/:id` | 🔒 | Delete an income by ID |

### Summary (Dashboard)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/summary` | 🔒 | Monthly income/expense totals + category breakdown. Query: `?months=6` (1–24, default 6). Returns `{ labels, expenseTotals, incomeTotals, expenseByCategory, totalExpenses, totalIncome, netSavings, gaugePercent }` |

### Insights

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/insights` | 🔒 | Rule-based 3-month spending analysis. Returns `{ insight }` (multi-line string) |

### Admin

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/admin/login` | — | Admin login. Body: `{ email, password }`. Returns admin JWT |
| GET | `/admin/users` | 🔒 Admin | List all users |

### Static Files

Uploaded profile pictures are served at:
```
GET /uploads/<filename>
```

---

## Database Models

### User

```js
{
  username:             String (required),
  name:                 String (default ''),
  email:                String (required, unique),
  password:             String (required, bcrypt-hashed),
  role:                 'user' | 'admin' (default 'user'),
  profilePic:           String (path, default ''),
  resetToken:           String,
  resetTokenExpiration: Date,
  timestamps: true
}
```

### Expense

```js
{
  userId:      ObjectId → User (required),
  amount:      Number (required),
  category:    String,
  description: String,
  date:        Date (default: now),
  timestamps: true
}
```

### Income

```js
{
  userId:      ObjectId → User (required),
  amount:      Number (required),
  category:    String,
  description: String,
  date:        Date (default: now),
  timestamps: true
}
```

### PasswordReset

```js
{
  email:     String (required),
  token:     String (required),
  expiresAt: Date (required)
}
```

---

## Frontend Components

### `App.js`
Root component. Manages `isLoggedIn`, `user`, and `isAdmin` state. Conditionally renders `Sidebar` (logged-in regular users) or `Nav` (everyone else). Defines all React Router routes.

### `api.js`
Single Axios instance exported for use across all components. Reads `REACT_APP_API_URL` from environment (defaults to `http://localhost:8080`). Includes:
- **Request interceptor:** injects `Authorization: Bearer <token>` from `localStorage`.
- **Response interceptor:** on 401, clears `localStorage` and redirects to `/login`.

### `DashBoard/dashboard.jsx`
Main post-login view. Fetches `/api/summary` and `/api/insights` on mount. Renders:
- Income vs. expense bar chart (Chart.js)
- Savings gauge (react-gauge-chart)
- Category breakdown
- AI insights panel
- Notifications, Reminders, Quick Transfer, Tasks widgets

### `mainpage/mainpage.jsx`
Transaction management hub. Hosts tabs/sections for adding incomes, adding expenses, viewing income list, and viewing expense list.

### `components/profile.jsx`
User profile editor. Features:
- Loads username, display name, email, and profile picture from `/api/current-user`
- Initials-based avatar fallback when no photo is set
- Cross-browser file picker (hidden `<input>` + styled `<label>`)
- Local blob URL preview before upload
- Saving state (disabled button, "Saving…" label)
- Success / error feedback with colour-coded messages
- Logout button wired to `onLogout` prop + `navigate('/')`

### `Layout/Sidebar.jsx`
Collapsible left sidebar shown to authenticated non-admin users. Contains navigation links and a mini profile display.

### `Admin/`
Separate admin flow: `AdminLogin.js` authenticates against `/admin/login`, `AdminDashboard.js` shows system overview, `Users.js` lists all users.

---

## Authentication & Security

| Mechanism | Detail |
|---|---|
| Password hashing | `bcrypt` with salt rounds = 10 |
| Token signing | `jsonwebtoken` — token payload includes `{ id, role }` |
| Token storage | `localStorage` (client-side) |
| Protected routes | `authenticateToken` middleware on all `/api` routes that need identity |
| Admin routes | Additional `adminAuthenticate` middleware; admin tokens are checked separately |
| Rate limiting | `express-rate-limit` applied globally |
| HTTP headers | `helmet` sets security headers (CSP, HSTS, X-Frame-Options, etc.) |
| CORS | Whitelist of allowed origins via `CORS_ORIGIN` env var |
| Input validation | `express-validator` on auth routes |
| File uploads | Multer restricts to JPEG/PNG/GIF, max 5 MB per file |

> **Note:** For production, consider moving JWT storage from `localStorage` to `httpOnly` cookies to mitigate XSS risk.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `MONGODB_URI` | Yes | `mongodb://localhost:27017/informations` | MongoDB connection string |
| `JWT_SECRET` | Yes | — | Secret used to sign user JWTs |
| `PORT` | No | `8080` | Port the Express server listens on |
| `CORS_ORIGIN` | No | `http://localhost:3000,...` | Comma-separated list of allowed origins |
| `EMAIL_USER` | Yes (for password reset) | — | SMTP username for Nodemailer |
| `EMAIL_PASS` | Yes (for password reset) | — | SMTP password for Nodemailer. Gmail requires a 16-character app password, not the regular Gmail account password. |
| `EMAIL_MODE` | No | `smtp` | Use `console` locally to print password reset links in the backend terminal instead of sending email. |

### Frontend (`frontend/.env.development`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `REACT_APP_API_URL` | No | `http://localhost:8080` | Backend base URL used by `api.js` |

Copy `frontend/.env.example` to `frontend/.env.development` (local) or set in your deployment platform for production.

---

## Getting Started — Local Setup

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- MongoDB running locally (or a MongoDB Atlas connection string)
- Git

### 1. Clone the repository

```bash
git clone https://github.com/sahravi63/sahravi63-Personalized-Financial-Assistant.git
cd sahravi63-Personalized-Financial-Assistant
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/financial_assistant
JWT_SECRET=your_super_secret_key_here
PORT=8080
CORS_ORIGIN=http://localhost:3000
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_character_gmail_app_password
EMAIL_MODE=smtp
```

For Gmail password reset emails, enable 2-Step Verification on the Gmail account, create an App Password, and put that generated 16-character password in `EMAIL_PASS`.
For local reset testing without SMTP, set `EMAIL_MODE=console`, restart the backend, request a reset, and copy the reset link printed in the backend terminal.

Start the backend:

```bash
npm run dev        # development (nodemon, auto-restart)
# or
npm start          # production
```

The server starts on `http://localhost:8080`. On first run it automatically creates a default admin user:
- **Email:** `admin@example.com`
- **Password:** `admin123`

> Change these credentials immediately in production.

### 3. Set up the frontend

Open a new terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env.development`:

```env
REACT_APP_API_URL=http://localhost:8080
```

Start the React dev server:

```bash
npm start
```

The app opens at `http://localhost:3000`.

### 4. Verify the setup

Navigate to `http://localhost:3000`, sign up as a new user, add some incomes and expenses, then check the dashboard for charts and insights.

To test admin access, go to `/admin-login` and use `admin@example.com` / `admin123`.

---

## Available Scripts

### Backend (`cd backend`)

| Script | Command | Description |
|---|---|---|
| Start (prod) | `npm start` | Runs `node index.js` |
| Dev | `npm run dev` | Runs with `nodemon` (auto-restart on file changes) |
| Test | `npm test` | Runs `backend/test/port.test.js` using Node built-in test runner |

### Frontend (`cd frontend`)

| Script | Command | Description |
|---|---|---|
| Dev server | `npm start` | CRA dev server on port 3000 with HMR |
| Build | `npm run build` | Production build to `frontend/build/` |
| Test | `npm test` | Jest + React Testing Library in watch mode |
| Eject | `npm run eject` | Ejects CRA config (irreversible) |

---

## Deployment

### Backend — Vercel Serverless

The `backend/vercel.json` configures Vercel to route all requests to `index.js`:

```json
{
  "version": 2,
  "builds": [{ "src": "index.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "index.js" }]
}
```

Set all environment variables listed in [Environment Variables](#environment-variables) in the Vercel project settings.

> **File uploads:** Vercel's serverless functions have an ephemeral filesystem — uploaded profile pictures are lost on each deployment. For persistent uploads, integrate a cloud storage service such as AWS S3, Cloudinary, or Supabase Storage.

### Frontend — Vercel Static

1. Connect the `frontend/` directory to a new Vercel project.
2. Set `REACT_APP_API_URL` to your deployed backend URL in Vercel environment variables.
3. Vercel auto-detects CRA and runs `npm run build`.

The live frontend is currently deployed at `https://sahravi63-personalized-financial-as.vercel.app/`.

---

## Known Issues & Roadmap

### Current Limitations

- **Profile picture persistence on Vercel:** Multer writes to the local `uploads/` directory, which is ephemeral on serverless platforms. Needs cloud storage integration.
- **Admin JWT separate from user JWT:** Admin and user tokens are managed separately, which adds code complexity. A unified RBAC approach would be cleaner.
- **No pagination:** The income and expense list endpoints return all records for a user; large datasets will slow down response time.

### Roadmap / Future Improvements

- [ ] Cloud storage for profile pictures (AWS S3 / Cloudinary)
- [ ] JWT refresh token flow with `httpOnly` cookie storage
- [ ] Budget goal setting with over-budget alerts
- [ ] Recurring transaction support
- [ ] CSV / PDF export of transaction history
- [ ] Multi-currency support
- [ ] Push notifications / email digests for monthly summaries
- [ ] Unit and integration test coverage (Jest + Supertest on backend)
- [ ] Dark / light theme toggle

---

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request against `main`.

Please follow the existing code style. ESLint config is defined in `frontend/package.json`.

---

## License

ISC — see `package.json`.

---

*Built by  Ravi Sah — SRM Institute of Science and Technology, CSE Batch 2023–2027*
