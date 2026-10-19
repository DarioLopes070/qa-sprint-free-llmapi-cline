import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { StatCard } from '../components/ui/StatCard.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { LoadingState } from '../components/ui/LoadingState.jsx';
import { listProjects } from '../services/projects.js';
import { listTestCases } from '../services/testcases.js';
import { listExecutions } from '../services/executions.js';

const STATUS_LABELS = {
  Passed: 'Aprovado',
  Failed: 'Reprovado',
  Blocked: 'Bloqueado',
  'Not Run': 'Não executado',
};

const STATUS_BADGE_STYLE = (status) => {
  const base = {
    display: 'inline-block',
    padding: '0.125rem 0.5rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 600,
  };

  switch (status) {
    case 'Passed':
      return { ...base, backgroundColor: '#ecfdf5', color: '#059669' };
    case 'Failed':
      return { ...base, backgroundColor: '#fef2f2', color: '#b91c1c' };
    case 'Blocked':
      return { ...base, backgroundColor: '#fefce8', color: '#854d0e' };
    case 'Not Run':
      return { ...base, backgroundColor: '#f3f4f6', color: '#6b7280' };
    default:
      return { ...base, backgroundColor: '#f3f4f6', color: '#6b7280' };
  }
};

const formatDateTimeBrazilian = (isoString) => {
  if (!isoString) return '—';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  } catch {
    return '—';
  }
};

export const Dashboard = () => {
  const [projectsCount, setProjectsCount] = useState(null);
  const [testCasesCount, setTestCasesCount] = useState(null);
  const [testCasesList, setTestCasesList] = useState([]);
  const [executions, setExecutions] = useState([]);
  const [executionsLoaded, setExecutionsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  const loadCounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    setExecutionsLoaded(false);
    try {
      const [projectsResult, testCasesResult, executionsResult] = await Promise.allSettled([
        listProjects(),
        listTestCases(),
        listExecutions(),
      ]);
      let firstError = null;

      if (projectsResult.status === 'fulfilled') {
        setProjectsCount(projectsResult.value.length);
      } else {
        setProjectsCount(null);
        firstError = projectsResult.reason.message || 'Falha ao carregar projetos.';
      }

      if (testCasesResult.status === 'fulfilled') {
        const tcList = testCasesResult.value;
        setTestCasesCount(tcList.length);
        setTestCasesList(tcList);
      } else {
        setTestCasesCount(null);
        setTestCasesList([]);
        if (!firstError) {
          firstError = testCasesResult.reason.message || 'Falha ao carregar casos de teste.';
        }
      }

      if (executionsResult.status === 'fulfilled') {
        setExecutions(executionsResult.value);
        setExecutionsLoaded(true);
      } else {
        setExecutions([]);
        setExecutionsLoaded(false);
        if (!firstError) {
          firstError = executionsResult.reason.message || 'Falha ao carregar execuções.';
        }
      }

      if (firstError) {
        setError(firstError);
      }

      setLoading(false);
    } catch (err) {
      setError(err.message || 'Falha ao carregar métricas.');
      setLoading(false);
      setExecutionsLoaded(false);
      setProjectsCount(null);
      setTestCasesCount(null);
      setExecutions([]);
    }
  }, []);

  useEffect(() => {
    loadCounts();
  }, [location.pathname, loadCounts]);

  const totalExecutions = executions.length;
  const passedExecutions = executions.filter((e) => e.status === 'Passed').length;
  const failedExecutions = executions.filter((e) => e.status === 'Failed').length;
  const blockedExecutions = executions.filter((e) => e.status === 'Blocked').length;

  const testCaseMap = new Map();
  testCasesList.forEach((tc) => testCaseMap.set(tc.id, tc.title));

  const recentExecutions = [...executions]
    .sort((a, b) => new Date(b.executed_at) - new Date(a.executed_at))
    .slice(0, 5);

  const projectsStatValue = loading ? '-' : projectsCount;
  const testCasesStatValue = loading ? '-' : testCasesCount;
  const executionsStatValue = executionsLoaded ? totalExecutions : '-';
  const passedStatValue = executionsLoaded ? passedExecutions : '-';
  const failedStatValue = executionsLoaded ? failedExecutions : '-';
  const blockedStatValue = executionsLoaded ? blockedExecutions : '-';

  const statStatus = loading
    ? 'pending'
    : error
      ? 'error'
      : projectsCount > 0 || testCasesCount > 0 || totalExecutions > 0
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
        <StatCard label="Execuções" value={executionsStatValue} status={statStatus} />
        <StatCard label="Aprovadas" value={passedStatValue} status={statStatus} />
        <StatCard label="Reprovadas" value={failedStatValue} status={statStatus} />
        <StatCard label="Bloqueadas" value={blockedStatValue} status={statStatus} />
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', margin: 0 }}>
              Últimas Execuções
            </h3>
            <Link
              to="/executions"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: '#2563eb',
                color: '#ffffff',
                borderRadius: '0.375rem',
                fontWeight: 500,
                fontSize: '0.875rem',
                textDecoration: 'none',
              }}
            >
              <span>→</span> Ver todas
            </Link>
          </div>

          {loading ? (
            <LoadingState message="Carregando execuções..." />
          ) : error ? (
            <div
              style={{
                padding: '1rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                textAlign: 'center',
              }}
            >
              <p style={{ margin: '0 0 0.75rem 0' }}>{error}</p>
              <button
                type="button"
                onClick={loadCounts}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#2563eb',
                  background: 'transparent',
                  border: '1px solid #2563eb',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                }}
              >
                Tentar novamente
              </button>
            </div>
          ) : executions.length === 0 ? (
            <EmptyState
              title="Nenhuma execução cadastrada"
              description="Ainda não existem execuções de teste no sistema."
              icon="📭"
            />
          ) : (
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              {recentExecutions.map((execution) => (
                <li
                  key={execution.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                    padding: '0.75rem',
                    borderBottom: '1px solid #f3f4f6',
                    fontSize: '0.875rem',
                    color: '#374151',
                  }}
                >
                  <div style={{ fontWeight: 600, color: '#111827' }}>Execução #{execution.id}</div>
                  <div>
                    Caso de Teste:{' '}
                    {testCaseMap.get(execution.test_case_id) || `Caso #${execution.test_case_id}`}
                  </div>
                  <div>
                    Status:{' '}
                    <span style={STATUS_BADGE_STYLE(execution.status)}>
                      {STATUS_LABELS[execution.status] || execution.status}
                    </span>
                  </div>
                  <div>
                    Executado em:{' '}
                    {formatDateTimeBrazilian(execution.executed_at)}
                  </div>
                  <div>Responsável: {execution.executed_by || '—'}</div>
                </li>
              ))}
            </ul>
          )}
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