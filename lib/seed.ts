import { guardarBlob } from "@/lib/files"
import type { Activity } from "@/lib/types"

/** Comprovantes fictícios servidos de `public/seed/`, um para cada atividade. */
function comprovante(nome: string, tamanho: number) {
  return {
    id: `exemplo-${nome}`,
    nome,
    tipo: nome.endsWith(".pdf") ? "application/pdf" : "image/png",
    tamanho,
  }
}

const MODELOS: Activity[] = [
  {
    id: "exemplo-1",
    titulo: "Iniciação Científica em visão computacional",
    categoria: "ic",
    horas: 30,
    data: "2025-03-10",
    status: "aprovada",
    arquivo: comprovante("ic-visao-computacional.pdf", 1394),
  },
  {
    id: "exemplo-2",
    titulo: "Monitoria de Algoritmos e Estruturas de Dados",
    categoria: "monitoria",
    horas: 24,
    data: "2025-08-01",
    status: "aprovada",
    arquivo: comprovante("monitoria-algoritmos.pdf", 1377),
  },
  {
    id: "exemplo-3",
    titulo: "Semana da Computação 2026",
    categoria: "eventos",
    horas: 12,
    data: "2026-05-20",
    status: "em_analise",
    arquivo: comprovante("semana-computacao.png", 5081),
  },
  {
    id: "exemplo-4",
    titulo: "Curso de introdução a aprendizado de máquina",
    categoria: "cursos",
    horas: 40,
    data: "2026-03-15",
    status: "pendente",
    arquivo: comprovante("curso-aprendizado-maquina.pdf", 1387),
  },
  {
    id: "exemplo-5",
    titulo: "Minicurso de Git e GitHub",
    categoria: "cursos",
    horas: 8,
    data: "2026-06-10",
    status: "pendente",
    arquivo: comprovante("minicurso-git.png", 5009),
  },
  {
    id: "exemplo-6",
    titulo: "Apresentação de artigo no ERAD-SP",
    categoria: "producao",
    horas: 10,
    data: "2026-04-18",
    status: "pendente",
    arquivo: comprovante("artigo-erad-sp.pdf", 1376),
  },
  {
    id: "exemplo-7",
    titulo: "Diretoria do Centro Acadêmico de Computação",
    categoria: "representacao",
    horas: 20,
    data: "2026-07-20",
    status: "em_analise",
    arquivo: comprovante("centro-academico.pdf", 1380),
  },
  {
    id: "exemplo-8",
    titulo: "Palestra sobre carreira em tecnologia",
    categoria: "eventos",
    horas: 4,
    data: "2026-02-20",
    status: "recusada",
    motivoRecusa:
      "O certificado não mostra a carga horária. Envie um comprovante em que a carga horária apareça.",
    arquivo: comprovante("palestra-carreira.png", 4820),
  },
  {
    id: "exemplo-9",
    titulo: "Curso de Python para iniciantes",
    categoria: "cursos",
    horas: 20,
    data: "2025-02-10",
    status: "pendente",
    arquivo: comprovante("curso-python.pdf", 1386),
  },
]

export function criarSeed(): Activity[] {
  return MODELOS.map((modelo) => ({ ...modelo }))
}

/** Baixa os comprovantes de exemplo e os guarda no IndexedDB deste navegador. */
export async function guardarComprovantesDoSeed(): Promise<void> {
  await Promise.all(
    MODELOS.map(async ({ arquivo }) => {
      const resposta = await fetch(`/seed/${arquivo.nome}`)
      if (resposta.ok) await guardarBlob(arquivo.id, await resposta.blob())
    }),
  )
}
