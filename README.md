# QA Sprint

Plataforma de gestão de qualidade de software (QA) para cadastro e acompanhamento de projetos, casos de teste, execuções e bugs. Conta com uma API em Flask (backend Python) e um frontend em React (Vite), integrados por serviços HTTP e consumindo um banco de dados SQLite.

## Objetivo

Fornecer um sistema leve para equipes de QA gerenciarem o ciclo de qualidade de software:

* **Projetos** — cadastro e organização dos projetos de qualidade.
* **Casos de Teste** — definição de casos de teste vinculados a projetos.
* **Execuções de Teste** — registro do resultado da execução de cada caso de teste.
* **Bugs** — registro, filtragem e acompanhamento de bugs encontrados nos testes.
* **Dashboard** — visão geral com indicadores de projetos, casos de teste, execuções e bugs.

## Tecnologias utilizadas

* **Backend:** Flask, Flask-SQLAlchemy, SQLite, Pytest.
* **Frontend:** React 18, Vite, react-router-dom, prop-types.
* **Qualidade de código:** ESLint.

## Estrutura principal de diretórios

```qa-sprint-free-llmapi-cline/
├── app/                          # Backend Flask (fábrica create_app)
│   ├── __init__.py               # Cria a aplicação e registra os blueprints
│   ├── config.py                 # Configurações (Development / Testing)
│   ├── extensions.py             # Instância SQLAlchemy e PRAGMA foreign_keys
│   ├── models.py                 # Modelos Project, TestCase, TestExecution, Bug
│   ├── blueprints/
│   │   ├── projects/             # CRUD de projetos (/api/projects)
│   │   ├── testcases/            # CRUD de casos de teste (/api/testcases)
│   │   ├── test_executions/      # CRUD de execuções (/api/executions)
│   │   └── bugs/                 # CRUD de bugs (/api/bugs)
│   └── ...
├── frontend/                     # Frontend React (Vite)
│   ├── src/
│   │   ├── App.jsx               # Rotas da aplicação
│   │   ├── pages/                # Dashboard, Projects, TestCases, TestExecutions, Bugs, NotFound
│   │   ├── components/           # UI (StatCard, EmptyState, LoadingState, PageHeader), layout, bugs
│   │   └── services/             # Camada de serviço HTTP (api.js, projects, testcases, executions, bugs)
│   ├── package.json
│   └── vite.config.js
├── tests/                        # Testes automatizados (Pytest)
├── instance/                     # Instância do Flask (banco SQLite local em desenvolvimento)
├── venv/                         # Ambiente virtual Python
├── node_modules/                 # Dependências do frontend
├── .gitignore
├── AGENTS.md                     # Convenções de interface (coluna Ações em tabelas)
├── pytest.ini
└── requirements.txt
```

## Pré-requisitos

* Python 3 (recomendado 3.10+)
* Node.js e npm (recomendado Node 18+)
* Git

## Instalação e configuração do backend

1. Crie e ative o ambiente virtual Python:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

1. Instale as dependências Python:

```powershell
pip install -r requirements.txt
```

1. Defina as variáveis de ambiente necessárias (exemplo no PowerShell):

```powershell
$env:FLASK_APP = 'app'
$env:FLASK_ENV = 'development'
```

> A aplicação utiliza a fábrica `create_app()` definida em `app/__init__.py`. Em desenvolvimento, o banco SQLite é criado automaticamente no diretório `instance/`.

1. Inicie o servidor Flask:

```powershell
flask run
```

O backend ficará disponível em `http://localhost:5000` (ou na porta informada pelo Flask).

## Instalação e configuração do frontend

1. Acesse o diretório do frontend:

```powershell
cd frontend
```

1. Instale as dependências:

```powershell
npm install
```

1. Inicie o servidor de desenvolvimento (Vite):

```powershell
npm run dev
```

O frontend ficará disponível em `http://localhost:5173` (ou na porta informada pelo Vite).

