from flask import Blueprint, request, jsonify
from datetime import datetime

from .. import db
from ..models import Plan, Stop, PlanMetrics, GoalSettings
from ..services.geocode import geocode_structured
from ..services.routing import get_route_stats

plans_bp = Blueprint("plans", __name__)

def minutes_from_seconds(sec):
    return round(sec / 60)

def miles_from_meters(m):
    return m * 0.000621371


@plans_bp.get("/plans")
def list_plans():
    plans = Plan.query.order_by(Plan.created_at.desc()).all()
    return jsonify([p.to_dict() for p in plans]), 200

@plans_bp.get("/plans/<int:plan_id>")
def get_plan(plan_id):
    plan = Plan.query.get(plan_id)
    if not plan:
        return jsonify({"error": "Plan not found"}), 404
    return jsonify(plan.to_dict()), 200

@plans_bp.post("/plans")
def create_plan():
    data = request.get_json() or {}

    # basic validation (rubric: error handling)
    name = (data.get("name") or "").strip()
    start_parts = data.get("startParts") or {}
    stops = data.get("stops") or []

    if not name:
        return jsonify({"error": "Plan name is required"}), 400
    if not start_parts:
        return jsonify({"error": "startParts is required"}), 400
    if not isinstance(stops, list) or len(stops) == 0:
        return jsonify({"error": "At least one stop is required"}), 400

    plan = Plan(
        name=name,
        start_location=(data.get("startLocation") or "").strip(),
        start_street=(start_parts.get("street") or "").strip(),
        start_city=(start_parts.get("city") or "").strip(),
        start_state=(start_parts.get("state") or "").strip().upper(),
        start_zip=(start_parts.get("zip") or "").strip(),
    )

    db.session.add(plan)
    db.session.flush()  # so plan.id exists

    for idx, s in enumerate(stops):
        parts = s.get("parts") or {}
        stop = Stop(
            plan_id=plan.id,
            street=(parts.get("street") or "").strip(),
            city=(parts.get("city") or "").strip(),
            state=(parts.get("state") or "").strip().upper(),
            zip=(parts.get("zip") or "").strip(),
            minutes=int(s.get("minutes") or 0),
            order_index=idx,
        )
        db.session.add(stop)

    db.session.commit()
    return jsonify(plan.to_dict()), 201

@plans_bp.delete("/plans/<int:plan_id>")
def delete_plan(plan_id):
    plan = Plan.query.get(plan_id)
    if not plan:
        return jsonify({"error": "Plan not found"}), 404
    db.session.delete(plan)
    db.session.commit()
    return jsonify({"ok": True}), 200

@plans_bp.post("/plans/<int:plan_id>/compute-metrics")
def compute_metrics(plan_id):
    plan = Plan.query.get(plan_id)
    if not plan:
        return jsonify({"error": "Plan not found"}), 404

    try:
        start_parts = {
            "street": plan.start_street,
            "city": plan.start_city,
            "state": plan.start_state,
            "zip": plan.start_zip,
        }

        start_result = geocode_structured(start_parts)

        ordered_stops = sorted(plan.stops, key=lambda s: s.order_index)
        stop_results = []

        for stop in ordered_stops:
            stop_parts = {
                "street": stop.street,
                "city": stop.city,
                "state": stop.state,
                "zip": stop.zip,
            }
            stop_results.append(geocode_structured(stop_parts))

        coords = [
            {"lat": start_result["lat"], "lon": start_result["lon"]},
            *[
                {"lat": r["lat"], "lon": r["lon"]}
                for r in stop_results
            ],
        ]

        stats = get_route_stats(coords)

        drive_minutes = minutes_from_seconds(stats["durationSeconds"])
        miles = miles_from_meters(stats["distanceMeters"])

        base_service_minutes = sum(int(s.minutes or 0) for s in ordered_stops)

        # temporary defaults until Goals moves to backend
        settings = GoalSettings.query.first()

        buffer_per_stop = settings.buffer_minutes if settings else 0
        mpg = settings.mpg if settings else 25
        gas_price = settings.gas_price if settings else 3.5

        buffer_total = buffer_per_stop * len(ordered_stops)
        service_minutes = base_service_minutes + buffer_total
        total_minutes = service_minutes + drive_minutes
        gallons = (miles / mpg) if mpg > 0 else 0
        gas_cost = gallons * gas_price

        metrics = plan.metrics
        if not metrics:
            metrics = PlanMetrics(plan_id=plan.id)
            db.session.add(metrics)

        metrics.distance_meters = stats["distanceMeters"]
        metrics.duration_seconds = stats["durationSeconds"]
        metrics.miles = miles
        metrics.drive_minutes = drive_minutes
        metrics.service_minutes = service_minutes
        metrics.total_minutes = total_minutes
        metrics.gallons = gallons
        metrics.gas_cost = gas_cost
        metrics.mpg = mpg
        metrics.gas_price = gas_price
        metrics.buffer_minutes = buffer_per_stop
        metrics.updated_at = datetime.utcnow()

        db.session.commit()
        return jsonify(plan.to_dict()), 200

    except Exception as err:
        return jsonify({"error": str(err)}), 500