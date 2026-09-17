import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"

/** Lista para o `aria-describedby` do controle: ajuda e erro, quando existirem. */
export function descrever(id: string, ajuda: boolean, erro?: string) {
  const partes = [ajuda ? `${id}-ajuda` : null, erro ? `${id}-erro` : null]
  return partes.filter(Boolean).join(" ") || undefined
}

export function Campo({
  id,
  rotulo,
  ajuda,
  erro,
  children,
}: {
  id: string
  rotulo: React.ReactNode
  ajuda?: React.ReactNode
  erro?: string
  children: React.ReactNode
}) {
  return (
    <Field data-invalid={Boolean(erro)}>
      <FieldLabel htmlFor={id}>{rotulo}</FieldLabel>
      {children}
      {ajuda ? (
        <FieldDescription id={`${id}-ajuda`}>{ajuda}</FieldDescription>
      ) : null}
      <FieldError id={`${id}-erro`}>{erro}</FieldError>
    </Field>
  )
}
