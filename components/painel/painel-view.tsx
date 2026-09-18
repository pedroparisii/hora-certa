"use client"

import { PlusIcon } from "lucide-react"

import { ActivityForm } from "@/components/painel/atividades/activity-form"
import { ActivityList } from "@/components/painel/atividades/activity-list"
import { DeadlineAlerts } from "@/components/painel/deadline-alerts"
import { ProgressOverview } from "@/components/painel/progress-overview"
import { ReportCard } from "@/components/painel/report-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { hojeISO, resumo as calcularResumo } from "@/lib/rules"
import { useActivities } from "@/lib/store"
import type { Activity } from "@/lib/types"

export function PainelView() {
  const atividades = useActivities()

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Meu painel</h1>
          <p className="text-muted-foreground">
            Suas horas complementares, o que já foi aprovado e o que ainda falta.
          </p>
        </div>
        {atividades && (
          <ActivityForm>
            <Button>
              <PlusIcon aria-hidden="true" />
              Registrar atividade
            </Button>
          </ActivityForm>
        )}
      </div>

      {atividades ? (
        <Conteudo atividades={atividades} />
      ) : (
        <div className="flex flex-col gap-6" aria-busy="true">
          <Skeleton className="h-56 w-full rounded-xl" />
          <Skeleton className="h-72 w-full rounded-xl" />
          <span className="sr-only">Carregando suas atividades</span>
        </div>
      )}
    </div>
  )
}

function Conteudo({ atividades }: { atividades: Activity[] }) {
  const hoje = hojeISO()
  const resumo = calcularResumo(atividades, hoje)

  return (
    <>
      <DeadlineAlerts atividades={atividades} resumo={resumo} hoje={hoje} />
      <ProgressOverview resumo={resumo} />
      <ActivityList atividades={atividades} hoje={hoje} />
      <ReportCard atividades={atividades} />
    </>
  )
}
