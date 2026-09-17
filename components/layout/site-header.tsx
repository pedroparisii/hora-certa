"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ClockIcon } from "lucide-react"

import { A11yMenu } from "@/components/layout/a11y-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const LINKS = [
  { href: "/", rotulo: "Início" },
  { href: "/painel", rotulo: "Painel" },
  { href: "/sobre", rotulo: "Sobre" },
]

export function SiteHeader() {
  const caminho = usePathname()

  return (
    <header className="border-b border-border bg-card print:hidden">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md px-1 py-2 text-base font-semibold"
        >
          <ClockIcon aria-hidden="true" className="size-5 text-primary" />
          Hora Certa
        </Link>

        <div className="ml-auto sm:order-last">
          <A11yMenu />
        </div>

        <nav
          aria-label="Principal"
          className="order-last w-full sm:order-none sm:ml-auto sm:w-auto"
        >
          <ul className="flex flex-wrap items-center gap-1">
            {LINKS.map((link) => {
              const atual = caminho === link.href
              return (
                <li key={link.href}>
                  <Button
                    asChild
                    variant="ghost"
                    className={cn(
                      "font-normal",
                      atual && "bg-secondary font-medium text-foreground",
                    )}
                  >
                    <Link
                      href={link.href}
                      aria-current={atual ? "page" : undefined}
                    >
                      {link.rotulo}
                    </Link>
                  </Button>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </header>
  )
}
