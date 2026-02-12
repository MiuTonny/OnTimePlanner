import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="page">
      <h1>OnTimePlanner</h1>
      <p>Dashboard is rendering ✅</p>

      <Link className="button" to="/plan">
        Create a New Plan
      </Link>
    </div>
  );
}
