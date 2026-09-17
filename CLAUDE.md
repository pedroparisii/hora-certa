# CLAUDE.md: Gestor de Atividades Complementares (Hackathon SeCoT XVIII)

Protótipo web navegável para o aluno de BCC da UFSCar Sorocaba registrar atividades complementares, acompanhar o progresso e gerar o relatório de entrega em PDF. Sem banco de dados por escolha: um banco exigiria servidor e hospedagem durante o protótipo, então tudo roda no navegador. Onde a UI mencionar `localStorage`/IndexedDB, deixar esse motivo explícito.

## Critérios (peso igual, 0–20 cada)

Utilidade · Praticidade · Acessibilidade · Criatividade · Qualidade do protótipo. Acessibilidade é requisito, não extra. A avaliação é anônima: **nenhum nome de integrante no site**.

## Stack

- Next.js (App Router) + TypeScript strict
- Tailwind CSS + shadcn/ui (Radix por baixo)
- `lucide-react` (ícones), `sonner` (toasts), `next-themes` (tema), `zod` (validação)
- `idb-keyval` para arquivos (IndexedDB). Metadados em `localStorage`
- `pdf-lib` para montar o relatório em PDF no cliente
- Deploy na Vercel

Não adicionar: react-hook-form, bibliotecas de estado, date-fns... Precisou de algo fora da lista? Pergunte antes.

Por que arquivos fora do localStorage: o limite é ~5 MB e base64 infla 33%. Dois PDFs quebram o app.

## Comandos

```bash
pnpm dev
pnpm lint
pnpm typecheck   # tsc --noEmit
pnpm build
```

Rodar `lint`, `typecheck` e `build` antes de considerar qualquer tarefa pronta.

## Estrutura

```
app/
  layout.tsx              # lang="pt-BR", fontes, ThemeProvider, skip link, Toaster
  page.tsx                # início
  sobre/page.tsx          # apresentação do projeto para a banca
  painel/page.tsx         # progresso + alertas + lista + card de relatório
  avaliador/page.tsx      # painel da comissão (prévia), fora da navegação
components/
  ui/                     # shadcn gerado, não editar à mão
  layout/                 # site-header, site-footer, a11y-menu
  shared/                 # campo, status-badge, comprovante-button
  painel/                 # painel-view, progress-overview, category-progress,
                          # deadline-alerts, report-card, data-tools
    atividades/           # activity-list/item/filters, activity-form/fields, file-field
  avaliador/              # avaliador-view, review-table, reject-dialog
lib/
  types.ts
  rules.ts                # constantes e cálculos puros, sem React
  store.ts                # localStorage + hook
  files.ts                # idb-keyval
  report.ts               # monta o PDF com pdf-lib, sem React
  schema.ts               # zod: formulário e importação
  seed.ts                 # dados de exemplo
public/
  seed/                   # comprovantes fictícios do seed (PDF e PNG)
```

Não precisa seguir 100% essa estruturua ela serve apenas de referencia.

## Modelo de dados

```ts
type Status = 'pendente' | 'em_analise' | 'aprovada' | 'recusada'

type Activity = {
  id: string            
  titulo: string
  categoria: CategoryId
  horas: number         
  data: string          
  status: Status
  arquivo: { id: string; nome: string; tipo: string; tamanho: number }
  motivoRecusa?: string
}
```

- Chave do storage: `ac:v2` → `Activity[]`.
- `expirada` **não é armazenado**: é derivado (status `pendente` com prazo vencido).
- **Comprovante é obrigatório.** Não existe atividade sem arquivo, nem no seed.
- O aluno controla o status no formulário, com três opções: `pendente` (padrão), `aprovada` e `recusada`. É um gestor pessoal: ele anota o que a secretaria respondeu.
- `em_analise` continua no tipo, mas só a página `/avaliador` define esse valor. Quando a atividade está `em_analise`, o select do formulário mostra esse status e o aluno pode trocá-lo pelas três opções.
- Nenhuma atividade fica travada: qualquer uma pode ser editada ou excluída.
- Botões "Exportar/Importar JSON" no painel reforçam a portabilidade e servem de backup.

## Regras de negócio (`lib/rules.ts`)

Constantes no topo do arquivo, fáceis de ajustar:

