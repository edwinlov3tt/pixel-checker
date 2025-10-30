# Frontend Integration Guide

This guide covers the remaining frontend work to connect your React dashboard to the backend API.

## Current State

✅ **Completed:**
- Backend API with all endpoints
- Database schema
- Heartbeat snippet
- API client service (`src/services/api.js`)
- Frontend UI (currently using mock data)

⏳ **Remaining:**
- Update SitesContext to use API
- Update MonitoringContext for real-time data
- Add authentication flow (login page, protected routes)

---

## 1. Update SitesContext

**File:** `src/contexts/SitesContext.jsx`

Replace localStorage calls with API calls.

### Changes Needed:

```javascript
import { sitesAPI } from '../services/api';

export function SitesProvider({ children }) {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load sites from API instead of localStorage
  useEffect(() => {
    async function loadSites() {
      try {
        const data = await sitesAPI.getAll();
        setSites(data);
      } catch (error) {
        console.error('Failed to load sites:', error);
      } finally {
        setLoading(false);
      }
    }
    loadSites();
  }, []);

  // Update addSite
  const addSite = async (siteData) => {
    try {
      const newSite = await sitesAPI.create(siteData);
      setSites(prev => [...prev, newSite]);
      return newSite;
    } catch (error) {
      console.error('Failed to add site:', error);
      throw error;
    }
  };

  // Update updateSite
  const updateSite = async (id, updates) => {
    try {
      const updatedSite = await sitesAPI.update(id, updates);
      setSites(prev => prev.map(s => s.id === id ? updatedSite : s));
      return updatedSite;
    } catch (error) {
      console.error('Failed to update site:', error);
      throw error;
    }
  };

  // Update deleteSite
  const deleteSite = async (id) => {
    try {
      await sitesAPI.delete(id);
      setSites(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Failed to delete site:', error);
      throw error;
    }
  };

  // ... rest of context
}
```

---

## 2. Update MonitoringContext

**File:** `src/contexts/MonitoringContext.jsx`

Replace simulation with real API data.

### Changes Needed:

```javascript
import { sitesAPI } from '../services/api';

export function MonitoringProvider({ children }) {
  const { sites, updateSite } = useSites();

  // Poll for status updates every 30 seconds
  useEffect(() => {
    if (!sites.length) return;

    async function updateStatuses() {
      for (const site of sites) {
        try {
          const status = await sitesAPI.getStatus(site.id);

          // Map API status to dashboard format
          updateSite(site.id, {
            gtmStatus: status.gtm_status,
            ga4Status: status.ga4_status,
            metaStatus: status.meta_status,
            lastChecked: status.last_heartbeat_at
          });
        } catch (error) {
          console.error(`Failed to get status for site ${site.id}:`, error);
        }
      }
    }

    // Initial update
    updateStatuses();

    // Poll every 30 seconds
    const interval = setInterval(updateStatuses, 30000);

    return () => clearInterval(interval);
  }, [sites]);

  // ... rest of context
}
```

---

## 3. Create Login Page

**File:** `src/pages/Login.jsx` (create new file)

```javascript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authAPI.login(email, password);
      navigate('/'); // Redirect to dashboard
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#121212] to-[#1E1E1E]">
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#CF0E0F] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Pixel Checker</h1>
          <p className="text-gray-400 mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#CF0E0F]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#CF0E0F]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#CF0E0F] hover:bg-[#B00C0E] text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

---

## 4. Add Protected Routes

**File:** `src/App.jsx`

Update routing to protect dashboard routes.

```javascript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { authAPI } from './services/api';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
// ... other imports

