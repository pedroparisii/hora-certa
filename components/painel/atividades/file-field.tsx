"use client"

import { PaperclipIcon } from "lucide-react"

import { Campo, descrever } from "@/components/shared/campo"
import { Input } from "@/components/ui/input"
import { ACCEPT, TAMANHO_MAXIMO, formatarTamanho } from "@/lib/files"
import type { ArquivoMeta } from "@/lib/types"

export function FileField({
  id,
  meta,
  erro,
}: {
  id: string
  meta?: ArquivoMeta
  erro?: string
}) {
  return (
    <Campo
      id={id}
      rotulo={meta ? "Trocar o comprovante" : "Comprovante (obrigatório)"}
      erro={erro}
      ajuda={
        meta
          ? `Deixe em branco para manter o arquivo atual. PDF, PNG ou JPG de até ${formatarTamanho(TAMANHO_MAXIMO)}.`
          : `PDF, PNG ou JPG de até ${formatarTamanho(TAMANHO_MAXIMO)}. O arquivo fica guardado só neste navegador.`
      }
    >
      {meta && (
        <div className="flex flex-wrap items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm">
          <PaperclipIcon aria-hidden="true" className="size-4 shrink-0" />
          <span className="min-w-0 break-all">{meta.nome}</span>
          <span className="text-muted-foreground">
            {formatarTamanho(meta.tamanho)}
          </span>
        </div>
      )}

      <Input
        id={id}
        name="arquivo"
        type="file"
        accept={ACCEPT}
        aria-invalid={Boolean(erro)}
        aria-describedby={descrever(id, true, erro)}
      />
    </Campo>
  )
}
