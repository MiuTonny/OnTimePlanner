/**
 * Login
 *
 * PURPOSE:
 * - Public entry page for authentication
 * - Supports both:
 *   - existing user login
 *   - new user signup
 *
 * FLOW:
 * - On mount, check whether a backend session already exists
 * - If session exists, redirect directly to /plan
 * - Otherwise stay on login page
 *
 * WHY THIS MATTERS:
 * - Connects frontend auth UI to the Flask backend
 * - Demonstrates session-based authentication
 * - Provides a smoother user experience
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMe, login, signup } from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  /**
   * Form state
   */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /**
   * UI mode:
   * - "login" = existing user
   * - "signup" = create account
   */
  const [mode, setMode] = useState("login");

  /**
   * UI feedback state
   */
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Check existing session on mount
   * - If user is already authenticated, skip login page
   */
  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        await fetchMe();

        if (!cancelled) {
          navigate("/plan");
        }
      } catch {
        /**
         * No active session:
         * stay on login page
         */
      }
    }

    checkSession();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  /**
   * Handle login/signup submit
   */
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        await login({ email, password });
      } else {
        await signup({ email, password });
      }

      navigate("/plan");
    } catch (err) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-overlay">
        <div className="login-card">
          <h1>OnTimePlanner</h1>

          <p className="muted">
            Plan your routes, estimate miles, and optimize your day.
          </p>

          <form onSubmit={handleSubmit}>
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

            {error && <p className="hint">{error}</p>}

            <div className="actions">
              <button
                className="button primary"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? (mode === "login" ? "Signing In..." : "Creating Account...")
                  : (mode === "login" ? "Sign In" : "Sign Up")}
              </button>

              <button
                type="button"
                className="button"
                onClick={() => {
                  setMode(mode === "login" ? "signup" : "login");
                  setError("");
                }}
              >
                {mode === "login"
                  ? "Need an account?"
                  : "Already have an account?"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}