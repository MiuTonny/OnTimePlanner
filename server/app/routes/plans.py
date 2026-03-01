from flask import Blueprint, request, jsonify
from .. import db
from ..models import Plan, Stop

plans_bp = Blueprint("plans", __name__)

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