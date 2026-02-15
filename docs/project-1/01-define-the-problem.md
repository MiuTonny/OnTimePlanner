/**
 * StopForm
 *
 * PURPOSE:
 * - Collect stop address + minutes-on-site from the user
 * - Notify the parent when the user wants to add a stop
 *
 * DESIGN:
 * - Controlled form component (inputs are driven by parent state)
 * - Does NOT own stops array
 * - Calls parent callback on submit
 */