```ts
export const META_HORAS = 90
export const HORAS_POR_CREDITO = 15
export const TETO_HORAS_SEMESTRE = 60      // 4 créditos
export const MIN_CATEGORIAS = 2
export const AVISO_PRAZO_DIAS = 45
export const CATEGORIAS = [
  { id: 'ic', rotulo: 'IC / Desenvolvimento', descricao: 'Iniciação Científica (com ou sem bolsa) ou projetos de desenvolvimento tecnológico.' },
  { id: 'monitoria', rotulo: 'Monitoria', descricao: 'Monitoria acadêmica oficial no campus.' },
  { id: 'cursos', rotulo: 'Cursos / Extensão', descricao: 'Cursos de extensão acadêmica ou aperfeiçoamento profissional concluídos.' },
  { id: 'eventos', rotulo: 'Eventos Acadêmicos', descricao: 'Participação em congressos, simpósios, ciclos de palestras ou semanas acadêmicas.' },
  { id: 'producao', rotulo: 'Produção Científica', descricao: 'Publicação e/ou apresentação de artigos em eventos ou periódicos da área.' },
  { id: 'representacao', rotulo: 'Representação / Entidades', descricao: 'Cargos em CA/DA, Atlética, Empresa Júnior, PET ou representação discente em conselhos.' },
] as const

export type CategoryId = (typeof CATEGORIAS)[number]['id']
```

A `descricao` aparece como texto de ajuda no select do formulário, para o aluno saber onde encaixar o certificado.

Funções puras:

- `semestreDe(data)` → `"2026.2"` (jan–jun = 1, jul–dez = 2; simplificação documentada na UI).
- `prazoValidacao(data)` → último dia do semestre seguinte ao da atividade.
- `situacaoPrazo(activity, hoje)` → `ok | proximo | expirada`.
- `resumo(activities)` → horas aprovadas, horas em análise, horas por categoria, categorias atendidas, créditos, horas pendentes por semestre de validação.

Regras exibidas:

1. Progresso conta só `aprovada`. `em_analise` aparece como previsão ("+12 h em análise").
2. Meta cumprida só com ≥ 90 h **e** ≥ 2 categorias com horas aprovadas.
3. Aviso quando as horas pendentes de um mesmo semestre de validação passarem de 60 h.
4. Aviso para pendentes com prazo em até 45 dias. Expiradas ficam marcadas e não somam.

## Estado (`lib/store.ts`)

- `useActivities()` com `useSyncExternalStore`: `subscribe` ouve o evento `storage` e um evento próprio disparado a cada escrita.
- `getSnapshot` retorna referência estável (cachear o parse pela string bruta). `getServerSnapshot` retorna `null`; enquanto `null`, renderizar skeleton. Isso evita hydration mismatch sem `useEffect` + `mounted`.
- Primeira visita (chave ausente): gravar `seed.ts`. O avaliador abre em janela anônima e precisa ver o app com conteúdo.
- Ações: `add`, `update`, `remove`, `resetToSeed`, `clearAll`, `importJson`, `exportJson`.
- Excluir atividade também remove o arquivo do IndexedDB.

## Telas

**Início (`/`)**: o que é, para quem, três coisas que resolve (registrar, acompanhar prazos, gerar relatório), botão "Abrir meu painel" e o vídeo de demonstração (`public/demo-web.mp4`, versão comprimida do `Showcase.mp4`, com pôster `demo-poster.jpg`). O vídeo não toca sozinho e tem descrição em texto ao lado. Nada além disso: a explicação de armazenamento mora na Sobre e no painel.

**Sobre (`/sobre`)**: a entrega é só o link, então esta página faz o papel do "pitch". Link no header ("Sobre") e destaque na página inicial. Tom mais livre que o resto do app, mas cada seção precisa informar algo concreto. Seções:
1. Problema: certificados impressos, validação manual, prazos perdidos, falta de visibilidade. Curto, com base no edital e nas regras reais.
2. Solução em uma frase e o que o aluno ganha.
3. Fluxo passo a passo (é uma sequência real, então numeração faz sentido): registrar atividade com comprovante → acompanhar progresso e prazos → gerar o PDF do semestre → entregar à coordenação (impresso ou por e-mail) → atualizar o status no painel. Explicar que o PDF junta requerimento e comprovantes num arquivo só, pronto para a Comissão.
4. Regras do DComp-So que o sistema aplica: 90 h, 1 crédito = 15 h, 2 categorias mínimas, validação no semestre seguinte, teto de 4 créditos por semestre.
5. Acessibilidade: decisões concretas (fonte Atkinson Hyperlegible, status com ícone + texto, teclado, tema e tamanho do texto, linguagem simples, WCAG 2.2 AA). Algo bonito e comovente.
6. Proposta para a UFSCar: o painel da comissão como prévia de como os professores responsáveis poderiam validar direto pelo sistema. É o que atende ao item do edital de compartilhar com os professores por um painel de acesso.
7. Como testar: roteiro curto para a banca, com links diretos para `/painel` (incluindo o card de relatório) e `/avaliador`. Explica que os dados são de exemplo e ficam no navegador, e como restaurá-los.
8. Decisões e próximos passos: sem backend de propósito (funciona já, sem depender da UFSCar), modelo de status pronto para integração com o SIGA, exportação JSON. Limitações ditas com honestidade (dados por navegador, status anotado pelo próprio aluno).
9. Stack usada, representacao bonita.
Sem nomes da equipe. Sem depoimentos, números inventados ou métricas falsas.

