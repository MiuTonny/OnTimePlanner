/**
 * App
 *
 * PURPOSE:
 * - Top-level application router
 * - Defines public vs protected routes
 * - Applies shared layout pieces (NavBar + StepHeader)
 *
 * WHY THIS MATTERS:
 * - Centralizes routing logic in one place
 * - Protects app pages so only authenticated users can access them
 * - Keeps layout logic separate from page components
 */

import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import "./styles/app.css";

import Dashboard from "./pages/Dashboard.jsx";
import Reviews from "./pages/Reviews.jsx"; // ✅ renamed from Goals
import Login from "./pages/Login.jsx";
import PlanBuilder from "./pages/PlanBuilder.jsx";
import PlanResults from "./pages/PlanResults.jsx";

import StepHeader from "./components/StepHeader.jsx";
import NavBar from "./components/NavBar.jsx";

import { fetchMe } from "./services/api";

/**
 * ProtectedRoute
 *
 * PURPOSE:
 * - Prevent access to app pages unless the user is authenticated
 * - Checks the current session by calling the backend /api/me route
 *
 * FLOW:
 * - loading -> waiting for backend
 * - authenticated -> render child page
 * - unauthenticated -> redirect to /login
 */
function ProtectedRoute({ children }) {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        await fetchMe();

        if (!cancelled) {
          setStatus("authenticated");
        }
      } catch {
        if (!cancelled) {
          setStatus("unauthenticated");
        }
      }
    }

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="page">
        <p>Checking session...</p>
      </div>
    );
  }

  return status === "authenticated"
    ? children
    : <Navigate to="/login" replace />;
}

/**
 * AppLayout
 *
 * PURPOSE:
 * - Show shared navigation UI on protected app pages
 * - Hide NavBar + StepHeader on login screen
 */
function AppLayout() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <>
      {!isLoginPage && (
        <>
          <NavBar />
          <StepHeader />
        </>
      )}

      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />

        {/* Default route */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/plan"
          element={
            <ProtectedRoute>
              <PlanBuilder />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reviews"
          element={
            <ProtectedRoute>
              <Reviews />
            </ProtectedRoute>
          }
        />

        <Route
          path="/plan/:id"
          element={
            <ProtectedRoute>
              <PlanResults />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

/**
 * Root App component
 */
export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}