# Convenções de Interface — Tabelas com Coluna de Ações

Este documento estabelece o padrão para implementação de colunas "Ações" em tabelas do sistema (Casos de Teste, Projetos, Execuções de Teste, Bugs e futuras páginas).

## Alinhamento da coluna "Ações"

O objetivo é que o centro horizontal do texto "Ações" coincida com o centro horizontal do conjunto de botões (ex.: "Editar" e "Excluir") da mesma coluna.

### Regras obrigatórias

1. **Centralização horizontal**: Tanto o cabeçalho "Ações" quanto os botões devem usar `textAlign: 'center'` em contêineres internos, de modo que compartilhem o mesmo eixo central da coluna.

2. **Contêiner dos botões**: Agrupar os botões em um `<div>` com `display: 'inline-flex'`, `alignItems: 'center'` e `gap: '0.5rem'`.

3. **Espaçamento entre botões**: Controlado exclusivamente por `gap: '0.5rem'` no contêiner `inline-flex`. Não usar `margin-right` nos botões individuais.

4. **Elementos `<th>` e `<td>`**: Manter comportamento nativo de tabela. **Não aplicar `display: 'flex'` diretamente nos elementos `<th>` e `<td>`.** Eles devem usar apenas os estilos de célula/cabeçalho existentes (`cellStyle` / `headerStyle`).

5. **Wrapper interno**: Tanto o texto "Ações" no cabeçalho quanto o grupo de botões na célula devem ser envolvidos por `<div style={{ textAlign: 'center' }}>` para centralização.

6. **Responsividade**: Preservar `overflowX: 'auto'` e `minWidth: '640px'` no container da tabela.

7. **Acessibilidade**: Manter `aria-label` nos botões e `scope="col"` nos cabeçalhos.

8. **Estilos dos botões**: Preservar cores, bordas, padding e fontSize existentes de cada botão. Não alterar a aparência visual dos botões, apenas seu agrupamento e alinhamento.

### Estrutura de referência (aprovada no TestCaseTable.jsx e replicada no ProjectTable.jsx)

```jsx
<th scope="col" style={headerStyle}>
  <div style={{ textAlign: 'center' }}>Ações</div>
</th>
```

```jsx
<td style={cellStyle}>
  <div style={{ textAlign: 'center' }}>
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
      <button type="button" onClick={onEdit} ...>Editar</button>
      <button type="button" onClick={onDelete} ...>Excluir</button>
    </div>
  </div>
</td>
```

### O que NÃO fazer

- Não usar `justifyContent: 'flex-end'` ou `textAlign: 'right'` na coluna "Ações".
- Não aplicar `display: 'flex'` diretamente em `<th>` ou `<td>`.
- Não usar margens arbitrárias, `position: relative`, `transform: translateX` ou qualquer deslocamento manual para simular alinhamento.

### Aplicabilidade

Este padrão deve ser reutilizado em todas as futuras tabelas com colunas de ação, incluindo:

- Tabela de Execuções de Testes
- Tabela de Bugs
- Qualquer nova tabela com botões de ação

Não criar componentes compartilhados nem refatorar tabelas existentes apenas para aplicar este padrão. Aplicar somente em novas implementações ou quando houver correção visual solicitada.
