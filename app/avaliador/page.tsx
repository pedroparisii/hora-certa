import type { Metadata } from "next"

import { AvaliadorView } from "@/components/avaliador/avaliador-view"

export const metadata: Metadata = {
  title: "Painel da comissão",
  description:
    "Prévia de como a Comissão de Avaliação analisaria as atividades pelo sistema.",
  robots: { index: false, follow: false },
}

export default function AvaliadorPage() {
  return <AvaliadorView />
}
