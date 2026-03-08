import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import PlanBuilder from "./pages/PlanBuilder.jsx";
import PlanResults from "./pages/PlanResults.jsx";
import Goals from "./pages/Goals.jsx";
import Login from "./pages/Login.jsx";
import StepHeader from "./components/StepHeader.jsx";
import NavBar from "./components/NavBar.jsx";

/**
 * ProtectedRoute
 *
 * PURPOSE:
 * - Prevent access to app pages unless the user is logged in
 * - For project scope, login state is stored in localStorage
 */
function ProtectedRoute({ children }) {
  const isLoggedIn = localStorage.getItem("otp_logged_in") === "true";
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

/**
 * AppLayout
 *
 * PURPOSE:
 * - Show NavBar + StepHeader on app pages
 * - Hide them on the login page
 */
function AppLayout() {
  const location = useLocation();
  const isLoggedIn = localStorage.getItem("otp_logged_in") === "true";
  const isLoginPage = location.pathname === "/login";


  return (
    <>
      {!isLoginPage && isLoggedIn && (
        <>
          <NavBar />
          <StepHeader />
        </>
      )}

      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

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
          path="/goals"
          element={
            <ProtectedRoute>
              <Goals />
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

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
