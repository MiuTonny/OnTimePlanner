import { useParams, Link } from "react-router-dom";

export default function PlanResults() {
  const { id } = useParams();

  return (
    <div className="page">
      <h1>Route Results</h1>
      <p>
        Plan ID: <strong>{id}</strong>
      </p>

      <Link className="button" to="/plan">
        Back to Builder
      </Link>
    </div>
  );
}