**Painel (`/painel`)**

Ordem dos blocos: alertas → progresso total → minhas atividades → gerar relatório → "horas por categoria" e "meus dados" lado a lado (`md:grid-cols-2`, empilham no celular).

- Alertas de prazo e de teto semestral, no topo, só quando existirem.
- Régua de progresso total: 90 h dividida em 6 marcas de crédito (15 h cada). Esse é o elemento visual marcante do projeto; o resto fica quieto.
- Lista de atividades: busca por título, filtro por status e categoria, ordenação por data. Cada item: título, categoria, data, horas, status, prazo, arquivo (abrir/baixar), editar, excluir (com confirmação).
- Botão "Registrar atividade" abre o formulário.
- Estado vazio orienta a ação ("Nenhuma atividade ainda. Registre a primeira.").
- Card "Gerar relatório" (ver abaixo).
- Progresso por categoria e indicador de "2 categorias mínimas".
- "Meus dados": exportar/importar JSON, restaurar exemplo, apagar tudo. Diz por que não há banco de dados.

**Formulário (Dialog)**: título, categoria (select), carga horária (number), data (date, não futura), status (select) e comprovante (PDF/PNG/JPG, até 5 MB). Criar exige o arquivo; editar mantém o atual se nada for enviado, e substituir apaga o antigo do IndexedDB. "Motivo da recusa" é opcional e só aparece com status `recusada`. Validação com zod no submit via `FormData`. Erros abaixo do campo, ligados por `aria-describedby`; foco vai ao primeiro campo inválido. Toast "Atividade registrada" / "Atividade atualizada".

**Card "Gerar relatório" (em `/painel`)**
- Select de semestre de validação (padrão: o atual). O relatório inclui só as atividades `pendente` do semestre; não há filtro para mudar isso.
- Resumo da seleção em texto: quantidade de atividades, total de horas e créditos. Avisa se passar do teto de 60 h.
- Botão "Baixar PDF", desabilitado com explicação quando a seleção está vazia. Carregamento anunciado (`aria-busy` e texto).
- Uma linha de ajuda: o PDF serve para imprimir ou anexar ao e-mail da coordenação.
- A montagem fica em `lib/report.ts` (`pdf-lib`, sem React); o card só chama a função.

**PDF do relatório (`lib/report.ts`)**
- Página 1 (requerimento): título, semestre de validação, data de geração, campos em branco para nome e RA, tabela (nº, atividade, categoria, data, horas, status) e totais por categoria e geral, em horas e créditos. Helvetica.
- Depois, os comprovantes na ordem da tabela, cada um precedido de uma página "Comprovante nº X: título". PDFs entram por `copyPages`; PNG/JPG são embutidos numa página A4, ajustados à página.
- Comprovante que falhar (corrompido, protegido, ausente) não derruba o resto: o PDF sai assim mesmo e um toast lista o que ficou de fora.
- Nome do arquivo: `relatorio-ac-<semestre>.pdf` (ex.: `relatorio-ac-2026-2.pdf`).

**Painel da comissão (`/avaliador`)**
- Prévia de implementação futura: como a Comissão de Avaliação do DComp-So aprovaria as ACs direto pelo sistema. Banner no topo explicando isso em uma frase.
- Fora do header e do menu. Acesso por um link discreto no rodapé ("Painel da comissão"), para a banca conseguir achar. `metadata.robots = { index: false }`.
- Tabela simples: aluno não aparece (dados locais), só atividade, categoria, data, horas, comprovante (abrir) e status atual.
- Filtro por status, padrão "pendente + em análise".
- Ações por linha: "Iniciar análise", "Aprovar", "Recusar". Recusar abre um campo obrigatório de motivo. Toast confirma ("Atividade aprovada").
- Nada de login, senha ou papéis. Mesma exigência de acessibilidade das outras páginas.

## Acessibilidade (obrigatório, WCAG 2.2 AA)

