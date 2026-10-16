import React from 'react';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';

export const TestExecutions = () => {
  return (
    <div className="executions-page">
      <PageHeader
        title="Execuções"
        description="Acompanhe o histórico de execuções de testes."
      />

      <EmptyState
        title="Aguardando integração com a API"
        description="O histórico de execuções será carregado a partir do endpoint /api/executions após a integração com o backend."
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