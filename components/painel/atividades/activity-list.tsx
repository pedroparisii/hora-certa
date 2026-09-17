"use client"

import { useState } from "react"
import { ListChecksIcon, PlusIcon } from "lucide-react"

import {
  ActivityFilters,
  FILTROS_LIMPOS,
  aplicarFiltros,
  type Filtros,
} from "@/components/painel/atividades/activity-filters"
import { ActivityForm } from "@/components/painel/atividades/activity-form"
import { ActivityItem } from "@/components/painel/atividades/activity-item"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { ItemGroup } from "@/components/ui/item"
import { plural } from "@/lib/rules"
import type { Activity } from "@/lib/types"

export function ActivityList({
  atividades,
  hoje,
}: {
  atividades: Activity[]
  hoje: string
}) {
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_LIMPOS)

  if (atividades.length === 0) {
    return (
      <Card>
        <CardContent>
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ListChecksIcon aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>Nenhuma atividade ainda</EmptyTitle>
              <EmptyDescription>
                Registre a primeira atividade para começar a contar as horas.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <ActivityForm>
                <Button>
                  <PlusIcon aria-hidden="true" />
                  Registrar atividade
                </Button>
              </ActivityForm>
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>
    )
  }

  const filtradas = aplicarFiltros(atividades, filtros)

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>Minhas atividades</h2>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <ActivityFilters filtros={filtros} aoMudar={setFiltros} />

        <p aria-live="polite" className="text-sm text-muted-foreground">
          {filtradas.length === atividades.length
            ? plural(
                atividades.length,
                "atividade registrada",
                "atividades registradas",
              )
            : `${filtradas.length} de ${atividades.length} atividades`}
        </p>

        {filtradas.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyTitle>Nenhuma atividade com esses filtros</EmptyTitle>
              <EmptyDescription>
                Mude a busca ou volte para todos os status e categorias.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                variant="outline"
                onClick={() => setFiltros(FILTROS_LIMPOS)}
              >
                Limpar filtros
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <ItemGroup className="gap-3">
            {filtradas.map((atividade) => (
              <ActivityItem
                key={atividade.id}
                atividade={atividade}
                hoje={hoje}
              />
            ))}
          </ItemGroup>
        )}
      </CardContent>
    </Card>
  )
}
