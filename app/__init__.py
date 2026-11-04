import os
from datetime import timezone
from flask import Flask, jsonify
from .extensions import db


def serialize_datetime(dt):
    """Serializa datetime em ISO 8601 com indicador inequívoco de UTC (+00:00).

    Valores timezone-naive sao interpretados como UTC (convencao do projeto).
    Valores timezone-aware sao convertidos para UTC antes da serializacao.
    """
    if dt is None:
        return None
    if dt.tzinfo is None:
        # Naive: interpretar como UTC (convencao do projeto)
        dt = dt.replace(tzinfo=timezone.utc)
    else:
        # Converter para UTC
        dt = dt.astimezone(timezone.utc)
    return dt.isoformat()
from .blueprints.projects import bp as projects_bp
from .blueprints.test import bp as test_bp
from .blueprints.test_executions import bp as test_executions_bp
from .blueprints.testcases import bp as testcases_bp
from .blueprints.bugs import bp as bugs_bp


def _json_error(message, status_code):
    return jsonify({"error": message}), status_code


def create_app(config_name="Development"):
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(f"app.config.{config_name}Config")

    # SECRET_KEY: configuracao de teste tem prioridade; caso contrario, le da variavel de ambiente
    if not app.config.get("SECRET_KEY"):
        app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY")

    if config_name != "Testing" and not app.config.get("SECRET_KEY"):
        raise RuntimeError(
            "SECRET_KEY nao esta definida. Defina a variavel de ambiente SECRET_KEY."
        )

    db.init_app(app)
    app.register_blueprint(projects_bp)
    app.register_blueprint(testcases_bp)
    app.register_blueprint(test_executions_bp)
    app.register_blueprint(test_bp)
    app.register_blueprint(bugs_bp)

    @app.errorhandler(404)
    def not_found(e):
        return _json_error("Recurso não encontrado", 404)

    @app.errorhandler(500)
    def internal_error(e):
        return _json_error("Erro interno do servidor", 500)

    return app
