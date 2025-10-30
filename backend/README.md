# Pixel Checker Backend API

Node.js/Express backend for the Pixel Checker monitoring system.

## Features

- **Heartbeat Ingestion**: Receives pixel status data from client snippets
- **Site Management**: CRUD operations for monitored sites
- **Authentication**: JWT-based auth with bcrypt password hashing
- **PostgreSQL Database**: Stores sites, heartbeats, and status data
- **Organization Support**: Multi-tenant architecture for team collaboration

## Prerequisites

- Node.js 18+
- PostgreSQL 13+

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Set Up Database

See `db/README.md` for detailed instructions. Quick version:

```bash
# Create database
createdb pixel_checker

# Run schema
psql -d pixel_checker -f db/schema.sql
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your database credentials and JWT secret:

```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pixel_checker
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secure_random_string
FRONTEND_URL=http://localhost:5173
```

### 4. Start Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server will start on `http://localhost:3001`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }
  ```

- `POST /api/auth/login` - Login
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- `GET /api/auth/me` - Get current user (requires auth)

### Sites

All endpoints require authentication (`Authorization: Bearer <token>`)

- `GET /api/sites` - Get all sites for organization
- `GET /api/sites/:id` - Get single site
- `POST /api/sites` - Create site
  ```json
  {
    "url": "https://example.com",
    "name": "Example Site",
    "gtmContainerId": "GTM-XXXXXX",
    "ga4MeasurementId": "G-XXXXXXXXXX",
    "metaPixelId": "123456789"
  }
  ```
- `PUT /api/sites/:id` - Update site
- `DELETE /api/sites/:id` - Delete site
- `GET /api/sites/:id/status` - Get current pixel status
- `GET /api/sites/:id/heartbeats?limit=50` - Get recent heartbeats

### Ingestion

- `POST /api/ingest` - Receive heartbeat from client snippet (public, no auth)
  ```json
  {
    "siteUrl": "https://example.com",
    "gtmPresent": true,
    "gtmContainerId": "GTM-XXXXXX",
    "ga4Present": true,
    "ga4CollectSeen": true,
    "ga4MeasurementId": "G-XXXXXXXXXX",
    "metaPixelPresent": true,
    "metaTrSeen": true,
    "metaPixelId": "123456789",
    "consentState": {},
    "consentGranted": true,
    "pageUrl": "https://example.com/page",
    "userAgent": "..."
  }
  ```

## Database Schema

Key tables:
- `organizations` - Organizations/teams
- `users` - User accounts (belongs to org)
- `sites` - Monitored sites (belongs to org)
- `heartbeats` - Time-series data from snippets
- `site_status` - Aggregated current status per site

See `db/schema.sql` for full schema.

## Development

### Project Structure

```
backend/
├── src/
│   ├── server.js           # Main Express app
│   ├── routes/             # API route handlers
│   │   ├── auth.js
│   │   ├── sites.js
│   │   └── ingest.js
│   ├── services/           # Business logic
│   │   ├── authService.js
│   │   ├── siteService.js
│   │   └── heartbeatService.js
│   ├── middleware/         # Express middleware
│   │   └── auth.js
│   └── db/
│       └── connection.js   # Database connection pool
├── db/
│   ├── schema.sql          # Database schema
│   └── README.md           # DB setup instructions
├── .env.example            # Environment template
└── package.json
```

### Testing the API

```bash
# Health check
curl http://localhost:3001/health

# Register user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get sites (use token from login)
curl http://localhost:3001/api/sites \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Security Notes

- **JWT_SECRET**: Use a strong random string in production (32+ characters)
- **Database Password**: Use a strong password
- **CORS**: Update `FRONTEND_URL` in production to your actual domain
- **HTTPS**: Always use HTTPS in production

## Deployment

### Option 1: VPS/Droplet (DigitalOcean, Linode, etc.)

1. Set up PostgreSQL on server
2. Clone repo and run `npm install`
3. Configure `.env` with production values
4. Use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start src/server.js --name pixel-checker-api
   pm2 startup
   pm2 save
   ```
5. Set up nginx reverse proxy for HTTPS

### Option 2: Docker (Coming Soon)

## Troubleshooting

**"Database connection failed"**
- Check PostgreSQL is running: `pg_isready`
- Verify credentials in `.env`
- Ensure database exists: `psql -l | grep pixel_checker`

**"Invalid or expired token"**
- Token expires after 7 days (configurable via `JWT_EXPIRES_IN`)
- User needs to log in again

**"Site not found" on heartbeat ingestion**
- Ensure site URL exactly matches what's in the database
- Site must be created via API before heartbeats can be received
