import { CircleCheckIcon, TargetIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  HORAS_POR_CREDITO,
  META_HORAS,
  MIN_CATEGORIAS,
  plural,
  type Resumo,
} from "@/lib/rules"

const CREDITOS_DA_META = META_HORAS / HORAS_POR_CREDITO
const MARCAS = Array.from({ length: CREDITOS_DA_META }, (_, i) => i)

const HACHURA =
  "repeating-linear-gradient(45deg, var(--primary) 0 3px, transparent 3px 7px)"

function preenchimento(horas: number, marca: number): number {
  const dentroDaMarca = horas - marca * HORAS_POR_CREDITO
  return Math.min(100, Math.max(0, (dentroDaMarca / HORAS_POR_CREDITO) * 100))
}

function oQueFalta(resumo: Resumo): string {
  const faltas: string[] = []
  if (resumo.horasRestantes > 0) {
    faltas.push(`${resumo.horasRestantes} horas aprovadas`)
  }

  const categorias = MIN_CATEGORIAS - resumo.categoriasAtendidas
  if (categorias > 0) {
    faltas.push(
      `${plural(categorias, "categoria", "categorias")} com horas aprovadas`,
    )
  }

  return faltas.join(" e ")
}

export function ProgressOverview({ resumo }: { resumo: Resumo }) {
  const valorEmTexto = `${resumo.horasAprovadas} de ${META_HORAS} horas aprovadas, ${resumo.creditos} de ${CREDITOS_DA_META} créditos`

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>Progresso total</h2>
        </CardTitle>
        <CardDescription>
          A meta é {META_HORAS} horas aprovadas, o mesmo que{" "}
          {CREDITOS_DA_META} créditos de {HORAS_POR_CREDITO} horas.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div>
          <div
            role="progressbar"
            aria-label="Horas aprovadas"
            aria-valuemin={0}
            aria-valuemax={META_HORAS}
            aria-valuenow={resumo.horasAprovadas}
            aria-valuetext={valorEmTexto}
            className="flex gap-1"
          >
            {MARCAS.map((marca) => (
              <div
                key={marca}
                className="relative h-8 flex-1 overflow-hidden rounded-sm bg-muted ring-1 ring-foreground/10"
              >
                <div
                  className="absolute inset-y-0 left-0 opacity-45"
                  style={{
                    width: `${preenchimento(resumo.horasAprovadas + resumo.horasEmAnalise, marca)}%`,
                    backgroundImage: HACHURA,
                  }}
                />
                <div
                  className="absolute inset-y-0 left-0 bg-primary"
                  style={{
                    width: `${preenchimento(resumo.horasAprovadas, marca)}%`,
                  }}
                />
              </div>
            ))}
          </div>

          <ol aria-hidden="true" className="mt-1 flex gap-1">
            {MARCAS.map((marca) => (
              <li
                key={marca}
                className="flex-1 text-right text-xs text-muted-foreground"
              >
                {(marca + 1) * HORAS_POR_CREDITO} h
              </li>
            ))}
          </ol>
        </div>

        <p className="text-base">
          <strong className="font-semibold">{valorEmTexto}.</strong>
          {resumo.horasEmAnalise > 0 ? (
            <>
              {" "}
              Mais {resumo.horasEmAnalise} horas estão em análise, na faixa
              hachurada.
            </>
          ) : null}
        </p>

        <dl className="grid gap-3 sm:grid-cols-3">
          {[
            { termo: "Horas aprovadas", valor: `${resumo.horasAprovadas} h` },
            { termo: "Em análise", valor: `${resumo.horasEmAnalise} h` },
            { termo: "Faltam para a meta", valor: `${resumo.horasRestantes} h` },
          ].map((item) => (
            <div
              key={item.termo}
              className="rounded-md bg-muted px-3 py-2 text-muted-foreground"
            >
              <dt>{item.termo}</dt>
              <dd className="text-lg font-semibold text-foreground">
                {item.valor}
              </dd>
            </div>
          ))}
        </dl>

        <p className="flex items-start gap-2 text-sm">
          {resumo.metaCumprida ? (
            <CircleCheckIcon
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-aprovada"
            />
          ) : (
            <TargetIcon
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-muted-foreground"
            />
          )}
          {resumo.metaCumprida
            ? `Meta cumprida: ${META_HORAS} horas aprovadas em ${resumo.categoriasAtendidas} categorias.`
            : `Para cumprir a meta: ${oQueFalta(resumo)}.`}
        </p>
      </CardContent>
    </Card>
  )
}
