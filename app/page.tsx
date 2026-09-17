import Link from "next/link"
import {
  CalendarClockIcon,
  FileTextIcon,
  ListChecksIcon,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { META_HORAS } from "@/lib/rules"

const RESOLVE: { Icone: LucideIcon; titulo: string; texto: string }[] = [
  {
    Icone: ListChecksIcon,
    titulo: "Registrar",
    texto:
      "Guarde título, categoria, carga horária e o comprovante de cada atividade em um lugar só.",
  },
  {
    Icone: CalendarClockIcon,
    titulo: "Acompanhar prazos",
    texto:
      "O sistema calcula o semestre de validação de cada atividade, avisa quando o prazo está perto e marca o que venceu.",
  },
  {
    Icone: FileTextIcon,
    titulo: "Gerar relatório",
    texto:
      "Baixe um PDF com o requerimento do semestre e todos os comprovantes juntos, pronto para entregar.",
  },
]

export default function InicioPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-12">
      <section className="flex flex-col gap-4">
        <h1 className="font-heading text-3xl font-semibold text-balance">
          Controle das suas atividades complementares
        </h1>
        <p className="text-lg text-muted-foreground">
          Para quem cursa Bacharelado em Ciência da Computação na UFSCar
          Sorocaba e precisa cumprir {META_HORAS} horas de atividades
          complementares até o fim do curso.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="lg">
            <Link href="/painel">Abrir meu painel</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/sobre">Conhecer o projeto</Link>
          </Button>
        </div>
      </section>

      <section aria-labelledby="resolve" className="flex flex-col gap-4">
        <h2 id="resolve" className="font-heading text-xl font-semibold">
          O que dá para fazer aqui
        </h2>
        <ul className="grid gap-4 sm:grid-cols-3">
          {RESOLVE.map((item) => (
            <li key={item.titulo}>
              <Card className="h-full">
                <CardHeader>
                  <item.Icone
                    aria-hidden="true"
                    className="size-5 text-primary"
                  />
                  <CardTitle>
                    <h3>{item.titulo}</h3>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  {item.texto}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="demonstracao" className="flex flex-col gap-4">
        <h2 id="demonstracao" className="font-heading text-xl font-semibold">
          Veja a plataforma em uso
        </h2>
        <video
          controls
          preload="none"
          poster="/demo-poster.jpg"
          aria-describedby="demonstracao-descricao"
          className="aspect-video w-full rounded-lg border border-border bg-card"
        >
          <source src="/demo-web.mp4" type="video/mp4" />
          <a href="/demo-web.mp4" className="underline underline-offset-4">
            Baixar o vídeo de demonstração
          </a>
        </video>
        <p id="demonstracao-descricao" className="text-muted-foreground">
          O vídeo mostra, nesta ordem: a página inicial, o painel com a
          régua de progresso e os avisos, o registro de uma atividade com
          comprovante, a escolha do semestre no card de relatório, as horas por
          categoria e a página Sobre.
        </p>
      </section>
    </div>
  )
}
