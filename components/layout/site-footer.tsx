import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-border bg-card print:hidden">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm text-muted-foreground">
        <p>Protótipo para o Hackathon SeCoT XVIII.</p>
        <Link
          href="/avaliador"
          className="inline-flex min-h-11 items-center rounded-md px-2 underline underline-offset-4 hover:text-foreground"
        >
          Painel da comissão
        </Link>
      </div>
    </footer>
  )
}
