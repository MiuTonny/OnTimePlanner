from datetime import datetime
from .. import db

class PlanMetrics(db.Model):
    __tablename__ = "plan_metrics"

    id = db.Column(db.Integer, primary_key=True)
    plan_id = db.Column(db.Integer, db.ForeignKey("plans.id"), nullable=False, unique=True)

    distance_meters = db.Column(db.Float, nullable=False, default=0)
    duration_seconds = db.Column(db.Float, nullable=False, default=0)

    miles = db.Column(db.Float, nullable=False, default=0)
    drive_minutes = db.Column(db.Integer, nullable=False, default=0)
    service_minutes = db.Column(db.Integer, nullable=False, default=0)
    total_minutes = db.Column(db.Integer, nullable=False, default=0)

    gallons = db.Column(db.Float, nullable=False, default=0)
    gas_cost = db.Column(db.Float, nullable=False, default=0)
    mpg = db.Column(db.Float, nullable=False, default=25)
    gas_price = db.Column(db.Float, nullable=False, default=3.5)
    buffer_minutes = db.Column(db.Integer, nullable=False, default=0)

    updated_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "distanceMeters": self.distance_meters,
            "durationSeconds": self.duration_seconds,
            "miles": self.miles,
            "driveMinutes": self.drive_minutes,
            "serviceMinutes": self.service_minutes,
            "totalMinutes": self.total_minutes,
            "gallons": self.gallons,
            "gasCost": self.gas_cost,
            "mpg": self.mpg,
            "gasPrice": self.gas_price,
            "bufferMinutes": self.buffer_minutes,
            "updatedAt": self.updated_at.isoformat(),
        }