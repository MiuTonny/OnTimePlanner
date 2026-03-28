/**
 * NavBar
 *
 * PURPOSE:
 * - Main navigation for authenticated users
 * - Provides quick access to:
 *   - Dashboard
 *   - Plan Builder
 *   - Reviews page
 * - Allows user to logout (clears session on backend)
 *
 * WHY THIS MATTERS:
 * - Gives the app a real "product" feel
 * - Central navigation improves UX
 * - Demonstrates authenticated session flow
 */

import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../services/api";

export default function NavBar() {
  const navigate = useNavigate();

  /**
   * Handle logout
   * - Calls backend to clear session
   * - Redirects user to login page
   */
  async function handleLogout() {
    try {
      await logout();
    } catch (err) {
      /**
       * Even if logout fails,
       * still redirect for safety
       */
      console.error("Logout failed:", err);
    } finally {
      navigate("/login");
    }
  }

  /**
   * Dynamic class for active nav link
   */
  const linkClass = ({ isActive }) =>
    `button ${isActive ? "active" : ""}`;

  return (
    <div className="nav">
      {/* App brand / logo */}
      <div className="brand">
        <NavLink to="/dashboard">OnTimePlanner</NavLink>
        <span className="badge">Full-Stack</span>
      </div>

      {/* Navigation links */}
      <div style={{ display: "flex", gap: 10 }}>
        <NavLink className={linkClass} to="/dashboard">
          Dashboard
        </NavLink>

        <NavLink className={linkClass} to="/plan">
          Build
        </NavLink>

        <NavLink className={linkClass} to="/reviews">
          Reviews
        </NavLink>

        {/* Logout button */}
        <button className="button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}