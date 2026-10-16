import pytest
from app.models import Project, TestCase as _TestCase, TestExecution as _TestExecution, Bug
from app.extensions import db


# ============================================================
# Cenário 1 — Fluxo completo de QA
# ============================================================
def test_qa_full_flow(client):
    """Fluxo completo: Projeto -> TestCase -> TestExecution -> Bug -> atualizacao."""
    # 1. Criar projeto
    response = client.post('/api/projects/', json={
        'name': 'QA Flow Project',
        'description': 'Projeto para fluxo completo de QA'
    })
    assert response.status_code == 201
    project_data = response.get_json()
    project_id = project_data['id']
    assert project_data['name'] == 'QA Flow Project'

    # 2. Criar TestCase associado ao projeto
    response = client.post('/api/testcases/', json={
        'project_id': project_id,
        'title': 'Login Test Case',
        'description': 'Validar login do usuario',
        'steps': '1. Abrir app\n2. Inserir credenciais\n3. Clicar em entrar',
        'expected_result': 'Usuario autenticado',
        'priority': 'High',
    })
    assert response.status_code == 201
    tc_data = response.get_json()
    tc_id = tc_data['id']
    assert tc_data['project_id'] == project_id
    assert tc_data['title'] == 'Login Test Case'

    # 3. Registrar TestExecution com status Failed
    response = client.post('/api/executions/', json={
        'test_case_id': tc_id,
        'status': 'Failed',
        'executed_by': 'qa_tester',
        'actual_result': 'Erro de credenciais invalidas',
        'notes': 'Reproduzido em ambiente de homologacao',
    })
    assert response.status_code == 201
    exec_data = response.get_json()
    exec_id = exec_data['id']
    assert exec_data['status'] == 'Failed'
    assert exec_data['test_case_id'] == tc_id

    # 4. Criar Bug associado ao projeto e ao TestCase
    response = client.post('/api/bugs/', json={
        'project_id': project_id,
        'test_case_id': tc_id,
        'title': 'Falha no login',
        'description': 'Login nao autentica com credenciais validas',
        'severity': 'High',
        'status': 'Open',
    })
    assert response.status_code == 201
    bug_data = response.get_json()
    bug_id = bug_data['id']
    assert bug_data['project_id'] == project_id
    assert bug_data['test_case_id'] == tc_id
    assert bug_data['status'] == 'Open'
    assert bug_data['resolved_at'] is None

    # 5. Consultar os quatro recursos pela API
    resp_project = client.get(f'/api/projects/{project_id}')
    resp_tc = client.get(f'/api/testcases/{tc_id}')
    resp_exec = client.get(f'/api/executions/{exec_id}')
    resp_bug = client.get(f'/api/bugs/{bug_id}')

    assert resp_project.status_code == 200
    assert resp_tc.status_code == 200
    assert resp_exec.status_code == 200
    assert resp_bug.status_code == 200

    # 6. Validar IDs, relacionamentos e dados persistidos
    assert resp_project.get_json()['id'] == project_id
    assert resp_tc.get_json()['project_id'] == project_id
    assert resp_exec.get_json()['test_case_id'] == tc_id
    assert resp_bug.get_json()['project_id'] == project_id
    assert resp_bug.get_json()['test_case_id'] == tc_id

    # 7. Atualizar o Bug para Resolved
    response = client.put(f'/api/bugs/{bug_id}', json={
        'status': 'Resolved',
    })
    assert response.status_code == 200
    updated_bug = response.get_json()
    assert updated_bug['status'] == 'Resolved'

    # 8. Confirmar que resolved_at foi preenchido
    assert updated_bug['resolved_at'] is not None
    assert 'T' in updated_bug['resolved_at']  # ISO 8601

    # 9. Consultar novamente os registros
    resp_bug2 = client.get(f'/api/bugs/{bug_id}')
    assert resp_bug2.status_code == 200

    # 10. Confirmar consistencia dos dados
    final_bug = resp_bug2.get_json()
    assert final_bug['id'] == bug_id
    assert final_bug['status'] == 'Resolved'
    assert final_bug['resolved_at'] is not None
    assert final_bug['resolved_at'] == updated_bug['resolved_at']


# ============================================================
# Cenário 2 — Execucoes de teste
# ============================================================
def test_test_executions_scenario(client):
    """Criar projeto, dois TestCases, múltiplas execucoes com diferentes status."""
    with client.application.app_context():
        project = Project(name='Executions Project')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

    with client.application.app_context():
        tc1 = _TestCase(project_id=project_id, title='TC Alpha')
        tc2 = _TestCase(project_id=project_id, title='TC Beta')
        db.session.add_all([tc1, tc2])
        db.session.commit()
        tc1_id = tc1.id
        tc2_id = tc2.id

    statuses = ['Passed', 'Failed', 'Blocked', 'Not Run']
    for i, status in enumerate(statuses):
        tc_id = tc1_id if i < 2 else tc2_id
        response = client.post('/api/executions/', json={
            'test_case_id': tc_id,
            'status': status,
            'executed_by': f'tester_{i}',
        })
        assert response.status_code == 201, f'Status {status} rejeitado'
        data = response.get_json()
        assert data['status'] == status

    response = client.get(f'/api/executions/?test_case_id={tc1_id}')
    assert response.status_code == 200
    execs_tc1 = response.get_json()
    assert len(execs_tc1) == 2
    for e in execs_tc1:
        assert e['test_case_id'] == tc1_id

    response = client.get(f'/api/executions/?test_case_id={tc2_id}')
    assert response.status_code == 200
    execs_tc2 = response.get_json()
    assert len(execs_tc2) == 2
    for e in execs_tc2:
        assert e['test_case_id'] == tc2_id

    statuses_tc1 = {e['status'] for e in execs_tc1}
    statuses_tc2 = {e['status'] for e in execs_tc2}
    assert 'Passed' in statuses_tc1
    assert 'Failed' in statuses_tc1
    assert 'Blocked' in statuses_tc2
    assert 'Not Run' in statuses_tc2


