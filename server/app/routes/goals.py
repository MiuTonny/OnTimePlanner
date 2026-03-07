from flask import Blueprint, request, jsonify
from .. import db
from ..models import GoalSettings

goals_bp = Blueprint("goals", __name__)

def get_or_create_goal_settings():
    settings = GoalSettings.query.first()

    if not settings:
        settings = GoalSettings(
            return_to_start=False,
            buffer_minutes=0,
            mpg=25,
            gas_price=3.5,
        )
        db.session.add(settings)
        db.session.commit()

    return settings

@goals_bp.get("/goals")
def get_goals():
    settings = get_or_create_goal_settings()
    return jsonify(settings.to_dict()), 200

@goals_bp.patch("/goals")
def update_goals():
    settings = get_or_create_goal_settings()
    data = request.get_json() or {}

    settings.return_to_start = bool(data.get("returnToStart", settings.return_to_start))
    settings.buffer_minutes = int(data.get("bufferMinutes", settings.buffer_minutes) or 0)
    settings.mpg = float(data.get("mpg", settings.mpg) or 25)
    settings.gas_price = float(data.get("gasPrice", settings.gas_price) or 3.5)

    db.session.commit()
    return jsonify(settings.to_dict()), 200
