import React from 'react';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';

export const TestCases = () => {
  return (
    <div className="testcases-page">
      <PageHeader
        title="Casos de Teste"
        description="Cadastre e organize os casos de teste por projeto."
      />

      <EmptyState
        title="Aguardando integração com a API"
        description="A listagem de casos de teste será carregada a partir do endpoint /api/testcases após a integração com o backend."
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