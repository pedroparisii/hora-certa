import { CalendarClockIcon, ScaleIcon, TriangleAlertIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AVISO_PRAZO_DIAS,
  TETO_HORAS_SEMESTRE,
  creditosDe,
  formatarData,
  plural,
  prazoValidacao,
  situacaoPrazo,
  type Resumo,
} from "@/lib/rules"
import type { Activity } from "@/lib/types"

function listaDeTitulos(atividades: Activity[]): string {
  return atividades.map((atividade) => atividade.titulo).join("; ")
}

export function DeadlineAlerts({
  atividades,
  resumo,
  hoje,
}: {
  atividades: Activity[]
  resumo: Resumo
  hoje: string
}) {
  const expiradas = atividades.filter(
    (atividade) => situacaoPrazo(atividade, hoje) === "expirada",
  )
  const proximas = atividades.filter(
    (atividade) => situacaoPrazo(atividade, hoje) === "proximo",
  )
  const acimaDoTeto = resumo.porSemestre.filter(
    (semestre) => semestre.horas > TETO_HORAS_SEMESTRE,
  )

  if (!expiradas.length && !proximas.length && !acimaDoTeto.length) return null

  return (
    <section aria-labelledby="avisos" className="flex flex-col gap-3">
      <h2 id="avisos" className="sr-only">
        Avisos
      </h2>

      {expiradas.length > 0 && (
        <Alert variant="destructive">
          <TriangleAlertIcon aria-hidden="true" />
          <AlertTitle>
            {plural(expiradas.length, "atividade perdeu", "atividades perderam")}{" "}
            o prazo de validação
          </AlertTitle>
          <AlertDescription>
            Essas horas não entram no total: {listaDeTitulos(expiradas)}. O
            prazo termina no fim do semestre seguinte ao da atividade.
          </AlertDescription>
        </Alert>
      )}

      {proximas.length > 0 && (
        <Alert>
          <CalendarClockIcon aria-hidden="true" />
          <AlertTitle>
            {plural(proximas.length, "atividade", "atividades")} com prazo perto
            do fim
          </AlertTitle>
          <AlertDescription>
            Faltam menos de {AVISO_PRAZO_DIAS} dias para entregar:{" "}
            {proximas
              .map(
                (atividade) =>
                  `${atividade.titulo} (até ${formatarData(prazoValidacao(atividade.data))})`,
              )
              .join("; ")}
            .
          </AlertDescription>
        </Alert>
      )}

      {acimaDoTeto.map((semestre) => (
        <Alert key={semestre.semestre}>
          <ScaleIcon aria-hidden="true" />
          <AlertTitle>
            Acima do teto de {TETO_HORAS_SEMESTRE} horas no semestre{" "}
            {semestre.semestre}
          </AlertTitle>
          <AlertDescription>
            Você tem {semestre.horas} horas esperando análise para validar em{" "}
            {semestre.semestre}, e cada semestre aproveita no máximo{" "}
            {TETO_HORAS_SEMESTRE} horas ({creditosDe(TETO_HORAS_SEMESTRE)} créditos). Vale deixar parte das
            atividades para o semestre seguinte.
          </AlertDescription>
        </Alert>
      ))}
    </section>
  )
}
