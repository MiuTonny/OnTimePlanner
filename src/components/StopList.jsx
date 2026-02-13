/**
 * StopList
 *
 * PURPOSE:
 * - Display the list of stops
 * - Provide a Remove button per stop
 *
 * DESIGN:
 * - Presentational component (no state for stops lives here)
 * - Receives:
 *   - stops (data)
 *   - onRemove (callback)
 */

export default function StopList({ stops, onRemove }) {
  // Conditional rendering: show a friendly message if no stops exist
  if (stops.length === 0) {
    return <p>No stops added yet.</p>;
  }

  return (
    <div>
      <h3>Stops</h3>

      <ul>
        {stops.map((stop) => (
          <li key={stop.id}>
            {/* Display stop details */}
            {stop.address} — {stop.minutes} minutes

            {/* Call parent callback with the stop id */}
            <button onClick={() => onRemove(stop.id)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
