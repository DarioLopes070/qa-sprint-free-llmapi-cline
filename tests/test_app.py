from app import create_app
import pytest

def test_app_initialization(client):
    # The default route should return 404 before any blueprints define it
    response = client.get('/')
    assert response.status_code == 404


def test_testing_config_has_secret_key(monkeypatch):
    """TestingConfig deve ter SECRET_KEY definida mesmo sem variavel de ambiente."""
    monkeypatch.delenv('SECRET_KEY', raising=False)
    app = create_app('Testing')
    assert app.config.get('SECRET_KEY') == 'test-secret-key'


def test_development_config_requires_secret_key(monkeypatch):
    """Desenvolvimento sem SECRET_KEY deve gerar erro claro."""
    monkeypatch.delenv('SECRET_KEY', raising=False)
    with pytest.raises(RuntimeError, match="SECRET_KEY"):
        create_app('Development')


def test_development_config_with_secret_key(monkeypatch):
    """Desenvolvimento com SECRET_KEY definida deve funcionar normalmente."""
    monkeypatch.setenv('SECRET_KEY', 'dev-key-123')
    app = create_app('Development')
    assert app.config.get('SECRET_KEY') == 'dev-key-123'


def test_bug_created_at_serialized_with_utc(client):
    """created_at deve ser serializado com +00:00 apos persistencia."""
    with client.application.app_context():
        from app.extensions import db
        from app.models import Project, Bug
        project = Project(name='UTC Project')
        db.session.add(project)
        db.session.commit()
        bug = Bug(project_id=project.id, title='UTC Bug', status='Open')
        db.session.add(bug)
        db.session.commit()
        bug_id = bug.id

    response = client.get(f'/api/bugs/{bug_id}')
    assert response.status_code == 200
    data = response.get_json()
    assert data['created_at'] is not None
    assert '+00:00' in data['created_at'], f"Esperado +00:00, obteve: {data['created_at']}"


def test_bug_resolved_at_serialized_with_utc(client):
    """resolved_at deve ser serializado com +00:00 apos definicao."""
    with client.application.app_context():
        from app.extensions import db
        from app.models import Project, Bug
        project = Project(name='UTC Resolved Project')
        db.session.add(project)
        db.session.commit()
        bug = Bug(project_id=project.id, title='UTC Resolved Bug', status='Open')
        db.session.add(bug)
        db.session.commit()
        bug_id = bug.id

    response = client.put(f'/api/bugs/{bug_id}', json={'status': 'Resolved'})
    assert response.status_code == 200
    data = response.get_json()
    assert data['resolved_at'] is not None
    assert '+00:00' in data['resolved_at'], f"Esperado +00:00, obteve: {data['resolved_at']}"


def test_project_created_at_serialized_with_utc(client):
    """Project.created_at deve ser serializado com +00:00."""
    with client.application.app_context():
        from app.extensions import db
        from app.models import Project
        project = Project(name='UTC Project 2')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

    response = client.get(f'/api/projects/{project_id}')
    assert response.status_code == 200
    data = response.get_json()
    assert data['created_at'] is not None
    assert '+00:00' in data['created_at'], f"Esperado +00:00, obteve: {data['created_at']}"


def test_testcase_created_at_serialized_with_utc(client):
    """TestCase.created_at deve ser serializado com +00:00."""
    with client.application.app_context():
        from app.extensions import db
        from app.models import Project, TestCase
        project = Project(name='UTC TC Project')
        db.session.add(project)
        db.session.commit()
        tc = TestCase(project_id=project.id, title='UTC TC')
        db.session.add(tc)
        db.session.commit()
        tc_id = tc.id

    response = client.get(f'/api/testcases/{tc_id}')
    assert response.status_code == 200
    data = response.get_json()
    assert data['created_at'] is not None
    assert '+00:00' in data['created_at'], f"Esperado +00:00, obteve: {data['created_at']}"


