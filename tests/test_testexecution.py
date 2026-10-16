import pytest
from app.models import Project, TestCase as _TestCase, TestExecution as _TestExecution


def test_testexecution_creation(app):
    """Test creating and persisting a TestExecution model"""
    with app.app_context():
        from app.extensions import db
        
        project = Project(name='Test Project')
        db.session.add(project)
        db.session.commit()
        
        test_case = _TestCase(project_id=project.id, title='Test Case 1')
        db.session.add(test_case)
        db.session.commit()
        
        execution = _TestExecution(
            test_case_id=test_case.id,
            status='Passed',
            executed_by='tester1',
            actual_result='Result matched',
            notes='All good'
        )
        
        db.session.add(execution)
        db.session.commit()
        
        saved_execution = _TestExecution.query.filter_by(test_case_id=test_case.id).first()


def test_testexecution_valid_statuses(app):
    """Test that TestExecution accepts only valid status values"""
    with app.app_context():
        from app.extensions import db
        
        project = Project(name='Test Project')
        db.session.add(project)
        db.session.commit()
        
        test_case = _TestCase(project_id=project.id, title='Test Case')
        db.session.add(test_case)
        db.session.commit()
        
        valid_statuses = ['Passed', 'Failed', 'Blocked', 'Not Run']
        
        for status in valid_statuses:
            execution = _TestExecution(test_case_id=test_case.id, status=status)
            db.session.add(execution)
            db.session.commit()
            
            saved = _TestExecution.query.filter_by(status=status).first()
            assert saved.status == status
            db.session.delete(saved)
            db.session.commit()


def test_testexecution_invalid_status_rejected(app):
    """Test that invalid status is rejected by database constraint"""
    with app.app_context():
        from app.extensions import db
        
        project = Project(name='Test Project')
        db.session.add(project)
        db.session.commit()
        
        test_case = _TestCase(project_id=project.id, title='Test Case')
        db.session.add(test_case)
        db.session.commit()
        
        execution_invalid = _TestExecution(test_case_id=test_case.id, status='InvalidStatus')
        db.session.add(execution_invalid)
        
        with pytest.raises(Exception):
            db.session.commit()
        db.session.rollback()


def test_testexecution_optional_fields(app):
    """Test that TestExecution optional fields can be null"""
    with app.app_context():
        from app.extensions import db
        
        project = Project(name='Test Project')
        db.session.add(project)
        db.session.commit()
        
        test_case = _TestCase(project_id=project.id, title='Test Case')
        db.session.add(test_case)
        db.session.commit()
        
        execution = _TestExecution(test_case_id=test_case.id, status='Not Run')
        db.session.add(execution)
        db.session.commit()
        
        saved_execution = _TestExecution.query.filter_by(status='Not Run').first()
        assert saved_execution is not None
        assert saved_execution.executed_by is None
        assert saved_execution.actual_result is None
        assert saved_execution.notes is None
        assert saved_execution.executed_at is not None


def test_testexecution_auto_executed_at(app):
    """Test that executed_at is automatically populated"""
    with app.app_context():
        from app.extensions import db
        
        project = Project(name='Test Project')
        db.session.add(project)
        db.session.commit()
        
        test_case = _TestCase(project_id=project.id, title='Test Case')
        db.session.add(test_case)
        db.session.commit()
        
        execution = _TestExecution(test_case_id=test_case.id, status='Passed')
        db.session.add(execution)
        db.session.commit()
        
        assert execution.executed_at is not None
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        # SQLite stores datetime as naive, so we need to handle timezone-aware vs naive comparison
        executed_at = execution.executed_at
        if executed_at.tzinfo is None:
            executed_at = executed_at.replace(tzinfo=timezone.utc)
        time_diff = abs((now - executed_at).total_seconds())
        assert time_diff < 60


def test_testexecution_project_to_testcase_to_execution_chain(app):
    """Test full chain: Project -> TestCase -> TestExecution"""
    with app.app_context():
        from app.extensions import db
        
        project = Project(name='Full Chain Project')
        db.session.add(project)
        db.session.commit()
        
        test_case = _TestCase(project_id=project.id, title='Chain Test Case')
        db.session.add(test_case)
        db.session.commit()
        
        execution = _TestExecution(test_case_id=test_case.id, status='Passed')
        db.session.add(execution)
        db.session.commit()
        
        saved_project = Project.query.filter_by(name='Full Chain Project').first()
        assert len(saved_project.test_cases) == 1
        assert saved_project.test_cases[0].title == 'Chain Test Case'
        assert len(saved_project.test_cases[0].test_executions) == 1
        assert saved_project.test_cases[0].test_executions[0].status == 'Passed'


def test_testexecution_association_with_testcase(app):
    """Test TestExecution association with TestCase"""
    with app.app_context():
        from app.extensions import db
        
        project = Project(name='Test Project')
        db.session.add(project)
        db.session.commit()
        
        test_case = _TestCase(project_id=project.id, title='Test Case')
        db.session.add(test_case)
        db.session.commit()
        
        execution1 = _TestExecution(test_case_id=test_case.id, status='Passed')
        execution2 = _TestExecution(test_case_id=test_case.id, status='Failed')
        
        db.session.add_all([execution1, execution2])
        db.session.commit()
        
        saved_test_case = _TestCase.query.filter_by(title='Test Case').first()
        assert len(saved_test_case.test_executions) == 2
        assert execution1 in saved_test_case.test_executions
        assert execution2 in saved_test_case.test_executions
        assert saved_test_case.test_executions[0].test_case.id == saved_test_case.id


def test_testexecution_required_fields(app):
    """Test that TestExecution requires test_case_id and status"""
    with app.app_context():
        from app.extensions import db
        
        project = Project(name='Test Project')
        db.session.add(project)
        db.session.commit()
        
        test_case = _TestCase(project_id=project.id, title='Test Case')
        db.session.add(test_case)
        db.session.commit()
        
        execution_no_case = _TestExecution(status='Passed')
        db.session.add(execution_no_case)
        with pytest.raises(Exception):
            db.session.commit()
        db.session.rollback()
        
        execution_no_status = _TestExecution(test_case_id=test_case.id)
        db.session.add(execution_no_status)
        with pytest.raises(Exception):
            db.session.commit()
        db.session.rollback()