import pytest
from app.models import Project, Bug
from app.models import TestCase as _TestCase


def test_bug_creation(app):
    """Test creating and persisting a Bug model"""
    with app.app_context():
        from app.extensions import db
        project = Project(name='Test Project for Bug')
        db.session.add(project)
        db.session.commit()
        bug = Bug(
            project_id=project.id,
            title='Bug 1',
            description='Bug description',
            severity='High',
            status='Open'
        )
        db.session.add(bug)
        db.session.commit()
        saved_bug = Bug.query.filter_by(title='Bug 1').first()
        assert saved_bug is not None
        assert saved_bug.title == 'Bug 1'
        assert saved_bug.description == 'Bug description'
        assert saved_bug.severity == 'High'
        assert saved_bug.status == 'Open'
        assert saved_bug.project_id == project.id
        assert saved_bug.created_at is not None
        assert saved_bug.id is not None


def test_bug_association_with_project(app):
    """Test Bug association with Project"""
    with app.app_context():
        from app.extensions import db
        project = Project(name='Test Project')
        db.session.add(project)
        db.session.commit()
        bug1 = Bug(project_id=project.id, title='Bug 1')
        bug2 = Bug(project_id=project.id, title='Bug 2')
        db.session.add_all([bug1, bug2])
        db.session.commit()
        saved_project = Project.query.filter_by(name='Test Project').first()
        assert len(saved_project.bugs) == 2
        assert bug1 in saved_project.bugs
        assert bug2 in saved_project.bugs
        assert saved_project.bugs[0].project.id == saved_project.id


def test_bug_optional_test_case_association(app):
    """Test Bug optional association with TestCase"""
    with app.app_context():
        from app.extensions import db
        project = Project(name='Test Project')


def test_bug_default_severity_and_status(app):
    """Test that Bug has default severity Medium and status Open"""
    with app.app_context():
        from app.extensions import db
        project = Project(name='Test Project')
        db.session.add(project)
        db.session.commit()
        bug = Bug(project_id=project.id, title='Default Bug')
        db.session.add(bug)
        db.session.commit()
        saved_bug = Bug.query.filter_by(title='Default Bug').first()
        assert saved_bug.severity == 'Medium'
        assert saved_bug.status == 'Open'


def test_bug_valid_severities(app):
    """Test that Bug accepts all valid severity values"""
    with app.app_context():
        from app.extensions import db
        project = Project(name='Test Project')
        db.session.add(project)
        db.session.commit()
        valid_severities = ['Low', 'Medium', 'High', 'Critical']
        for severity in valid_severities:
            bug = Bug(project_id=project.id, title=f'Bug {severity}', severity=severity)
            db.session.add(bug)
            db.session.commit()
            saved = Bug.query.filter_by(severity=severity).first()
            assert saved.severity == severity
            db.session.delete(saved)
            db.session.commit()


def test_bug_valid_statuses(app):
    """Test that Bug accepts all valid status values"""
    with app.app_context():
        from app.extensions import db
        project = Project(name='Test Project')
        db.session.add(project)
        db.session.commit()
        valid_statuses = ['Open', 'In Progress', 'Resolved', 'Closed']
        for status in valid_statuses:
            bug = Bug(project_id=project.id, title=f'Bug {status}', status=status)
            db.session.add(bug)
            db.session.commit()
            saved = Bug.query.filter_by(status=status).first()
            assert saved.status == status
            db.session.delete(saved)
            db.session.commit()
        db.session.add(project)
        db.session.commit()
        test_case = _TestCase(project_id=project.id, title='Test Case')
        db.session.add(test_case)
        db.session.commit()


def test_bug_invalid_severity_rejected(app):
    """Test that invalid severity is rejected by database constraint"""
    with app.app_context():
        from app.extensions import db
        project = Project(name='Test Project')
        db.session.add(project)
        db.session.commit()
        bug_invalid = Bug(project_id=project.id, title='Invalid Severity Bug', severity='InvalidSeverity')
        db.session.add(bug_invalid)
        with pytest.raises(Exception):
            db.session.commit()
        db.session.rollback()


def test_bug_invalid_status_rejected(app):
    """Test that invalid status is rejected by database constraint"""
    with app.app_context():
        from app.extensions import db
        project = Project(name='Test Project')
        db.session.add(project)
        db.session.commit()
        bug_invalid = Bug(project_id=project.id, title='Invalid Status Bug', status='InvalidStatus')
        db.session.add(bug_invalid)
        with pytest.raises(Exception):
            db.session.commit()
        db.session.rollback()


