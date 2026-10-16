from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import event
from sqlalchemy.engine import Engine
import sqlite3

# Primary SQLAlchemy instance
# The engine will be created when init_app is called via the app factory

# Lazily import db once the app is configured

db = SQLAlchemy()

# Enable foreign key constraint enforcement on SQLite
@event.listens_for(Engine, "connect")
def activate_sqlite_foreign_keys(dbapi_connection, connection_record):
    # Only enable foreign keys for SQLite connections
    if isinstance(dbapi_connection, sqlite3.Connection):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()
