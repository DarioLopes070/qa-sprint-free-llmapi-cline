import React from 'react';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { StatCard } from '../components/ui/StatCard.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';

export const Dashboard = () => {
  return (
    <div className="dashboard-page">
      <PageHeader
        title="Dashboard"
        description="Visão geral das atividades de qualidade e métricas do sistema."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard label="Projetos" value="0" status="pending" />
        <StatCard label="Casos de Teste" value="0" status="pending" />
        <StatCard label="Execuções" value="0" status="pending" />
        <StatCard label="Bugs" value="0" status="pending" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        <section
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', marginBottom: '1rem' }}>
            Indicadores de Qualidade
          </h3>
          <EmptyState
            title="Aguardando integração com a API"
            description="Os indicadores de qualidade serão exibidos aqui após a integração com os endpoints do backend."
          />
        </section>

        <section
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', marginBottom: '1rem' }}>
            Execuções Recentes
          </h3>
          <EmptyState
            title="Nenhuma execução recente"
            description="As execuções recentes aparecerão aqui após a integração com a API de execuções."
          />
        </section>

        <section
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', marginBottom: '1rem' }}>
            Bugs por Severidade
          </h3>
          <EmptyState
            title="Sem dados de bugs"
            description="A distribuição de bugs por severidade será exibida após a integração com a API de bugs."
          />
        </section>

        <section
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', marginBottom: '1rem' }}>
            Atividades Recentes
          </h3>
          <EmptyState
            title="Nenhuma atividade recente"
            description="O feed de atividades será populado após a integração com o backend."
          />
        </section>
      </div>

      <div
        style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <span style={{ fontSize: '1.5rem' }}>ℹ️</span>
        <div>
          <p style={{ fontSize: '0.875rem', color: '#1e40af', fontWeight: 500, margin: 0 }}>
            Em desenvolvimento
          </p>
          <p style={{ fontSize: '0.75rem', color: '#1e40af', margin: '0.25rem 0 0 0' }}>
            Use o menu lateral para navegar entre Projetos, Casos de Teste, Execuções e Bugs.
          </p>
        </div>
      </div>
    </div>
  );
};