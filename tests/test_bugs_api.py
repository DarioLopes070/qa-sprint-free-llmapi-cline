import pytest
from app.models import Project
from app.models import TestCase as _TestCase
from app.models import Bug as _Bug


def test_create_bug_valid(client):
    """Teste: criar bug valido com todos os campos."""
    with client.application.app_context():
        from app.extensions import db
        project = Project(name='Project for Bug')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

        tc = _TestCase(project_id=project_id, title='TC for Bug')
        db.session.add(tc)
        db.session.commit()
        tc_id = tc.id

    response = client.post('/api/bugs/', json={
        'project_id': project_id,
        'test_case_id': tc_id,
        'title': 'Bug title',
        'description': 'Bug description',
        'severity': 'High',
        'status': 'Open',
    })
    assert response.status_code == 201
    data = response.get_json()
    assert data['project_id'] == project_id
    assert data['test_case_id'] == tc_id
    assert data['title'] == 'Bug title'
    assert data['description'] == 'Bug description'
    assert data['severity'] == 'High'
    assert data['status'] == 'Open'
    assert 'id' in data
    assert 'created_at' in data


def test_create_bug_minimal_fields(client):
    """Teste: criar bug apenas com campos obrigatorios."""
    with client.application.app_context():
        from app.extensions import db
        project = Project(name='Project for Minimal Bug')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

    response = client.post('/api/bugs/', json={
        'project_id': project_id,
        'title': 'Minimal bug',
    })
    assert response.status_code == 201
    data = response.get_json()
    assert data['title'] == 'Minimal bug'
    assert data['severity'] == 'Medium'
    assert data['status'] == 'Open'
    assert data['test_case_id'] is None
    assert data['description'] is None
    assert data['resolved_at'] is None


def test_create_bug_all_valid_severities(client):
    """Teste: todos os valors de severity validos sao aceitos."""
    with client.application.app_context():
        from app.extensions import db
        project = Project(name='Project for Severities')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

    for severity in ['Low', 'Medium', 'High', 'Critical']:
        response = client.post('/api/bugs/', json={
            'project_id': project_id,
            'title': f'Bug {severity}',
            'severity': severity,
        })
        assert response.status_code == 201, f'Severity {severity} foi rejeitada'
        data = response.get_json()
        assert data['severity'] == severity


def test_create_bug_all_valid_statuses(client):
    """Teste: todos os valores de status validos sao aceitos."""
    with client.application.app_context():
        from app.extensions import db
        project = Project(name='Project for Statuses')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

    for status in ['Open', 'In Progress', 'Resolved', 'Closed']:
        response = client.post('/api/bugs/', json={
            'project_id': project_id,
            'title': f'Bug {status}',
            'status': status,
        })
        assert response.status_code == 201, f'Status {status} foi rejeitado'
        data = response.get_json()
        assert data['status'] == status


def test_create_bug_invalid_severity(client):
    """Teste: severity invalido retorna 400."""
    with client.application.app_context():
        from app.extensions import db
        project = Project(name='Project for Invalid Severity')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

    response = client.post('/api/bugs/', json={
        'project_id': project_id,
        'title': 'Bug',
        'severity': 'InvalidSeverity',
    })
    assert response.status_code == 400
    data = response.get_json()
    assert 'error' in data


def test_create_bug_invalid_status(client):
    """Teste: status invalido retorna 400."""
    with client.application.app_context():
        from app.extensions import db
        project = Project(name='Project for Invalid Status')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

    response = client.post('/api/bugs/', json={
        'project_id': project_id,
        'title': 'Bug',
        'status': 'InvalidStatus',
    })
    assert response.status_code == 400
    data = response.get_json()
    assert 'error' in data


def test_create_bug_missing_project_id(client):
    """Teste: project_id ausente retorna 400."""
    response = client.post('/api/bugs/', json={'title': 'Bug'})
    assert response.status_code == 400


def test_create_bug_inexistent_project(client):
    """Teste: project_id referenciando Project inexistente retorna 400."""
    response = client.post('/api/bugs/', json={
        'project_id': 9999,
        'title': 'Bug',
    })
    assert response.status_code == 400


def test_create_bug_invalid_project_id_type(client):
    """Teste: project_id nao inteiro retorna 400."""
    response = client.post('/api/bugs/', json={
        'project_id': 'not_an_int',
        'title': 'Bug',
    })
    assert response.status_code == 400