def test_execution_executed_at_serialized_with_utc(client):
    """TestExecution.executed_at deve ser serializado com +00:00."""
    with client.application.app_context():
        from app.extensions import db
        from app.models import Project, TestCase, TestExecution
        project = Project(name='UTC Exec Project')
        db.session.add(project)
        db.session.commit()
        tc = TestCase(project_id=project.id, title='UTC Exec TC')
        db.session.add(tc)
        db.session.commit()
        execution = TestExecution(test_case_id=tc.id, status='Passed')
        db.session.add(execution)
        db.session.commit()
        exec_id = execution.id

    response = client.get(f'/api/executions/{exec_id}')
    assert response.status_code == 200
    data = response.get_json()
    assert data['executed_at'] is not None
    assert '+00:00' in data['executed_at'], f"Esperado +00:00, obteve: {data['executed_at']}"


def test_null_date_fields_remain_null(client):
    """Campos de data nulos devem permanecer null na serializacao."""
    with client.application.app_context():
        from app.extensions import db
        from app.models import Project, Bug
        project = Project(name='Null Date Project')
        db.session.add(project)
        db.session.commit()
        bug = Bug(project_id=project.id, title='Null Date Bug', status='Open')
        db.session.add(bug)
        db.session.commit()
        bug_id = bug.id

    response = client.get(f'/api/bugs/{bug_id}')
    assert response.status_code == 200
    data = response.get_json()
    assert data['created_at'] is not None
    assert data['resolved_at'] is None


def test_resolved_at_preserved_through_transitions(client):
    """resolved_at deve ser preservado em transicoes Resolved->Closed->Open."""
    with client.application.app_context():
        from app.extensions import db
        from app.models import Project, Bug
        project = Project(name='Transition Project 2')
        db.session.add(project)
        db.session.commit()
        bug = Bug(project_id=project.id, title='Transition Bug 2', status='Open')
        db.session.add(bug)
        db.session.commit()
        bug_id = bug.id

    response = client.put(f'/api/bugs/{bug_id}', json={'status': 'Resolved'})
    assert response.status_code == 200
    resolved_at_first = response.get_json()['resolved_at']
    assert resolved_at_first is not None

    response = client.put(f'/api/bugs/{bug_id}', json={'status': 'Closed'})
    assert response.status_code == 200
    assert response.get_json()['resolved_at'] == resolved_at_first

    response = client.put(f'/api/bugs/{bug_id}', json={'status': 'Open'})
    assert response.status_code == 200
    assert response.get_json()['resolved_at'] == resolved_at_first


# ============================================================
# Testes de handlers 404 e 500
# ============================================================

def test_route_inexistente_retorna_404(client):
    """Rota inexistente deve retornar HTTP 404."""
    response = client.get('/api/rota-que-nao-existe')
    assert response.status_code == 404


def test_404_resposta_eh_json(client):
    """Resposta 404 deve utilizar Content-Type JSON."""
    response = client.get('/api/rota-que-nao-existe')
    assert 'application/json' in response.content_type


def test_404_contem_chave_error(client):
    """Resposta 404 deve conter a chave 'error'."""
    response = client.get('/api/rota-que-nao-existe')
    data = response.get_json()
    assert 'error' in data


def test_erro_interno_retorna_500(client):
    """Erro interno deve retornar HTTP 500 sem expor detalhes."""
    client.application.config['PROPAGATE_EXCEPTIONS'] = False

    @client.application.route('/_test_500')
    def _raise_error():
        raise RuntimeError('Erro simulado')

    response = client.get('/_test_500')
    assert response.status_code == 500


def test_500_resposta_eh_json(client):
    """Resposta 500 deve utilizar Content-Type JSON."""
    client.application.config['PROPAGATE_EXCEPTIONS'] = False

    @client.application.route('/_test_500_json')
    def _raise_error_json():
        raise RuntimeError('Erro simulado')

    response = client.get('/_test_500_json')
    assert 'application/json' in response.content_type


def test_500_nao_expede_traceback(client):
    """Resposta 500 nao deve expor traceback ou detalhes internos."""
    client.application.config['PROPAGATE_EXCEPTIONS'] = False

    @client.application.route('/_test_500_no_traceback')
    def _raise_error_no_traceback():
        raise RuntimeError('Erro simulado com detalhes internos')

    response = client.get('/_test_500_no_traceback')
    data = response.get_json()
    assert 'error' in data
    assert 'traceback' not in data
    assert 'Traceback' not in data.get('error', '')
    assert 'RuntimeError' not in data.get('error', '')
