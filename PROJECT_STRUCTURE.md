# Pixel Monitor Dashboard - Project Structure & Documentation

## Overview
A React + Vite application for monitoring marketing pixels (GTM, GA4, Meta, Xandr, Simpli.fi) across multiple websites. Features a modern glassmorphic UI with real-time status updates and comprehensive site management.

## Tech Stack
- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with glassmorphic design
- **Routing**: React Router v6
- **State Management**: React Context API
- **Icons**: Lucide React
- **Date Formatting**: date-fns

## Project Structure
```
pixel-checker/
├── src/
│   ├── components/           # React components
│   │   ├── Layout/           # App layout components
│   │   │   ├── Header.jsx    # Top navigation bar
│   │   │   ├── Sidebar.jsx   # Side navigation menu
│   │   │   └── MainContent.jsx # Main content wrapper
│   │   ├── Dashboard/        # Dashboard specific components
│   │   │   ├── DashboardView.jsx # Main dashboard page
│   │   │   ├── StatsGrid.jsx # Statistics grid container
│   │   │   └── StatCard.jsx  # Individual stat card
│   │   ├── Sites/            # Site management components
│   │   │   ├── SitesView.jsx # Sites management page
│   │   │   ├── SitesTable.jsx # Sites data table
│   │   │   ├── SiteRow.jsx   # Individual site row
│   │   │   ├── SiteDetailDrawer.jsx # Site details panel
│   │   │   └── AddSiteModal.jsx # Add new site form
│   │   ├── Common/           # Reusable components
│   │   │   ├── StatusDot.jsx # Status indicator
│   │   │   ├── Tooltip.jsx   # Hover tooltip
│   │   │   └── Button.jsx    # Button component
│   │   └── Pixels/           # Pixel-related components
│   │       └── PixelSelector.jsx # Pixel type selector
│   ├── context/              # React Context providers
│   │   ├── SitesContext.jsx  # Sites data management
│   │   └── MonitoringContext.jsx # Real-time monitoring
│   ├── services/             # Business logic & utilities
│   │   ├── localStorage.js   # LocalStorage operations
│   │   ├── mockData.js      # Mock data generation
│   │   └── monitoring.js     # Monitoring simulation
│   ├── styles/              # Global styles
│   │   ├── globals.css      # Base styles & Tailwind imports
│   │   └── glassmorphism.css # Glassmorphic components
│   ├── App.jsx              # Main app component
│   └── main.jsx             # App entry point
├── public/                  # Static assets
├── index.html              # HTML entry point
├── package.json            # Dependencies & scripts
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
└── postcss.config.js       # PostCSS configuration
```

## Key Features

### 1. Dashboard
- **Real-time Statistics**: Displays total sites, active tags, issues found, and uptime
- **Sites Overview**: Table view of all monitored sites with status indicators
- **Visual Status Indicators**: Traffic-light system (green/red/amber) for pixel status

### 2. Site Management
- **Add New Sites**: Modal form to add sites with pixel configuration
- **Pixel Selection**: Choose which pixels to track (GTM, GA4, Meta, Xandr, Simpli.fi)
- **Site Details**: Expandable drawer with detailed site information
- **Persistent Storage**: Sites saved to localStorage

### 3. Monitoring System
- **Real-time Updates**: Simulated monitoring updates every 10 seconds
- **Status Types**:
  - `active`: Pixel is firing correctly (green)
  - `missing`: Pixel not detected (red)
  - `blocked`: Pixel blocked by ad blocker or consent (amber)
- **Last Seen Tracking**: Timestamps for each site's last activity

### 4. UI/UX Features
- **Glassmorphic Design**: Modern frosted glass effect throughout
- **Dark Theme**: Ash gradient background (#121212 → #1E1E1E)
- **Responsive Layout**: Mobile-friendly design with breakpoint at 768px
- **Smooth Animations**: Fade-in effects and hover states
- **Tooltips**: Contextual information on hover

## Data Models

### Site Object Structure
```javascript
{
  id: string,                    // Unique identifier
  url: string,                   // Site URL
  name: string,                  // Display name
  addedDate: Date,              // When site was added
  trackedPixels: {
    gtm: { enabled: boolean, containerId: string },
    ga4: { enabled: boolean, measurementId: string },
    meta: { enabled: boolean, pixelId: string },
    xandr: { enabled: boolean, pixelId: string },
    simplifi: { enabled: boolean, pixelId: string }
  },
  status: {                     // Current status of each pixel
    gtm: 'active' | 'missing' | 'blocked',
    ga4: 'active' | 'missing' | 'blocked',
    meta: 'active' | 'missing' | 'blocked',
    xandr: 'active' | 'missing' | 'blocked',
    simplifi: 'active' | 'missing' | 'blocked'
  },
  lastSeen: Date,               // Last update timestamp
  notes: string,                // Optional notes
  consentStatus: 'granted' | 'denied' | 'pending'
}
```

## Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn installed

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development
The app runs on `http://localhost:5173` by default. Hot module replacement is enabled for rapid development.

## State Management
- **SitesContext**: Manages all site data, provides CRUD operations
- **MonitoringContext**: Handles real-time monitoring updates
- **LocalStorage**: Persists site data between sessions

## Styling Architecture
- **Tailwind CSS**: Utility-first CSS framework
- **Custom Classes**:
  - `.glassmorphism`: Base glass effect
  - `.glassmorphism-card`: Glass effect for cards
  - `.status-dot`: Animated status indicators
  - `.fade-in`: Entry animations

## Future Enhancements
1. **Backend Integration**: Connect to real monitoring API
2. **Authentication**: User login and multi-tenant support
3. **Real Monitoring**: Actual pixel detection via heartbeat script
4. **Alerts System**: Email/Slack notifications for status changes
5. **Export Features**: Download site reports as CSV/PDF
6. **Advanced Filtering**: Search and filter sites by status/pixel type
7. **Historical Data**: Track status changes over time with charts
8. **Bulk Operations**: Select multiple sites for batch updates

## Component Usage Examples

### Adding a New Site
```jsx
import AddSiteModal from './components/Sites/AddSiteModal';

<AddSiteModal
  isOpen={modalOpen}
  onClose={() => setModalOpen(false)}
  onAddSite={handleAddSite}
/>
```

### Using Status Indicators
```jsx
import StatusDot from './components/Common/StatusDot';

<StatusDot
  status="active"  // or "missing" or "blocked"
  tooltip="GTM-XXXX firing normally"
/>
```

### Accessing Site Data
```jsx
import { useSites } from './context/SitesContext';

const MyComponent = () => {
  const { sites, addSite, updateSite, deleteSite } = useSites();
  // Use sites data...
};
```

## Notes
- Mock data is generated on first load if no sites exist in localStorage
- Monitoring simulation randomly updates site statuses to demonstrate real-time features
- All pixel IDs and container IDs are stored but not validated in the current MVP