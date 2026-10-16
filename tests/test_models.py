import pytest
from app.models import Project


def test_project_creation(app):
    """Test creating and persisting a Project model"""
    with app.app_context():
        # Create a new project
        project = Project(
            name='Test Project',
            description='Test project description'
        )
        
        # Add to database
        from app.extensions import db
        db.session.add(project)
        db.session.commit()
        
        # Verify project was saved
        saved_project = Project.query.filter_by(name='Test Project').first()
        assert saved_project is not None
        assert saved_project.name == 'Test Project'
        assert saved_project.description == 'Test project description'
        assert saved_project.created_at is not None
        assert saved_project.id is not None


def test_project_required_fields(app):
    """Test that Project requires a name"""
    with app.app_context():
        from app.extensions import db
        
        # Try creating project without name - should fail on commit
        project = Project(
            description='Project without name'
        )
        
        db.session.add(project)
        with pytest.raises(Exception):
            db.session.commit()
        db.session.rollback()


def test_project_name_optional_description(app):
    """Test creating project with name only (description is optional)"""
    with app.app_context():
        from app.extensions import db
        
        project = Project(name='Minimal Project')
        db.session.add(project)
        db.session.commit()
        
        saved_project = Project.query.filter_by(name='Minimal Project').first()
        assert saved_project is not None
        assert saved_project.description is None
        assert saved_project.created_at is not None