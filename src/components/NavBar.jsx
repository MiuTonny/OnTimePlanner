import { Link, useNavigate } from "react-router-dom";

export default function NavBar() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("otp_logged_in");
    navigate("/login");
  }

  return (
    <div className="nav">
      <div className="brand">
        <Link to="/dashboard">OnTimePlanner</Link>
        <span className="badge">Full-Stack</span>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <Link className="button" to="/plan">Build</Link>
        <Link className="button" to="/goals">Goals</Link>
        <Link className="button" to="/dashboard">Dashboard</Link>
        <button className="button" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}