def test_create_bug_missing_title(client):
    """Teste: title ausente retorna 400."""
    with client.application.app_context():
        from app.extensions import db
        project = Project(name='Project for Missing Title')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

    response = client.post('/api/bugs/', json={
        'project_id': project_id,
    })
    assert response.status_code == 400


def test_create_bug_empty_title(client):
    """Teste: title vazio retorna 400."""
    with client.application.app_context():
        from app.extensions import db
        project = Project(name='Project for Empty Title')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

    response = client.post('/api/bugs/', json={
        'project_id': project_id,
        'title': '   ',
    })
    assert response.status_code == 400


def test_create_bug_title_too_long(client):
    """Teste: title com mais de 255 caracteres retorna 400."""
    with client.application.app_context():
        from app.extensions import db
        project = Project(name='Project for Long Title')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

    response = client.post('/api/bugs/', json={
        'project_id': project_id,
        'title': 'A' * 256,
    })
    assert response.status_code == 400


def test_create_bug_invalid_types(client):
    """Teste: tipos invalidos nos campos retornam 400."""
    with client.application.app_context():
        from app.extensions import db
        project = Project(name='Project for Invalid Types')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

    response = client.post('/api/bugs/', json={
        'project_id': project_id,
        'title': 'Bug',
        'severity': 123,
    })
    assert response.status_code == 400


def test_create_bug_invalid_status_type(client):
    """Teste: status nao string retorna 400."""
    with client.application.app_context():
        from app.extensions import db
        project = Project(name='Project for Status Type')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

    response = client.post('/api/bugs/', json={
        'project_id': project_id,
        'title': 'Bug',
        'status': 123,
    })
    assert response.status_code == 400


def test_create_bug_unknown_fields(client):
    """Teste: campos desconhecidos retornam 400."""
    with client.application.app_context():
        from app.extensions import db
        project = Project(name='Project for Unknown Fields')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

    response = client.post('/api/bugs/', json={
        'project_id': project_id,
        'title': 'Bug',
        'unknown_field': 'value',
    })
    assert response.status_code == 400


def test_create_bug_invalid_json(client):
    """Teste: JSON malformado retorna 400."""
    response = client.post(
        '/api/bugs/',
        data='not valid json',
        content_type='application/json'
    )
    assert response.status_code == 400


def test_create_bug_no_content_type(client):
    """Teste: requisicao sem content-type JSON retorna 400."""
    response = client.post(
        '/api/bugs/',
        data='project_id=1&title=Bug',
        content_type='application/x-www-form-urlencoded'
    )
    assert response.status_code == 400


def test_create_bug_test_case_from_other_project(client):
    """Teste: TestCase de outro projeto nao pode ser associado."""
    with client.application.app_context():
        from app.extensions import db
        project1 = Project(name='Project 1')
        project2 = Project(name='Project 2')
        db.session.add_all([project1, project2])
        db.session.commit()
        p1_id = project1.id
        p2_id = project2.id

        tc = _TestCase(project_id=p2_id, title='TC in Project 2')
        db.session.add(tc)
        db.session.commit()
        tc_id = tc.id

    response = client.post('/api/bugs/', json={
        'project_id': p1_id,
        'title': 'Bug',
        'test_case_id': tc_id,
    })
    assert response.status_code == 400
    data = response.get_json()
    assert 'error' in data


def test_list_bugs(client):
    """Teste: listar todos os bugs."""
    with client.application.app_context():
        from app.extensions import db
        project = Project(name='Project for List Bugs')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

        db.session.add(_Bug(project_id=project_id, title='Bug 1'))
        db.session.add(_Bug(project_id=project_id, title='Bug 2'))
        db.session.commit()

    response = client.get('/api/bugs/')
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    assert len(data) == 2


def test_list_bugs_filter_by_project(client):
    """Teste: filtrar bugs por project_id."""
    with client.application.app_context():
        from app.extensions import db
        project1 = Project(name='Project Filter 1')
        project2 = Project(name='Project Filter 2')
        db.session.add_all([project1, project2])
        db.session.commit()
        p1_id = project1.id
        p2_id = project2.id

        db.session.add(_Bug(project_id=p1_id, title='Bug P1'))
        db.session.add(_Bug(project_id=p2_id, title='Bug P2'))
        db.session.commit()

    response = client.get(f'/api/bugs/?project_id={p1_id}')
    assert response.status_code == 200
    data = response.get_json()
    assert len(data) == 1
    assert data[0]['project_id'] == p1_id
    assert data[0]['title'] == 'Bug P1'


