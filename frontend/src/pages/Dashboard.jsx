import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { StatCard } from '../components/ui/StatCard.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { listProjects } from '../services/projects.js';
import { listTestCases } from '../services/testcases.js';

export const Dashboard = () => {
  const [projectsCount, setProjectsCount] = useState(null);
  const [testCasesCount, setTestCasesCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    const loadCounts = async () => {
      setLoading(true);
      setError(null);
      try {
        const [projectsResult, testCasesResult] = await Promise.allSettled([
          listProjects(),
          listTestCases(),
        ]);
        let firstError = null;

        if (isMounted) {
          if (projectsResult.status === 'fulfilled') {
            setProjectsCount(projectsResult.value.length);
          } else {
            setProjectsCount(null);
            firstError = projectsResult.reason.message || 'Falha ao carregar projetos.';
          }

          if (testCasesResult.status === 'fulfilled') {
            setTestCasesCount(testCasesResult.value.length);
          } else {
            setTestCasesCount(null);
            if (!firstError) {
              firstError = testCasesResult.reason.message || 'Falha ao carregar casos de teste.';
            }
          }

          if (firstError) {
            setError(firstError);
          }

          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Falha ao carregar métricas.');
          setLoading(false);
          setProjectsCount(null);
          setTestCasesCount(null);
        }
      }
    };

    loadCounts();

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  const projectsStatValue = loading ? '-' : projectsCount;
  const testCasesStatValue = loading ? '-' : testCasesCount;
  const statStatus = loading
    ? 'pending'
    : error
      ? 'error'
      : projectsCount > 0
        ? 'ok'
        : 'warning';

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Dashboard"
        description="Visão geral das atividades de qualidade e métricas do sistema."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard label="Projetos" value={projectsStatValue} status={statStatus} />
        <StatCard label="Casos de Teste" value={testCasesStatValue} status={statStatus} />
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