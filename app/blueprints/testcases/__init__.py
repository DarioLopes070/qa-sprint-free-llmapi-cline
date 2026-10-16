from flask import Blueprint, request, jsonify
from app import serialize_datetime
from app.extensions import db
from app.models import TestCase, Project

bp = Blueprint('testcases', __name__, url_prefix='/api/testcases')

VALID_PRIORITIES = ['Low', 'Medium', 'High']
ALLOWED_FIELDS = {
    'project_id', 'title', 'description', 'steps',
    'expected_result', 'priority',
}


def _serialize_test_case(tc):
    return {
        'id': tc.id,
        'project_id': tc.project_id,
        'title': tc.title,
        'description': tc.description,
        'steps': tc.steps,
        'expected_result': tc.expected_result,
        'priority': tc.priority,
        'created_at': serialize_datetime(tc.created_at),
    }


def _error_response(message, status_code):
    return jsonify({'error': message}), status_code


@bp.route('/', methods=['GET'])
def list_test_cases():
    project_id = request.args.get('project_id', type=int)
    query = TestCase.query
    if project_id is not None:
        query = query.filter_by(project_id=project_id)
    return jsonify([_serialize_test_case(tc) for tc in query.all()]), 200


@bp.route('/<int:test_case_id>', methods=['GET'])
def get_test_case(test_case_id):
    tc = db.session.get(TestCase, test_case_id)
    if tc is None:
        return _error_response('Test case not found', 404)
    return jsonify(_serialize_test_case(tc)), 200


@bp.route('/', methods=['POST'])
def create_test_case():
    if not request.is_json:
        return _error_response('Request must be JSON', 400)
    data = request.get_json(silent=True)
    if data is None:
        return _error_response('Invalid JSON', 400)

    unknown = set(data.keys()) - ALLOWED_FIELDS
    if unknown:
        return _error_response(f'Unknown fields: {", ".join(sorted(unknown))}', 400)

    project_id = data.get('project_id')
    title = data.get('title')
    priority = data.get('priority', 'Medium')

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

    for field in ('description', 'steps', 'expected_result'):
        value = data.get(field)
        if value is not None and not isinstance(value, str):
            return _error_response(f'{field} must be a string', 400)

    if not isinstance(priority, str):
        return _error_response('priority must be a string', 400)
    if priority not in VALID_PRIORITIES:
        return _error_response(f'Invalid priority. Allowed: {", ".join(VALID_PRIORITIES)}', 400)

    tc = TestCase(
        project_id=project_id, title=title,
        description=data.get('description'),
        steps=data.get('steps'),
        expected_result=data.get('expected_result'),
        priority=priority,
    )
    db.session.add(tc)
    db.session.commit()
    return jsonify(_serialize_test_case(tc)), 201


@bp.route('/<int:test_case_id>', methods=['PUT'])
def update_test_case(test_case_id):
    tc = db.session.get(TestCase, test_case_id)
    if tc is None:
        return _error_response('Test case not found', 404)
    if not request.is_json:
        return _error_response('Request must be JSON', 400)
    data = request.get_json(silent=True)
    if data is None:
        return _error_response('Invalid JSON', 400)

    unknown = set(data.keys()) - ALLOWED_FIELDS
    if unknown:
        return _error_response(f'Unknown fields: {", ".join(sorted(unknown))}', 400)

    if 'project_id' in data:
        pid = data['project_id']
        if not isinstance(pid, int):
            return _error_response('project_id must be an integer', 400)
        if db.session.get(Project, pid) is None:
            return _error_response('Referenced project does not exist', 400)
        tc.project_id = pid

    if 'title' in data:
        title = data['title']
        if not title or not str(title).strip():
            return _error_response('Title cannot be empty', 400)
        title = str(title).strip()
        if len(title) > 255:
            return _error_response('Title cannot exceed 255 characters', 400)
        tc.title = title

    for field in ('description', 'steps', 'expected_result'):
        if field in data:
            val = data[field]
            if val is not None and not isinstance(val, str):
                return _error_response(f'{field} must be a string', 400)
            setattr(tc, field, val)

    if 'priority' in data:
        priority = data['priority']
        if not isinstance(priority, str):
            return _error_response('priority must be a string', 400)
        if priority not in VALID_PRIORITIES:
            return _error_response(f'Invalid priority. Allowed: {", ".join(VALID_PRIORITIES)}', 400)
        tc.priority = priority

    db.session.commit()
    return jsonify(_serialize_test_case(tc)), 200


@bp.route('/<int:test_case_id>', methods=['DELETE'])
def delete_test_case(test_case_id):
    tc = db.session.get(TestCase, test_case_id)
    if tc is None:
        return _error_response('Test case not found', 404)
    db.session.delete(tc)
    db.session.commit()
    return '', 204