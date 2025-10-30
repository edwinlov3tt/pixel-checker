# Cloudflare Tunnel Setup - pixel.edwinlovett.com

Your Pixel Checker API is now live at **https://pixel.edwinlovett.com** using Cloudflare Tunnel!

## What Was Set Up

### 1. Cloudflare Tunnel Created
- **Tunnel Name**: pixel-checker
- **Tunnel ID**: 9558caad-a9c4-4d82-b551-72aaa16cedbe
- **Configuration**: `/Users/edwinlovettiii/.cloudflared/config.yml`
- **Credentials**: `/Users/edwinlovettiii/.cloudflared/9558caad-a9c4-4d82-b551-72aaa16cedbe.json`

### 2. DNS Configuration
- **Domain**: pixel.edwinlovett.com
- **Record Type**: CNAME
- **Points To**: Cloudflare Tunnel
- **SSL**: Automatic (Cloudflare)

### 3. Routing
- `https://pixel.edwinlovett.com` → `http://localhost:3001`
- All API endpoints are accessible through HTTPS
- Heartbeat script is publicly accessible

---

## Current Status

✅ **Tunnel Running**: Yes (background process)
✅ **DNS Configured**: Yes (CNAME record created)
✅ **SSL Certificate**: Automatic (Cloudflare)
✅ **API Accessible**: https://pixel.edwinlovett.com/health
✅ **Heartbeat Script**: https://pixel.edwinlovett.com/heartbeat.js

---

## Managing the Tunnel

### Start Tunnel Manually
```bash
cloudflared tunnel run pixel-checker
```

### Stop Tunnel
```bash
# Find the process
ps aux | grep cloudflared

# Kill it
kill <PID>
```

### Check Tunnel Status
```bash
cloudflared tunnel list
```

### View Tunnel Logs
```bash
tail -f ~/.cloudflared/tunnel.log
tail -f ~/.cloudflared/tunnel-error.log
```

---

## Auto-Start Configuration

A LaunchAgent has been created to keep the tunnel running automatically:

**Location**: `/Users/edwinlovettiii/Library/LaunchAgents/com.pixelchecker.tunnel.plist`

### Load the Service (Start Auto-Start)
```bash
launchctl load ~/Library/LaunchAgents/com.pixelchecker.tunnel.plist
```

### Unload the Service (Stop Auto-Start)
```bash
launchctl unload ~/Library/LaunchAgents/com.pixelchecker.tunnel.plist
```

### Check Service Status
```bash
launchctl list | grep pixelchecker
```

### Restart the Service
```bash
launchctl unload ~/Library/LaunchAgents/com.pixelchecker.tunnel.plist
launchctl load ~/Library/LaunchAgents/com.pixelchecker.tunnel.plist
```

---

## API Endpoints

All endpoints now work with `https://pixel.edwinlovett.com`:

### Public Endpoints
- `GET /health` - Health check
- `POST /api/ingest` - Receive heartbeat data (no auth)
- `GET /heartbeat.js` - Heartbeat script

### Authenticated Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Current user info
- `GET /api/sites` - List sites
- `POST /api/sites` - Create site
- `PUT /api/sites/:id` - Update site
- `DELETE /api/sites/:id` - Delete site
- `GET /api/sites/:id/status` - Get site status
- `GET /api/sites/:id/heartbeats` - Get heartbeat history

---

## Testing the Setup

### Test Health Endpoint
```bash
curl https://pixel.edwinlovett.com/health
```
Expected: `{"status":"ok","timestamp":"..."}`

### Test Heartbeat Script
```bash
curl -I https://pixel.edwinlovett.com/heartbeat.js
```
Expected: `200 OK` with `content-type: application/javascript`

### Test API Login
```bash
curl -X POST https://pixel.edwinlovett.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pixelchecker.com","password":"password123"}'
```

### Test Heartbeat Ingestion
```bash
curl -X POST https://pixel.edwinlovett.com/api/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "siteUrl": "https://example.com",
    "gtmPresent": true,
    "ga4CollectSeen": true,
    "metaTrSeen": true
  }'
```

---

## Installing the Heartbeat Script

### Via Google Tag Manager (Recommended)

1. Create a new Custom HTML tag in GTM
2. Paste this code:

