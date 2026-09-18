import { CircleCheckIcon, CircleDashedIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { META_HORAS, MIN_CATEGORIAS, type Resumo } from "@/lib/rules"

export function CategoryProgress({ resumo }: { resumo: Resumo }) {
  const atingiuMinimo = resumo.categoriasAtendidas >= MIN_CATEGORIAS
  const Icone = atingiuMinimo ? CircleCheckIcon : CircleDashedIcon

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>Horas por categoria</h2>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <p className="flex items-center gap-2 text-sm">
          <Icone
            aria-hidden="true"
            className={
              atingiuMinimo
                ? "size-4 shrink-0 text-aprovada"
                : "size-4 shrink-0 text-muted-foreground"
            }
          />
          {atingiuMinimo
            ? `${resumo.categoriasAtendidas} categorias com horas aprovadas. O mínimo são ${MIN_CATEGORIAS}.`
            : `${resumo.categoriasAtendidas} de ${MIN_CATEGORIAS} categorias mínimas com horas aprovadas`}
        </p>

        <ul className="flex flex-col gap-3">
          {resumo.categorias.map((categoria) => (
            <li key={categoria.id} className="flex flex-col gap-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <span>{categoria.rotulo}</span>
                <span className="text-sm text-muted-foreground">
                  {categoria.horasAprovadas} h aprovadas
                  {categoria.horasEmAnalise > 0
                    ? ` · ${categoria.horasEmAnalise} h em análise`
                    : ""}
                </span>
              </div>
              <Progress
                className="h-2"
                value={(categoria.horasAprovadas / META_HORAS) * 100}
                aria-label={categoria.rotulo}
                aria-valuetext={`${categoria.horasAprovadas} de ${META_HORAS} horas aprovadas`}
              />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
