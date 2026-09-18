"use client"

import { PencilIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { ActivityForm } from "@/components/painel/atividades/activity-form"
import { ComprovanteButton } from "@/components/shared/comprovante-button"
import { PrazoBadge, StatusBadge } from "@/components/shared/status-badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import {
  STATUS_ROTULO,
  formatarData,
  prazoValidacao,
  rotuloCategoria,
  situacaoPrazo,
} from "@/lib/rules"
import { excluir } from "@/lib/store"
import type { Activity } from "@/lib/types"

export function ActivityItem({
  atividade,
  hoje,
}: {
  atividade: Activity
  hoje: string
}) {
  const situacao = situacaoPrazo(atividade, hoje)

  return (
    <Item
      role="listitem"
      variant="outline"
      className="items-start gap-3 bg-card"
    >
      <ItemContent>
        <ItemTitle className="text-base leading-snug">
          {atividade.titulo}
        </ItemTitle>
        <ItemDescription>
          {rotuloCategoria(atividade.categoria)} ·{" "}
          {formatarData(atividade.data)} · {atividade.horas} h · Prazo{" "}
          {formatarData(prazoValidacao(atividade.data))}
        </ItemDescription>

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <StatusBadge status={atividade.status} />
          <PrazoBadge situacao={situacao} />
        </div>

        {atividade.motivoRecusa && (
          <p className="pt-1 text-sm text-recusada">
            Motivo da recusa: {atividade.motivoRecusa}
          </p>
        )}
      </ItemContent>

      <ItemActions className="w-full flex-wrap gap-1 sm:w-auto">
        <ComprovanteButton atividade={atividade}>
          Abrir comprovante
        </ComprovanteButton>

        <ActivityForm atividade={atividade}>
          <Button variant="ghost" aria-label={`Editar ${atividade.titulo}`}>
            <PencilIcon aria-hidden="true" />
            Editar
          </Button>
        </ActivityForm>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" aria-label={`Excluir ${atividade.titulo}`}>
              <Trash2Icon aria-hidden="true" />
              Excluir
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir esta atividade?</AlertDialogTitle>
              <AlertDialogDescription>
                {atividade.titulo} ({STATUS_ROTULO[atividade.status]}) sai deste
                navegador junto com o comprovante. Não dá para desfazer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => {
                  excluir(atividade.id)
                  toast.success("Atividade excluída")
                }}
              >
                Excluir atividade
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </ItemActions>
    </Item>
  )
}
