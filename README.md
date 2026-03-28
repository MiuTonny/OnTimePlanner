# OnTimePlanner

OnTimePlanner is a full-stack logistics route planner designed for service professionals such as cleaners, delivery drivers, field technicians, and contractors.

It allows users to build multi-stop routes, estimate time, distance, and fuel cost, and manage plans with user-specific data and authentication.

Built as a Full-Stack Project for Flatiron School’s Software Engineering program.

---

## 🚀 Live Concept

> Plan your day. Know your time. Control your costs.

OnTimePlanner focuses on simplifying daily route planning into a fast, structured workflow that gives users clarity before they even leave home.

---

## ✨ Features

### 🔐 Authentication & User Accounts
- User signup and login (session-based authentication)
- Protected routes (only authenticated users can access app features)
- Each user has **private, isolated data**

---

### 🗺️ Route Planning
- Create route plans with:
  - Start location
  - Multiple stops
- Spreadsheet-style stop entry (fast and intuitive)
- Structured address input for reliable geocoding

---

### 📊 Route Results & Metrics
- Geocoding via OpenStreetMap (Nominatim)
- Routing via OSRM
- Automatically calculates:
  - Drive time
  - Distance (miles)
  - Service time
  - Total day duration
  - Fuel cost estimate

---

### 📁 Dashboard
- View saved plans (paginated)
- Delete plans
- Each plan is tied to the authenticated user

---

### ⚙️ Settings (Goals)
- Buffer time per stop (parking, setup)
- Vehicle MPG
- Gas price ($/gallon)

---

## 🧠 Problem Being Solved

Many service professionals estimate their workday manually:

- “How long will this route take?”
- “How much gas will I spend?”
- “Can I fit more jobs today?”

OnTimePlanner solves this by combining routing, time estimation, and cost calculation into a single, easy-to-use tool.

---

## 🛠️ Tech Stack

### Frontend
- React (Vite)
- React Router
- JavaScript (ES6+)
- Custom CSS

### Backend
- Flask
- SQLAlchemy (ORM)
- Flask-Migrate
- Flask-CORS
- Session-based authentication

### Database
- SQLite (development)

### External APIs
- OpenStreetMap / Nominatim (geocoding)
- OSRM (routing: distance + duration)

---

## 🏗️ Architecture

This project follows a clear separation of concerns:

### Frontend (React)
- UI rendering
- Client-side routing
- API communication via service layer

### Backend (Flask)
- RESTful API
- Business logic (metrics calculation)
- Authentication & authorization

### Database
- Users
- Plans
- Stops
- Metrics
- Goal settings

---

## 📁 Project Structure

```txt
client/
  src/
    components/   reusable UI components
    pages/        route views (Dashboard, PlanBuilder, Results, Reviews, Login)
    services/     API layer (frontend → backend)
    styles/       global styling

server/
  app/
    models/       database models (User, Plan, Stop, Metrics, Goals)
    routes/       API endpoints
    config.py     app configuration
  migrations/     database migrations

  ⚙️ Installation
1. Clone the repository
git clone https://github.com/MiuTonny/OnTimePlanner.git
cd OnTimePlanner

2. Backend setup (Flask)
cd server
python3 -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt

flask db upgrade
flask run

3. Frontend setup (React)
cd ..
npm install
npm run dev

4. Open the app

Frontend:
http://localhost:5173

Backend:
http://localhost:5000

API Overview
Auth
POST /api/signup
POST /api/login
DELETE /api/logout
GET /api/me
Plans
GET /api/plans?page=1&per_page=10
POST /api/plans
GET /api/plans/:id
PATCH /api/plans/:id
DELETE /api/plans/:id
Metrics
POST /api/plans/:id/compute-metrics
Goals
GET /api/goals
PATCH /api/goals
🧩 Key Concepts Demonstrated
Full-stack architecture (React + Flask)
RESTful API design
Session-based authentication
Protected frontend routes
Data ownership & authorization
Relational database modeling
External API integration
Async data handling (React hooks)
Pagination
🚧 Future Improvements
Route optimization (automatic stop reordering)
Interactive map (Leaflet or Mapbox)
Real-time gas price integration
Shareable/exportable plans
Mobile responsiveness improvements
Role-based accounts (teams/companies)
👤 Author

Milton Tavares (MiuTonny)
Flatiron School – Software Engineering