# ============================================================
# Cenário 3 — Bugs e relacionamentos
# ============================================================
def test_bugs_cross_project_rejection(client):
    """Bug nao pode ser associado a TestCase de outro projeto."""
    with client.application.app_context():
        p1 = Project(name='Project Alpha')
        p2 = Project(name='Project Beta')
        db.session.add_all([p1, p2])
        db.session.commit()
        p1_id = p1.id
        p2_id = p2.id

    with client.application.app_context():
        tc1 = _TestCase(project_id=p1_id, title='TC Project Alpha')
        tc2 = _TestCase(project_id=p2_id, title='TC Project Beta')
        db.session.add_all([tc1, tc2])
        db.session.commit()
        tc1_id = tc1.id
        tc2_id = tc2.id

    response = client.post('/api/bugs/', json={
        'project_id': p1_id,
        'test_case_id': tc1_id,
        'title': 'Bug valido projeto 1',
        'severity': 'Medium',
    })
    assert response.status_code == 201

    response = client.post('/api/bugs/', json={
        'project_id': p2_id,
        'test_case_id': tc2_id,
        'title': 'Bug valido projeto 2',
        'severity': 'Low',
    })
    assert response.status_code == 201

    response = client.post('/api/bugs/', json={
        'project_id': p1_id,
        'test_case_id': tc2_id,
        'title': 'Bug invalido cross-project',
        'severity': 'High',
    })
    assert response.status_code == 400
    data = response.get_json()
    assert 'error' in data

    response = client.get('/api/bugs/')
    assert response.status_code == 200
    bugs = response.get_json()
    bug_titles = [b['title'] for b in bugs]
    assert 'Bug invalido cross-project' not in bug_titles


# ============================================================
# Cenário 4 — Exclusão em cascata
# ============================================================
def test_cascade_delete_project(client):
    """Exclusao de projeto remove TestCases, TestExecutions e Bugs."""
    with client.application.app_context():
        project = Project(name='Cascade Project')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

        tc = _TestCase(project_id=project_id, title='TC Cascade')
        db.session.add(tc)
        db.session.commit()
        tc_id = tc.id

        execution = _TestExecution(test_case_id=tc_id, status='Passed')
        db.session.add(execution)
        db.session.commit()
        exec_id = execution.id

        bug = Bug(project_id=project_id, title='Bug Cascade', test_case_id=tc_id)
        db.session.add(bug)
        db.session.commit()
        bug_id = bug.id

    response = client.delete(f'/api/projects/{project_id}')
    assert response.status_code == 204

    with client.application.app_context():
        assert db.session.get(Project, project_id) is None
        assert db.session.get(_TestCase, tc_id) is None
        assert db.session.get(_TestExecution, exec_id) is None
        assert db.session.get(Bug, bug_id) is None

    response = client.get('/api/testcases/')
    assert response.status_code == 200
    assert len(response.get_json()) == 0

    response = client.get('/api/executions/')
    assert response.status_code == 200
    assert len(response.get_json()) == 0

    response = client.get('/api/bugs/')
    assert response.status_code == 200
    assert len(response.get_json()) == 0


# ============================================================
# Cenário 5 — Integridade após falhas
# ============================================================
def test_integrity_after_failures(client):
    """Operacoes invalidas nao alteram registros existentes; app continua funcionando."""
    with client.application.app_context():
        project = Project(name='Integrity Project')
        db.session.add(project)
        db.session.commit()
        project_id = project.id

        tc = _TestCase(project_id=project_id, title='TC Integrity')
        db.session.add(tc)
        db.session.commit()
        tc_id = tc.id

        bug = Bug(project_id=project_id, title='Original Bug', severity='High')
        db.session.add(bug)
        db.session.commit()
        bug_id = bug.id

    resp_before = client.get(f'/api/bugs/{bug_id}')
    assert resp_before.status_code == 200
    original_title = resp_before.get_json()['title']
    original_status = resp_before.get_json()['status']

    response = client.put(f'/api/bugs/{bug_id}', json={
        'severity': 'UltraCritical',
    })
    assert response.status_code == 400

    response = client.put(f'/api/bugs/{bug_id}', json={
        'unknown_field': 'value',
    })
    assert response.status_code == 400

    with client.application.app_context():
        other_project = Project(name='Other Project')
        db.session.add(other_project)
        db.session.commit()
        other_id = other_project.id

        other_tc = _TestCase(project_id=other_id, title='Other TC')
        db.session.add(other_tc)
        db.session.commit()
        other_tc_id = other_tc.id

    response = client.put(f'/api/bugs/{bug_id}', json={
        'test_case_id': other_tc_id,
    })
    assert response.status_code == 400

    response = client.put(f'/api/bugs/{bug_id}', json={
        'title': '',
    })
    assert response.status_code == 400

    resp_after = client.get(f'/api/bugs/{bug_id}')
    assert resp_after.status_code == 200
    data = resp_after.get_json()
    assert data['title'] == original_title
    assert data['status'] == original_status
    assert data['severity'] == 'High'

    response = client.put(f'/api/bugs/{bug_id}', json={
        'status': 'Resolved',
        'title': 'Updated Bug Title',
    })
    assert response.status_code == 200
    data = response.get_json()
    assert data['title'] == 'Updated Bug Title'
    assert data['status'] == 'Resolved'
    assert data['resolved_at'] is not None