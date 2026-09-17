import type { Metadata } from "next"
import { Atkinson_Hyperlegible_Next } from "next/font/google"
import { ThemeProvider } from "next-themes"

import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { Toaster } from "@/components/ui/sonner"

import "./globals.css"

const atkinson = Atkinson_Hyperlegible_Next({
  variable: "--font-atkinson",
  subsets: ["latin"],
  display: "swap",
  fallback: ["Verdana", "system-ui", "sans-serif"],
})

export const metadata: Metadata = {
  title: {
    default: "Hora Certa — atividades complementares",
    template: "%s · Hora Certa",
  },
  description:
    "Registre atividades complementares, acompanhe o progresso até as 90 horas e gere o relatório de entrega.",
}

const AJUSTE_TEXTO = `(function(){try{var t=localStorage.getItem("ac:texto");if(t)document.documentElement.setAttribute("data-texto",t)}catch(e){}})()`

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      data-texto="100"
      suppressHydrationWarning
      className={`${atkinson.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: AJUSTE_TEXTO }} />
      </head>
      <body className="flex min-h-full flex-col">
        <ThemeProvider attribute="class" disableTransitionOnChange>
          <a
            href="#conteudo"
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-3 focus:text-primary-foreground"
          >
            Pular para o conteúdo
          </a>
          <SiteHeader />
          <main id="conteudo" className="flex-1">
            {children}
          </main>
          <SiteFooter />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
