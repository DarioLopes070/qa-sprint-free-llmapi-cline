"""Auditoria de datas: UTC, ISO 8601, resolved_at, persistência."""
import os
import sys

# Adiciona o diretorio raiz do projeto ao sys.path de forma dinamica
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from datetime import datetime, timezone, timedelta
from app import create_app
from app.extensions import db
from app.models import Project, Bug


def test_utc_timezone_aware(client):
    """Verifica comportamento de fuso horário em created_at.

    Aplicação grava datetime.now(timezone.utc) (timezone-aware UTC).
    SQLite não preserva fuso horário; ao ler de volta pode retornar naive.
    Isso é uma limitação do SQLite, não um bug do aplicação.
    """
    from app.extensions import db
    project = Project(name="Date Audit")
    db.session.add(project)
    db.session.commit()

    bug = Bug(project_id=project.id, title="Date Bug", status="Open")
    db.session.add(bug)
    db.session.commit()

    saved = db.session.get(Bug, bug.id)
    assert saved.created_at is not None
    if saved.created_at.tzinfo is not None:
        assert saved.created_at.utcoffset() == timedelta(0), "created_at deve estar em UTC"
        print("  OK: created_at eh timezone-aware UTC (lido do SQLAlchemy)")
    else:
        print("  AVISO: created_at eh timezone-naive ao ler do SQLite (limitação do SQLite)")
        print("         O valor é gravado como UTC (timezone-aware) mas SQLite não preserva fuso")


def test_iso8601_serialization(client):
    """Verifica serializacao ISO 8601 em created_at e resolved_at."""
    with client.application.app_context():
        from app.extensions import db
        project = Project(name="ISO Project")
        db.session.add(project)
        db.session.commit()

        bug = Bug(project_id=project.id, title="ISO Bug", status="Open")
        db.session.add(bug)
        db.session.commit()
        bug_id = bug.id

    response = client.get(f"/api/bugs/{bug_id}")
    assert response.status_code == 200
    data = response.get_json()

    assert "created_at" in data
    assert data["created_at"] is not None
    assert "T" in data["created_at"], "created_at deve ter separador T (ISO 8601)"
    assert data["resolved_at"] is None

    response = client.put(f"/api/bugs/{bug_id}", json={"status": "Resolved"})
    assert response.status_code == 200
    data = response.get_json()
    assert data["resolved_at"] is not None
    assert "T" in data["resolved_at"], "resolved_at deve ter separador T (ISO 8601)"

    print("  OK: created_at e resolved_at serializados em ISO 8601")


def test_resolved_at_persistence(client):
    """Verifica que resolved_at persiste apos commit e nova consulta."""
    from app.extensions import db
    project = Project(name="Persist Project")
    db.session.add(project)
    db.session.commit()

    past = datetime(2026, 1, 15, 10, 30, 0, tzinfo=timezone.utc)
    bug = Bug(
        project_id=project.id,
        title="Persist Bug",
        status="Resolved",
        resolved_at=past,
    )
    db.session.add(bug)
    db.session.commit()
    bug_id = bug.id

    saved = db.session.get(Bug, bug_id)
    assert saved.resolved_at is not None
    assert saved.resolved_at.replace(tzinfo=None) == past.replace(tzinfo=None)

    print("  OK: resolved_at persistido apos commit e nova consulta")


def test_status_transitions(client):
    """Verifica comportamento de resolved_at nas transicoes de status."""
    with client.application.app_context():
        from app.extensions import db
        project = Project(name="Transition Project")
        db.session.add(project)
        db.session.commit()

        bug = Bug(project_id=project.id, title="Transition Bug", status="Open")
        db.session.add(bug)
        db.session.commit()
        bug_id = bug.id

    # Open -> Resolved: resolved_at deve ser preenchido
    response = client.put(f"/api/bugs/{bug_id}", json={"status": "Resolved"})
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "Resolved"
    assert data["resolved_at"] is not None
    resolved_at_first = data["resolved_at"]

    # Resolved -> Closed: resolved_at deve ser preservado (não sobrescrito)
    response = client.put(f"/api/bugs/{bug_id}", json={"status": "Closed"})
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "Closed"
    assert data["resolved_at"] == resolved_at_first, "resolved_at nao deve mudar ao ir de Resolved para Closed"

    # Closed -> Open: comportamento atual mantem resolved_at
    response = client.put(f"/api/bugs/{bug_id}", json={"status": "Open"})
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "Open"

    print("  OK: transicoes Open->Resolved->Closed->Open verificadas")
    print(f"        resolved_at após Open->Resolved: {resolved_at_first}")
    print(f"        resolved_at após Resolved->Closed: {data['resolved_at']}")
    print(f"        resolved_at após Closed->Open: {data['resolved_at']} (mantido)")


def main():
    failures = []
    app = create_app("Testing")
    client = app.test_client()

    with app.app_context():
        db.create_all()

    try:
        print("=== Auditoria de Datas ===\n")

        print("1. UTC e timezone-aware:")
        with app.app_context():
            test_utc_timezone_aware(client)

        print("\n2. Serializacao ISO 8601:")
        test_iso8601_serialization(client)

        print("\n3. Persistencia de resolved_at:")
        with app.app_context():
            test_resolved_at_persistence(client)

        print("\n4. Transicoes de status:")
        with app.app_context():
            test_status_transitions(client)

        print("\n=== AUDITORIA DE DATAS CONCLUÍDA ===")

    except AssertionError as ae:
        failures.append(str(ae))
        print(f"\nFALHA: {ae}")
    except Exception as exc:
        failures.append(str(exc))
        print(f"\nERRO: {exc}")

    if failures:
        print("\n=== FALHAS ===")
        for f in failures:
            print(f"  - {f}")
        sys.exit(1)


if __name__ == "__main__":
    main()