```html
<script
  src="https://pixel.edwinlovett.com/heartbeat.js"
  data-site-url="{{Page Hostname}}"
></script>
```

3. Set trigger to "All Pages"
4. Publish the container

### Direct Embed

Add to your site's `<head>` section:

```html
<script
  src="https://pixel.edwinlovett.com/heartbeat.js"
  data-site-url="https://your-site.com"
></script>
```

---

## Configuration Files Updated

### Frontend (.env)
```env
VITE_API_URL=https://pixel.edwinlovett.com/api
```

### Backend (.env)
```env
FRONTEND_URL=http://localhost:5173,https://pixel.edwinlovett.com
```

### Heartbeat Script (public/heartbeat.js)
- Default API endpoint: `https://pixel.edwinlovett.com/api/ingest`
- Can be overridden with `data-api-endpoint` attribute

---

## CORS Configuration

The backend now supports multiple CORS origins:
- `http://localhost:5173` (local development)
- `https://pixel.edwinlovett.com` (production)

Additional origins can be added in `backend/.env` as comma-separated values.

---

## Security Notes

1. **Credentials Storage**: Tunnel credentials are stored in `~/.cloudflared/`
   - Keep these files secure
   - Don't commit to version control
   - To revoke: delete the tunnel in Cloudflare dashboard

2. **SSL/TLS**: Handled automatically by Cloudflare
   - Tunnel uses encrypted connection
   - Public endpoints use HTTPS
   - No certificate management needed

3. **JWT Secret**: Update `JWT_SECRET` in backend/.env for production

---

## Troubleshooting

### Tunnel Not Working
```bash
# Check if tunnel is running
ps aux | grep cloudflared

# Check tunnel logs
tail -f ~/.cloudflared/tunnel.log

# Restart tunnel
cloudflared tunnel run pixel-checker
```

### DNS Not Resolving
```bash
# Check DNS propagation
nslookup pixel.edwinlovett.com

# May take a few minutes to propagate globally
```

### 502 Bad Gateway
- Ensure your backend is running on `localhost:3001`
- Check backend logs for errors
- Restart the tunnel

### CORS Errors
- Check `FRONTEND_URL` in backend/.env
- Ensure origin is in the allowed list
- Check browser console for specific CORS error

---

## Switching Between Local and Production

### Use Local API (Development)

Edit `.env`:
```env
# VITE_API_URL=https://pixel.edwinlovett.com/api
VITE_API_URL=http://localhost:3001/api
```

### Use Production API

Edit `.env`:
```env
VITE_API_URL=https://pixel.edwinlovett.com/api
# VITE_API_URL=http://localhost:3001/api
```

Restart Vite dev server after changing.

---

## Monitoring

### Check Tunnel Status in Cloudflare
1. Log in to Cloudflare Dashboard
2. Go to "Zero Trust" → "Networks" → "Tunnels"
3. Find "pixel-checker" tunnel
4. View status, traffic, and connections

### View Real-time Logs
```bash
# Tunnel logs
tail -f ~/.cloudflared/tunnel.log

# Backend API logs
# (in your backend terminal)

# Frontend logs
# (in your frontend terminal)
```

---

## Production Deployment Notes

When deploying to a production server:

1. **Install cloudflared** on the server
2. **Copy tunnel credentials** from `~/.cloudflared/9558caad-a9c4-4d82-b551-72aaa16cedbe.json`
3. **Copy config** from `~/.cloudflared/config.yml`
4. **Run as systemd service** (Linux) or keep using launchd (macOS)
5. **Ensure backend starts on boot**

---

## Quick Reference

**Tunnel Name**: pixel-checker
**Domain**: https://pixel.edwinlovett.com
**Local Backend**: http://localhost:3001
**Config**: `~/.cloudflared/config.yml`
**Logs**: `~/.cloudflared/tunnel.log`

**Start Tunnel**: `cloudflared tunnel run pixel-checker`
**Stop Tunnel**: Kill the process or `launchctl unload`
**Auto-start**: `launchctl load ~/Library/LaunchAgents/com.pixelchecker.tunnel.plist`

---

**Setup Date**: 2025-10-28
**Configured By**: Claude Code