def test_list_bugs_filter_by_severity(client):
    """Teste: filtrar bugs por severity."""
    with client.application.app_context():
        from app.extensions import db
        project = Project(name='Project Filter Severity')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

        db.session.add(_Bug(project_id=project_id, title='Bug Low', severity='Low'))
        db.session.add(_Bug(project_id=project_id, title='Bug High', severity='High'))
        db.session.commit()

    response = client.get('/api/bugs/?severity=High')
    assert response.status_code == 200
    data = response.get_json()
    assert len(data) == 1
    assert data[0]['severity'] == 'High'


def test_list_bugs_filter_by_status(client):
    """Teste: filtrar bugs por status."""
    with client.application.app_context():
        from app.extensions import db
        project = Project(name='Project Filter Status')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

        db.session.add(_Bug(project_id=project_id, title='Bug Open', status='Open'))
        db.session.add(_Bug(project_id=project_id, title='Bug Closed', status='Closed'))
        db.session.commit()

    response = client.get('/api/bugs/?status=Closed')
    assert response.status_code == 200
    data = response.get_json()
    assert len(data) == 1
    assert data[0]['status'] == 'Closed'


def test_get_bug_by_id(client):
    """Teste: GET /api/bugs/<id> com recurso existente."""
    with client.application.app_context():
        from app.extensions import db
        project = Project(name='Project for Get Bug')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

        bug = _Bug(project_id=project_id, title='Get Bug', severity='Critical')
        db.session.add(bug)
        db.session.commit()
        bug_id = bug.id

    response = client.get(f'/api/bugs/{bug_id}')
    assert response.status_code == 200
    data = response.get_json()
    assert data['id'] == bug_id
    assert data['project_id'] == project_id
    assert data['title'] == 'Get Bug'
    assert data['severity'] == 'Critical'


def test_get_bug_not_found(client):
    """Teste: GET /api/bugs/<id> com recurso inexistente."""
    response = client.get('/api/bugs/9999')
    assert response.status_code == 404
    data = response.get_json()
    assert 'error' in data


def test_update_bug_partial(client):
    """Teste: atualizacao parcial de bug."""
    with client.application.app_context():
        from app.extensions import db
        project = Project(name='Project for Partial Update Bug')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

        bug = _Bug(project_id=project_id, title='Partial Bug', status='Open')
        db.session.add(bug)
        db.session.commit()
        bug_id = bug.id

    response = client.put(f'/api/bugs/{bug_id}', json={
        'status': 'Resolved',
    })
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'Resolved'
    assert data['title'] == 'Partial Bug'


def test_update_bug_complete(client):
    """Teste: atualizacao completa de bug."""
    with client.application.app_context():
        from app.extensions import db
        project = Project(name='Project for Complete Update Bug')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

        tc = _TestCase(project_id=project_id, title='TC for Update')
        db.session.add(tc)
        db.session.commit()
        tc_id = tc.id

        bug = _Bug(project_id=project_id, title='Complete Bug', status='Open')
        db.session.add(bug)
        db.session.commit()
        bug_id = bug.id

    response = client.put(f'/api/bugs/{bug_id}', json={
        'test_case_id': tc_id,
        'title': 'Updated Bug',
        'description': 'Updated description',
        'severity': 'Critical',
        'status': 'Closed',
    })
    assert response.status_code == 200
    data = response.get_json()
    assert data['title'] == 'Updated Bug'
    assert data['description'] == 'Updated description'
    assert data['severity'] == 'Critical'
    assert data['status'] == 'Closed'
    assert data['test_case_id'] == tc_id


def test_update_bug_not_found(client):
    """Teste: PUT /api/bugs/<id> com recurso inexistente."""
    response = client.put('/api/bugs/9999', json={'status': 'Resolved'})
    assert response.status_code == 404


def test_update_bug_unknown_fields(client):
    """Teste: campos desconhecidos em atualizacao retornam 400."""
    with client.application.app_context():
        from app.extensions import db
        project = Project(name='Project for Unknown Update Bug')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

        bug = _Bug(project_id=project_id, title='Bug Unknown Update')
        db.session.add(bug)
        db.session.commit()
        bug_id = bug.id

    response = client.put(f'/api/bugs/{bug_id}', json={
        'status': 'Resolved',
        'unknown_field': 'value',
    })
    assert response.status_code == 400


