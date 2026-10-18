import React, { useState, useEffect, useRef } from 'react';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { LoadingState } from '../components/ui/LoadingState.jsx';
import { ProjectTable } from '../components/projects/ProjectTable.jsx';
import { ProjectForm } from '../components/projects/ProjectForm.jsx';
import { DeleteConfirmDialog } from '../components/projects/DeleteConfirmDialog.jsx';
import {
  listProjects,
  createProject,
  updateProject,
  deleteProject,
} from '../services/projects.js';

export const Projects = () => {
  const isMounted = useRef(true);

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const [deletingProject, setDeletingProject] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const loadProjects = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await listProjects();
      if (isMounted.current) {
        setProjects(data);
        setLoading(false);
      }
    } catch (error) {
      if (isMounted.current) {
        setLoadError(error.message || 'Falha ao carregar projetos.');
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    isMounted.current = true;
    loadProjects();

    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleCreate = () => {
    setEditingProject(null);
    setFormError(null);
    setFormOpen(true);
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormError(null);
    setFormOpen(true);
  };

  const handleCancelForm = () => {
    setFormOpen(false);
    setEditingProject(null);
    setFormError(null);
  };

  const handleSave = async (data) => {
    setFormError(null);
    setSaving(true);

    try {
      if (editingProject) {
        await updateProject(editingProject.id, data);
      } else {
        await createProject(data);
      }

      if (isMounted.current) {
        await loadProjects();
        setFormOpen(false);
        setEditingProject(null);
        setSaving(false);
      }
    } catch (error) {
      if (isMounted.current) {
        setFormError(error.message || 'Erro ao salvar o projeto.');
        setSaving(false);
      }
    }
  };

  const handleDelete = (project) => {
    setDeletingProject(project);
    setDeleteError(null);
  };

  const handleCancelDelete = () => {
    setDeletingProject(null);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProject) return;

    setDeleteError(null);
    setDeleting(true);

    try {
      await deleteProject(deletingProject.id);

      if (isMounted.current) {
        await loadProjects();
        setDeletingProject(null);
        setDeleting(false);
      }
    } catch (error) {
      if (isMounted.current) {
        setDeleteError(error.message || 'Erro ao excluir o projeto.');
        setDeleting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="projects-page">
        <PageHeader
          title="Projetos"
          description="Gerencie os projetos de qualidade da sua organização."
        />
        <LoadingState message="Carregando projetos..." />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="projects-page">
        <PageHeader
          title="Projetos"
          description="Gerencie os projetos de qualidade da sua organização."
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
            onClick={loadProjects}
            className="btn btn-primary"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="projects-page">
      <PageHeader
        title="Projetos"
        description="Gerencie os projetos de qualidade da sua organização."
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
        {projects.length > 0 && (
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            {projects.length} projeto{projects.length !== 1 ? 's' : ''}
          </span>
        )}
        <button
          type="button"
          onClick={handleCreate}
          className="btn btn-primary"
          disabled={saving}
        >
          Novo Projeto
        </button>
      </div>

      {projects.length > 0 ? (
        <ProjectTable
          projects={projects}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <EmptyState
          title="Nenhum projeto encontrado"
          description="Comece criando o primeiro projeto."
          action={{
            label: 'Criar projeto',
            onClick: handleCreate,
          }}
        />
      )}

      {formOpen && (
        <ProjectForm
          project={editingProject}
          onSave={handleSave}
          onCancel={handleCancelForm}
          saving={saving}
          error={formError}
        />
      )}

      {deletingProject && (
        <DeleteConfirmDialog
          project={deletingProject}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          deleting={deleting}
          error={deleteError}
        />
      )}
    </div>
  );
};