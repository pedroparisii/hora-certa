"use client"

import { Campo, descrever } from "@/components/shared/campo"
import { FileField } from "@/components/painel/atividades/file-field"
import { FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  CATEGORIAS,
  STATUS_ALUNO,
  STATUS_ROTULO,
  hojeISO,
  type CategoryId,
} from "@/lib/rules"
import type { Activity, Status } from "@/lib/types"

export function ActivityFields({
  id,
  atividade,
  erros,
  categoria,
  aoMudarCategoria,
  status,
  aoMudarStatus,
}: {
  id: string
  atividade?: Activity
  erros: Record<string, string>
  categoria: CategoryId | ""
  aoMudarCategoria: (categoria: CategoryId) => void
  status: Status
  aoMudarStatus: (status: Status) => void
}) {
  const descricaoCategoria = CATEGORIAS.find(
    (item) => item.id === categoria,
  )?.descricao

  const emAnalise = atividade?.status === "em_analise"
  const opcoesStatus: Status[] = emAnalise
    ? ["em_analise", ...STATUS_ALUNO]
    : [...STATUS_ALUNO]

  return (
    <FieldGroup>
      <Campo
        id={`${id}-titulo`}
        rotulo="Título da atividade (obrigatório)"
        erro={erros.titulo}
      >
        <Input
          id={`${id}-titulo`}
          name="titulo"
          defaultValue={atividade?.titulo}
          aria-invalid={Boolean(erros.titulo)}
          aria-describedby={descrever(`${id}-titulo`, false, erros.titulo)}
        />
      </Campo>

      <Campo
        id={`${id}-categoria`}
        rotulo="Categoria (obrigatório)"
        erro={erros.categoria}
        ajuda={descricaoCategoria ?? "Escolha onde o seu certificado se encaixa."}
      >
        <Select
          name="categoria"
          value={categoria}
          onValueChange={(valor) => aoMudarCategoria(valor as CategoryId)}
        >
          <SelectTrigger
            id={`${id}-categoria`}
            className="w-full"
            aria-invalid={Boolean(erros.categoria)}
            aria-describedby={descrever(
              `${id}-categoria`,
              true,
              erros.categoria,
            )}
          >
            <SelectValue placeholder="Escolha a categoria" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIAS.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.rotulo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Campo>

      <div className="grid gap-5 sm:grid-cols-2">
        <Campo
          id={`${id}-horas`}
          rotulo="Carga horária (obrigatório)"
          ajuda="Em horas inteiras, como está no certificado."
          erro={erros.horas}
        >
          <Input
            id={`${id}-horas`}
            name="horas"
            type="number"
            inputMode="numeric"
            min={1}
            max={999}
            step={1}
            defaultValue={atividade?.horas}
            aria-invalid={Boolean(erros.horas)}
            aria-describedby={descrever(`${id}-horas`, true, erros.horas)}
          />
        </Campo>

        <Campo
          id={`${id}-data`}
          rotulo="Data de realização (obrigatório)"
          ajuda="Define o semestre de validação."
          erro={erros.data}
        >
          <Input
            id={`${id}-data`}
            name="data"
            type="date"
            max={hojeISO()}
            defaultValue={atividade?.data}
            aria-invalid={Boolean(erros.data)}
            aria-describedby={descrever(`${id}-data`, true, erros.data)}
          />
        </Campo>
      </div>

      <Campo
        id={`${id}-status`}
        rotulo="Status (obrigatório)"
        erro={erros.status}
        ajuda={
          emAnalise
            ? "O painel da comissão marcou esta atividade como em análise. Você pode trocar por pendente, aprovada ou recusada."
            : "Como está a entrega deste comprovante na secretaria."
        }
      >
        <Select
          name="status"
          value={status}
          onValueChange={(valor) => aoMudarStatus(valor as Status)}
        >
          <SelectTrigger
            id={`${id}-status`}
            className="w-full"
            aria-describedby={descrever(`${id}-status`, true, erros.status)}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {opcoesStatus.map((valor) => (
              <SelectItem key={valor} value={valor}>
                {valor === "em_analise"
                  ? "Em análise (definido pela comissão)"
                  : STATUS_ROTULO[valor]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Campo>

      {status === "recusada" && (
        <Campo
          id={`${id}-motivoRecusa`}
          rotulo="Motivo da recusa"
          ajuda="Opcional. Anote o que a secretaria pediu para corrigir."
          erro={erros.motivoRecusa}
        >
          <Textarea
            id={`${id}-motivoRecusa`}
            name="motivoRecusa"
            rows={3}
            defaultValue={atividade?.motivoRecusa}
            aria-invalid={Boolean(erros.motivoRecusa)}
            aria-describedby={descrever(
              `${id}-motivoRecusa`,
              true,
              erros.motivoRecusa,
            )}
          />
        </Campo>
      )}

      <FileField id={`${id}-arquivo`} meta={atividade?.arquivo} erro={erros.arquivo} />
    </FieldGroup>
  )
}
