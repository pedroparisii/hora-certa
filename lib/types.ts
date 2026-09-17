import type { CategoryId, STATUS } from "@/lib/rules"

export type Status = (typeof STATUS)[number]

export type ArquivoMeta = {
  id: string
  nome: string
  tipo: string
  tamanho: number
}

export type Activity = {
  id: string
  titulo: string
  categoria: CategoryId
  horas: number
  data: string
  status: Status
  arquivo: ArquivoMeta
  motivoRecusa?: string
}
