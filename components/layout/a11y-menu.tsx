"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import { PaletteIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const CHAVE_TEXTO = "ac:texto"

const TEMAS = [
  { valor: "light", rotulo: "Claro" },
  { valor: "dark", rotulo: "Escuro" },
  { valor: "system", rotulo: "Do sistema" },
]

const TAMANHOS = [
  { valor: "100", rotulo: "Padrão" },
  { valor: "112", rotulo: "Maior (112,5%)" },
  { valor: "125", rotulo: "Muito maior (125%)" },
]

function tamanhoSalvo(): string {
  try {
    return localStorage.getItem(CHAVE_TEXTO) ?? "100"
  } catch {
    return "100"
  }
}

export function A11yMenu() {
  const { theme, setTheme } = useTheme()
  const [tamanho, setTamanho] = useState(tamanhoSalvo)

  function mudarTamanho(valor: string) {
    setTamanho(valor)
    document.documentElement.setAttribute("data-texto", valor)
    try {
      localStorage.setItem(CHAVE_TEXTO, valor)
    } catch {
      // Sem localStorage a escolha vale só nesta aba.
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <PaletteIcon aria-hidden="true" />
          <span className="sr-only">Acessibilidade</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Tema</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          {TEMAS.map((opcao) => (
            <DropdownMenuRadioItem key={opcao.valor} value={opcao.valor}>
              {opcao.rotulo}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Tamanho do texto</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={tamanho} onValueChange={mudarTamanho}>
          {TAMANHOS.map((opcao) => (
            <DropdownMenuRadioItem key={opcao.valor} value={opcao.valor}>
              {opcao.rotulo}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
