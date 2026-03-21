from flask import Blueprint, request, jsonify, session
from .. import db
from ..models import User

auth_bp = Blueprint("auth", __name__)

@auth_bp.post("/signup")
def signup():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"error": "Email already exists"}), 409

    user = User(email=email)
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    session["user_id"] = user.id
    return jsonify(user.to_dict()), 201


@auth_bp.post("/login")
def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password"}), 401

    session["user_id"] = user.id
    return jsonify(user.to_dict()), 200


@auth_bp.delete("/logout")
def logout():
    session.pop("user_id", None)
    return jsonify({"message": "Logged out"}), 200


@auth_bp.get("/me")
def me():
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    return jsonify(user.to_dict()), 200
