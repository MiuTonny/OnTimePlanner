from .. import db

class GoalSettings(db.Model):
    __tablename__ = "goal_settings"

    id = db.Column(db.Integer, primary_key=True)

    return_to_start = db.Column(db.Boolean, nullable=False, default=False)
    buffer_minutes = db.Column(db.Integer, nullable=False, default=0)
    mpg = db.Column(db.Float, nullable=False, default=25)
    gas_price = db.Column(db.Float, nullable=False, default=3.5)

    def to_dict(self):
        return {
            "id": self.id,
            "returnToStart": self.return_to_start,
            "bufferMinutes": self.buffer_minutes,
            "mpg": self.mpg,
            "gasPrice": self.gas_price,
        }
