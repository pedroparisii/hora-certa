"use client"

import { useId, useState } from "react"
import { toast } from "sonner"

import { ActivityFields } from "@/components/painel/atividades/activity-fields"
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
import { salvarArquivo } from "@/lib/files"
import type { CategoryId } from "@/lib/rules"
import { comprovanteSchema, formularioSchema } from "@/lib/schema"
import { adicionar, atualizar } from "@/lib/store"
import type { Activity, Status } from "@/lib/types"

const ORDEM = ["titulo", "categoria", "horas", "data", "status", "arquivo"]

export function ActivityForm({
  atividade,
  children,
}: {
  atividade?: Activity
  children: React.ReactNode
}) {
  const id = useId()
  const [aberto, setAberto] = useState(false)
  const [erros, setErros] = useState<Record<string, string>>({})
  const [salvando, setSalvando] = useState(false)
  const [categoria, setCategoria] = useState<CategoryId | "">(
    atividade?.categoria ?? "",
  )
  const [status, setStatus] = useState<Status>(atividade?.status ?? "pendente")

  function limparErro(campo: string) {
    setErros((atuais) => {
      if (!atuais[campo]) return atuais
      const resto = { ...atuais }
      delete resto[campo]
      return resto
    })
  }

  function aoMudarAbertura(valor: boolean) {
    setAberto(valor)
    if (valor) {
      setErros({})
      setCategoria(atividade?.categoria ?? "")
      setStatus(atividade?.status ?? "pendente")
    }
  }

  async function aoEnviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const dados = new FormData(evento.currentTarget)
    const enviado = dados.get("arquivo")
    const novoArquivo =
      enviado instanceof File && enviado.size > 0 ? enviado : null

    const campos = formularioSchema.safeParse({
      titulo: dados.get("titulo"),
      categoria: dados.get("categoria"),
      horas: dados.get("horas"),
      data: dados.get("data"),
      status: dados.get("status") ?? status,
      motivoRecusa: dados.get("motivoRecusa") || undefined,
    })

    // Editar sem anexar nada mantém o comprovante que já está guardado.
    const comprovante = comprovanteSchema.safeParse(novoArquivo)
    const erroArquivo =
      !comprovante.success && (novoArquivo || !atividade)
        ? comprovante.error.issues[0].message
        : undefined

    if (!campos.success || erroArquivo) {
      const encontrados: Record<string, string> = {}
      if (!campos.success) {
        for (const problema of campos.error.issues) {
          const campo = String(problema.path[0])
          encontrados[campo] ??= problema.message
        }
      }
      if (erroArquivo) encontrados.arquivo = erroArquivo

      setErros(encontrados)
      const primeiro = ORDEM.find((campo) => encontrados[campo])
      document.getElementById(`${id}-${primeiro}`)?.focus()
      return
    }

    setSalvando(true)
    try {
      const arquivo = comprovante.success
        ? await salvarArquivo(comprovante.data)
        : atividade!.arquivo

      if (atividade) {
        atualizar(atividade.id, { ...campos.data, arquivo })
        toast.success("Atividade atualizada")
      } else {
        adicionar({ ...campos.data, arquivo })
        toast.success("Atividade registrada")
      }
      setAberto(false)
    } catch {
      toast.error("Não foi possível salvar a atividade. Tente de novo.")
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={aoMudarAbertura}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {atividade ? "Editar atividade" : "Registrar atividade"}
          </DialogTitle>
          <DialogDescription>
            O comprovante é obrigatório e fica guardado só neste navegador.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={aoEnviar}
          noValidate
          onInput={(evento) =>
            limparErro((evento.target as HTMLInputElement).name)
          }
        >
          <ActivityFields
            id={id}
            atividade={atividade}
            erros={erros}
            categoria={categoria}
            aoMudarCategoria={(valor) => {
              setCategoria(valor)
              limparErro("categoria")
            }}
            status={status}
            aoMudarStatus={setStatus}
          />

          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={salvando}>
              {salvando
                ? "Salvando"
                : atividade
                  ? "Salvar alterações"
                  : "Registrar atividade"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
