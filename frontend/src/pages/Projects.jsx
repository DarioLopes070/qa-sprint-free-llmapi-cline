import React from 'react';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';

export const Projects = () => {
  return (
    <div className="projects-page">
      <PageHeader
        title="Projetos"
        description="Gerencie os projetos de qualidade da sua organização."
      />

      <EmptyState
        title="Aguardando integração com a API"
        description="A listagem de projetos será carregada a partir do endpoint /api/projects após a integração com o backend."
        action={{
          label: 'Voltar ao Dashboard',
          onClick: () => {
            window.location.href = '/';
          },
        }}
      />
    </div>
  );
};