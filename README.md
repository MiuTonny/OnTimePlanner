# OnTimePlanner

OnTimePlanner is a lightweight logistics route planner built with React.  
It helps service professionals (cleaners, delivery drivers, technicians, contractors) create daily schedules and estimate time, mileage, and fuel cost.

Built as Project 1 for Flatiron School’s Software Engineering program.

---

## Features

- Create route plans with a start location + multiple stops
- Spreadsheet-style stop entry (route-planner feel)
- Goals/settings:
  - Buffer minutes per stop (parking/setup)
  - Vehicle MPG
  - Gas price ($/gallon)
- Route Results:
  - Geocoding + routing from external APIs
  - Drive time + distance estimates
  - Total day time (service + buffer + drive)
  - Gas cost estimate
  - Address fallback notes when geocoding is approximate
- Dashboard:
  - View saved plans
  - Delete plans
  - Weekly summary (last 7 days) aggregated from saved plan metrics

---

## Problem Being Solved

Many service workers estimate daily workload manually (time, miles, fuel).  
OnTimePlanner provides a focused interface for planning routes and estimating cost/time without clutter.

---

## Tech Stack

- React (Vite)
- React Router
- JavaScript
- localStorage persistence
- External APIs:
  - OpenStreetMap/Nominatim for geocoding
  - OSRM for routing (distance + duration)

---

## Project Structure

```txt
src/
  components/   reusable UI components
  pages/        route views (Dashboard, PlanBuilder, Goals, PlanResults)
  services/     external API calls (geocode, routing)
  utils/        storage + helper utilities
  styles/       global styling
docs/
  project-1/    project notes + teacher discussion prep

Installation

git clone https://github.com/MiuTonny/OnTimePlanner.git
cd OnTimePlanner
npm install
npm run dev

Build for production
npm run build

Future Improvements

-Route optimization (reorder stops for shortest path)

-Backend API + database persistence (Project 2/3)

-Real-time gas price API integration

-Interactive map visualization (Leaflet/Mapbox)

-Export/share route plans

Author

Milton Tavares (MiuTonny)
Flatiron School – Software Engineering
