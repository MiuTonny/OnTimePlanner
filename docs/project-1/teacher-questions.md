1️⃣ What problem does this app solve?

OnTimePlanner helps delivery drivers, cleaners, or field workers organize multi-stop workdays.

Instead of manually estimating time and route structure, users can:

Add a start location

Add multiple service stops

Estimate time spent at each stop

Save the plan

Review structured route details

2️⃣ Why is this useful?

Many workers:

Use paper notes

Switch between maps + notes apps

Manually track stops and time

This app centralizes planning in one clean interface.

3️⃣ Why split into StopForm and StopList?

Separation of concerns.

PlanBuilder → owns state and business logic

StopForm → handles input UI

StopList → handles list rendering

This makes components reusable, readable, and easier to maintain.

4️⃣ Why not store totalMinutes in state?

Because totalMinutes is a derived value.

It is calculated from stops using .reduce().

Storing it separately would create duplicated state and risk inconsistencies if stops change.

Derived state ensures accuracy.

5️⃣ Why use immutable updates (filter, spread operator)?

React relies on detecting state changes via reference comparison.

Mutating arrays directly (like using splice) would not create a new reference and could break re-rendering.

Using:

setStops([...stops, newStop])


and

stops.filter(...)


ensures React re-renders properly.

6️⃣ Why use useEffect on Dashboard?

Dashboard loads saved plans when the component mounts.

useEffect with an empty dependency array:

useEffect(() => {
  setPlans(getPlans());
}, []);


runs once on first render.

This ensures the UI reflects persisted data.

7️⃣ Why use dynamic routing (/plan/:id)?

Each saved plan has a unique ID.

Dynamic routing allows:

Navigating directly to a specific plan

Cleaner URL structure

Scalability for future API integration

Example:
/plan/173937239123

8️⃣ What React concepts does this project demonstrate?

useState

useEffect

Controlled inputs

Derived values

Conditional rendering

Component composition

Props and callback flow

React Router (BrowserRouter, Routes, Route, useParams, useNavigate)

Immutable state updates