"use client"

import { useId, useState } from "react"
import { CircleCheckIcon, HourglassIcon } from "lucide-react"
import { toast } from "sonner"

import { Campo } from "@/components/shared/campo"
import { RejectDialog } from "@/components/avaliador/reject-dialog"
import { ComprovanteButton } from "@/components/shared/comprovante-button"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatarData, plural, rotuloCategoria } from "@/lib/rules"
import { definirStatus } from "@/lib/store"
import type { Activity, Status } from "@/lib/types"

const FILTROS = [
  { valor: "fila", rotulo: "Pendentes e em análise" },
  { valor: "todos", rotulo: "Todos os status" },
  { valor: "pendente", rotulo: "Só pendentes" },
  { valor: "em_analise", rotulo: "Só em análise" },
  { valor: "aprovada", rotulo: "Só aprovadas" },
  { valor: "recusada", rotulo: "Só recusadas" },
]

function combina(atividade: Activity, filtro: string): boolean {
  if (filtro === "todos") return true
  if (filtro === "fila") {
    return atividade.status === "pendente" || atividade.status === "em_analise"
  }
  return atividade.status === filtro
}

function mudar(atividade: Activity, status: Status, aviso: string) {
  definirStatus(atividade.id, status)
  toast.success(aviso)
}

export function ReviewTable({ atividades }: { atividades: Activity[] }) {
  const id = useId()
  const [filtro, setFiltro] = useState("fila")
  const visiveis = atividades.filter((atividade) => combina(atividade, filtro))

  return (
    <div className="flex flex-col gap-4">
      <div className="max-w-xs">
        <Campo id={`${id}-filtro`} rotulo="Mostrar">
          <Select value={filtro} onValueChange={setFiltro}>
            <SelectTrigger id={`${id}-filtro`} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FILTROS.map((opcao) => (
                <SelectItem key={opcao.valor} value={opcao.valor}>
                  {opcao.rotulo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Campo>
      </div>

      <p aria-live="polite" className="text-sm text-muted-foreground">
        {plural(visiveis.length, "atividade na lista", "atividades na lista")}
      </p>

      <Table>
        <TableCaption>
          Atividades registradas neste navegador. Nenhum dado de aluno é
          identificado.
        </TableCaption>
        <TableHeader className="max-md:sr-only">
          <TableRow>
            <TableHead>Atividade</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="text-right">Horas</TableHead>
            <TableHead>Comprovante</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Análise</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visiveis.map((atividade) => (
            <TableRow
              key={atividade.id}
              className="max-md:flex max-md:flex-wrap max-md:gap-x-2 max-md:gap-y-2 max-md:py-4 max-md:*:p-0"
            >
              <TableCell className="font-medium whitespace-normal max-md:w-full">
                {atividade.titulo}
              </TableCell>
              <TableCell className="whitespace-normal max-md:text-muted-foreground">
                {rotuloCategoria(atividade.categoria)}
              </TableCell>
              <TableCell className="max-md:text-muted-foreground">
                {formatarData(atividade.data)}
              </TableCell>
              <TableCell className="text-right max-md:text-muted-foreground">
                {atividade.horas} h
              </TableCell>
              <TableCell className="max-md:order-last">
                <ComprovanteButton atividade={atividade}>
                  Abrir
                </ComprovanteButton>
              </TableCell>
              <TableCell className="max-md:w-full">
                <StatusBadge status={atividade.status} />
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-2">
                  {atividade.status === "pendente" && (
                    <Button
                      variant="outline"
                      aria-label={`Iniciar análise de ${atividade.titulo}`}
                      onClick={() =>
                        mudar(atividade, "em_analise", "Análise iniciada")
                      }
                    >
                      <HourglassIcon aria-hidden="true" />
                      Iniciar análise
                    </Button>
                  )}
                  {atividade.status !== "aprovada" && (
                    <Button
                      aria-label={`Aprovar ${atividade.titulo}`}
                      onClick={() =>
                        mudar(atividade, "aprovada", "Atividade aprovada")
                      }
                    >
                      <CircleCheckIcon aria-hidden="true" />
                      Aprovar
                    </Button>
                  )}
                  {atividade.status !== "recusada" && (
                    <RejectDialog atividade={atividade} />
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {visiveis.length === 0 && (
        <p className="rounded-md border border-dashed p-6 text-center text-muted-foreground">
          Nenhuma atividade com esse filtro. Os status alterados continuam na
          opção “Todos os status”.
        </p>
      )}
    </div>
  )
}
