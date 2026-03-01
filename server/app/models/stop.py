from .. import db

class Stop(db.Model):
    __tablename__ = "stops"

    id = db.Column(db.Integer, primary_key=True)
    plan_id = db.Column(db.Integer, db.ForeignKey("plans.id"), nullable=False)

    street = db.Column(db.String(120), nullable=False)
    city = db.Column(db.String(80), nullable=False)
    state = db.Column(db.String(2), nullable=False)
    zip = db.Column(db.String(5), nullable=False)

    minutes = db.Column(db.Integer, nullable=False, default=0)
    order_index = db.Column(db.Integer, nullable=False, default=0)

    def to_dict(self):
        address = f"{self.street}, {self.city}, {self.state} {self.zip}"
        return {
            "id": self.id,
            "address": address,
            "parts": {
                "street": self.street,
                "city": self.city,
                "state": self.state,
                "zip": self.zip,
            },
            "minutes": self.minutes,
        }