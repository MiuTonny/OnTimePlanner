import { NavLink } from "react-router-dom";

export default function NavBar() {
  return (
    <nav className="nav">
      <div className="nav__brand">OnTimePlanner</div>
      <div className="nav__links">
        <NavLink to="/" end className="nav__link">
          Dashboard
        </NavLink>
        <NavLink to="/plan" className="nav__link">
          New Plan
        </NavLink>
      </div>
    </nav>
  );
}
