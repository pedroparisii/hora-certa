# Hora Certa

Plataforma web para alunos de Bacharelado em Ciência da Computação da UFSCar
Sorocaba registrarem atividades complementares, acompanhar o progresso até as 90
horas e gerar o relatório de entrega em PDF, com os comprovantes anexados.

Feito para o Hackathon SeCoT XVIII. Não tem banco de dados por escolha: montar
um exigiria servidor e hospedagem durante o protótipo, então as atividades ficam
no `localStorage` e os comprovantes no IndexedDB do próprio navegador.

## Rodar

```bash
pnpm install
pnpm dev
```

Outros comandos:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## Telas

| Rota         | O que faz                                                          |
| ------------ | ------------------------------------------------------------------ |
| `/`          | Apresentação curta e entrada para o painel                         |
| `/sobre`     | Problema, solução, regras aplicadas, acessibilidade e roteiro      |
| `/painel`    | Régua de progresso, avisos de prazo, lista, relatório e backup     |
| `/avaliador` | Painel da comissão, uma prévia (fora da navegação principal)       |

## Como o código está organizado

- `lib/rules.ts` — constantes do curso e cálculos puros (semestre de validação,
  prazos, resumo de horas). Nenhuma regra dentro de componente.
- `lib/store.ts` — `localStorage` com `useSyncExternalStore`, mais as ações de
  criar, editar, excluir, importar e exportar.
- `lib/files.ts` — comprovantes no IndexedDB via `idb-keyval`.
- `lib/report.ts` — monta o requerimento e os comprovantes num PDF só, com
  `pdf-lib`, no próprio navegador.
- `lib/seed.ts` — atividades de exemplo e os comprovantes de `public/seed/`.
- `components/ui/` — componentes gerados pelo shadcn/ui.
- `components/layout/` — cabeçalho, rodapé e menu de acessibilidade.
- `components/shared/` — peças usadas em mais de uma página (campo, status,
  botão de comprovante).
- `components/painel/` e `components/avaliador/` — as telas de cada rota; a
  página em `app/` só define os metadados.

## Acessibilidade

O alvo é WCAG 2.2 AA: fonte Atkinson Hyperlegible Next, status sempre com ícone
e texto, contraste verificado nos dois temas, alvos de toque de 44 px, foco
visível, menu de tema e de tamanho do texto, e `axe-core` sem violações em todas
as páginas.
