import { Link } from "react-router-dom";

export default function NavBar() {
  return (
    <div className="nav">
      <div className="brand">
        <Link to="/">OnTimePlanner</Link>
        <span className="badge">Project 1</span>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <Link className="button" to="/plan">Build</Link>
        <Link className="button" to="/goals">Goals</Link>
      </div>
    </div>
  );
}
