import pytest
from app.models import Project
from app.models import TestCase as _TestCase
from app.models import TestExecution as _TestExecution
from app.extensions import db


def test_create_execution_valid(client):
    """Teste: criar execucao valida com todos os campos."""
    with client.application.app_context():
        project = Project(name='Project for Execution')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

        tc = _TestCase(project_id=project_id, title='TC for Execution')
        db.session.add(tc)
        db.session.commit()
        tc_id = tc.id

    response = client.post('/api/executions/', json={
        'test_case_id': tc_id,
        'status': 'Passed',
        'executed_by': 'tester1',
        'actual_result': 'Result matched',
        'notes': 'All good',
    })
    assert response.status_code == 201
    data = response.get_json()
    assert data['test_case_id'] == tc_id
    assert data['status'] == 'Passed'
    assert data['executed_by'] == 'tester1'
    assert data['actual_result'] == 'Result matched'
    assert data['notes'] == 'All good'
    assert 'id' in data
    assert 'executed_at' in data


def test_create_execution_minimal_fields(client):
    """Teste: criar execucao apenas com campos obrigatorios."""
    with client.application.app_context():
        project = Project(name='Project for Minimal Exec')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

        tc = _TestCase(project_id=project_id, title='TC Minimal')
        db.session.add(tc)
        db.session.commit()
        tc_id = tc.id

    response = client.post('/api/executions/', json={
        'test_case_id': tc_id,
        'status': 'Not Run',
    })
    assert response.status_code == 201
    data = response.get_json()
    assert data['status'] == 'Not Run'
    assert data['executed_by'] is None
    assert data['actual_result'] is None
    assert data['notes'] is None


def test_create_execution_all_valid_statuses(client):
    """Teste: todos os status validos sao aceitos."""
    with client.application.app_context():
        project = Project(name='Project for Statuses')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

        tc = _TestCase(project_id=project_id, title='TC Statuses')
        db.session.add(tc)
        db.session.commit()
        tc_id = tc.id

    for status in ['Passed', 'Failed', 'Blocked', 'Not Run']:
        response = client.post('/api/executions/', json={
            'test_case_id': tc_id,
            'status': status,
        })
        assert response.status_code == 201, f'Status {status} foi rejeitado'
        data = response.get_json()
        assert data['status'] == status


def test_create_execution_invalid_status(client):
    """Teste: status invalido retorna 400."""
    with client.application.app_context():
        project = Project(name='Project for Invalid Status')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

        tc = _TestCase(project_id=project_id, title='TC Invalid Status')
        db.session.add(tc)
        db.session.commit()
        tc_id = tc.id

    response = client.post('/api/executions/', json={
        'test_case_id': tc_id,
        'status': 'InvalidStatus',
    })
    assert response.status_code == 400
    data = response.get_json()
    assert 'error' in data


def test_create_execution_missing_test_case_id(client):
    """Teste: test_case_id ausente retorna 400."""
    response = client.post('/api/executions/', json={'status': 'Passed'})
    assert response.status_code == 400


def test_create_execution_inexistent_test_case(client):
    """Teste: test_case_id referenciando TestCase inexistente retorna 400."""
    response = client.post('/api/executions/', json={
        'test_case_id': 9999,
        'status': 'Passed',
    })
    assert response.status_code == 400


def test_create_execution_invalid_types(client):
    """Teste: tipos invalidos nos campos retornam 400."""
    with client.application.app_context():
        project = Project(name='Project for Invalid Types')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

        tc = _TestCase(project_id=project_id, title='TC Invalid Types')
        db.session.add(tc)
        db.session.commit()
        tc_id = tc.id

    response = client.post('/api/executions/', json={
        'test_case_id': 'not_an_int',
        'status': 'Passed',
    })
    assert response.status_code == 400


def test_create_execution_invalid_status_type(client):
    """Teste: status nao string retorna 400."""
    with client.application.app_context():
        project = Project(name='Project for Status Type')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

        tc = _TestCase(project_id=project_id, title='TC Status Type')
        db.session.add(tc)
        db.session.commit()
        tc_id = tc.id

    response = client.post('/api/executions/', json={
        'test_case_id': tc_id,
        'status': 123,
    })
    assert response.status_code == 400


