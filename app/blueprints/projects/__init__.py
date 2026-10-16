from flask import Blueprint, request, jsonify
from app import serialize_datetime
from app.extensions import db
from app.models import Project

bp = Blueprint('projects', __name__, url_prefix='/api/projects')


def _serialize_project(project):
    return {
        'id': project.id,
        'name': project.name,
        'description': project.description,
        'created_at': serialize_datetime(project.created_at),
    }


def _error_response(message, status_code):
    return jsonify({'error': message}), status_code


@bp.route('/', methods=['GET'])
def list_projects():
    """Listar todos os projetos."""
    projects = Project.query.all()
    return jsonify([_serialize_project(p) for p in projects]), 200


@bp.route('/<int:project_id>', methods=['GET'])
def get_project(project_id):
    """Consultar um projeto por ID."""
    project = db.session.get(Project, project_id)
    if project is None:
        return _error_response('Project not found', 404)
    return jsonify(_serialize_project(project)), 200


@bp.route('/', methods=['POST'])
def create_project():
    """Criar um novo projeto."""
    if not request.is_json:
        return _error_response('Request must be JSON', 400)

    data = request.get_json(silent=True)
    if data is None:
        return _error_response('Invalid JSON', 400)

    name = data.get('name')
    description = data.get('description')

    if not name or not str(name).strip():
        return _error_response('Name is required and cannot be empty', 400)

    name = str(name).strip()
    if len(name) > 255:
        return _error_response('Name cannot exceed 255 characters', 400)

    project = Project(name=name, description=description)
    db.session.add(project)
    db.session.commit()

    return jsonify(_serialize_project(project)), 201


@bp.route('/<int:project_id>', methods=['PUT'])
def update_project(project_id):
    """Atualizar um projeto existente."""
    project = db.session.get(Project, project_id)
    if project is None:
        return _error_response('Project not found', 404)

    if not request.is_json:
        return _error_response('Request must be JSON', 400)

    data = request.get_json(silent=True)
    if data is None:
        return _error_response('Invalid JSON', 400)

    name = data.get('name')
    description = data.get('description')

    if name is not None:
        if not str(name).strip():
            return _error_response('Name cannot be empty', 400)
        name = str(name).strip()
        if len(name) > 255:
            return _error_response('Name cannot exceed 255 characters', 400)
        project.name = name

    if description is not None:
        project.description = description

    db.session.commit()
    return jsonify(_serialize_project(project)), 200


@bp.route('/<int:project_id>', methods=['DELETE'])
def delete_project(project_id):
    """Excluir um projeto."""
    project = db.session.get(Project, project_id)
    if project is None:
        return _error_response('Project not found', 404)

    db.session.delete(project)
    db.session.commit()
    return '', 204
