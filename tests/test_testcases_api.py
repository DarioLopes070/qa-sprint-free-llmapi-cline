from datetime import datetime

import pytest
from app.models import Project
from app.models import TestCase as _TestCase
from app.models import TestExecution as _TestExecution
from app.extensions import db


def test_create_test_case_valid(client):
    """Teste: criar caso de teste valido."""
    with client.application.app_context():
        project = Project(name='Project for TC')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

    response = client.post('/api/testcases/', json={
        'project_id': project_id,
        'title': 'Login Test',
        'description': 'Test login functionality',
        'steps': '1. Open app\\n2. Enter credentials\\n3. Click submit',
        'expected_result': 'User is logged in',
        'priority': 'High',
    })
    assert response.status_code == 201
    data = response.get_json()
    assert data['title'] == 'Login Test'
    assert data['project_id'] == project_id
    assert data['priority'] == 'High'
    assert 'id' in data
    assert 'created_at' in data


def test_create_test_case_default_priority(client):
    """Teste: prioridade padrao eh Medium quando nao informada."""
    with client.application.app_context():
        project = Project(name='Project for Default Priority')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

    response = client.post('/api/testcases/', json={
        'project_id': project_id,
        'title': 'TC Default Priority',
    })
    assert response.status_code == 201
    data = response.get_json()
    assert data['priority'] == 'Medium'


def test_list_test_cases(client):
    """Teste: listar todos os casos de teste."""
    with client.application.app_context():
        project = Project(name='Project for List TC')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

        db.session.add(_TestCase(project_id=project_id, title='TC 1'))
        db.session.add(_TestCase(project_id=project_id, title='TC 2'))
        db.session.commit()

    response = client.get('/api/testcases/')
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    assert len(data) == 2


def test_list_test_cases_filter_by_project(client):
    """Teste: filtrar casos de teste por project_id."""
    with client.application.app_context():
        project1 = Project(name='Project Filter 1')
        project2 = Project(name='Project Filter 2')
        db.session.add_all([project1, project2])
        db.session.commit()
        pid1 = project1.id
        pid2 = project2.id

        db.session.add(_TestCase(project_id=pid1, title='TC Project 1'))
        db.session.add(_TestCase(project_id=pid2, title='TC Project 2'))
        db.session.commit()

    response = client.get(f'/api/testcases/?project_id={pid1}')
    assert response.status_code == 200
    data = response.get_json()
    assert len(data) == 1
    assert data[0]['title'] == 'TC Project 1'
    assert data[0]['project_id'] == pid1


def test_get_test_case_by_id(client):
    """Teste: GET /api/testcases/<id> com recurso existente."""
    with client.application.app_context():
        project = Project(name='Project for Get TC')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

        tc = _TestCase(project_id=project_id, title='Get TC')
        db.session.add(tc)
        db.session.commit()
        tc_id = tc.id

    response = client.get(f'/api/testcases/{tc_id}')
    assert response.status_code == 200
    data = response.get_json()
    assert data['id'] == tc_id
    assert data['title'] == 'Get TC'
    assert data['project_id'] == project_id


def test_get_test_case_not_found(client):
    """Teste: GET /api/testcases/<id> com recurso inexistente."""
    response = client.get('/api/testcases/9999')
    assert response.status_code == 404
    data = response.get_json()
    assert 'error' in data


def test_update_test_case_complete(client):
    """Teste: atualizacao completa de caso de teste."""
    with client.application.app_context():
        project = Project(name='Project for Update TC')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

        tc = _TestCase(project_id=project_id, title='Original')
        db.session.add(tc)
        db.session.commit()
        tc_id = tc.id

    response = client.put(f'/api/testcases/{tc_id}', json={
        'project_id': project_id,
        'title': 'Updated Title',
        'description': 'Updated desc',
        'steps': 'Updated steps',
        'expected_result': 'Updated result',
        'priority': 'Low',
    })
    assert response.status_code == 200
    data = response.get_json()
    assert data['title'] == 'Updated Title'
    assert data['description'] == 'Updated desc'
    assert data['steps'] == 'Updated steps'
    assert data['expected_result'] == 'Updated result'
    assert data['priority'] == 'Low'


