import os

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

    # Uses SECRET_KEY from .env/environment instead of hardcoding it
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key")

    CORS(
        app,
        resources={r"/api/*": {"origins": "http://localhost:5173"}},
        supports_credentials=True
    )

    db.init_app(app)
    migrate.init_app(app, db)

    # register routes
    from .routes.plans import plans_bp
    from .routes.goals import goals_bp
    from .routes.auth import auth_bp

    app.register_blueprint(plans_bp, url_prefix="/api")
    app.register_blueprint(goals_bp, url_prefix="/api")
    app.register_blueprint(auth_bp, url_prefix="/api")

    return app
    


    return app
