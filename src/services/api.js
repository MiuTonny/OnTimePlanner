async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      msg = data.error || msg;
    } catch {}
    throw new Error(msg);
  }

  try {
    return await res.json();
  } catch {
    return null;
  }
}

export function fetchPlans() {
  return request("/api/plans");
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

export function deletePlan(planId) {
  return request(`/api/plans/${planId}`, { method: "DELETE" });
}

export function computePlanMetrics(planId) {
  return request(`/api/plans/${planId}/compute-metrics`, {
    method: "POST",
  });
}

export function fetchGoals() {
  return request("/api/goals");
}

export function updateGoals(payload) {
  return request("/api/goals", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
