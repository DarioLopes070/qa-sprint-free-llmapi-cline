import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { LoadingState } from '../components/ui/LoadingState.jsx';
import { TestCaseTable } from '../components/testcases/TestCaseTable.jsx';
import { TestCaseForm } from '../components/testcases/TestCaseForm.jsx';
import { DeleteTestCaseConfirmDialog } from '../components/testcases/DeleteTestCaseConfirmDialog.jsx';
import {
  listTestCases,
  createTestCase,
  updateTestCase,
  deleteTestCase,
} from '../services/testcases.js';
import { listProjects } from '../services/projects.js';

export const TestCases = () => {
  const isMounted = useRef(true);

  const [testCases, setTestCases] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filterProjectId, setFilterProjectId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingTestCase, setEditingTestCase] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const [deletingTestCase, setDeletingTestCase] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const loadTestCases = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await listTestCases(filterProjectId);
      if (isMounted.current) {
        setTestCases(data);
        setLoading(false);
      }
    } catch (error) {
      if (isMounted.current) {
        setLoadError(error.message || 'Falha ao carregar casos de teste.');
        setLoading(false);
      }
    }
  }, [filterProjectId]);

  useEffect(() => {
    isMounted.current = true;

    const loadProjects = async () => {
      try {
        const data = await listProjects();
        if (isMounted.current) {
          setProjects(data);
        }
      } catch (error) {
        if (isMounted.current) {
          setLoadError(error.message || 'Falha ao carregar projetos.');
        }
      }
    };

    loadProjects();
    loadTestCases();

    return () => {
      isMounted.current = false;
    };
  }, [filterProjectId, loadTestCases]);

  const handleCreate = () => {
    setEditingTestCase(null);
    setFormError(null);
    setFormOpen(true);
  };

  const handleEdit = (testCase) => {
    setEditingTestCase(testCase);
    setFormError(null);
    setFormOpen(true);
  };

  const handleCancelForm = () => {
    setFormOpen(false);
    setEditingTestCase(null);
    setFormError(null);
  };

  const handleSave = async (data) => {
    setFormError(null);
    setSaving(true);

    try {
      if (editingTestCase) {
        await updateTestCase(editingTestCase.id, data);
      } else {
        await createTestCase(data);
      }

      if (isMounted.current) {
        await loadTestCases();
        setFormOpen(false);
        setEditingTestCase(null);
        setSaving(false);
      }
    } catch (error) {
      if (isMounted.current) {
        setFormError(error.message || 'Erro ao salvar o caso de teste.');
        setSaving(false);
      }
    }
  };

  const handleDelete = (testCase) => {
    setDeletingTestCase(testCase);
    setDeleteError(null);
  };

  const handleCancelDelete = () => {
    setDeletingTestCase(null);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTestCase) return;

    setDeleteError(null);
    setDeleting(true);

    try {
      await deleteTestCase(deletingTestCase.id);

      if (isMounted.current) {
        await loadTestCases();
        setDeletingTestCase(null);
        setDeleting(false);
      }
    } catch (error) {
      if (isMounted.current) {
        setDeleteError(error.message || 'Erro ao excluir o caso de teste.');
        setDeleting(false);
      }
    }
  };
  if (loading) {
    return (
      <div className="testcases-page">
        <PageHeader
          title="Casos de Teste"
          description="Cadastre e organize os casos de teste por projeto."
        />
        <LoadingState message="Carregando casos de teste..." />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="testcases-page">
        <PageHeader
          title="Casos de Teste"
          description="Cadastre e organize os casos de teste por projeto."
        />
        <div
          style={{
            padding: '1.5rem',
            textAlign: 'center',
            color: '#b91c1c',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '0.375rem',
            maxWidth: '400px',
            margin: '0 auto',
          }}
        >
          <p style={{ margin: '0 0 1rem 0' }}>{loadError}</p>
          <button
            type="button"
            onClick={loadTestCases}
            className="btn btn-primary"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="testcases-page">
      <PageHeader
        title="Casos de Teste"
        description="Cadastre e organize os casos de teste por projeto."
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Filtrar por projeto:
          </label>
          <select
            value={filterProjectId === null ? '' : String(filterProjectId)}
            onChange={(event) =>
              setFilterProjectId(event.target.value ? Number(event.target.value) : null)
            }
            className="input"
            style={{
              fontSize: '0.875rem',
              padding: '0.375rem 0.75rem',
            }}
          >
            <option value="">Todos os projetos</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
        {testCases.length > 0 && (
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            {testCases.length} caso{testCases.length !== 1 ? 's de teste' : ' de teste'}
          </span>
        )}
        <button
          type="button"
          onClick={handleCreate}
          className="btn btn-primary"
          disabled={saving}
        >
          Novo Caso de Teste
        </button>
      </div>

      {testCases.length > 0 ? (
        <TestCaseTable
          testCases={testCases}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <EmptyState
          title="Nenhum caso de teste encontrado"
          description="Comece criando o primeiro caso de teste."
          action={{
            label: 'Criar caso de teste',
            onClick: handleCreate,
          }}
        />
      )}

      {formOpen && (
        <TestCaseForm
          testCase={editingTestCase}
          projects={projects}
          onSave={handleSave}
          onCancel={handleCancelForm}
          saving={saving}
          error={formError}
        />
      )}

      {deletingTestCase && (
        <DeleteTestCaseConfirmDialog
          testCase={deletingTestCase}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          deleting={deleting}
          error={deleteError}
        />
      )}
    </div>
  );
};