from flask import Blueprint, request, jsonify
from app import serialize_datetime
from app.extensions import db
from app.models import Bug, Project, TestCase
from datetime import datetime, timezone

bp = Blueprint('bugs', __name__, url_prefix='/api/bugs')

VALID_SEVERITIES = ['Low', 'Medium', 'High', 'Critical']
VALID_STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed']
RESOLVED_STATUSES = {'Resolved', 'Closed'}

ALLOWED_CREATE_FIELDS = {
    'project_id', 'test_case_id', 'title', 'description',
    'severity', 'status',
}
ALLOWED_UPDATE_FIELDS = {
    'test_case_id', 'title', 'description', 'severity', 'status',
}


def _serialize_bug(bug):
    return {
        'id': bug.id,
        'project_id': bug.project_id,
        'test_case_id': bug.test_case_id,
        'title': bug.title,
        'description': bug.description,
        'severity': bug.severity,
        'status': bug.status,
        'created_at': serialize_datetime(bug.created_at),
        'resolved_at': serialize_datetime(bug.resolved_at),
    }


def _error_response(message, status_code):
    return jsonify({'error': message}), status_code


@bp.route('/', methods=['GET'])
def list_bugs():
    """Listar bugs, com filtros opcionais por project_id, test_case_id, severity, status."""
    project_id = request.args.get('project_id', type=int)
    test_case_id = request.args.get('test_case_id', type=int)
    severity = request.args.get('severity', type=str)
    status = request.args.get('status', type=str)
    query = Bug.query
    if project_id is not None:
        query = query.filter_by(project_id=project_id)
    if test_case_id is not None:
        query = query.filter_by(test_case_id=test_case_id)
    if severity is not None:
        query = query.filter_by(severity=severity)
    if status is not None:
        query = query.filter_by(status=status)
    return jsonify([_serialize_bug(b) for b in query.all()]), 200


@bp.route('/<int:bug_id>', methods=['GET'])
def get_bug(bug_id):
    """Consultar um bug por ID."""
    bug = db.session.get(Bug, bug_id)
    if bug is None:
        return _error_response('Bug not found', 404)
    return jsonify(_serialize_bug(bug)), 200


@bp.route('/', methods=['POST'])
def create_bug():
    """Criar um novo bug."""
    if not request.is_json:
        return _error_response('Request must be JSON', 400)

    data = request.get_json(silent=True)
    if data is None:
        return _error_response('Invalid JSON', 400)

    unknown = set(data.keys()) - ALLOWED_CREATE_FIELDS
    if unknown:
        return _error_response(f'Unknown fields: {", ".join(sorted(unknown))}', 400)

    project_id = data.get('project_id')
    title = data.get('title')

    if project_id is None:
        return _error_response('project_id is required', 400)
    if not isinstance(project_id, int):
        return _error_response('project_id must be an integer', 400)
    if db.session.get(Project, project_id) is None:
        return _error_response('Referenced project does not exist', 400)

    if not title or not str(title).strip():
        return _error_response('Title is required and cannot be empty', 400)
    title = str(title).strip()
    if len(title) > 255:
        return _error_response('Title cannot exceed 255 characters', 400)

    test_case_id = data.get('test_case_id')
    if test_case_id is not None:
        if not isinstance(test_case_id, int):
            return _error_response('test_case_id must be an integer', 400)
        test_case = db.session.get(TestCase, test_case_id)
        if test_case is None:
            return _error_response('Referenced test case does not exist', 400)
        if test_case.project_id != project_id:
            return _error_response('Test case does not belong to the specified project', 400)

    severity = data.get('severity', 'Medium')
    if not isinstance(severity, str):
        return _error_response('severity must be a string', 400)
    if severity not in VALID_SEVERITIES:
        return _error_response(f'Invalid severity. Allowed: {", ".join(VALID_SEVERITIES)}', 400)

    status = data.get('status', 'Open')
    if not isinstance(status, str):
        return _error_response('status must be a string', 400)
    if status not in VALID_STATUSES:
        return _error_response(f'Invalid status. Allowed: {", ".join(VALID_STATUSES)}', 400)

    description = data.get('description')
    if description is not None and not isinstance(description, str):
        return _error_response('description must be a string', 400)

    resolved_at = None
    if status in RESOLVED_STATUSES:
        resolved_at = datetime.now(timezone.utc)

    bug = Bug(
        project_id=project_id,
        test_case_id=test_case_id,
        title=title,
        description=description,
        severity=severity,
        status=status,
        resolved_at=resolved_at,
    )
    db.session.add(bug)
    db.session.commit()
    return jsonify(_serialize_bug(bug)), 201


@bp.route('/<int:bug_id>', methods=['PUT'])
def update_bug(bug_id):
    """Atualizar campos editaveis de um bug existente."""
    bug = db.session.get(Bug, bug_id)
    if bug is None:
        return _error_response('Bug not found', 404)

    if not request.is_json:
        return _error_response('Request must be JSON', 400)

    data = request.get_json(silent=True)
    if data is None:
        return _error_response('Invalid JSON', 400)

    unknown = set(data.keys()) - ALLOWED_UPDATE_FIELDS
    if unknown:
        return _error_response(f'Unknown fields: {", ".join(sorted(unknown))}', 400)

    if 'test_case_id' in data:
        test_case_id = data['test_case_id']
        if not isinstance(test_case_id, int):
            return _error_response('test_case_id must be an integer', 400)
        test_case = db.session.get(TestCase, test_case_id)
        if test_case is None:
            return _error_response('Referenced test case does not exist', 400)
        if test_case.project_id != bug.project_id:
            return _error_response('Test case does not belong to the bug project', 400)
        bug.test_case_id = test_case_id

    if 'title' in data:
        title = data['title']
        if not title or not str(title).strip():
            return _error_response('Title cannot be empty', 400)
        title = str(title).strip()
        if len(title) > 255:
            return _error_response('Title cannot exceed 255 characters', 400)
        bug.title = title

    if 'description' in data:
        description = data['description']
        if description is not None and not isinstance(description, str):
            return _error_response('description must be a string', 400)
        bug.description = description

    if 'severity' in data:
        severity = data['severity']
        if not isinstance(severity, str):
            return _error_response('severity must be a string', 400)
        if severity not in VALID_SEVERITIES:
            return _error_response(f'Invalid severity. Allowed: {", ".join(VALID_SEVERITIES)}', 400)
        bug.severity = severity

    if 'status' in data:
        status = data['status']
        if not isinstance(status, str):
            return _error_response('status must be a string', 400)
        if status not in VALID_STATUSES:
            return _error_response(f'Invalid status. Allowed: {", ".join(VALID_STATUSES)}', 400)
        bug.status = status
        if status in RESOLVED_STATUSES and bug.resolved_at is None:
            bug.resolved_at = datetime.now(timezone.utc)

    db.session.commit()
    return jsonify(_serialize_bug(bug)), 200


@bp.route('/<int:bug_id>', methods=['DELETE'])
def delete_bug(bug_id):
    """Excluir um bug."""
    bug = db.session.get(Bug, bug_id)
    if bug is None:
        return _error_response('Bug not found', 404)

    db.session.delete(bug)
    db.session.commit()
    return '', 204