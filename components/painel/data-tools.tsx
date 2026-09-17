"use client"

import { useRef } from "react"
import { FileDownIcon, FileUpIcon, RotateCcwIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { baixarArquivo } from "@/lib/files"
import { plural } from "@/lib/rules"
import {
  exportarJson,
  importarJson,
  limparTudo,
  restaurarExemplo,
} from "@/lib/store"

export function DataTools() {
  const entrada = useRef<HTMLInputElement>(null)

  async function aoImportar(evento: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0]
    evento.target.value = ""
    if (!arquivo) return

    try {
      const quantidade = importarJson(await arquivo.text())
      toast.success(
        plural(quantidade, "atividade importada", "atividades importadas"),
      )
    } catch (erro) {
      toast.error(
        erro instanceof Error ? erro.message : "Não foi possível importar.",
      )
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>Meus dados</h2>
        </CardTitle>
        <CardDescription>
          O protótipo não usa banco de dados: para não depender de hospedagem,
          tudo fica guardado neste navegador. Exporte um backup antes de trocar
          de computador ou limpar o histórico.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() =>
            baixarArquivo(
              new Blob([exportarJson()], { type: "application/json" }),
              "atividades-complementares.json",
            )
          }>
          <FileDownIcon aria-hidden="true" />
          Exportar JSON
        </Button>

        <Button variant="outline" onClick={() => entrada.current?.click()}>
          <FileUpIcon aria-hidden="true" />
          Importar JSON
        </Button>
        <input
          ref={entrada}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={aoImportar}
        />

        <Button
          variant="ghost"
          onClick={() => {
            restaurarExemplo()
            toast.success("Dados de exemplo restaurados")
          }}
        >
          <RotateCcwIcon aria-hidden="true" />
          Restaurar dados de exemplo
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost">
              <Trash2Icon aria-hidden="true" />
              Apagar todas
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Apagar todas as atividades?</AlertDialogTitle>
              <AlertDialogDescription>
                Todas as atividades e os comprovantes saem deste navegador. Não
                dá para desfazer, mas você pode restaurar os dados de exemplo
                depois.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => {
                  limparTudo()
                  toast.success("Atividades apagadas")
                }}
              >
                Apagar todas
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
