/**
 * StopForm
 *
 * PURPOSE:
 * - Collect stop address + minutes-on-site from the user
 * - Notify the parent when the user wants to add a stop
 *
 * DESIGN:
 * - This is a "controlled form" component.
 * - It does NOT own the stops array.
 * - It receives the current input values + setters via props.
 */

export default function StopForm({
  stopAddress,
  setStopAddress,
  stopMinutes,
  setStopMinutes,
  onAddStop,
}) {
  /**
   * handleSubmit
   * - Prevents the browser from refreshing the page on form submit
   * - Calls the parent callback that actually adds the stop
   */
  function handleSubmit(e) {
    e.preventDefault();
    onAddStop();
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add Stop</h3>

      {/* Controlled input: value comes from parent state */}
      <input
        type="text"
        placeholder="Stop address"
        value={stopAddress}
        onChange={(e) => setStopAddress(e.target.value)}
      />

      {/* Controlled input: value comes from parent state */}
      <input
        type="number"
        placeholder="Minutes on site"
        value={stopMinutes}
        onChange={(e) => setStopMinutes(e.target.value)}
        min="0"
      />

      {/* Submitting the form allows "Enter" key to add a stop (nice UX) */}
      <button type="submit">Add Stop</button>
    </form>
  );
}
