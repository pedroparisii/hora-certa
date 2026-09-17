import type { Metadata } from "next"

import { PainelView } from "@/components/painel/painel-view"

export const metadata: Metadata = {
  title: "Painel",
  description:
    "Progresso das horas complementares, avisos de prazo e lista de atividades.",
}

export default function PainelPage() {
  return <PainelView />
}
