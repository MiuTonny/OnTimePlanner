/**
 * StopForm
 *
 * PURPOSE:
 * - Collect stop address parts (street/city/state/zip) + minutes-on-site
 * - This makes geocoding much more reliable because we can build a consistent
 *   formatted address string with commas and a 2-letter state code.
 *
 * DESIGN:
 * - Controlled inputs driven by parent state
 * - Does NOT own the stops array
 * - Calls parent callback on submit
 */

export default function StopForm({
  stopStreet,
  setStopStreet,
  stopCity,
  setStopCity,
  stopState,
  setStopState,
  stopZip,
  setStopZip,
  stopMinutes,
  setStopMinutes,
  onAddStop,
}) {
  /**
   * UI-level validation:
   * Disable submit unless inputs are complete.
   * Parent still performs final validation as source of truth.
   */
  const canSubmit =
    stopStreet.trim().length > 0 &&
    stopCity.trim().length > 0 &&
    stopState.trim().length > 0 &&
    stopZip.trim().length > 0 &&
    Number(stopMinutes) > 0;

  /**
   * handleSubmit
   * - Prevents full page reload
   * - Calls parent callback to add a stop
   */
  function handleSubmit(e) {
    e.preventDefault();
    onAddStop();
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add Stop</h3>

      {/* Street */}
      <input
        type="text"
        placeholder="Street address (e.g., 123 Main St)"
        value={stopStreet}
        onChange={(e) => setStopStreet(e.target.value)}
        required
      />

      {/* City */}
      <input
        type="text"
        placeholder="City (e.g., Boca Raton)"
        value={stopCity}
        onChange={(e) => setStopCity(e.target.value)}
        required
      />

      {/* State */}
      <input
        type="text"
        placeholder="State (e.g., FL)"
        value={stopState}
        onChange={(e) => setStopState(e.target.value)}
        maxLength={2}
        required
      />

      {/* ZIP */}
      <input
        type="text"
        placeholder="ZIP (e.g., 33428)"
        value={stopZip}
        onChange={(e) => setStopZip(e.target.value)}
        required
      />

      {/* Minutes */}
      <input
        type="number"
        placeholder="Minutes on site"
        value={stopMinutes}
        onChange={(e) => setStopMinutes(e.target.value)}
        min="1"
        required
      />

      <button type="submit" disabled={!canSubmit}>
        Add Stop
      </button>
    </form>
  );
}
