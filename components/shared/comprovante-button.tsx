"use client"

import { FileTextIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { abrirArquivo } from "@/lib/files"
import type { Activity } from "@/lib/types"

export function ComprovanteButton({
  atividade,
  children,
}: {
  atividade: Activity
  children: React.ReactNode
}) {
  async function abrir() {
    if (!(await abrirArquivo(atividade.arquivo))) {
      toast.error("O comprovante não está guardado neste navegador.")
    }
  }

  return (
    <Button
      variant="outline"
      onClick={abrir}
      aria-label={`Abrir comprovante de ${atividade.titulo}`}
    >
      <FileTextIcon aria-hidden="true" />
      {children}
    </Button>
  )
}
