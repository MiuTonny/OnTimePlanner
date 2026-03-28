/**
 * API SERVICE LAYER
 *
 * PURPOSE:
 * - Centralize all frontend → backend communication
 * - Keep fetch logic out of page components
 * - Automatically include session cookies with every request
 *
 * WHY THIS MATTERS:
 * - Separation of concerns:
 *   UI components focus on rendering + interaction
 *   API service focuses on HTTP requests
 * - Makes the app easier to maintain and debug
 * - Keeps auth/session behavior consistent across the app
 */

/**
 * request
 *
 * PURPOSE:
 * - Shared wrapper around fetch()
 * - Sends JSON requests to the Flask backend
 * - Includes credentials for session-based auth
 * - Normalizes error handling so pages can show clean messages
 */
async function request(url, options = {}) {
  const res = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  /**
   * Handle non-2xx responses
   */
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;

    try {
      const data = await res.json();
      msg = data.error || msg;
    } catch {
      /**
       * If response is not JSON,
       * keep the fallback message
       */
    }

    throw new Error(msg);
  }

  /**
   * Some endpoints may return no JSON body
   */
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * AUTH ROUTES
 * - Signup
 * - Login
 * - Logout
 * - Current session
 */

export function signup(payload) {
  return request("/api/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function login(payload) {
  return request("/api/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function logout() {
  return request("/api/logout", {
    method: "DELETE",
  });
}

export function fetchMe() {
  return request("/api/me");
}

/**
 * PLAN ROUTES
 * - list plans (paginated)
 * - get one plan
 * - create
 * - update
 * - delete
 * - compute metrics
 */

export function fetchPlans(page = 1, perPage = 10) {
  return request(`/api/plans?page=${page}&per_page=${perPage}`);
}

export function fetchPlan(planId) {
  return request(`/api/plans/${planId}`);
}

export function createPlan(plan) {
  return request("/api/plans", {
    method: "POST",
    body: JSON.stringify(plan),
  });
}

export function updatePlan(planId, payload) {
  return request(`/api/plans/${planId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deletePlan(planId) {
  return request(`/api/plans/${planId}`, {
    method: "DELETE",
  });
}

export function computePlanMetrics(planId) {
  return request(`/api/plans/${planId}/compute-metrics`, {
    method: "POST",
  });
}

/**
 * GOALS ROUTES
 * - get saved goal/settings defaults
 * - update defaults
 */

export function fetchGoals() {
  return request("/api/goals");
}

export function updateGoals(payload) {
  return request("/api/goals", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}