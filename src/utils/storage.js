/**
 * storage.js
 *
 * PURPOSE:
 * - Centralize localStorage read/write logic
 * - Keep components clean
 * - Make saved-plan logic easy to explain and maintain
 */

const STORAGE_KEY = "ontimeplanner:plans";

/**
 * getPlans
 * - Reads saved plans from localStorage
 * - Returns an array (empty if none)
 */
export function getPlans() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // If localStorage gets corrupted, fail safely
    return [];
  }
}

/**
 * savePlans
 * - Writes the full plans array back to localStorage
 */
export function savePlans(plans) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

/**
 * addPlan
 * - Adds a single plan to localStorage
 * - Returns the updated plans array
 */
export function addPlan(plan) {
  const current = getPlans();
  const updated = [plan, ...current]; // newest first
  savePlans(updated);
  return updated;
}

/**
 * removePlan
 * - Deletes a plan by id
 * - Returns the updated plans array
 */
export function removePlan(planId) {
  const current = getPlans();
  const updated = current.filter((p) => p.id !== planId);
  savePlans(updated);
  return updated;
}
