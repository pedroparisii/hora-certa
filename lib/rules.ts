import type { Activity, Status } from "@/lib/types"

export const META_HORAS = 90
export const HORAS_POR_CREDITO = 15
export const TETO_HORAS_SEMESTRE = 60
export const MIN_CATEGORIAS = 2
export const AVISO_PRAZO_DIAS = 45

export const CATEGORIAS = [
  {
    id: "ic",
    rotulo: "IC / Desenvolvimento",
    descricao:
      "Iniciação Científica (com ou sem bolsa) ou projetos de desenvolvimento tecnológico.",
  },
  {
    id: "monitoria",
    rotulo: "Monitoria",
    descricao: "Monitoria acadêmica oficial no campus.",
  },
  {
    id: "cursos",
    rotulo: "Cursos / Extensão",
    descricao:
      "Cursos de extensão acadêmica ou aperfeiçoamento profissional concluídos.",
  },
  {
    id: "eventos",
    rotulo: "Eventos Acadêmicos",
    descricao:
      "Participação em congressos, simpósios, ciclos de palestras ou semanas acadêmicas.",
  },
  {
    id: "producao",
    rotulo: "Produção Científica",
    descricao:
      "Publicação e/ou apresentação de artigos em eventos ou periódicos da área.",
  },
  {
    id: "representacao",
    rotulo: "Representação / Entidades",
    descricao:
      "Cargos em CA/DA, Atlética, Empresa Júnior, PET ou representação discente em conselhos.",
  },
] as const

export type CategoryId = (typeof CATEGORIAS)[number]["id"]

export const STATUS = ["pendente", "em_analise", "aprovada", "recusada"] as const

/** Status que o aluno controla no formulário. `em_analise` vem do painel da comissão. */
export const STATUS_ALUNO = ["pendente", "aprovada", "recusada"] as const

export const STATUS_ROTULO: Record<Status, string> = {
  pendente: "Pendente",
  em_analise: "Em análise",
  aprovada: "Aprovada",
  recusada: "Recusada",
}

export type SituacaoPrazo = "ok" | "proximo" | "expirada"

export function rotuloCategoria(id: CategoryId): string {
  return CATEGORIAS.find((categoria) => categoria.id === id)!.rotulo
}

export function hojeISO(): string {
  const agora = new Date()
  const mes = String(agora.getMonth() + 1).padStart(2, "0")
  const dia = String(agora.getDate()).padStart(2, "0")
  return `${agora.getFullYear()}-${mes}-${dia}`
}

export function formatarData(data: string): string {
  const [ano, mes, dia] = data.split("-")
  return `${dia}/${mes}/${ano}`
}

export function plural(
  quantidade: number,
  singular: string,
  varios: string,
): string {
  return `${quantidade} ${quantidade === 1 ? singular : varios}`
}

function diasEntre(inicio: string, fim: string): number {
  const umDia = 24 * 60 * 60 * 1000
  return Math.round((Date.parse(fim) - Date.parse(inicio)) / umDia)
}

/** Semestre em que a atividade foi realizada: jan–jun = 1, jul–dez = 2. */
export function semestreDe(data: string): string {
  const [ano, mes] = data.split("-")
  return `${ano}.${Number(mes) <= 6 ? 1 : 2}`
}

/** As atividades são validadas no semestre seguinte ao de realização. */
export function semestreValidacao(data: string): string {
  const [ano, periodo] = semestreDe(data).split(".")
  return periodo === "1" ? `${ano}.2` : `${Number(ano) + 1}.1`
}

/** Último dia do semestre de validação. */
export function prazoValidacao(data: string): string {
  const [ano, periodo] = semestreValidacao(data).split(".")
  return periodo === "1" ? `${ano}-06-30` : `${ano}-12-31`
}

export function situacaoPrazo(activity: Activity, hoje: string): SituacaoPrazo {
  if (activity.status !== "pendente") return "ok"
  const prazo = prazoValidacao(activity.data)
  if (prazo < hoje) return "expirada"
  return diasEntre(hoje, prazo) <= AVISO_PRAZO_DIAS ? "proximo" : "ok"
}

export function creditosDe(horas: number): number {
  return Math.floor(horas / HORAS_POR_CREDITO)
}

type ResumoCategoria = {
  id: CategoryId
  rotulo: string
  horasAprovadas: number
  horasEmAnalise: number
}

export type Resumo = {
  horasAprovadas: number
  horasEmAnalise: number
  horasRestantes: number
  creditos: number
  categorias: ResumoCategoria[]
  categoriasAtendidas: number
  metaCumprida: boolean
  /** Horas ainda não avaliadas, agrupadas pelo semestre em que serão validadas. */
  porSemestre: { semestre: string; horas: number }[]
}

export function resumo(activities: Activity[], hoje: string): Resumo {
  const categorias: ResumoCategoria[] = CATEGORIAS.map((categoria) => ({
    id: categoria.id,
    rotulo: categoria.rotulo,
    horasAprovadas: 0,
    horasEmAnalise: 0,
  }))

  const semestres = new Map<string, number>()
  let horasAprovadas = 0
  let horasEmAnalise = 0

  for (const activity of activities) {
    const categoria = categorias.find((item) => item.id === activity.categoria)

    if (activity.status === "aprovada") {
      horasAprovadas += activity.horas
      if (categoria) categoria.horasAprovadas += activity.horas
      continue
    }

    if (activity.status === "recusada") continue
    if (situacaoPrazo(activity, hoje) === "expirada") continue

    if (activity.status === "em_analise") {
      horasEmAnalise += activity.horas
      if (categoria) categoria.horasEmAnalise += activity.horas
    }

    const semestre = semestreValidacao(activity.data)
    semestres.set(semestre, (semestres.get(semestre) ?? 0) + activity.horas)
  }

  const categoriasAtendidas = categorias.filter(
    (categoria) => categoria.horasAprovadas > 0,
  ).length

  return {
    horasAprovadas,
    horasEmAnalise,
    horasRestantes: Math.max(0, META_HORAS - horasAprovadas),
    creditos: creditosDe(horasAprovadas),
    categorias,
    categoriasAtendidas,
    metaCumprida:
      horasAprovadas >= META_HORAS && categoriasAtendidas >= MIN_CATEGORIAS,
    porSemestre: [...semestres.entries()]
      .map(([semestre, horas]) => ({ semestre, horas }))
      .sort((a, b) => a.semestre.localeCompare(b.semestre)),
  }
}
