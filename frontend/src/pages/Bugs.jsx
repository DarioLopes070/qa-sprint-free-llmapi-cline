import React from 'react';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';

export const Bugs = () => {
  return (
    <div className="bugs-page">
      <PageHeader
        title="Bugs"
        description="Registre e monitore bugs encontrados nos testes."
      />

      <EmptyState
        title="Aguardando integração com a API"
        description="A listagem de bugs será carregada a partir do endpoint /api/bugs após a integração com o backend."
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