def test_create_execution_invalid_optional_field_type(client):
    """Teste: tipo invalido em campo opcional retorna 400."""
    with client.application.app_context():
        project = Project(name='Project for Optional Type')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

        tc = _TestCase(project_id=project_id, title='TC Optional Type')
        db.session.add(tc)
        db.session.commit()
        tc_id = tc.id

    response = client.post('/api/executions/', json={
        'test_case_id': tc_id,
        'status': 'Passed',
        'executed_by': 123,
    })
    assert response.status_code == 400


def test_create_execution_unknown_fields(client):
    """Teste: campos desconhecidos retornam 400."""
    with client.application.app_context():
        project = Project(name='Project for Unknown Fields')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

        tc = _TestCase(project_id=project_id, title='TC Unknown')
        db.session.add(tc)
        db.session.commit()
        tc_id = tc.id

    response = client.post('/api/executions/', json={
        'test_case_id': tc_id,
        'status': 'Passed',
        'unknown_field': 'value',
    })
    assert response.status_code == 400


def test_create_execution_invalid_json(client):
    """Teste: JSON malformado retorna 400."""
    response = client.post(
        '/api/executions/',
        data='not valid json',
        content_type='application/json'
    )
    assert response.status_code == 400


def test_create_execution_no_content_type(client):
    """Teste: requisicao sem content-type JSON retorna 400."""
    response = client.post(
        '/api/executions/',
        data='test_case_id=1&status=Passed',
        content_type='application/x-www-form-urlencoded'
    )
    assert response.status_code == 400


def test_list_executions(client):
    """Teste: listar todas as execucoes."""
    with client.application.app_context():
        project = Project(name='Project for List Exec')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

        tc = _TestCase(project_id=project_id, title='TC List')
        db.session.add(tc)
        db.session.commit()
        tc_id = tc.id

        db.session.add(_TestExecution(test_case_id=tc_id, status='Passed'))
        db.session.add(_TestExecution(test_case_id=tc_id, status='Failed'))
        db.session.commit()

    response = client.get('/api/executions/')
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    assert len(data) == 2


def test_list_executions_filter_by_test_case(client):
    """Teste: filtrar execucoes por test_case_id."""
    with client.application.app_context():
        project = Project(name='Project for Filter Exec')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

        tc1 = _TestCase(project_id=project_id, title='TC Filter 1')
        tc2 = _TestCase(project_id=project_id, title='TC Filter 2')
        db.session.add_all([tc1, tc2])
        db.session.commit()
        tc1_id = tc1.id
        tc2_id = tc2.id

        db.session.add(_TestExecution(test_case_id=tc1_id, status='Passed'))
        db.session.add(_TestExecution(test_case_id=tc2_id, status='Failed'))
        db.session.commit()

    response = client.get(f'/api/executions/?test_case_id={tc1_id}')
    assert response.status_code == 200
    data = response.get_json()
    assert len(data) == 1
    assert data[0]['test_case_id'] == tc1_id
    assert data[0]['status'] == 'Passed'


def test_get_execution_by_id(client):
    """Teste: GET /api/executions/<id> com recurso existente."""
    with client.application.app_context():
        project = Project(name='Project for Get Exec')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

        tc = _TestCase(project_id=project_id, title='TC Get')
        db.session.add(tc)
        db.session.commit()
        tc_id = tc.id

        execution = _TestExecution(test_case_id=tc_id, status='Blocked')
        db.session.add(execution)
        db.session.commit()
        execution_id = execution.id

    response = client.get(f'/api/executions/{execution_id}')
    assert response.status_code == 200
    data = response.get_json()
    assert data['id'] == execution_id
    assert data['test_case_id'] == tc_id
    assert data['status'] == 'Blocked'


def test_get_execution_not_found(client):
    """Teste: GET /api/executions/<id> com recurso inexistente."""
    response = client.get('/api/executions/9999')
    assert response.status_code == 404
    data = response.get_json()
    assert 'error' in data


def test_update_execution_complete(client):
    """Teste: atualizacao completa de execucao."""
    with client.application.app_context():
        project = Project(name='Project for Update Exec')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

        tc = _TestCase(project_id=project_id, title='TC Update')
        db.session.add(tc)
        db.session.commit()
        tc_id = tc.id

        execution = _TestExecution(test_case_id=tc_id, status='Not Run')
        db.session.add(execution)
        db.session.commit()
        execution_id = execution.id

    response = client.put(f'/api/executions/{execution_id}', json={
        'status': 'Passed',
        'executed_by': 'tester2',
        'actual_result': 'Updated result',
        'notes': 'Updated notes',
    })
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'Passed'
    assert data['executed_by'] == 'tester2'
    assert data['actual_result'] == 'Updated result'
    assert data['notes'] == 'Updated notes'


