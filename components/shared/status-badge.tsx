import {
  CalendarClockIcon,
  CircleCheckIcon,
  CircleDashedIcon,
  CircleXIcon,
  HourglassIcon,
  TriangleAlertIcon,
  type LucideIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { STATUS_ROTULO, type SituacaoPrazo } from "@/lib/rules"
import type { Status } from "@/lib/types"
import { cn } from "@/lib/utils"

const ESTILO: Record<Status, { Icone: LucideIcon; cor: string }> = {
  pendente: { Icone: CircleDashedIcon, cor: "border-pendente/40 text-pendente" },
  em_analise: { Icone: HourglassIcon, cor: "border-analise/40 text-analise" },
  aprovada: {
    Icone: CircleCheckIcon,
    cor: "border-aprovada/40 text-aprovada",
  },
  recusada: { Icone: CircleXIcon, cor: "border-recusada/40 text-recusada" },
}

const BASE = "h-auto gap-1 rounded-md py-0.5 text-[0.8rem] font-normal"

export function StatusBadge({ status }: { status: Status }) {
  const { Icone, cor } = ESTILO[status]

  return (
    <Badge variant="outline" className={cn(BASE, cor)}>
      <Icone aria-hidden="true" />
      {STATUS_ROTULO[status]}
    </Badge>
  )
}

export function PrazoBadge({ situacao }: { situacao: SituacaoPrazo }) {
  if (situacao === "ok") return null

  const expirada = situacao === "expirada"
  const Icone = expirada ? TriangleAlertIcon : CalendarClockIcon

  return (
    <Badge
      variant="outline"
      className={cn(
        BASE,
        expirada
          ? "border-recusada/40 text-recusada"
          : "border-analise/40 text-analise",
      )}
    >
      <Icone aria-hidden="true" />
      {expirada ? "Prazo vencido" : "Prazo perto do fim"}
    </Badge>
  )
}
