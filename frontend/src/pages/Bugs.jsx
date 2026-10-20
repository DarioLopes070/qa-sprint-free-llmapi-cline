import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { LoadingState } from '../components/ui/LoadingState.jsx';
import { BugTable } from '../components/bugs/BugTable.jsx';
import { BugForm } from '../components/bugs/BugForm.jsx';
import { DeleteBugConfirmDialog } from '../components/bugs/DeleteBugConfirmDialog.jsx';
import {
  listBugs,
  createBug,
  updateBug,
  deleteBug,
} from '../services/bugs.js';
import { listProjects } from '../services/projects.js';
import { listTestCases } from '../services/testcases.js';

export const Bugs = () => {
  const isMounted = useRef(true);
  const newBugButtonRef = useRef(null);

  const SEVERITY_FILTER_OPTIONS = [
    { label: 'Todas as severidades', value: '' },
    { label: 'Baixa', value: 'Low' },
    { label: 'Média', value: 'Medium' },
    { label: 'Alta', value: 'High' },
    { label: 'Crítica', value: 'Critical' },
  ];

  const STATUS_FILTER_OPTIONS = [
    { label: 'Todos os status', value: '' },
    { label: 'Aberto', value: 'Open' },
    { label: 'Em Andamento', value: 'In Progress' },
    { label: 'Resolvido', value: 'Resolved' },
    { label: 'Fechado', value: 'Closed' },
  ];

  const [bugs, setBugs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [filters, setFilters] = useState({
    project_id: '',
    test_case_id: '',
    severity: '',
    status: '',
  });

  const [showForm, setShowForm] = useState(false);
  const [editingBug, setEditingBug] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(null);

  const [deletingBug, setDeletingBug] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const hasActiveFilters =
    filters.project_id !== '' ||
    filters.test_case_id !== '' ||
    filters.severity !== '' ||
    filters.status !== '';

  const loadAll = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [bugsData, projectsData, testCasesData] = await Promise.all([
        listBugs(filters),
        listProjects(),
        listTestCases(filters.project_id || undefined),
      ]);
      if (isMounted.current) {
        setBugs(bugsData);
        setProjects(projectsData);
        setTestCases(testCasesData);
        setLoading(false);
      }
    } catch (error) {
      if (isMounted.current) {
        setLoadError(error.message || 'Falha ao carregar bugs.');
        setLoading(false);
      }
    }
  }, [filters]);

  useEffect(() => {
    isMounted.current = true;

    loadAll();

    return () => {
      isMounted.current = false;
    };
  }, [loadAll]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && showForm && !saving) {
        handleCloseForm();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showForm, saving]);

  const handleOpenCreate = () => {
    setEditingBug(null);
    setSaveError(null);
    setSaveSuccess(null);
    setShowForm(true);
  };

  const handleOpenEdit = (bug) => {
    setEditingBug(bug);
    setSaveError(null);
    setSaveSuccess(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingBug(null);
    setSaveError(null);
    setSaveSuccess(null);
    if (newBugButtonRef.current) {
      newBugButtonRef.current.focus();
    }
  };

  const handleClearFilters = () => {
    setFilters({
      project_id: '',
      test_case_id: '',
      severity: '',
      status: '',
    });
  };

  const handleProjectChange = (event) => {
    const value = event.target.value;
    const projectId = value ? Number(value) : null;
    setFilters((prev) => ({
      ...prev,
      project_id: projectId === null ? '' : String(projectId),
      // Ao mudar o projeto, limpa a seleção anterior de Caso de Teste.
      test_case_id: '',
    }));
  };

  const handleOpenDelete = (bug) => {
    setDeletingBug(bug);
    setDeleteError(null);
  };

  const handleCancelDelete = () => {
    setDeletingBug(null);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingBug) return;

    setDeleteError(null);
    setDeleting(true);

    try {
      await deleteBug(deletingBug.id);

      if (isMounted.current) {
        await loadAll();
        setDeletingBug(null);
        setDeleting(false);
      }
    } catch (error) {
      if (isMounted.current) {
        setDeleteError(error.message || 'Erro ao excluir o bug.');
        setDeleting(false);
      }
    }
  };

  const handleSave = async (payload) => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(null);
    try {
      if (editingBug) {
        await updateBug(editingBug.id, payload);
      } else {
        await createBug(payload);
      }
      if (isMounted.current) {
        setSaveSuccess('Bug salvo com sucesso.');
      }
      try {
        await loadAll();
      } catch {
        if (isMounted.current) {
          setSaveSuccess(
            'Bug salvo com sucesso. Falha ao recarregar a lista; atualize a pagina para ver as alteracoes.'
          );
        }
      }
      handleCloseForm();
    } catch (error) {
      setSaveError(error.message || 'Falha ao salvar bug.');
    } finally {
      if (isMounted.current) {
        setSaving(false);
      }
    }
  };

  const headerActions = (
    <button
      ref={newBugButtonRef}
      type="button"
      onClick={handleOpenCreate}
      className="btn btn-primary"
      disabled={saving}
      style={{
        padding: '0.5rem 1rem',
        fontSize: '0.875rem',
        opacity: saving ? 0.6 : 1,
      }}
    >
      Novo Bug
    </button>
  );

  return (
    <div className="bugs-page">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          marginBottom: '1.5rem',
          gap: '1rem',
        }}
      >
        <div />
        <div style={{ textAlign: 'center' }}>
          <PageHeader
            title="Bugs"
            description="Registre e monitore bugs encontrados nos testes."
          />
        </div>
        <div style={{ textAlign: 'right' }}>{headerActions}</div>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Projeto:
          </label>
          <select
            value={filters.project_id === '' ? '' : String(filters.project_id)}
            onChange={handleProjectChange}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Caso de Teste:
          </label>
          <select
            value={
              filters.test_case_id === '' ? '' : String(filters.test_case_id)
            }
            onChange={(event) => {
              const value = event.target.value;
              setFilters((prev) => ({
                ...prev,
                test_case_id: value ? Number(value) : '',
              }));
            }}
            className="input"
            style={{
              fontSize: '0.875rem',
              padding: '0.375rem 0.75rem',
            }}
          >
            <option value="">Todos os casos de teste</option>
            {testCases
              .filter(
                (tc) =>
                  filters.project_id === '' ||
                  tc.project_id === Number(filters.project_id)
              )
              .map((testCase) => (
                <option key={testCase.id} value={testCase.id}>
                  {testCase.title}
                </option>
              ))}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Severidade:
          </label>
          <select
            value={filters.severity}
            onChange={(event) =>
              setFilters((prev) => ({
                ...prev,
                severity: event.target.value,
              }))
            }
            className="input"
            style={{
              fontSize: '0.875rem',
              padding: '0.375rem 0.75rem',
            }}
          >
            {SEVERITY_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Status:
          </label>
          <select
            value={filters.status}
            onChange={(event) =>
              setFilters((prev) => ({
                ...prev,
                status: event.target.value,
              }))
            }
            className="input"
            style={{
              fontSize: '0.875rem',
              padding: '0.375rem 0.75rem',
            }}
          >
            {STATUS_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {!loading && bugs.length > 0 && (
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            {bugs.length} bug{bugs.length !== 1 ? 's' : ''}
          </span>
        )}
        <button
          type="button"
          onClick={handleClearFilters}
          className="btn btn-outline"
          disabled={loading}
          style={{
            fontSize: '0.875rem',
            padding: '0.375rem 0.75rem',
            opacity: loading ? 0.6 : 1,
          }}
        >
          Limpar filtros
        </button>
      </div>

      {loading && <LoadingState message="Carregando bugs..." />}

      {loadError && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            padding: '0.75rem',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            maxWidth: '400px',
            marginBottom: '1rem',
          }}
        >
          <p style={{ margin: '0 0 1rem 0' }}>{loadError}</p>
          <button
            type="button"
            onClick={loadAll}
            className="btn btn-primary"
            style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!loading && !loadError && bugs.length === 0 && (
        <EmptyState
          title="Nenhum bug encontrado"
          description={
            hasActiveFilters
              ? 'Nenhum bug corresponde aos filtros selecionados.'
              : 'Nenhum bug foi cadastrado ainda.'
          }
          action={
            hasActiveFilters
              ? { label: 'Limpar filtros', onClick: handleClearFilters }
              : { label: 'Criar bug', onClick: handleOpenCreate }
          }
        />
      )}

      {!loading && !loadError && bugs.length > 0 && (
        <BugTable
          bugs={bugs}
          projects={projects}
          testCases={testCases}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          deleting={deleting}
        />
      )}

      {showForm && (
        <div
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <BugForm
            bug={editingBug}
            projects={projects}
            testCases={testCases}
            onSave={handleSave}
            onCancel={handleCloseForm}
            saving={saving}
            error={saveError}
          />
        </div>
      )}

      {saveSuccess && (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            backgroundColor: '#ecfdf5',
            border: '1px solid #bbf7d0',
            color: '#065f46',
            padding: '0.75rem',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            zIndex: 1100,
            maxWidth: '400px',
            animation: 'fadeIn 0.3s ease-out',
          }}
        >
          {saveSuccess}
        </div>
      )}

      {deletingBug && (
        <DeleteBugConfirmDialog
          bug={deletingBug}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          deleting={deleting}
          error={deleteError}
        />
      )}
    </div>
  );
};