"use client"

import { useSyncExternalStore } from "react"

import { removerArquivo } from "@/lib/files"
import { atividadesSchema } from "@/lib/schema"
import { criarSeed, guardarComprovantesDoSeed } from "@/lib/seed"
import type { Activity, Status } from "@/lib/types"

const CHAVE = "ac:v2"
const EVENTO = "ac:alterado"

let memoria: string | null = null
let brutoEmCache: string | null = null
let listaEmCache: Activity[] = []

export type DadosAtividade = Omit<Activity, "id">

function lerBruto(): string | null {
  try {
    return localStorage.getItem(CHAVE) ?? memoria
  } catch {
    return memoria
  }
}

function gravarBruto(bruto: string): void {
  memoria = bruto
  try {
    localStorage.setItem(CHAVE, bruto)
  } catch {
    // Sem localStorage (janela restrita), os dados ficam só nesta sessão.
  }
}

function analisar(bruto: string): Activity[] {
  try {
    const resultado = atividadesSchema.safeParse(JSON.parse(bruto))
    return resultado.success ? resultado.data : []
  } catch {
    return []
  }
}

function semear(): string {
  void guardarComprovantesDoSeed().catch(() => {})
  const bruto = JSON.stringify(criarSeed())
  gravarBruto(bruto)
  return bruto
}

function snapshot(): Activity[] {
  const bruto = lerBruto() ?? semear()
  if (bruto !== brutoEmCache) {
    brutoEmCache = bruto
    listaEmCache = analisar(bruto)
  }
  return listaEmCache
}

function subscribe(aoMudar: () => void): () => void {
  window.addEventListener("storage", aoMudar)
  window.addEventListener(EVENTO, aoMudar)
  return () => {
    window.removeEventListener("storage", aoMudar)
    window.removeEventListener(EVENTO, aoMudar)
  }
}

function gravar(atividades: Activity[]): void {
  gravarBruto(JSON.stringify(atividades))
  window.dispatchEvent(new Event(EVENTO))
}

/** Devolve `null` enquanto o navegador não assumiu a renderização. */
export function useActivities(): Activity[] | null {
  return useSyncExternalStore(subscribe, snapshot, () => null)
}

export function adicionar(dados: DadosAtividade): void {
  gravar([...snapshot(), { id: crypto.randomUUID(), ...dados }])
}

export function atualizar(id: string, dados: DadosAtividade): void {
  const atual = snapshot().find((atividade) => atividade.id === id)
  if (atual && atual.arquivo.id !== dados.arquivo.id) {
    void removerArquivo(atual.arquivo.id)
  }

  gravar(
    snapshot().map((atividade) =>
      atividade.id === id ? { id: atividade.id, ...dados } : atividade,
    ),
  )
}

export function excluir(id: string): void {
  const atividade = snapshot().find((item) => item.id === id)
  if (atividade) void removerArquivo(atividade.arquivo.id)
  gravar(snapshot().filter((item) => item.id !== id))
}

export function definirStatus(
  id: string,
  status: Status,
  motivoRecusa?: string,
): void {
  gravar(
    snapshot().map((atividade) =>
      atividade.id === id
        ? {
            ...atividade,
            status,
            motivoRecusa: status === "recusada" ? motivoRecusa : undefined,
          }
        : atividade,
    ),
  )
}

export function restaurarExemplo(): void {
  void guardarComprovantesDoSeed().catch(() => {})
  gravar(criarSeed())
}

export function limparTudo(): void {
  for (const atividade of snapshot()) {
    void removerArquivo(atividade.arquivo.id)
  }
  gravar([])
}

export function exportarJson(): string {
  return JSON.stringify(snapshot(), null, 2)
}

export function importarJson(texto: string): number {
  let dados: unknown
  try {
    dados = JSON.parse(texto)
  } catch {
    throw new Error("O arquivo não é um JSON válido.")
  }

  const resultado = atividadesSchema.safeParse(dados)
  if (!resultado.success) {
    throw new Error(
      "O arquivo não tem o formato esperado. Use um JSON exportado por este app.",
    )
  }

  gravar(resultado.data)
  return resultado.data.length
}
