import json
import pytest
from app.models import Project
from app.models import TestCase as _TestCase
from app.models import Bug as _Bug
from app.extensions import db


def test_create_project(client):
    """Teste: criar um projeto via POST."""
    response = client.post('/api/projects/', json={
        'name': 'Test Project',
        'description': 'A test project'
    })
    assert response.status_code == 201
    data = response.get_json()
    assert data['name'] == 'Test Project'
    assert data['description'] == 'A test project'
    assert 'id' in data
    assert 'created_at' in data


def test_list_projects(client):
    """Teste: listar todos os projetos via GET."""
    with client.application.app_context():
        db.session.add(Project(name='Project 1'))
        db.session.add(Project(name='Project 2'))
        db.session.commit()

    response = client.get('/api/projects/')
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    assert len(data) == 2


def test_get_project_by_id(client):
    """Teste: consultar um projeto por ID."""
    with client.application.app_context():
        project = Project(name='Test Project', description='Desc')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

    response = client.get(f'/api/projects/{project_id}')
    assert response.status_code == 200
    data = response.get_json()
    assert data['id'] == project_id
    assert data['name'] == 'Test Project'
    assert data['description'] == 'Desc'


def test_get_project_not_found(client):
    """Teste: consultar projeto inexistente retorna 404."""
    response = client.get('/api/projects/9999')
    assert response.status_code == 404
    data = response.get_json()
    assert 'error' in data


def test_create_project_missing_name(client):
    """Teste: nome obrigatório ausente retorna 400."""
    response = client.post('/api/projects/', json={'description': 'No name'})
    assert response.status_code == 400
    data = response.get_json()
    assert 'error' in data


def test_create_project_empty_name(client):
    """Teste: nome vazio ou apenas espaços retorna 400."""
    response = client.post('/api/projects/', json={'name': '   '})
    assert response.status_code == 400


def test_create_project_name_too_long(client):
    """Teste: nome maior que 255 caracteres retorna 400."""
    response = client.post('/api/projects/', json={'name': 'A' * 256})
    assert response.status_code == 400


def test_create_project_name_exactly_255(client):
    """Teste: nome com exatamente 255 caracteres é aceito."""
    response = client.post('/api/projects/', json={'name': 'A' * 255})
    assert response.status_code == 201


def test_create_project_invalid_json(client):
    """Teste: JSON inválido retorna 400."""
    response = client.post(
        '/api/projects/',
        data='not valid json',
        content_type='application/json'
    )
    assert response.status_code == 400


def test_create_project_no_content_type(client):
    """Teste: requisição sem content-type JSON retorna 400."""
    response = client.post(
        '/api/projects/',
        data='name=Test',
        content_type='application/x-www-form-urlencoded'
    )
    assert response.status_code == 400


def test_response_format(client):
    """Teste: formato da resposta contém todos os campos esperados."""
    response = client.post('/api/projects/', json={'name': 'Format Test'})
    assert response.status_code == 201
    data = response.get_json()
    assert 'id' in data
    assert 'name' in data
    assert 'description' in data
    assert 'created_at' in data
    assert data['name'] == 'Format Test'
    assert data['description'] is None


def test_delete_project_with_related_records(client):
    """Teste: exclusão de projeto com registros relacionados (cascade)."""
    with client.application.app_context():
        project = Project(name='Project with relations')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

        test_case = _TestCase(project_id=project_id, title='TC 1')
        db.session.add(test_case)
        db.session.commit()

        bug = _Bug(project_id=project_id, title='Bug 1', test_case_id=test_case.id)
        db.session.add(bug)
        db.session.commit()

    response = client.delete(f'/api/projects/{project_id}')
    assert response.status_code == 204

    with client.application.app_context():
        assert db.session.get(Project, project_id) is None
        assert _TestCase.query.filter_by(project_id=project_id).count() == 0
        assert _Bug.query.filter_by(project_id=project_id).count() == 0


def test_update_project(client):
    """Teste: atualizar um projeto via PUT."""
    with client.application.app_context():
        project = Project(name='Original Name', description='Original desc')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

    response = client.put(f'/api/projects/{project_id}', json={
        'name': 'Updated Name',
        'description': 'Updated desc'
    })
    assert response.status_code == 200
    data = response.get_json()
    assert data['name'] == 'Updated Name'
    assert data['description'] == 'Updated desc'


def test_update_project_partial(client):
    """Teste: atualização parcial de um projeto (apenas name)."""
    with client.application.app_context():
        project = Project(name='Original', description='Original desc')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

    response = client.put(f'/api/projects/{project_id}', json={'name': 'New Name'})
    assert response.status_code == 200
    data = response.get_json()
    assert data['name'] == 'New Name'
    assert data['description'] == 'Original desc'


def test_update_project_not_found(client):
    """Teste: atualizar projeto inexistente retorna 404."""
    response = client.put('/api/projects/9999', json={'name': 'Test'})
    assert response.status_code == 404


def test_delete_project(client):
    """Teste: excluir um projeto via DELETE."""
    with client.application.app_context():
        project = Project(name='To Delete')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

    response = client.delete(f'/api/projects/{project_id}')
    assert response.status_code == 204
    assert response.data == b''

    response = client.get(f'/api/projects/{project_id}')
    assert response.status_code == 404


def test_delete_project_not_found(client):
    """Teste: excluir projeto inexistente retorna 404."""
    response = client.delete('/api/projects/9999')
    assert response.status_code == 404