- `lang="pt-BR"`, landmarks (`header`, `nav`, `main`), um `h1` por página, hierarquia de títulos correta.
- Skip link "Pular para o conteúdo".
- Tudo operável por teclado; foco visível e com contraste (`focus-visible:ring`), ordem lógica, foco retorna ao gatilho ao fechar o Dialog (Radix já faz; não quebrar).
- Contraste ≥ 4.5:1 em texto e ≥ 3:1 em componentes, nos dois temas.
- Status nunca só por cor: ícone + texto sempre.
- Barras de progresso com rótulo acessível e valor em texto ("54 de 90 horas, 3 de 6 créditos").
- Todo input com `<label>`; obrigatórios indicados em texto; erros anunciados.
- Toasts em região `aria-live` (sonner já faz); ações importantes também refletem na tela, não só no toast.
- Alvos de toque ≥ 44×44 px.
- `prefers-reduced-motion` respeitado; nenhuma animação automática.
- Menu de acessibilidade no header: tema (claro/escuro/sistema) e tamanho do texto (100/112,5/125% no `html`, salvo no localStorage). Layout não pode quebrar em 125% nem com zoom de 200%.
- Linguagem simples, frases curtas, uma ação principal por tela, confirmação antes de excluir (neurodivergentes e deficiência cognitiva).
- Nenhuma informação só em áudio/vídeo.
- Responsivo até 360 px; tabelas viram lista em telas pequenas.
- Verificar com Lighthouse (a11y = 100) e axe DevTools em todas as páginas, e navegar o fluxo inteiro só com teclado.

## Design

- Fonte: **Atkinson Hyperlegible Next** (via `next/font/google`) em tudo. Feita para leitores com baixa visão; é parte do argumento de acessibilidade.
- Paleta (tokens CSS do shadcn em `globals.css`, com equivalentes no tema escuro que mantenham o contraste):
  - fundo `#F6F7F9`, superfície `#FFFFFF`, texto `#17202A`, texto secundário `#4B5563`
  - primária `#0F5E6B` (azul-petróleo)
  - aprovada `#1E7B45`, em análise `#8A5A00`, recusada `#B42318`, pendente `#4B5563`
- Raio pequeno e consistente, sombras mínimas, bordas para separar. Nada de gradientes, blobs, glassmorphism, emojis, rótulos em CAIXA ALTA, "→" em botões.
- Largura de leitura ≤ 80 caracteres em textos corridos. Conteúdo alinhado à esquerda.
- Lembre-se de usar componentes do ShadcnUI, tem muita coisa...

## Texto da interface

- PT-BR, frase em caixa normal, voz ativa, direto. Botões dizem o que fazem ("Registrar atividade", "Imprimir relatório").
- Mesma palavra para a mesma ação em botão, título e toast.
- Proibido copy de marketing ("revolucione", "jornada", "de forma simples e intuitiva"), lorem ipsum e textos de preenchimento (Exceto na pagina de sobre onde vc tem mais liberadade).
- Erros dizem o que houve e como corrigir.

## Padrões de código

- Menos código é melhor. Componente passou de ~150 linhas → dividir ou simplificar.
- Server Components por padrão; `"use client"` só onde há estado, eventos ou storage.
- Estado derivado é calculado no render (ou `useMemo` se custoso), nunca sincronizado via `useEffect`.
- Lógica de regra fica em `lib/rules.ts`, nunca dentro de componente.
- Sem comentários óbvios, sem `console.log`, sem código morto, sem `any`, sem props/arquivos não usados.
- Nomes de domínio em português (`atividade`, `horas`), nomes técnicos em inglês (`useActivities`, `store`). Manter consistente.
- Não abstrair antes da segunda repetição.
- Não inventar funcionalidade que não existe.

## Ordem de execução

1. Setup: Next + Tailwind + shadcn, fonte, tokens, layout com header, skip link e menu de acessibilidade.
2. `types.ts`, `rules.ts`, `store.ts`, `seed.ts` e os comprovantes em `public/seed/`.
3. Painel: régua total, categorias, lista.
4. Formulário com comprovante obrigatório (`files.ts`) e campo de status.
5. Alertas de prazo e teto.
6. Painel da comissão (`/avaliador`).
7. `report.ts` e o card "Gerar relatório" no painel.
8. Início e Sobre.
9. Exportar/importar JSON, restaurar exemplo.
10. Passada de acessibilidade (teclado, Lighthouse, axe, zoom 200%, tema escuro).
11. Deploy na Vercel e teste do fluxo completo em janela anônima, desktop e celular.

## Pronto quando

- Não é possível criar atividade sem comprovante.
- Fluxo completo navegável: início → painel → registrar com comprovante → baixar o PDF do semestre → mudar o status (pelo formulário ou pelo painel da comissão) → painel reflete.
- O aluno troca o status entre pendente, aprovada e recusada; o painel da comissão coloca em análise, aprova e recusa.
- Seed aparece em janela anônima, com comprovantes, e o PDF gerado abre corretamente.
- Lighthouse a11y 100 em todas as páginas; zero erros no axe.
- `lint`, `typecheck` e `build` limpos.
- Nenhum nome da equipe no site.