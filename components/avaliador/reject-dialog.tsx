"use client"

import { useId, useState } from "react"
import { CircleXIcon } from "lucide-react"
import { toast } from "sonner"

import { Campo, descrever } from "@/components/shared/campo"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { definirStatus } from "@/lib/store"
import type { Activity } from "@/lib/types"

const MINIMO = 10

export function RejectDialog({ atividade }: { atividade: Activity }) {
  const id = useId()
  const [aberto, setAberto] = useState(false)
  const [erro, setErro] = useState<string>()

  function aoEnviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const motivo = String(
      new FormData(evento.currentTarget).get("motivo") ?? "",
    ).trim()

    if (motivo.length < MINIMO) {
      setErro("Explique o motivo em pelo menos uma frase, para o aluno corrigir.")
      document.getElementById(`${id}-motivo`)?.focus()
      return
    }

    definirStatus(atividade.id, "recusada", motivo)
    toast.success("Atividade recusada")
    setAberto(false)
  }

  return (
    <Dialog
      open={aberto}
      onOpenChange={(valor) => {
        setAberto(valor)
        if (valor) setErro(undefined)
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" aria-label={`Recusar ${atividade.titulo}`}>
          <CircleXIcon aria-hidden="true" />
          Recusar
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Recusar atividade</DialogTitle>
          <DialogDescription>{atividade.titulo}</DialogDescription>
        </DialogHeader>

        <form onSubmit={aoEnviar} noValidate>
          <Campo
            id={`${id}-motivo`}
            rotulo="Motivo da recusa (obrigatório)"
            ajuda="O aluno vê este texto no painel e ao editar a atividade."
            erro={erro}
          >
            <Textarea
              id={`${id}-motivo`}
              name="motivo"
              rows={4}
              defaultValue={atividade.motivoRecusa}
              aria-invalid={Boolean(erro)}
              aria-describedby={descrever(`${id}-motivo`, true, erro)}
            />
          </Campo>

          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" variant="destructive">
              Recusar atividade
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
