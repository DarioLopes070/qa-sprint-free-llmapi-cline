import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { LoadingState } from "../components/ui/LoadingState.jsx";
import { TestExecutionTable } from "../components/testexecutions/TestExecutionTable.jsx";
import { TestExecutionForm } from "../components/testexecutions/TestExecutionForm.jsx";
import { DeleteTestExecutionConfirmDialog } from "../components/testexecutions/DeleteTestExecutionConfirmDialog.jsx";
import { listExecutions, createExecution, updateExecution, deleteExecution } from "../services/executions.js";
import { listTestCases } from "../services/testcases.js";

export const TestExecutions = () => {
  const isMounted = useRef(true);
  const [executions, setExecutions] = useState([]);
  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingExecution, setEditingExecution] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingExecution, setDeletingExecution] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [filterTestCaseId, setFilterTestCaseId] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const loadAll = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [executionsData, testCasesData] = await Promise.all([
        listExecutions(),
        listTestCases(),
      ]);
      if (isMounted.current) {
        setExecutions(executionsData);
        setTestCases(testCasesData);
        setLoading(false);
      }
    } catch (error) {
      if (isMounted.current) {
        setLoadError(error.message || "Falha ao carregar execuções.");
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;

    loadAll();

    return () => {
      isMounted.current = false;
    };
  }, [loadAll]);

  const handleOpenCreate = () => {
    setEditingExecution(null);
    setSaveError(null);
    setSaveSuccess(null);
    setShowForm(true);
  };

  const handleOpenEdit = (execution) => {
    setEditingExecution(execution);
    setSaveError(null);
    setSaveSuccess(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingExecution(null);
    setSaveError(null);
    setSaveSuccess(null);
  };

  const handleSave = async (payload) => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(null);
    try {
      if (editingExecution) {
        await updateExecution(editingExecution.id, payload);
      } else {
        await createExecution(payload);
      }
      setSaveSuccess("Execução salva com sucesso.");
      await loadAll();
      handleCloseForm();
    } catch (error) {
      setSaveError(error.message || "Falha ao salvar execução.");
    } finally {
      if (isMounted.current) {
        setSaving(false);
      }
    }
  };

  const filteredExecutions = useMemo(() => {
    return executions.filter((execution) => {
      if (filterTestCaseId && Number(execution.test_case_id) !== Number(filterTestCaseId)) {
        return false;
      }
      if (filterStatus && execution.status !== filterStatus) {
        return false;
      }
      return true;
    });
  }, [executions, filterTestCaseId, filterStatus]);

  const handleOpenDelete = (execution) => {
    setDeletingExecution({ ...execution, testCaseTitle: execution.test_case_id });
    setDeleteError(null);
    setShowDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setShowDeleteDialog(false);
    setDeletingExecution(null);
    setDeleteError(null);
    setIsDeleting(false);
  };

  const handleDelete = async () => {
    if (!deletingExecution) return;
    setDeleteError(null);
    setIsDeleting(true);
    try {
      await deleteExecution(deletingExecution.id);
      await loadAll();
      setSaveSuccess("Execução excluída com sucesso.");
      handleCloseDeleteDialog();
    } catch (error) {
      setDeleteError(error.message || "Falha ao excluir execução.");
    } finally {
      if (isMounted.current) {
        setIsDeleting(false);
      }
    }
  };

  const handleClearFilters = () => {
    setFilterTestCaseId("");
    setFilterStatus("");
  };

  if (loading) {
    return (
      <div className="executions-page">
        <PageHeader
          title="Execuções"
          description="Acompanhe o histórico de execuções de testes."
        />
        <LoadingState message="Carregando execuções..." />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="executions-page">
        <PageHeader
          title="Execuções"
          description="Acompanhe o histórico de execuções de testes."
        />
        <div
          style={{
            padding: "1.5rem",
            textAlign: "center",
            color: "#b91c1c",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "0.375rem",
            maxWidth: "400px",
            margin: "0 auto",
          }}
        >
          <p>{loadError}</p>
          <button type="button" onClick={loadAll} className="btn btn-primary">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="executions-page">
      <PageHeader
        title="Execuções"
        description="Acompanhe o histórico de execuções de testes."
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          {filteredExecutions.length}{' '}
          {filteredExecutions.length === 1 ? 'execução' : 'execuções'}
        </span>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <select
            value={filterTestCaseId}
            onChange={(e) => setFilterTestCaseId(e.target.value)}
            className="input"
            style={{ fontSize: '0.875rem', padding: '0.5rem 0.75rem' }}
          >
            <option value="">Todos os casos</option>
            {(testCases || []).map((tc) => (
              <option key={tc.id} value={tc.id}>
                {tc.title}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input"
            style={{ fontSize: '0.875rem', padding: '0.5rem 0.75rem' }}
          >
            <option value="">Todos os status</option>
            <option value="Passed">Aprovado</option>
            <option value="Failed">Reprovado</option>
            <option value="Blocked">Bloqueado</option>
            <option value="Not Run">Não executado</option>
          </select>
          <button
            type="button"
            onClick={handleClearFilters}
            className="btn btn-outline"
            disabled={!filterTestCaseId && !filterStatus}
            style={{
              fontSize: '0.875rem',
              padding: '0.5rem 0.75rem',
              opacity: (!filterTestCaseId && !filterStatus) ? 0.6 : 1,
            }}
          >
            Limpar filtros
          </button>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="btn btn-primary"
            disabled={testCases.length === 0}
          >
            Nova Execução
          </button>
        </div>
      </div>

      {testCases.length === 0 && (
        <div
          style={{
            padding: '1rem',
            textAlign: 'center',
            color: '#6b7280',
            backgroundColor: '#f3f4f6',
            borderRadius: '0.375rem',
            marginBottom: '1rem',
            maxWidth: '400px',
          }}
        >
          <p>Não há casos de teste cadastrados. Cadastre um caso antes de criar uma execução.</p>
        </div>
      )}

      {executions.length === 0 && (
        <EmptyState
          title="Nenhuma execução encontrada"
          description="Comece registrando a primeira execução de teste."
        />
      )}

      {executions.length > 0 && filteredExecutions.length === 0 && (
        <EmptyState
          title="Nenhuma execução encontrada para os filtros selecionados."
          description="Ajuste os filtros ou clique em Limpar filtros para ver todas as execuções."
        />
      )}

      {executions.length > 0 && filteredExecutions.length > 0 ? (
        <TestExecutionTable
          executions={filteredExecutions}
          testCases={testCases}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
        />
      ) : null}

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
          <TestExecutionForm
            execution={editingExecution}
            testCases={testCases}
            onSave={handleSave}
            onCancel={handleCloseForm}
            saving={saving}
            error={saveError}
          />
        </div>
      )}

      {showDeleteDialog && (
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
            zIndex: 1100,
            padding: '1rem',
          }}
        >
          <DeleteTestExecutionConfirmDialog
            execution={deletingExecution}
            onConfirm={handleDelete}
            onCancel={handleCloseDeleteDialog}
            deleting={isDeleting}
            error={deleteError}
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
    </div>
  );
};
