// We import useState because this component needs to store and update data
import { useState } from "react";

export default function PlanBuilder() {

  // ===============================
  // STATE SECTION
  // ===============================

  // Holds the start location entered by the user
  const [startLocation, setStartLocation] = useState("");

  // Holds the current stop address input value
  const [stopAddress, setStopAddress] = useState("");

  // Holds the current minutes input value
  const [stopMinutes, setStopMinutes] = useState("");

  // Holds the array of all added stops
  // Each stop will be an object: { id, address, minutes }
  const [stops, setStops] = useState([]);

  // ===============================
  // EVENT HANDLERS
  // ===============================

  // Adds a new stop to the stops array
  function handleAddStop() {

    // Prevent adding empty values
    if (!stopAddress || !stopMinutes) return;

    // Create a new stop object
    const newStop = {
      id: Date.now(), // simple unique id based on timestamp
      address: stopAddress,
      minutes: Number(stopMinutes), // convert string to number
    };

    // Update state immutably (DO NOT mutate stops directly)
    // We create a new array containing previous stops + new stop
    setStops([...stops, newStop]);

    // Clear input fields after adding
    setStopAddress("");
    setStopMinutes("");
  }

  // Removes a stop by filtering it out
  function handleRemoveStop(id) {

    // Create a new array without the stop matching the id
    const updatedStops = stops.filter((stop) => stop.id !== id);

    // Update state with new filtered array
    setStops(updatedStops);
  }

  // ===============================
  // DERIVED VALUE
  // ===============================

  // totalMinutes is NOT stored in state
  // It is derived from the stops array
  // This prevents duplicated state and inconsistencies
  const totalMinutes = stops.reduce(
    (sum, stop) => sum + stop.minutes,
    0
  );

  // ===============================
  // RENDER SECTION (JSX)
  // ===============================

  return (
    <div className="page">
      <h1>Create Day Plan</h1>

      {/* Controlled input for start location */}
      <h3>Start Location</h3>
      <input
        type="text"
        placeholder="Enter start address"
        value={startLocation} // value comes from state
        onChange={(e) => setStartLocation(e.target.value)} // update state on change
      />

      {/* Controlled inputs for adding a stop */}
      <h3>Add Stop</h3>
      <input
        type="text"
        placeholder="Stop address"
        value={stopAddress}
        onChange={(e) => setStopAddress(e.target.value)}
      />

      <input
        type="number"
        placeholder="Minutes on site"
        value={stopMinutes}
        onChange={(e) => setStopMinutes(e.target.value)}
      />

      <button onClick={handleAddStop}>
        Add Stop
      </button>

      {/* Render list of stops dynamically */}
      <h3>Stops</h3>
      <ul>
        {stops.map((stop) => (
          <li key={stop.id}>
            {stop.address} — {stop.minutes} minutes
            <button onClick={() => handleRemoveStop(stop.id)}>
              Remove
            </button>
          </li>
        ))}
      </ul>

      {/* Display derived total */}
      <h3>Total Service Time: {totalMinutes} minutes</h3>
    </div>
  );
}
