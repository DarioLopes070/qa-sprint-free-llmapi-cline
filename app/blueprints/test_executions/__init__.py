from flask import Blueprint, request, jsonify
from app import serialize_datetime
from app.extensions import db
from app.models import TestExecution, TestCase

bp = Blueprint('test_executions', __name__, url_prefix='/api/executions')

VALID_STATUSES = ['Passed', 'Failed', 'Blocked', 'Not Run']
ALLOWED_CREATE_FIELDS = {
    'test_case_id', 'status', 'executed_by', 'actual_result', 'notes',
}
ALLOWED_UPDATE_FIELDS = {
    'status', 'executed_by', 'actual_result', 'notes',
}


def _serialize_execution(execution):
    return {
        'id': execution.id,
        'test_case_id': execution.test_case_id,
        'status': execution.status,
        'executed_at': serialize_datetime(execution.executed_at),
        'executed_by': execution.executed_by,
        'actual_result': execution.actual_result,
        'notes': execution.notes,
    }


def _error_response(message, status_code):
    return jsonify({'error': message}), status_code


@bp.route('/', methods=['GET'])
def list_executions():
    """Listar execucoes, com filtro opcional por test_case_id."""
    test_case_id = request.args.get('test_case_id', type=int)
    query = TestExecution.query
    if test_case_id is not None:
        query = query.filter_by(test_case_id=test_case_id)
    return jsonify([_serialize_execution(e) for e in query.all()]), 200


@bp.route('/<int:execution_id>', methods=['GET'])
def get_execution(execution_id):
    """Consultar uma execucao por ID."""
    execution = db.session.get(TestExecution, execution_id)
    if execution is None:
        return _error_response('Test execution not found', 404)
    return jsonify(_serialize_execution(execution)), 200


@bp.route('/', methods=['POST'])
def create_execution():
    """Registrar uma nova execucao."""
    if not request.is_json:
        return _error_response('Request must be JSON', 400)

    data = request.get_json(silent=True)
    if data is None:
        return _error_response('Invalid JSON', 400)

    unknown = set(data.keys()) - ALLOWED_CREATE_FIELDS
    if unknown:
        return _error_response(f'Unknown fields: {", ".join(sorted(unknown))}', 400)

    test_case_id = data.get('test_case_id')
    status = data.get('status')

    if test_case_id is None:
        return _error_response('test_case_id is required', 400)
    if not isinstance(test_case_id, int):
        return _error_response('test_case_id must be an integer', 400)
    if db.session.get(TestCase, test_case_id) is None:
        return _error_response('Referenced test case does not exist', 400)

    if status is None:
        return _error_response('status is required', 400)
    if not isinstance(status, str):
        return _error_response('status must be a string', 400)
    if status not in VALID_STATUSES:
        return _error_response(f'Invalid status. Allowed: {", ".join(VALID_STATUSES)}', 400)

    for field in ('executed_by', 'actual_result', 'notes'):
        value = data.get(field)
        if value is not None and not isinstance(value, str):
            return _error_response(f'{field} must be a string', 400)

    execution = TestExecution(
        test_case_id=test_case_id,
        status=status,
        executed_by=data.get('executed_by'),
        actual_result=data.get('actual_result'),
        notes=data.get('notes'),
    )
    db.session.add(execution)
    db.session.commit()
    return jsonify(_serialize_execution(execution)), 201


@bp.route('/<int:execution_id>', methods=['PUT'])
def update_execution(execution_id):
    """Atualizar campos editaveis de uma execucao existente."""
    execution = db.session.get(TestExecution, execution_id)
    if execution is None:
        return _error_response('Test execution not found', 404)

    if not request.is_json:
        return _error_response('Request must be JSON', 400)

    data = request.get_json(silent=True)
    if data is None:
        return _error_response('Invalid JSON', 400)

    unknown = set(data.keys()) - ALLOWED_UPDATE_FIELDS
    if unknown:
        return _error_response(f'Unknown fields: {", ".join(sorted(unknown))}', 400)

    if 'status' in data:
        status = data['status']
        if not isinstance(status, str):
            return _error_response('status must be a string', 400)
        if status not in VALID_STATUSES:
            return _error_response(f'Invalid status. Allowed: {", ".join(VALID_STATUSES)}', 400)
        execution.status = status

    for field in ('executed_by', 'actual_result', 'notes'):
        if field in data:
            val = data[field]
            if val is not None and not isinstance(val, str):
                return _error_response(f'{field} must be a string', 400)
            setattr(execution, field, val)

    db.session.commit()
    return jsonify(_serialize_execution(execution)), 200


@bp.route('/<int:execution_id>', methods=['DELETE'])
def delete_execution(execution_id):
    """Excluir uma execucao."""
    execution = db.session.get(TestExecution, execution_id)
    if execution is None:
        return _error_response('Test execution not found', 404)

    db.session.delete(execution)
    db.session.commit()
    return '', 204