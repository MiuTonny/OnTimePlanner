/**
 * Reviews
 *
 * PURPOSE:
 * - Present the product in a stronger, more polished way
 * - Show who OnTimePlanner is built for
 * - Add trust-building content like testimonials and contact info
 *
 * PAGE SECTIONS:
 * - Product intro / pitch
 * - Target users
 * - Reviews / testimonials
 * - Demo / how it works
 * - Contact / creator info
 *
 * ARCHITECTURE:
 * - This page is a presentation page instead of a settings page
 * - No backend fetch is needed here
 * - Static content helps explain the product demo/story
 *
 * WHY THIS MATTERS:
 * - Makes the app feel more like a real product
 * - Helps communicate value to instructors, recruiters, or users
 * - Creates a better final step after route results
 */

import { Link } from "react-router-dom";

export default function Reviews() {
  /**
   * Static presentation content
   */
  const targetUsers = [
    {
      title: "Delivery Drivers",
      description:
        "Plan multiple stops, reduce wasted driving time, and better organize the workday.",
      icon: "🚚",
    },
    {
      title: "House Cleaners",
      description:
        "Map out house-to-house visits and understand how travel time affects the daily schedule.",
      icon: "🧽",
    },
    {
      title: "Field Technicians",
      description:
        "Preview route totals before leaving and better manage service appointments.",
      icon: "🛠️",
    },
  ];

  const testimonials = [
    {
      name: "Maria — House Cleaner",
      quote:
        "I can finally see my whole day before I leave home. It helps me decide how many jobs I can take.",
    },
    {
      name: "James — Delivery Driver",
      quote:
        "Way easier than switching between apps. Everything I need is in one place.",
    },
    {
      name: "Andre — Field Technician",
      quote:
        "Being able to estimate drive time and service time ahead of time is huge.",
    },
  ];

  const demoSteps = [
    {
      title: "Add addresses",
      description:
        "Enter your starting point and all stops for the day in one place.",
    },
    {
      title: "Generate results",
      description:
        "Instantly view route totals, estimated time, mileage, and fuel cost.",
    },
    {
      title: "Plan smarter",
      description:
        "Use the summary to adjust your schedule before your day even starts.",
    },
  ];

  const highlights = [
    "React frontend with reusable components",
    "Flask backend with authenticated API routes",
    "Persistent plans stored in a database",
    "Route metrics: time, distance, and cost",
  ];

  return (
    <div className="page">
      {/* Hero / product intro */}
      <div className="card reviews-hero">
        <div className="reviews-hero-copy">
          <p className="reviews-eyebrow">Final Step · Reviews</p>

          <h1>Plan smarter routes in seconds</h1>

          <p className="muted reviews-lead">
            OnTimePlanner helps route-based workers organize multiple stops,
            estimate travel time, and understand their entire day — before even
            leaving home.
          </p>

          <div className="actions">
            <Link className="button primary" to="/plan">
              Build a Route
            </Link>
            <Link className="button" to="/dashboard">
              Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="reviews-hero-panel">
          <h3>Why it matters</h3>
          <ul className="reviews-highlight-list">
            {highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Who it helps */}
      <div className="card">
        <h2>Who this app is for</h2>
        <p className="muted">
          Designed for people who work across multiple locations and need a fast,
          structured way to plan their day.
        </p>

        <div className="reviews-grid">
          {targetUsers.map((user) => (
            <div key={user.title} className="reviews-feature-card">
              <div className="reviews-icon">{user.icon}</div>
              <h3>{user.title}</h3>
              <p className="muted">{user.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Demo flow */}
      <div className="card">
        <h2>How it works</h2>

        <div className="demo-list">
          {demoSteps.map((step, index) => (
            <div key={step.title} className="demo-step-card">
              <div className="demo-badge">{index + 1}</div>
              <div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="card">
        <h2>What users say</h2>
        <p className="muted">
          Example feedback from real-world use cases.
        </p>

        <div className="reviews-grid">
          {testimonials.map((review) => (
            <div key={review.name} className="quote-card">
              <p className="quote-text">“{review.quote}”</p>
              <div className="quote-name">{review.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact / project info */}
      <div className="card">
        <h2>About this project</h2>

        <div className="contact-list">
          <div className="contact-item">
            <label className="label">Developer</label>
            <p className="hint">Milton Tavares</p>
          </div>

          <div className="contact-item">
            <label className="label">Email</label>
            <p className="hint">Miltonp.Tavares@hotmail.com</p>
          </div>

          <div className="contact-item">
            <label className="label">Stack</label>
            <p className="hint">React · Flask · SQLAlchemy</p>
          </div>

          <div className="contact-item">
            <label className="label">Goal</label>
            <p className="hint">
              Build a practical tool for delivery drivers, cleaners, and
              multi-stop workers to plan their day more efficiently.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}