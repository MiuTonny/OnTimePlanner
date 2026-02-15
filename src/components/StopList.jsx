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
 *   - stops (data from parent)
 *   - onRemove (callback from parent)
 *
 * RESPONSIBILITY:
 * - Render UI only
 * - Notify parent when a stop should be removed
 */

export default function StopList({ stops, onRemove }) {
  return (
    <div>
      <h3>Stops</h3>

      {/**
       * Conditional rendering:
       * If there are no stops, show a friendly message.
       * Otherwise, render the list.
       */}
      {stops.length === 0 ? (
        <p>No stops added yet.</p>
      ) : (
        <ul>
          {stops.map((stop) => (
            <li key={stop.id}>
              {/* Display stop details */}
              {stop.address} — {stop.minutes} minutes

              {/* 
                We use an arrow function so the callback 
                is executed only when the button is clicked.
              */}
              <button onClick={() => onRemove(stop.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
