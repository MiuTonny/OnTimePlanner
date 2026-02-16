/**
 * storage.js
 *
 * PURPOSE:
 * - Centralize all localStorage logic for Project 1
 * - Keep storage access separate from UI components
 * - Make future backend replacement easier (Project 2/3)
 *
 * WHY THIS FILE EXISTS:
 * - React components should NOT directly manipulate localStorage
 * - We isolate persistence logic here
 * - This improves maintainability and separation of concerns
 */

/**
 * Keys used in localStorage.
 *
 * We namespace keys to avoid collisions with other apps.
 * This is considered a best practice.
 */
const PLANS_KEY = "ontimeplanner:plans";
const GOALS_KEY = "ontimeplanner:goals";

/**
 * getPlans()
 *
 * PURPOSE:
 * - Retrieve all saved plans from localStorage.
 *
 * WHY:
 * - Dashboard needs all plans.
 * - PlanResults loads a specific plan by id.
 *
 * DEFENSIVE PROGRAMMING:
 * - If no plans exist, return an empty array.
 * - If parsing fails (corrupt JSON), return empty array.
 */
export function getPlans() {
  const raw = localStorage.getItem(PLANS_KEY);

  if (!raw) return [];

  try {
    return JSON.parse(raw);
  } catch {
    // In case localStorage was manually edited or corrupted
    return [];
  }
}

/**
 * savePlans(plans)
 *
 * PURPOSE:
 * - Overwrite all plans in storage.
 *
 * WHY:
 * - Used internally after add/update operations.
 * - Keeps a single source of truth.
 *
 * NOTE:
 * - This function does NOT merge automatically.
 * - Caller must pass the full updated array.
 */
export function savePlans(plans) {
  localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
}

/**
 * addPlan(plan)
 *
 * PURPOSE:
 * - Add a new plan to storage.
 *
 * DESIGN CHOICE:
 * - New plans are added to the FRONT of the array.
 * - This makes the newest plan appear first on Dashboard.
 *
 * IMMUTABILITY:
 * - We create a new array instead of mutating existing one.
 */
export function addPlan(plan) {
  const plans = getPlans();

  // New plan first (newest on top)
  savePlans([plan, ...plans]);
}

/**
 * updatePlan(updatedPlan)
 *
 * PURPOSE:
 * - Replace an existing plan by id.
 *
 * USE CASE:
 * - After route calculation completes,
 *   we compute miles, gas cost, totals, etc.
 * - We persist those computed metrics into the plan.
 *
 * WHY IMMUTABLE UPDATE:
 * - We use .map() to create a NEW array.
 * - We do NOT mutate existing objects.
 * - This mirrors React's state update philosophy.
 */
export function updatePlan(updatedPlan) {
  const plans = getPlans();

  const next = plans.map((p) =>
    p.id === updatedPlan.id ? updatedPlan : p
  );

  savePlans(next);
}

/**
 * removePlan(planId)
 *
 * PURPOSE:
 * - Delete a plan from localStorage by id.
 *
 * WHY:
 * - Lets the user clean up old plans from Dashboard.
 * - Useful while testing and creating many plans.
 *
 * IMMUTABILITY:
 * - Uses filter() to return a NEW array without the removed plan.
 */
export function removePlan(planId) {
  const plans = getPlans();
  const next = plans.filter((p) => p.id !== planId);
  savePlans(next);
}


/**
 * getGoals()
 *
 * PURPOSE:
 * - Retrieve user settings from localStorage.
 *
 * SETTINGS STORED:
 * - returnToStart
 * - bufferMinutes
 * - mpg (vehicle efficiency)
 * - gasPrice (per gallon)
 *
 * DEFAULTS:
 * - If nothing saved yet, return safe defaults.
 * - Prevents crashes if Goals page hasn’t been opened yet.
 *
 * WHY DEFAULTS MATTER:
 * - PlanResults depends on goals for calculations.
 * - We ensure calculations always have valid numbers.
 */
export function getGoals() {
  const raw = localStorage.getItem(GOALS_KEY);

  if (!raw) {
    // Safe defaults
    return {
      returnToStart: false,
      bufferMinutes: 0,
      mpg: 25,
      gasPrice: 3.5,
    };
  }

  try {
    const parsed = JSON.parse(raw);

    return {
      returnToStart: Boolean(parsed.returnToStart),
      bufferMinutes: Number(parsed.bufferMinutes || 0),
      mpg: Number(parsed.mpg || 25),
      gasPrice: Number(parsed.gasPrice || 3.5),
    };
  } catch {
    // Fallback if data corrupted
    return {
      returnToStart: false,
      bufferMinutes: 0,
      mpg: 25,
      gasPrice: 3.5,
    };
  }
}