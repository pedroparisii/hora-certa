"use client"

import { InfoIcon } from "lucide-react"

import { ReviewTable } from "@/components/avaliador/review-table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { useActivities } from "@/lib/store"

export function AvaliadorView() {
  const atividades = useActivities()

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold">
          Painel da comissão (prévia)
        </h1>
        <p className="text-muted-foreground">
          Como a análise das atividades funcionaria dentro do sistema.
        </p>
      </div>

      <Alert>
        <InfoIcon aria-hidden="true" />
        <AlertTitle>Proposta de implementação futura</AlertTitle>
        <AlertDescription>
          Esta é uma prévia de como a Comissão de Avaliação do DComp-So poderia
          aprovar as atividades complementares direto pelo sistema. Como o
          protótipo não usa banco de dados, ela trabalha sobre as atividades
          guardadas neste navegador.
        </AlertDescription>
      </Alert>

      {atividades ? (
        <ReviewTable atividades={atividades} />
      ) : (
        <div aria-busy="true">
          <Skeleton className="h-64 w-full rounded-xl" />
          <span className="sr-only">Carregando as atividades</span>
        </div>
      )}
    </div>
  )
}
