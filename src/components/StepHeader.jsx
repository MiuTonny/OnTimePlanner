/**
 * StepHeader
 *
 * PURPOSE:
 * - Visual step navigation (like route-planner apps)
 * - Guides user through the app flow:
 *   1) Addresses → build plan
 *   2) Results → view route output
 *   3) Reviews → product presentation / trust
 *
 * WHY THIS MATTERS:
 * - Improves UX by showing progress
 * - Makes the app feel structured and intuitive
 * - Mimics real-world tools (logistics / routing apps)
 */

import { NavLink, useLocation } from "react-router-dom";

export default function StepHeader() {
  /**
   * Detect current route
   */
  const location = useLocation();

  const isAddresses = location.pathname === "/plan";
  const isResults =
    location.pathname.startsWith("/plan/") ||
    location.pathname === "/dashboard";
  const isReviews = location.pathname === "/reviews";

  /**
   * Read last saved plan id + name
   * - Used for navigation + UI display
   */
  const lastPlanId = localStorage.getItem("lastPlanId");
  const lastPlanName = localStorage.getItem("lastPlanName");

  /**
   * Determine if a plan exists
   */
  const hasPlan = Boolean(lastPlanId);

  /**
   * Dynamic class for active step highlighting
   */
  const linkClass = (isActive) =>
    `step ${isActive ? "active" : ""}`;

  return (
    <div className="stepbar">
      {/* STEP 1: Addresses */}
      <NavLink to="/plan" className={linkClass(isAddresses)}>
        <span className="stepnum">1</span>
        <div>
          <div className="steptitle">Addresses</div>
          <div className="stepsub">Build route</div>
        </div>
      </NavLink>

      {/* STEP 2: Results */}
      <NavLink
        to={hasPlan ? `/plan/${lastPlanId}` : "/dashboard"}
        className={linkClass(isResults)}
      >
        <span className="stepnum">2</span>
        <div>
          <div className="steptitle">Results</div>

          {/* Dynamic subtitle */}
          <div className="stepsub">
            {hasPlan
              ? lastPlanName || "View totals"
              : "Open dashboard"}
          </div>
        </div>
      </NavLink>

      {/* STEP 3: Reviews */}
      <NavLink to="/reviews" className={linkClass(isReviews)}>
        <span className="stepnum">3</span>
        <div>
          <div className="steptitle">Reviews</div>
          <div className="stepsub">Who it's for</div>
        </div>
      </NavLink>
    </div>
  );
}