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
    titulo: "Curso de introdução a aprendizado de máquina",
    categoria: "cursos",
    horas: 40,
    data: "2026-03-15",
    status: "pendente",
    arquivo: comprovante("curso-aprendizado-maquina.pdf", 1387),
  },
  {
    id: "exemplo-3",
    titulo: "Palestra sobre carreira em tecnologia",
    categoria: "eventos",
    horas: 4,
    data: "2026-02-20",
    status: "recusada",
    motivoRecusa:
      "O certificado não mostra a carga horária. Envie um comprovante em que a carga horária apareça.",
    arquivo: comprovante("palestra-carreira.png", 4820),
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
