import { z } from "zod"

import { TAMANHO_MAXIMO, TIPOS_ACEITOS, formatarTamanho } from "@/lib/files"
import { CATEGORIAS, STATUS, hojeISO, type CategoryId } from "@/lib/rules"

const IDS_CATEGORIA = CATEGORIAS.map((categoria) => categoria.id) as [
  CategoryId,
  ...CategoryId[],
]

const DATA_ISO = /^\d{4}-\d{2}-\d{2}$/

/** Campos que o aluno preenche no formulário. */
export const formularioSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(3, "Escreva um título com pelo menos 3 letras.")
    .max(120, "Use no máximo 120 caracteres."),
  categoria: z.enum(IDS_CATEGORIA, {
    error: "Escolha a categoria da atividade.",
  }),
  horas: z.coerce
    .number({ error: "Informe a carga horária em horas." })
    .int("Informe a carga horária em horas inteiras.")
    .positive("A carga horária precisa ser maior que zero.")
    .max(999, "Informe uma carga horária de até 999 horas."),
  data: z
    .string()
    .regex(DATA_ISO, "Informe a data de realização.")
    .refine((data) => data <= hojeISO(), "A data não pode estar no futuro."),
  status: z.enum(STATUS, { error: "Escolha o status da atividade." }),
  motivoRecusa: z
    .string()
    .trim()
    .max(300, "Use no máximo 300 caracteres.")
    .optional(),
})

/** O arquivo enviado no formulário: obrigatório ao registrar uma atividade. */
export const comprovanteSchema = z
  .instanceof(File, { error: "Anexe o comprovante da atividade." })
  .refine((arquivo) => arquivo.size > 0, "Anexe o comprovante da atividade.")
  .refine(
    (arquivo) => TIPOS_ACEITOS.includes(arquivo.type),
    "Envie um arquivo PDF, PNG ou JPG.",
  )
  .refine(
    (arquivo) => arquivo.size <= TAMANHO_MAXIMO,
    `O comprovante precisa ter até ${formatarTamanho(TAMANHO_MAXIMO)}.`,
  )

const atividadeSchema = z.object({
  id: z.string().min(1),
  titulo: z.string().min(1),
  categoria: z.enum(IDS_CATEGORIA),
  horas: z.number().int().positive(),
  data: z.string().regex(DATA_ISO),
  status: z.enum(STATUS),
  arquivo: z.object({
    id: z.string().min(1),
    nome: z.string().min(1),
    tipo: z.string(),
    tamanho: z.number().nonnegative(),
  }),
  motivoRecusa: z.string().optional(),
})

export const atividadesSchema = z.array(atividadeSchema)
