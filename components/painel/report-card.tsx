"use client"

import { useId, useState } from "react"
import { FileDownIcon, TriangleAlertIcon } from "lucide-react"
import { toast } from "sonner"

import { Campo } from "@/components/shared/campo"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { baixarArquivo } from "@/lib/files"
import { gerarRelatorio } from "@/lib/report"
import {
  TETO_HORAS_SEMESTRE,
  creditosDe,
  hojeISO,
  plural,
  semestreDe,
  semestreValidacao,
} from "@/lib/rules"
import type { Activity } from "@/lib/types"

export function ReportCard({ atividades }: { atividades: Activity[] }) {
  const id = useId()
  const [escolhido, setEscolhido] = useState(() => semestreDe(hojeISO()))
  const [gerando, setGerando] = useState(false)

  const semestres = [
    ...new Set(atividades.map((atividade) => semestreValidacao(atividade.data))),
  ].sort()
  const semestre = semestres.includes(escolhido)
    ? escolhido
    : (semestres.at(-1) ?? "")

  const selecao = atividades.filter(
    (atividade) =>
      semestreValidacao(atividade.data) === semestre &&
      atividade.status === "pendente",
  )
  const horas = selecao.reduce((total, atividade) => total + atividade.horas, 0)

  async function baixarPdf() {
    setGerando(true)
    try {
      const { blob, nome, faltando } = await gerarRelatorio(semestre, selecao)
      baixarArquivo(blob, nome)
      if (faltando.length === 0) {
        toast.success("Relatório gerado")
      } else {
        toast.warning(
          `Relatório gerado sem ${plural(faltando.length, "comprovante", "comprovantes")}: ${faltando.join("; ")}.`,
        )
      }
    } catch {
      toast.error("Não foi possível gerar o relatório. Tente de novo.")
    } finally {
      setGerando(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>Gerar relatório</h2>
        </CardTitle>
        <CardDescription>
          O requerimento e os comprovantes das atividades pendentes do
          semestre num PDF só, para imprimir ou mandar por e-mail à
          coordenação.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="max-w-xs">
          <Campo
            id={`${id}-semestre`}
            rotulo="Semestre de validação"
          >
            <Select
              value={semestre}
              onValueChange={setEscolhido}
              disabled={semestres.length === 0}
            >
              <SelectTrigger
                id={`${id}-semestre`}
                className="w-full"
              >
                <SelectValue placeholder="Nenhum semestre disponível" />
              </SelectTrigger>
              <SelectContent>
                {semestres.map((opcao) => (
                  <SelectItem key={opcao} value={opcao}>
                    {opcao}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Campo>
        </div>

        <p aria-live="polite" className="text-sm">
          {selecao.length === 0
            ? "Nenhuma atividade pendente neste semestre. Escolha outro semestre."
            : `${plural(selecao.length, "atividade pendente", "atividades pendentes")}, ${horas} horas, ${plural(creditosDe(horas), "crédito", "créditos")}.`}
        </p>

        {horas > TETO_HORAS_SEMESTRE && (
          <Alert variant="destructive">
            <TriangleAlertIcon aria-hidden="true" />
            <AlertTitle>Acima do teto do semestre</AlertTitle>
            <AlertDescription>
              O semestre {semestre} aproveita no máximo {TETO_HORAS_SEMESTRE}{" "}
              horas. As {horas - TETO_HORAS_SEMESTRE} horas que passam disso
              ficam de fora da contagem da coordenação.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter className="flex-col items-start gap-2">
        <Button
          onClick={baixarPdf}
          aria-busy={gerando}
          disabled={gerando || selecao.length === 0}
        >
          <FileDownIcon aria-hidden="true" />
          {gerando ? "Gerando o PDF" : "Baixar PDF"}
        </Button>
        <p
          className="text-sm text-muted-foreground empty:hidden"
          aria-live="polite"
        >
          {gerando && "Juntando o requerimento e os comprovantes."}
        </p>
      </CardFooter>
    </Card>
  )
}
