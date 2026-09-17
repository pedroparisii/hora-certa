"use client"

import { useId } from "react"
import { SearchIcon } from "lucide-react"

import { Campo } from "@/components/shared/campo"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CATEGORIAS, STATUS, STATUS_ROTULO } from "@/lib/rules"
import type { Activity } from "@/lib/types"

export type Filtros = {
  busca: string
  status: string
  categoria: string
  ordem: string
}

export const FILTROS_LIMPOS: Filtros = {
  busca: "",
  status: "todos",
  categoria: "todas",
  ordem: "recentes",
}

function semAcento(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
}

export function aplicarFiltros(
  atividades: Activity[],
  filtros: Filtros,
): Activity[] {
  const termo = semAcento(filtros.busca.trim())

  return atividades
    .filter((atividade) => semAcento(atividade.titulo).includes(termo))
    .filter(
      (atividade) =>
        filtros.status === "todos" || atividade.status === filtros.status,
    )
    .filter(
      (atividade) =>
        filtros.categoria === "todas" ||
        atividade.categoria === filtros.categoria,
    )
    .sort((a, b) =>
      filtros.ordem === "recentes"
        ? b.data.localeCompare(a.data)
        : a.data.localeCompare(b.data),
    )
}

export function ActivityFilters({
  filtros,
  aoMudar,
}: {
  filtros: Filtros
  aoMudar: (filtros: Filtros) => void
}) {
  const id = useId()

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Campo id={`${id}-busca`} rotulo="Buscar por título">
        <div className="relative">
          <SearchIcon
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id={`${id}-busca`}
            value={filtros.busca}
            onChange={(evento) =>
              aoMudar({ ...filtros, busca: evento.target.value })
            }
            className="pl-9"
            placeholder="Monitoria, curso..."
          />
        </div>
      </Campo>

      <Campo id={`${id}-status`} rotulo="Status">
        <Select
          value={filtros.status}
          onValueChange={(status) => aoMudar({ ...filtros, status })}
        >
          <SelectTrigger id={`${id}-status`} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {STATUS.map((valor) => (
              <SelectItem key={valor} value={valor}>
                {STATUS_ROTULO[valor]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Campo>

      <Campo id={`${id}-categoria`} rotulo="Categoria">
        <Select
          value={filtros.categoria}
          onValueChange={(categoria) => aoMudar({ ...filtros, categoria })}
        >
          <SelectTrigger id={`${id}-categoria`} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            {CATEGORIAS.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.rotulo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Campo>

      <Campo id={`${id}-ordem`} rotulo="Ordenar por">
        <Select
          value={filtros.ordem}
          onValueChange={(ordem) => aoMudar({ ...filtros, ordem })}
        >
          <SelectTrigger id={`${id}-ordem`} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recentes">Data mais recente</SelectItem>
            <SelectItem value="antigas">Data mais antiga</SelectItem>
          </SelectContent>
        </Select>
      </Campo>
    </div>
  )
}
