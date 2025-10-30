# Routing Update - pixel.edwinlovett.com

## ✅ New Routing Configuration

Your Pixel Checker is now fully accessible at **pixel.edwinlovett.com** with proper path-based routing!

---

## URL Structure

### Frontend (Dashboard)
- **URL**: https://pixel.edwinlovett.com/
- **Routes to**: localhost:5173 (Vite dev server)
- **All pages**: Dashboard, sites, alerts, settings

### API (Backend)
- **Base URL**: https://pixel.edwinlovett.com/api
- **Routes to**: localhost:3001/api
- **Endpoints**:
  - `POST /api/auth/login` - Login
  - `POST /api/auth/register` - Register
  - `GET /api/auth/me` - Current user
  - `GET /api/sites` - List sites
  - `POST /api/sites` - Create site
  - `PUT /api/sites/:id` - Update site
  - `DELETE /api/sites/:id` - Delete site
  - `GET /api/sites/:id/status` - Site status
  - `GET /api/sites/:id/heartbeats` - Heartbeat history
  - `POST /api/ingest` - Receive heartbeat data

### Static Files
- **Heartbeat Script**: https://pixel.edwinlovett.com/heartbeat.js
- **Health Check**: https://pixel.edwinlovett.com/health

---

## Test Results

✅ **Frontend**: https://pixel.edwinlovett.com/ (200 OK)
✅ **API Health**: https://pixel.edwinlovett.com/health (200 OK)
✅ **Heartbeat Script**: https://pixel.edwinlovett.com/heartbeat.js (200 OK)
✅ **API Login**: https://pixel.edwinlovett.com/api/auth/login (working)

---

## Configuration Changes

### 1. Cloudflare Tunnel Config (`~/.cloudflared/config.yml`)

```yaml
ingress:
  # API requests
  - hostname: pixel.edwinlovett.com
    path: /api/*
    service: http://localhost:3001

  # Heartbeat script
  - hostname: pixel.edwinlovett.com
    path: /heartbeat.js
    service: http://localhost:3001

  # Health check
  - hostname: pixel.edwinlovett.com
    path: /health
    service: http://localhost:3001

  # Frontend (everything else)
  - hostname: pixel.edwinlovett.com
    service: http://localhost:5173

  # Catch-all
  - service: http_status:404
```

### 2. Vite Config (`vite.config.js`)

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all addresses
    port: 5173,
    strictPort: true,
    hmr: {
      clientPort: 443, // HTTPS port for HMR through tunnel
      host: 'pixel.edwinlovett.com',
    },
  },
})
```

### 3. Environment Variables

**Frontend (`.env`)**:
```env
VITE_API_URL=https://pixel.edwinlovett.com/api
```

**Backend (`backend/.env`)**:
```env
FRONTEND_URL=http://localhost:5173,https://pixel.edwinlovett.com
```

---

## How It Works

```
User visits pixel.edwinlovett.com
         ↓
   Cloudflare Edge
         ↓
   Cloudflare Tunnel
         ↓
    ┌────┴────┐
    ↓         ↓
/api/*    everything else
    ↓         ↓
Backend   Frontend
:3001     :5173
```

**Path-based routing**:
- `/api/*` → Backend (Express/Node.js)
- `/heartbeat.js` → Backend (static file)
- `/health` → Backend (health check)
- `/*` → Frontend (React/Vite)

---

## For Developers

### Local Development
Both servers need to be running:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

### Production Access
Everything is accessible through:
- https://pixel.edwinlovett.com

### Install Heartbeat Script

**Via GTM**:
```html
<script
  src="https://pixel.edwinlovett.com/heartbeat.js"
  data-site-url="{{Page Hostname}}"
></script>
```

**Direct Embed**:
```html
<script
  src="https://pixel.edwinlovett.com/heartbeat.js"
  data-site-url="https://your-site.com"
></script>
```

---

## Benefits

1. **Single Domain**: Everything under pixel.edwinlovett.com
2. **No CORS Issues**: API and frontend on same domain
3. **Clean URLs**: `/api/*` for API, `/` for dashboard
4. **Easy to Remember**: One URL for everything
5. **SSL Everywhere**: HTTPS on all routes

---

## Troubleshooting

### Frontend Not Loading
```bash
# Check if Vite is running
lsof -ti:5173

# Check Vite logs
# (in your frontend terminal)
```

### API Not Working
```bash
# Check if backend is running
lsof -ti:3001

# Test health endpoint
curl https://pixel.edwinlovett.com/health
```

### Tunnel Issues
```bash
# Check tunnel status
launchctl list | grep pixelchecker

# View tunnel logs
tail -f ~/.cloudflared/tunnel.log

# Restart tunnel
launchctl unload ~/Library/LaunchAgents/com.pixelchecker.tunnel.plist
launchctl load ~/Library/LaunchAgents/com.pixelchecker.tunnel.plist
```

---

## Updated: 2025-10-28

**Frontend**: ✅ pixel.edwinlovett.com/
**API**: ✅ pixel.edwinlovett.com/api
**Heartbeat**: ✅ pixel.edwinlovett.com/heartbeat.js
**Status**: ✅ Fully Operational
