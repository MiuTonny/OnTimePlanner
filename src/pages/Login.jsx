/**
 * Login
 *
 * PURPOSE:
 * - Entry point to the application
 * - Simulates sign-in for project scope
 * - Redirects user to Addresses page after login
 *
 * UI:
 * - Full-page background image
 * - Centered sign-in card
 *
 * WHY THIS MATTERS:
 * - Makes the app feel more complete
 * - Creates a cleaner demo flow for presentation
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("otp_logged_in") === "true";
    if (isLoggedIn) {
      navigate("/plan");
    }
  }, [navigate]);

  function handleLogin(e) {
    e.preventDefault();

    localStorage.setItem("otp_logged_in", "true");
    navigate("/plan");
  }

  return (
    <div className="login-page">
      <div className="login-overlay">
        <div className="login-card">
          <h1>OnTimePlanner</h1>
          <p className="muted">Plan your routes, estimate miles, and optimize your day.</p>

          <form onSubmit={handleLogin}>
            <div className="field">
              <label className="label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="field">
              <label className="label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="actions">
              <button className="button primary" type="submit">
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