def test_bug_optional_fields(app):
    """Test that Bug optional fields can be null"""
    with app.app_context():
        from app.extensions import db
        project = Project(name='Test Project')
        db.session.add(project)
        db.session.commit()
        bug = Bug(project_id=project.id, title='Minimal Bug')
        db.session.add(bug)
        db.session.commit()
        saved_bug = Bug.query.filter_by(title='Minimal Bug').first()
        assert saved_bug is not None
        assert saved_bug.description is None
        assert saved_bug.test_case_id is None
        assert saved_bug.resolved_at is None
        assert saved_bug.severity == 'Medium'
        assert saved_bug.status == 'Open'
        assert saved_bug.created_at is not None


def test_bug_resolved_at(app):
    """Test Bug resolved_at field"""
    with app.app_context():
        from app.extensions import db
        project = Project(name='Test Project')
        db.session.add(project)
        db.session.commit()
        from datetime import datetime, timezone
        resolved_time = datetime.now(timezone.utc)
        bug = Bug(project_id=project.id, title='Resolved Bug', resolved_at=resolved_time)
        db.session.add(bug)
        db.session.commit()
        saved_bug = Bug.query.filter_by(title='Resolved Bug').first()
        assert saved_bug.resolved_at is not None


def test_bug_auto_created_at(app):
    """Test that created_at is automatically populated"""


def test_bug_bidirectional_relationships(app):
    """Test Project -> Bugs and Bug -> Project bidirectional relationships"""
    with app.app_context():
        from app.extensions import db
        project = Project(name='Project with Bugs')
        db.session.add(project)
        db.session.commit()
        bug1 = Bug(title='Bug 1')
        bug2 = Bug(title='Bug 2')
        project.bugs.append(bug1)
        project.bugs.append(bug2)
        db.session.commit()
        saved_project = Project.query.filter_by(name='Project with Bugs').first()
        assert len(saved_project.bugs) == 2
        assert saved_project.bugs[0].project.name == 'Project with Bugs'
        assert saved_project.bugs[1].project.name == 'Project with Bugs'


def test_bug_test_case_bidirectional_relationship(app):
    """Test TestCase -> Bugs and Bug -> TestCase bidirectional relationship"""
    with app.app_context():
        from app.extensions import db
        project = Project(name='Project for TC Bug Relationship')
        db.session.add(project)
        db.session.commit()
        test_case = _TestCase(project_id=project.id, title='Test Case with Bugs')
        db.session.add(test_case)
        db.session.commit()
        bug1 = Bug(project_id=project.id, title='Bug 1', test_case_id=test_case.id)
        bug2 = Bug(project_id=project.id, title='Bug 2', test_case_id=test_case.id)
        db.session.add_all([bug1, bug2])
        db.session.commit()
        saved_test_case = _TestCase.query.filter_by(title='Test Case with Bugs').first()
        assert len(saved_test_case.bugs) == 2
        assert bug1 in saved_test_case.bugs
        assert bug2 in saved_test_case.bugs
        assert saved_test_case.bugs[0].test_case.id == saved_test_case.id


def test_bug_project_to_testcase_to_bug_chain(app):
    """Test full chain: Project -> TestCase -> Bug"""
    with app.app_context():
        from app.extensions import db
        project = Project(name='Full Chain Bug Project')
        db.session.add(project)
        db.session.commit()
        test_case = _TestCase(project_id=project.id, title='Chain Test Case')
        db.session.add(test_case)
        db.session.commit()
        bug = Bug(project_id=project.id, title='Chain Bug', test_case_id=test_case.id)
        db.session.add(bug)
        db.session.commit()
        saved_project = Project.query.filter_by(name='Full Chain Bug Project').first()
        assert len(saved_project.test_cases) == 1
        assert saved_project.test_cases[0].title == 'Chain Test Case'
        assert len(saved_project.test_cases[0].bugs) == 1
        assert saved_project.test_cases[0].bugs[0].title == 'Chain Bug'
    with app.app_context():
        from app.extensions import db
        project = Project(name='Test Project')
        db.session.add(project)
        db.session.commit()
        bug = Bug(project_id=project.id, title='Auto Created Bug')
        db.session.add(bug)
        db.session.commit()
        assert bug.created_at is not None
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        created_at = bug.created_at
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)
        time_diff = abs((now - created_at).total_seconds())
        assert time_diff < 60
        bug_no_case = Bug(project_id=project.id, title='Bug without case')
        db.session.add(bug_no_case)
        db.session.commit()
        saved_bug = Bug.query.filter_by(title='Bug without case').first()
        assert saved_bug is not None
        assert saved_bug.test_case_id is None
        bug_with_case = Bug(project_id=project.id, title='Bug with case', test_case_id=test_case.id)
        db.session.add(bug_with_case)
        db.session.commit()
        saved_bug_with_case = Bug.query.filter_by(title='Bug with case').first()
        assert saved_bug_with_case.test_case_id == test_case.id