def test_update_bug_invalid_status(client):
    """Teste: atualizacao com status invalido retorna 400."""
    with client.application.app_context():
        from app.extensions import db
        project = Project(name='Project for Invalid Update Status')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

        bug = _Bug(project_id=project_id, title='Bug Invalid Update')
        db.session.add(bug)
        db.session.commit()
        bug_id = bug.id

    response = client.put(f'/api/bugs/{bug_id}', json={'status': 'InvalidStatus'})
    assert response.status_code == 400


def test_update_bug_resolved_at_set(client):
    """Teste: resolved_at eh definido quando status muda para Resolved."""
    with client.application.app_context():
        from app.extensions import db
        project = Project(name='Project for Resolved At')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

        bug = _Bug(project_id=project_id, title='Resolved At Bug', status='Open')
        db.session.add(bug)
        db.session.commit()
        bug_id = bug.id

    response = client.put(f'/api/bugs/{bug_id}', json={'status': 'Resolved'})
    assert response.status_code == 200
    data = response.get_json()
    assert data['resolved_at'] is not None
    assert 'T' in data['resolved_at']


def test_update_bug_resolved_at_not_overwritten(client):
    """Teste: resolved_at valido nao eh sobrescrito indevidamente."""
    from datetime import datetime, timezone, timedelta
    with client.application.app_context():
        from app.extensions import db
        project = Project(name='Project for Resolved At Keep')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

        past = datetime.now(timezone.utc) - timedelta(days=5)
        bug = _Bug(
            project_id=project_id,
            title='Keep Resolved At',
            status='Resolved',
            resolved_at=past,
        )
        db.session.add(bug)
        db.session.commit()
        bug_id = bug.id

    # Muda para Closed (tambem resolved) - resolved_at deve ser mantido
    response = client.put(f'/api/bugs/{bug_id}', json={'status': 'Closed'})
    assert response.status_code == 200
    data = response.get_json()
    assert data['resolved_at'] is not None
    # Deve ser a mesma data original (nao sobrescrito)
    with client.application.app_context():
        from app.extensions import db
        saved_bug = db.session.get(_Bug, bug_id)
        assert saved_bug.resolved_at is not None
        # Compara apenas a parte de data/hora (sem sufixo de fuso horario)
        assert saved_bug.resolved_at.replace(tzinfo=None) == past.replace(tzinfo=None)


def test_delete_bug(client):
    """Teste: DELETE /api/bugs/<id> com recurso existente."""
    with client.application.app_context():
        from app.extensions import db
        project = Project(name='Project for Delete Bug')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

        bug = _Bug(project_id=project_id, title='Delete Bug')
        db.session.add(bug)
        db.session.commit()
        bug_id = bug.id

    response = client.delete(f'/api/bugs/{bug_id}')
    assert response.status_code == 204
    assert response.data == b''

    response = client.get(f'/api/bugs/{bug_id}')
    assert response.status_code == 404


def test_delete_bug_not_found(client):
    """Teste: DELETE /api/bugs/<id> com recurso inexistente."""
    response = client.delete('/api/bugs/9999')
    assert response.status_code == 404
    data = response.get_json()
    assert 'error' in data


def test_bug_serialized_dates(client):
    """Teste: created_at e resolved_at serializados em ISO 8601."""
    from datetime import datetime, timezone
    with client.application.app_context():
        from app.extensions import db
        project = Project(name='Project for Serialized Dates')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

        bug = _Bug(project_id=project_id, title='Serialized Dates Bug')
        db.session.add(bug)
        db.session.commit()
        bug_id = bug.id

    response = client.get(f'/api/bugs/{bug_id}')
    assert response.status_code == 200
    data = response.get_json()
    assert 'created_at' in data
    assert data['created_at'] is not None
    assert 'T' in data['created_at']
    assert 'resolved_at' in data


def test_bug_persist_description_and_severity(client):
    """Teste: description e severity sao persistidos corretamente."""
    with client.application.app_context():
        from app.extensions import db
        project = Project(name='Project for Persist')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

        bug = _Bug(
            project_id=project_id,
            title='Persist Bug',
            description='Detailed description',
            severity='Critical',
        )
        db.session.add(bug)
        db.session.commit()
        bug_id = bug.id

    response = client.get(f'/api/bugs/{bug_id}')
    assert response.status_code == 200
    data = response.get_json()
    assert data['description'] == 'Detailed description'
    assert data['severity'] == 'Critical'