def test_update_execution_partial(client):
    """Teste: atualizacao parcial de execucao."""
    with client.application.app_context():
        project = Project(name='Project for Partial Update Exec')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

        tc = _TestCase(project_id=project_id, title='TC Partial')
        db.session.add(tc)
        db.session.commit()
        tc_id = tc.id

        execution = _TestExecution(test_case_id=tc_id, status='Failed')
        db.session.add(execution)
        db.session.commit()
        execution_id = execution.id

    response = client.put(f'/api/executions/{execution_id}', json={
        'status': 'Passed',
    })
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'Passed'
    assert data['executed_by'] is None


def test_update_execution_not_found(client):
    """Teste: PUT /api/executions/<id> com recurso inexistente."""
    response = client.put('/api/executions/9999', json={'status': 'Passed'})
    assert response.status_code == 404


def test_update_execution_unknown_fields(client):
    """Teste: campos desconhecidos em atualizacao retornam 400."""
    with client.application.app_context():
        project = Project(name='Project for Unknown Update')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

        tc = _TestCase(project_id=project_id, title='TC Unknown Update')
        db.session.add(tc)
        db.session.commit()
        tc_id = tc.id

        execution = _TestExecution(test_case_id=tc_id, status='Passed')
        db.session.add(execution)
        db.session.commit()
        execution_id = execution.id

    response = client.put(f'/api/executions/{execution_id}', json={
        'status': 'Failed',
        'unknown_field': 'value',
    })
    assert response.status_code == 400


def test_delete_execution(client):
    """Teste: DELETE /api/executions/<id> com recurso existente."""
    with client.application.app_context():
        project = Project(name='Project for Delete Exec')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

        tc = _TestCase(project_id=project_id, title='TC Delete')
        db.session.add(tc)
        db.session.commit()
        tc_id = tc.id

        execution = _TestExecution(test_case_id=tc_id, status='Passed')
        db.session.add(execution)
        db.session.commit()
        execution_id = execution.id

    response = client.delete(f'/api/executions/{execution_id}')
    assert response.status_code == 204
    assert response.data == b''

    response = client.get(f'/api/executions/{execution_id}')
    assert response.status_code == 404


def test_delete_execution_not_found(client):
    """Teste: DELETE /api/executions/<id> com recurso inexistente."""
    response = client.delete('/api/executions/9999')
    assert response.status_code == 404
    data = response.get_json()
    assert 'error' in data


def test_execution_serialized_executed_at(client):
    """Teste: executed_at esta presente e serializado em ISO 8601."""
    with client.application.app_context():
        project = Project(name='Project for Serialized')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

        tc = _TestCase(project_id=project_id, title='TC Serialized')
        db.session.add(tc)
        db.session.commit()
        tc_id = tc.id

        execution = _TestExecution(test_case_id=tc_id, status='Passed')
        db.session.add(execution)
        db.session.commit()
        execution_id = execution.id

    response = client.get(f'/api/executions/{execution_id}')
    assert response.status_code == 200
    data = response.get_json()
    assert 'executed_at' in data
    assert data['executed_at'] is not None
    assert 'T' in data['executed_at']


def test_execution_persist_actual_result_and_notes(client):
    """Teste: actual_result e notes sao persistidos corretamente."""
    with client.application.app_context():
        project = Project(name='Project for Persist')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

        tc = _TestCase(project_id=project_id, title='TC Persist')
        db.session.add(tc)
        db.session.commit()
        tc_id = tc.id

        execution = _TestExecution(
            test_case_id=tc_id,
            status='Failed',
            actual_result='Error on line 42',
            notes='Needs investigation',
        )
        db.session.add(execution)
        db.session.commit()
        execution_id = execution.id

    response = client.get(f'/api/executions/{execution_id}')
    assert response.status_code == 200
    data = response.get_json()
    assert data['actual_result'] == 'Error on line 42'
    assert data['notes'] == 'Needs investigation'
