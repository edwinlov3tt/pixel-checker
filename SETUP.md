# Pixel Checker - Complete Setup Guide

This guide will walk you through setting up the complete Pixel Checker monitoring system, from database to dashboard.

## Overview

The system consists of:
1. **Backend API** (Node.js/Express + PostgreSQL) - Receives and stores pixel data
2. **Frontend Dashboard** (React + Vite) - Displays monitoring data
3. **Heartbeat Snippet** (JavaScript) - Embedded on client sites to detect pixels

## Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 13+ ([Download](https://www.postgresql.org/download/))
- **Git** (optional, for version control)

---

## Part 1: Database Setup

### 1.1 Install PostgreSQL

**macOS (Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download from [postgresql.org](https://www.postgresql.org/download/windows/)

### 1.2 Create Database

```bash
# Access PostgreSQL
psql postgres

# In psql prompt:
CREATE DATABASE pixel_checker;
CREATE USER pixel_checker_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE pixel_checker TO pixel_checker_user;
\c pixel_checker
GRANT ALL ON SCHEMA public TO pixel_checker_user;
\q
```

### 1.3 Run Schema

```bash
cd backend
psql -U pixel_checker_user -d pixel_checker -f db/schema.sql
```

**Verify:**
```bash
psql -U pixel_checker_user -d pixel_checker -c "\dt"
```
You should see 5 tables: organizations, users, sites, heartbeats, site_status

---

## Part 2: Backend API Setup

### 2.1 Install Dependencies

```bash
cd backend
npm install
```

### 2.2 Configure Environment

The `.env` file already exists. Update it with your database credentials:

```bash
# Edit backend/.env
DB_PASSWORD=your_secure_password  # Change this to match what you set in Step 1.2
JWT_SECRET=$(openssl rand -hex 32)  # Or use any secure random string
```

### 2.3 Test Database Connection

```bash
npm run dev
```

You should see:
```
✓ Database connected
🚀 Pixel Checker API running on http://localhost:3001
```

If you see connection errors, verify:
- PostgreSQL is running: `pg_isready`
- Database credentials in `.env` are correct
- Database exists: `psql -l | grep pixel_checker`

### 2.4 Create Test User

Keep the server running, open a new terminal:

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

You should get a success response with user details.

### 2.5 Create Test Site

First, login to get a token:

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

Copy the `token` from the response, then create a site:

```bash
curl -X POST http://localhost:3001/api/sites \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "url": "https://example.com",
    "name": "Test Site",
    "gtmContainerId": "GTM-XXXXXX",
    "ga4MeasurementId": "G-XXXXXXXXXX",
    "metaPixelId": "123456789"
  }'
```

---

## Part 3: Frontend Dashboard Setup

### 3.1 Install Dependencies

```bash
# From project root
npm install
```

### 3.2 Start Frontend

```bash
npm run dev
```

Frontend will start on http://localhost:5173

**Note:** The `.env` file with `VITE_API_URL=http://localhost:3001/api` is already configured.

---

## Part 4: Integrate Frontend with Backend

The frontend currently uses mock data from `localStorage`. To connect it to the real backend API, you'll need to update the React contexts.

### 4.1 Update SitesContext

Replace `/src/contexts/SitesContext.jsx` to use the API instead of localStorage.

**Key changes needed:**
- Import `sitesAPI` from `src/services/api.js`
- Replace `loadFromLocalStorage()` with `sitesAPI.getAll()`
- Replace `addSite()` localStorage logic with `sitesAPI.create()`
- Replace `updateSite()` with `sitesAPI.update()`
- Replace `deleteSite()` with `sitesAPI.delete()`

### 4.2 Add Authentication

Create a login page and protect routes using the authentication from `src/services/api.js`.

---

## Part 5: Deploy Heartbeat Snippet

### 5.1 Host the Snippet

The heartbeat snippet is in `/public/heartbeat.js`. You need to make it accessible to client sites.

**Option A: Serve from your backend**

Add this to `backend/src/server.js`:
```javascript
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use('/static', express.static(path.join(__dirname, '../../public')));
```

Now accessible at: `http://localhost:3001/static/heartbeat.js`

**Option B: Use a CDN**

Upload `heartbeat.js` to a CDN or static hosting service.

### 5.2 Install on Client Sites

**Via Google Tag Manager (Recommended):**

1. In GTM, create a new tag: "Custom HTML"
2. Paste this code:
```html
<script
  src="https://your-domain.com/heartbeat.js"
  data-site-url="https://client-site.com"
  data-api-endpoint="https://your-api.com/api/ingest"
></script>
```
3. Set trigger to "All Pages"
4. Publish container

**Direct Embed:**

Add to client site's `<head>`:
```html
<script
  src="https://your-domain.com/heartbeat.js"
  data-site-url="https://client-site.com"
  data-api-endpoint="https://your-api.com/api/ingest"
></script>
```

### 5.3 Test Snippet

1. Visit a page with the snippet installed
2. Open browser DevTools → Network tab
3. Look for a request to `/api/ingest`
4. Check backend logs for "📊 Heartbeat received"
5. Check dashboard - site status should update

---

## Part 6: Testing End-to-End

### 6.1 Verify Data Flow

1. **Backend running**: http://localhost:3001/health should return `{"status":"ok"}`
2. **Frontend running**: http://localhost:5173 should show dashboard
3. **Database has data**:
   ```bash
   psql -U pixel_checker_user -d pixel_checker -c "SELECT * FROM sites;"
   ```
4. **Snippet installed**: Visit client site, check Network tab for `/ingest` call
5. **Dashboard updates**: Refresh dashboard, verify status dots show real data

### 6.2 Test Pixel Detection

Create a test HTML page:

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Google Tag Manager -->
  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-XXXXXX');</script>

  <!-- Heartbeat Snippet -->
  <script
    src="http://localhost:3001/static/heartbeat.js"
    data-site-url="https://example.com"
    data-api-endpoint="http://localhost:3001/api/ingest"
  ></script>
</head>
<body>
  <h1>Test Page</h1>
</body>
</html>
```

Open in browser and check:
- DevTools Console for "[Pixel Checker]" logs (enable with `data-debug="true"`)
- Network tab for requests to GTM, GA4, Meta
- Backend logs for heartbeat reception
- Database for new heartbeat record:
  ```bash
  psql -U pixel_checker_user -d pixel_checker -c "SELECT * FROM heartbeats ORDER BY timestamp DESC LIMIT 1;"
  ```

---

## Troubleshooting

### Backend won't start

**"ECONNREFUSED" or database connection errors:**
- Check PostgreSQL is running: `pg_isready`
- Verify credentials in `backend/.env`
- Test connection: `psql -U pixel_checker_user -d pixel_checker`

**"Port 3001 already in use":**
```bash
lsof -ti:3001 | xargs kill -9
# Or change PORT in backend/.env
```

### Frontend can't reach backend

**CORS errors in browser console:**
- Verify `FRONTEND_URL` in `backend/.env` matches frontend URL
- Check backend logs for CORS settings on startup

**401 Unauthorized:**
- Token expired (7 days default) - log in again
- Token not being sent - check localStorage for `pixel_checker_token`

### Heartbeat not received

**"Site not found" error:**
- Ensure site URL in snippet **exactly** matches database URL
- Check: `psql -U pixel_checker_user -d pixel_checker -c "SELECT url FROM sites;"`

**No network request visible:**
- Check browser DevTools → Console for errors
- Verify snippet src URL is correct
- Check CSP (Content Security Policy) isn't blocking the script

**Heartbeat sent but not in database:**
- Check backend logs for errors
- Verify site exists in database
- Check database user permissions

---

## Next Steps

1. **Update Frontend Contexts** to use API instead of localStorage (see Part 4)
2. **Add Authentication UI** - Login page, protected routes
3. **Deploy to Production** - VPS, Vercel, or your hosting platform
4. **Set up HTTPS** - Required for production (Let's Encrypt)
5. **Add Real-time Updates** - WebSockets or polling for live status
6. **Implement Crawler** (Future) - Playwright/Puppeteer for validation

---

## Quick Reference

**Start Development:**
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
npm run dev
```

**Access Points:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health
- Heartbeat Snippet: http://localhost:3001/static/heartbeat.js

**Default Credentials:**
- Email: `admin@example.com`
- Password: `password123`

---

## Need Help?

Check the detailed READMEs:
- `backend/README.md` - Backend API documentation
- `backend/db/README.md` - Database setup details
- `PROJECT_STRUCTURE.md` - Codebase organization

For issues, check backend logs and browser DevTools console.