def test_update_test_case_partial(client):
    """Teste: atualizacao parcial de caso de teste."""
    with client.application.app_context():
        project = Project(name='Project for Partial Update')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

        tc = _TestCase(project_id=project_id, title='Original',
                      priority='High')
        db.session.add(tc)
        db.session.commit()
        tc_id = tc.id

    response = client.put(f'/api/testcases/{tc_id}', json={
        'title': 'Partial Updated',
    })
    assert response.status_code == 200
    data = response.get_json()
    assert data['title'] == 'Partial Updated'
    assert data['priority'] == 'High'


def test_update_test_case_not_found(client):
    """Teste: PUT /api/testcases/<id> com recurso inexistente."""
    response = client.put('/api/testcases/9999', json={'title': 'Test'})
    assert response.status_code == 404


def test_create_test_case_missing_project_id(client):
    """Teste: project_id obrigatorio retorna 400."""
    response = client.post('/api/testcases/', json={'title': 'No Project'})
    assert response.status_code == 400


def test_create_test_case_inexistent_project(client):
    """Teste: project_id referenciando projeto inexistente retorna 400."""
    response = client.post('/api/testcases/', json={
        'project_id': 9999,
        'title': 'TC with bad project',
    })
    assert response.status_code == 400


def test_create_test_case_missing_title(client):
    """Teste: titulo ausente retorna 400."""
    with client.application.app_context():
        project = Project(name='Project for Missing Title')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

    response = client.post('/api/testcases/', json={
        'project_id': project_id,
    })
    assert response.status_code == 400


def test_create_test_case_empty_title(client):
    """Teste: titulo vazio ou apenas espacos retorna 400."""
    with client.application.app_context():
        project = Project(name='Project for Empty Title')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

    response = client.post('/api/testcases/', json={
        'project_id': project_id,
        'title': '   ',
    })
    assert response.status_code == 400


def test_create_test_case_title_too_long(client):
    """Teste: titulo maior que 255 caracteres retorna 400."""
    with client.application.app_context():
        project = Project(name='Project for Long Title')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

    response = client.post('/api/testcases/', json={
        'project_id': project_id,
        'title': 'A' * 256,
    })
    assert response.status_code == 400


def test_create_test_case_invalid_priority(client):
    """Teste: prioridade invalida retorna 400."""
    with client.application.app_context():
        project = Project(name='Project for Invalid Priority')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

    response = client.post('/api/testcases/', json={
        'project_id': project_id,
        'title': 'TC Invalid Priority',
        'priority': 'Urgent',
    })
    assert response.status_code == 400


def test_create_test_case_invalid_types(client):
    """Teste: tipos invalidos nos campos retornam 400."""
    with client.application.app_context():
        project = Project(name='Project for Invalid Types')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

    response = client.post('/api/testcases/', json={
        'project_id': 'not_an_int',
        'title': 'TC Invalid Types',
    })
    assert response.status_code == 400


def test_create_test_case_unknown_fields(client):
    """Teste: campos desconhecidos retornam 400."""
    with client.application.app_context():
        project = Project(name='Project for Unknown Fields')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

    response = client.post('/api/testcases/', json={
        'project_id': project_id,
        'title': 'TC Unknown Fields',
        'unknown_field': 'value',
    })
    assert response.status_code == 400


def test_create_test_case_invalid_json(client):
    """Teste: JSON malformado retorna 400."""
    response = client.post(
        '/api/testcases/',
        data='not valid json',
        content_type='application/json'
    )
    assert response.status_code == 400


def test_create_test_case_no_content_type(client):
    """Teste: requisicao sem content-type JSON retorna 400."""
    response = client.post(
        '/api/testcases/',
        data='title=Test',
        content_type='application/x-www-form-urlencoded'
    )
    assert response.status_code == 400


def test_delete_test_case_with_related_records(client):
    """Teste: exclusao de caso de teste com registros relacionados (cascade)."""
    with client.application.app_context():
        project = Project(name='Project for Cascade Delete')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

        tc = _TestCase(project_id=project_id, title='TC for Cascade')
        db.session.add(tc)
        db.session.commit()
        tc_id = tc.id

    response = client.delete(f'/api/testcases/{tc_id}')
    assert response.status_code == 204

    with client.application.app_context():
        assert db.session.get(_TestCase, tc_id) is None


