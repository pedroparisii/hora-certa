import { del, get, set } from "idb-keyval"

import type { ArquivoMeta } from "@/lib/types"

export const TAMANHO_MAXIMO = 5 * 1024 * 1024
export const TIPOS_ACEITOS = ["application/pdf", "image/png", "image/jpeg"]
export const ACCEPT = ".pdf,.png,.jpg,.jpeg"

export function formatarTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export async function salvarArquivo(arquivo: File): Promise<ArquivoMeta> {
  const id = crypto.randomUUID()
  await set(id, arquivo)
  return {
    id,
    nome: arquivo.name,
    tipo: arquivo.type,
    tamanho: arquivo.size,
  }
}

export async function guardarBlob(id: string, blob: Blob): Promise<void> {
  await set(id, blob)
}

export async function lerArquivo(id: string): Promise<Blob | undefined> {
  return get<Blob>(id)
}

export async function removerArquivo(id: string): Promise<void> {
  await del(id)
}

/**
 * Abre o comprovante em outra aba. A aba é aberta antes da leitura no
 * IndexedDB para não perder o gesto do usuário; se o navegador bloquear,
 * o arquivo é baixado. Devolve false quando o arquivo sumiu do navegador.
 */
export async function abrirArquivo(meta: ArquivoMeta): Promise<boolean> {
  const aba = window.open("", "_blank")
  const blob = await get<Blob>(meta.id)

  if (!blob) {
    aba?.close()
    return false
  }

  if (!aba) {
    baixarArquivo(blob, meta.nome)
    return true
  }

  const url = URL.createObjectURL(blob)
  aba.location.href = url
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
  return true
}

export function baixarArquivo(blob: Blob, nome: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = nome
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}
