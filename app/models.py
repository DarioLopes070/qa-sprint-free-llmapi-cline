from datetime import datetime, timezone
from sqlalchemy import CheckConstraint
from .extensions import db

class Project(db.Model):
    __tablename__ = 'projects'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    
    test_cases = db.relationship('TestCase', back_populates='project', cascade='all, delete-orphan')
    bugs = db.relationship('Bug', back_populates='project', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Project {self.name}>'


class TestCase(db.Model):
    __tablename__ = 'test_cases'
    
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    steps = db.Column(db.Text, nullable=True)
    expected_result = db.Column(db.Text, nullable=True)
    priority = db.Column(db.String(20), nullable=False, default='Medium')
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    
    project = db.relationship('Project', back_populates='test_cases')
    test_executions = db.relationship('TestExecution', back_populates='test_case', cascade='all, delete-orphan')
    bugs = db.relationship('Bug', back_populates='test_case')
    
    def __repr__(self):
        return f'<TestCase {self.title}>'


class TestExecution(db.Model):
    __tablename__ = 'test_executions'
    
    id = db.Column(db.Integer, primary_key=True)
    test_case_id = db.Column(db.Integer, db.ForeignKey('test_cases.id'), nullable=False)
    status = db.Column(db.String(20), nullable=False)
    executed_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    executed_by = db.Column(db.String(255), nullable=True)
    actual_result = db.Column(db.Text, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    
    test_case = db.relationship('TestCase', back_populates='test_executions')
    
    __table_args__ = (
        CheckConstraint(
            "status IN ('Passed', 'Failed', 'Blocked', 'Not Run')",
            name='check_test_execution_status'
        ),
    )
    
    def __repr__(self):
        return f'<TestExecution {self.id} - {self.status}>'


class Bug(db.Model):
    __tablename__ = 'bugs'

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    test_case_id = db.Column(db.Integer, db.ForeignKey('test_cases.id'), nullable=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    severity = db.Column(db.String(20), nullable=False, default='Medium')
    status = db.Column(db.String(20), nullable=False, default='Open')
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    resolved_at = db.Column(db.DateTime, nullable=True)

    project = db.relationship('Project', back_populates='bugs')
    test_case = db.relationship('TestCase', back_populates='bugs')

    __table_args__ = (
        CheckConstraint(
            "severity IN ('Low', 'Medium', 'High', 'Critical')",
            name='check_bug_severity'
        ),
        CheckConstraint(
            "status IN ('Open', 'In Progress', 'Resolved', 'Closed')",
            name='check_bug_status'
        ),
    )

    def __repr__(self):
        return f'<Bug {self.id} - {self.title} - {self.status}>'