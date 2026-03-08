/**
 * StepHeader
 * - Simple step bar like route-planner apps
 * - Shows 1) Addresses 2) Goals 3) Results
 */

import { NavLink } from "react-router-dom";

export default function StepHeader() {
  const linkClass = ({ isActive }) =>
    `step ${isActive ? "active" : ""}`;

  return (
    <div className="stepbar">
      <NavLink to="/plan" className={linkClass}>
        <span className="stepnum">1</span>
        <div>
          <div className="steptitle">Addresses</div>
          <div className="stepsub">Import / Type</div>
        </div>
      </NavLink>

      <NavLink to="/goals" className={linkClass}>
        <span className="stepnum">2</span>
        <div>
          <div className="steptitle">Goals</div>
          <div className="stepsub">Set parameters</div>
        </div>
      </NavLink>

      <NavLink to="/dashboard" className={linkClass}>
        <span className="stepnum">3</span>
        <div>
          <div className="steptitle">Results</div>
          <div className="stepsub">Navigate / Export</div>
        </div>
      </NavLink>
    </div>
  );
}