def test_delete_test_case_not_found(client):
    """Teste: DELETE /api/testcases/<id> com recurso inexistente."""
    response = client.delete('/api/testcases/9999')
    assert response.status_code == 404
    data = response.get_json()
    assert 'error' in data


def _make_case_with_executions(client, executions):
    """Cria projeto, caso e execuções (com executed_at controlado) via modelo."""
    with client.application.app_context():
        project = Project(name='Project for Last Result')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

        tc = _TestCase(project_id=project_id, title='TC Last Result')
        db.session.add(tc)
        db.session.commit()
        tc_id = tc.id

        for status, executed_at in executions:
            db.session.add(
                _TestExecution(
                    test_case_id=tc_id,
                    status=status,
                    executed_at=executed_at,
                )
            )
        db.session.commit()
    return tc_id


def test_last_result_different_dates_date_wins_over_id(client):
    """Teste: maior ID com data mais antiga nao vence a data mais recente."""
    tc_id = _make_case_with_executions(
        client,
        [
            ('Passed', datetime(2026, 3, 1, 10, 0, 0)),   # id 1, data mais recente
            ('Failed', datetime(2026, 1, 1, 10, 0, 0)),   # id 2, data mais antiga
        ],
    )

    response = client.get('/api/testcases/')
    assert response.status_code == 200
    data = response.get_json()
    case = next((c for c in data if c['id'] == tc_id), None)
    assert case is not None
    assert case['last_execution'] is not None
    assert case['last_execution']['status'] == 'Passed'


def test_last_result_date_tie_higher_id_wins(client):
    """Teste: em empate de data/hora, vence o maior ID."""
    executed_at = datetime(2026, 2, 15, 12, 0, 0)
    tc_id = _make_case_with_executions(
        client,
        [
            ('Passed', executed_at),   # id 1
            ('Failed', executed_at),   # id 2 (vence pelo ID)
        ],
    )

    response = client.get('/api/testcases/')
    assert response.status_code == 200
    data = response.get_json()
    case = next((c for c in data if c['id'] == tc_id), None)
    assert case is not None
    assert case['last_execution'] is not None
    assert case['last_execution']['status'] == 'Failed'


def test_last_result_case_without_history(client):
    """Teste: caso sem execucao retorna last_execution nulo sem criar registros."""
    with client.application.app_context():
        project = Project(name='Project for No History')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

        tc = _TestCase(project_id=project_id, title='TC No History')
        db.session.add(tc)
        db.session.commit()
        tc_id = tc.id

    response = client.get('/api/testcases/')
    assert response.status_code == 200
    data = response.get_json()
    case = next((c for c in data if c['id'] == tc_id), None)
    assert case is not None
    assert case['last_execution'] is None

    # Nenhuma execucao foi criada para o caso
    response = client.get(f'/api/executions/?test_case_id={tc_id}')
    assert response.status_code == 200
    assert response.get_json() == []


def test_last_result_legacy_not_run_coexistence(client):
    """Teste: 'Not Run' legado mais recente nao esconde resultado valido anterior.

    O caso deve exibir o resultado valido anterior; o registro legado e
    preservado no historico com seu rotulo.
    """
    tc_id = _make_case_with_executions(
        client,
        [
            ('Passed', datetime(2026, 1, 1, 10, 0, 0)),   # id 1, valido, anterior
            ('Not Run', datetime(2026, 3, 1, 10, 0, 0)),  # id 2, legado, mais recente
        ],
    )

    response = client.get('/api/testcases/')
    assert response.status_code == 200
    data = response.get_json()
    case = next((c for c in data if c['id'] == tc_id), None)
    assert case is not None
    assert case['last_execution'] is not None
    assert case['last_execution']['status'] == 'Passed'

    # O registro legado continua visível no histórico
    response = client.get(f'/api/executions/?test_case_id={tc_id}')
    assert response.status_code == 200
    statuses = [e['status'] for e in response.get_json()]
    assert 'Not Run' in statuses
    assert 'Passed' in statuses

