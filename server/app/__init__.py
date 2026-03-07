from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS

from .config import Config

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, resources={r"/api/*": {"origins": "*"}})

    db.init_app(app)
    migrate.init_app(app, db)

    # register routes
    from .routes.plans import plans_bp
    from .routes.goals import goals_bp

    app.register_blueprint(plans_bp, url_prefix="/api")
    app.register_blueprint(goals_bp, url_prefix="/api")


    return app
