# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Pixel & GTM Monitoring System designed to verify whether tracking pixels (Meta, GA4, GTM, etc.) are installed and actively firing on client websites. The project consists of a modern dashboard with real-time monitoring capabilities.

## Architecture

The codebase currently contains:
- **index.html** - A single-page dashboard application with embedded CSS and JavaScript
  - Modern glassmorphic UI design with dark theme
  - Interactive table showing monitored sites with status indicators
  - Detail drawer for expanded site information
  - Real-time status updates via JavaScript

## Key Components

### Dashboard Features
- **Site Monitoring Table**: Displays site URLs with traffic-light status indicators for GTM, GA4, Meta pixels, and consent status
- **Status Indicators**:
  - Green dots = confirmed firing
  - Red dots = missing/not detected
  - Amber dots = present but blocked/suppressed
- **Detail Drawer**: Slides in from right when clicking a site row, showing expanded metrics
- **Stats Grid**: Shows total sites, active tags, issues found, and uptime percentage

### Design System
- **Color Scheme**: Dark ash gradient background (#121212 → #1E1E1E) with bold red accent (#CF0E0F)
- **Typography**: Inter font family
- **UI Style**: Glassmorphic design with backdrop blur effects and semi-transparent panels

## Development Notes

### Current Implementation
- Pure HTML/CSS/JavaScript implementation (no build process)
- Mock data for demonstration purposes
- Simulated real-time updates for status dots and timestamps
- Responsive design with mobile breakpoint at 768px

### Planned Architecture (per PRD)
- **Heartbeat Script**: On-page snippet for real-time tracking verification
- **Crawler Service**: Headless browser validation of tag presence
- **Backend**: Supabase/Postgres for data storage
- **Frontend Migration**: React + Vite with TailwindCSS
- **Authentication**: Supabase Auth integration