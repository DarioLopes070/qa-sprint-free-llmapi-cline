import pytest
from app.models import Project, TestCase as _TestCase


def test_testcase_creation(app):
    """Test creating and persisting a TestCase model"""
    with app.app_context():
        from app.extensions import db
        
        # Create a project first
        project = Project(name='Test Project for TestCase')
        db.session.add(project)
        db.session.commit()
        
        # Create a TestCase
        test_case = _TestCase(
            project_id=project.id,
            title='Test Case 1',
            description='Test case description',
            steps='Step 1\nStep 2',
            expected_result='Expected result',
            priority='High'
        )
        
        db.session.add(test_case)
        db.session.commit()
        
        # Verify test case was saved
        saved_test_case = _TestCase.query.filter_by(title='Test Case 1').first()
        assert saved_test_case is not None
        assert saved_test_case.title == 'Test Case 1'
        assert saved_test_case.description == 'Test case description'
        assert saved_test_case.steps == 'Step 1\nStep 2'
        assert saved_test_case.expected_result == 'Expected result'
        assert saved_test_case.priority == 'High'
        assert saved_test_case.project_id == project.id
        assert saved_test_case.created_at is not None
        assert saved_test_case.id is not None


def test_testcase_association_with_project(app):
    """Test TestCase association with Project"""
    with app.app_context():
        from app.extensions import db
        
        # Create a project
        project = Project(name='Test Project')
        db.session.add(project)
        db.session.commit()
        
        # Create test cases for the project
        test_case1 = _TestCase(project_id=project.id, title='Test Case 1')
        test_case2 = _TestCase(project_id=project.id, title='Test Case 2')
        
        db.session.add_all([test_case1, test_case2])
        db.session.commit()
        
        # Verify association
        saved_project = Project.query.filter_by(name='Test Project').first()
        assert len(saved_project.test_cases) == 2
        assert test_case1 in saved_project.test_cases
        assert test_case2 in saved_project.test_cases
        
        # Verify back reference
        assert saved_project.test_cases[0].project.id == saved_project.id


def test_testcase_required_fields(app):
    """Test that TestCase requires project_id and title"""
    with app.app_context():
        from app.extensions import db
        
        # Try creating test case without project_id
        test_case_no_project = _TestCase(title='Test Case')
        db.session.add(test_case_no_project)
        with pytest.raises(Exception):
            db.session.commit()
        db.session.rollback()
        
        # Try creating test case without title
        test_case_no_title = _TestCase(project_id=1)
        db.session.add(test_case_no_title)
        with pytest.raises(Exception):
            db.session.commit()
        db.session.rollback()


def test_testcase_default_priority(app):
    """Test that TestCase has default priority of Medium"""
    with app.app_context():
        from app.extensions import db
        
        project = Project(name='Test Project')
        db.session.add(project)
        db.session.commit()
        
        test_case = _TestCase(project_id=project.id, title='Test Case')
        db.session.add(test_case)
        db.session.commit()
        
        saved_test_case = _TestCase.query.filter_by(title='Test Case').first()
        assert saved_test_case.priority == 'Medium'


def test_testcase_optional_fields(app):
    """Test that TestCase optional fields can be null"""
    with app.app_context():
        from app.extensions import db
        
        project = Project(name='Test Project')
        db.session.add(project)
        db.session.commit()
        
        test_case = _TestCase(
            project_id=project.id,
            title='Minimal Test Case'
            # description, steps, expected_result are optional
        )
        db.session.add(test_case)
        db.session.commit()
        
        saved_test_case = _TestCase.query.filter_by(title='Minimal Test Case').first()
        assert saved_test_case is not None
        assert saved_test_case.description is None
        assert saved_test_case.steps is None
        assert saved_test_case.expected_result is None
        assert saved_test_case.priority == 'Medium'
        assert saved_test_case.created_at is not None


def test_project_to_testcases_relationship(app):
    """Test Project -> TestCases relationship bidirectional"""
    with app.app_context():
        from app.extensions import db
        
        project = Project(name='Project with Cases')
        db.session.add(project)
        db.session.commit()
        
        # Add test cases via relationship
        test_case1 = _TestCase(title='Case 1')
        test_case2 = _TestCase(title='Case 2')
        project.test_cases.append(test_case1)
        project.test_cases.append(test_case2)
        
        db.session.commit()
        
        # Verify they are saved with correct project_id
        saved_cases = _TestCase.query.filter_by(project_id=project.id).all()
        assert len(saved_cases) == 2
        assert saved_cases[0].project.name == 'Project with Cases'