// Protected Route Component
function ProtectedRoute({ children }) {
  if (!authAPI.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/*" element={
          <ProtectedRoute>
            {/* Your existing dashboard routes */}
            <YourDashboardLayout />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 5. Add Logout Functionality

**File:** `src/components/Header.jsx`

Add logout button to header.

```javascript
import { authAPI } from '../services/api';

function Header() {
  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      authAPI.logout();
    }
  };

  return (
    <header>
      {/* ... existing header content */}

      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
      >
        Logout
      </button>
    </header>
  );
}
```

---

## 6. Map API Response to Dashboard Format

The API returns data in snake_case, but your dashboard uses camelCase. Add a mapper:

**File:** `src/utils/apiMapper.js` (create new file)

```javascript
export function mapSiteFromAPI(apiSite) {
  return {
    id: apiSite.id,
    name: apiSite.name,
    url: apiSite.url,
    gtmContainerId: apiSite.gtm_container_id,
    ga4MeasurementId: apiSite.ga4_measurement_id,
    metaPixelId: apiSite.meta_pixel_id,
    gtmStatus: mapStatus(apiSite.gtm_status),
    ga4Status: mapStatus(apiSite.ga4_status),
    metaStatus: mapStatus(apiSite.meta_status),
    overallStatus: apiSite.overall_status,
    lastChecked: apiSite.last_heartbeat_at || apiSite.updated_at,
    totalHeartbeats: apiSite.total_heartbeats || 0
  };
}

function mapStatus(status) {
  // Map API status to dashboard color
  const statusMap = {
    'active': 'active',      // green
    'missing': 'error',      // red
    'blocked': 'warning',    // amber
    'unknown': 'unknown'     // gray
  };
  return statusMap[status] || 'unknown';
}

export function mapSitesToAPI(formData) {
  return {
    url: formData.url,
    name: formData.name,
    gtmContainerId: formData.gtmContainerId,
    ga4MeasurementId: formData.ga4MeasurementId,
    metaPixelId: formData.metaPixelId
  };
}
```

Use in SitesContext:

```javascript
import { mapSiteFromAPI, mapSitesToAPI } from '../utils/apiMapper';

const loadSites = async () => {
  const data = await sitesAPI.getAll();
  setSites(data.map(mapSiteFromAPI));
};
```

---

## 7. Testing

### 7.1 Test Authentication

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `npm run dev`
3. Visit http://localhost:5173
4. Should redirect to /login
5. Log in with `admin@example.com` / `password123`
6. Should redirect to dashboard

### 7.2 Test Site Management

1. Click "Add Site" button
2. Fill in site details
3. Submit - should create via API and appear in list
4. Click on a site to edit
5. Update details - should update via API
6. Delete a site - should remove via API

### 7.3 Test Real-time Monitoring

1. Create a site: `https://example.com`
2. Set up heartbeat snippet on a test page (see SETUP.md Part 5)
3. Visit the test page
4. Check backend logs for "📊 Heartbeat received"
5. Refresh dashboard - status should update to show real data

---

## 8. Optional Enhancements

### Real-time Updates with Polling

Already implemented in MonitoringContext (updates every 30s).

### Real-time Updates with WebSockets (Advanced)

For instant updates, implement WebSockets:
- Backend: Use `socket.io` or `ws`
- Frontend: Listen for status changes
- Update sites in real-time without polling

### Error Handling

Add global error boundary:

```javascript
// src/components/ErrorBoundary.jsx
import { Component } from 'react';

export class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div className="error-screen">Something went wrong</div>;
    }
    return this.props.children;
  }
}
```

### Loading States

Show spinners while API requests are in flight:

```javascript
{loading ? (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CF0E0F]"></div>
  </div>
) : (
  // ... content
)}
```

---

## Summary

**Files to Create:**
- `src/pages/Login.jsx`
- `src/utils/apiMapper.js`

**Files to Update:**
- `src/contexts/SitesContext.jsx` - Replace localStorage with API
- `src/contexts/MonitoringContext.jsx` - Poll API for status
- `src/App.jsx` - Add protected routes
- `src/components/Header.jsx` - Add logout button

**Testing Checklist:**
- [ ] Can log in
- [ ] Dashboard loads sites from API
- [ ] Can add/edit/delete sites
- [ ] Sites persist across page refreshes
- [ ] Heartbeat snippet sends data
- [ ] Dashboard shows real pixel status
- [ ] Can log out

Once complete, your dashboard will be fully connected to the backend and displaying real monitoring data!
