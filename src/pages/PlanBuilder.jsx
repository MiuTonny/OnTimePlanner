/**
 * PlanBuilder
 *
 * PURPOSE:
 * - Page where the user creates a daily plan
 * - Owns state for start location and stops
 * - Adds/removes stops
 * - Calculates derived totals
 *
 * ARCHITECTURE:
 * - State + business logic live here
 * - UI is split into reusable components:
 *   - StopForm (inputs)
 *   - StopList (display list)
 */

import { useState } from "react";
import StopForm from "../components/StopForm";
import StopList from "../components/StopList";

export default function PlanBuilder() {
  // Start location input state
  const [startLocation, setStartLocation] = useState("");

  // Stop form input state (controlled inputs)
  const [stopAddress, setStopAddress] = useState("");
  const [stopMinutes, setStopMinutes] = useState("");

  /**
   * stops = source of truth for all added stops.
   * Each stop:
   * { id: number, address: string, minutes: number }
   */
  const [stops, setStops] = useState([]);

  /**
   * handleAddStop
   * - Validates input
   * - Creates a new stop object
   * - Updates stops immutably (new array)
   */
  function handleAddStop() {
    if (!stopAddress || !stopMinutes) return;

    const newStop = {
      id: Date.now(), // simple unique id (ok for Project 1)
      address: stopAddress,
      minutes: Number(stopMinutes),
    };

    // Immutable state update: create a new array
    setStops([...stops, newStop]);

    // Clear the form fields
    setStopAddress("");
    setStopMinutes("");
  }

  /**
   * handleRemoveStop
   * - Removes a stop by id using filter()
   * - filter() returns a NEW array (immutable update)
   */
  function handleRemoveStop(id) {
    const updatedStops = stops.filter((stop) => stop.id !== id);
    setStops(updatedStops);
  }

  /**
   * Derived value:
   * - Not stored in state to avoid duplicated state bugs
   * - Always stays consistent with stops
   */
  const totalMinutes = stops.reduce((sum, stop) => sum + stop.minutes, 0);

  return (
    <div className="page">
      <h1>Create Day Plan</h1>

      {/* Start Location (controlled input) */}
      <h3>Start Location</h3>
      <input
        type="text"
        placeholder="Enter start address"
        value={startLocation}
        onChange={(e) => setStartLocation(e.target.value)}
      />

      {/* StopForm: receives controlled input values + setters + submit callback */}
      <StopForm
        stopAddress={stopAddress}
        setStopAddress={setStopAddress}
        stopMinutes={stopMinutes}
        setStopMinutes={setStopMinutes}
        onAddStop={handleAddStop}
      />

      {/* StopList: receives the stops data + remove callback */}
      <StopList stops={stops} onRemove={handleRemoveStop} />

      {/* Derived total display */}
      <h3>Total Service Time: {totalMinutes} minutes</h3>
    </div>
  );
}