> A URL base da API é lida da variável de ambiente `VITE_API_BASE_URL`. Caso não esteja definida, o frontend consome `/api` no mesmo host, esperando que o backend esteja rodando localmente ou atrás de um proxy.

## Rotas da aplicação (frontend)

| Rota | Página |
| ------ | -------- |
| `/` | Dashboard |
| `/projects` | Projetos |
| `/testcases` | Casos de Teste |
| `/executions` | Execuções de Teste |
| `/bugs` | Bugs |

## Rotas da API (backend)

| Recurso | Endpoints |
| --------- | ----------- |
| Projetos | `GET/POST /api/projects`, `GET/PUT/DELETE /api/projects/:id` |
| Casos de Teste | `GET/POST /api/testcases`, `GET/PUT/DELETE /api/testcases/:id` (filtro opcional `?project_id=`) |
| Execuções | `GET/POST /api/executions`, `GET/PUT/DELETE /api/executions/:id` (filtro opcional `?test_case_id=`) |
| Bugs | `GET/POST /api/bugs`, `GET/PUT/DELETE /api/bugs/:id` (filtros opcionais `?project_id=`, `?test_case_id=`, `?severity=`, `?status=`) |

## Funcionalidades

### Projetos

* Listar, criar, editar e excluir projetos.
* Nome obrigatório (máximo 255 caracteres) e descrição opcional.

### Casos de Teste

* Listar, criar, editar e excluir casos de teste vinculados a um projeto.
* Campos: título, descrição, passos, resultado esperado e prioridade (Baixa/Média/Alta).
* Filtro por projeto.

### Execuções de Teste

* Registrar a execução de um caso de teste com status (Aprovado/Reprovado/Bloqueado/Não executado), responsável, resultado real e observações.

### Bugs

* Listar, criar, editar e excluir bugs vinculados a projetos e (opcionalmente) a casos de teste.
* Campos: título, descrição, severidade (Baixa/Média/Alta/Crítica) e status (Aberto/Em Andamento/Resolvido/Fechado).
* Filtros por projeto, caso de teste, severidade e status.
* Validações: projeto obrigatório, título obrigatório (máximo 255 caracteres), caso de teste deve pertencer ao projeto selecionado.

### Dashboard

* Indicadores de projetos, casos de teste, execuções (aprovadas/reprovadas/bloqueadas) e bugs.
* Indicadores de bugs: total, abertos, em andamento, resolvidos, fechados e distribuição por severidade (baixa/média/alta/crítica).
* Carregamento com tratamento de erro parcial (uma falha na API não derruba os demais indicadores).
* Navegação para a página de Bugs a partir dos indicadores.

## Comandos úteis

### Backend (raiz do projeto)

```powershell
# Executar os testes automatizados
python -m pytest
```

### Frontend (dentro do diretório frontend/)

```powershell
cd frontend

# Servidor de desenvolvimento
npm run dev

# Lint (ESLint)
npm run lint

# Build de produção
npm run build

# Preview do build de produção
npm run preview
```

## Observações sobre desenvolvimento local

* O banco de dados em desenvolvimento é um arquivo SQLite gerado automaticamente no diretório `instance/` (ignorado pelo Git).
* O diretório `frontend/dist/` é gerado pelo build do Vite e é ignorado pelo Git.
* Ambientes virtuais (`venv/`, `node_modules/`) e caches não são versionados.
* Não versionar arquivos `.env` ou credenciais. A leitura de segredos deve ser feita exclusivamente por variáveis de ambiente.
* Os rótulos da interface são exibidos em português; os valores técnicos (status e severidades) são preservados em inglês no banco e na API.
* Este projeto não utiliza bibliotecas de gráficos externos; os indicadores do Dashboard são renderizados com o componente `StatCard` existente.
* **Novo endpoint de teste:** `GET /health` retorna HTTP 200 e JSON `{"status": "ok"}`.
* **Testes automatizados:** executar `python -m pytest` na raiz do projeto. O teste `test_health.py` valida tanto o código HTTP quanto o conteúdo JSON do endpoint.
