from datetime import datetime
from .. import db

class Plan(db.Model):
    __tablename__ = "plans"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)

    start_location = db.Column(db.String(255), nullable=False)
    start_street = db.Column(db.String(120), nullable=False)
    start_city = db.Column(db.String(80), nullable=False)
    start_state = db.Column(db.String(2), nullable=False)
    start_zip = db.Column(db.String(5), nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    stops = db.relationship("Stop", backref="plan", cascade="all, delete-orphan", lazy=True)
    metrics = db.relationship("PlanMetrics", backref="plan", cascade="all, delete-orphan", uselist=False, lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "startLocation": self.start_location,
            "startParts": {
                "street": self.start_street,
                "city": self.start_city,
                "state": self.start_state,
                "zip": self.start_zip,
            },
            "stops": [s.to_dict() for s in sorted(self.stops, key=lambda x: x.order_index)],
            "createdAt": self.created_at.isoformat(),
            "metrics": self.metrics.to_dict() if self.metrics else None,
        }