import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib"

import { lerArquivo } from "@/lib/files"
import {
  HORAS_POR_CREDITO,
  STATUS_ROTULO,
  creditosDe,
  formatarData,
  hojeISO,
  rotuloCategoria,
} from "@/lib/rules"
import type { Activity } from "@/lib/types"

const LARGURA = 595
const ALTURA = 842
const MARGEM = 50
const TINTA = rgb(0.09, 0.13, 0.17)
const CINZA = rgb(0.42, 0.45, 0.49)
const PETROLEO = rgb(0.06, 0.37, 0.42)
const PAPEL = rgb(1, 1, 1)

const COLUNAS = [
  { rotulo: "Nº", x: 50, largura: 22 },
  { rotulo: "Atividade", x: 74, largura: 184 },
  { rotulo: "Categoria", x: 262, largura: 108 },
  { rotulo: "Data", x: 374, largura: 52 },
  { rotulo: "Horas", x: 430, largura: 32 },
  { rotulo: "Status", x: 468, largura: 77 },
] as const

export type Relatorio = {
  blob: Blob
  nome: string
  /** Títulos das atividades cujo comprovante não pôde entrar no PDF. */
  faltando: string[]
}

function quebrar(
  texto: string,
  fonte: PDFFont,
  tamanho: number,
  largura: number,
): string[] {
  const linhas: string[] = []
  let atual = ""

  for (const palavra of texto.split(" ")) {
    const tentativa = atual ? `${atual} ${palavra}` : palavra
    if (atual && fonte.widthOfTextAtSize(tentativa, tamanho) > largura) {
      linhas.push(atual)
      atual = palavra
    } else {
      atual = tentativa
    }
  }

  if (atual) linhas.push(atual)
  return linhas
}

function escreverRequerimento(
  doc: PDFDocument,
  normal: PDFFont,
  negrito: PDFFont,
  semestre: string,
  atividades: Activity[],
): void {
  let pagina = doc.addPage([LARGURA, ALTURA])
  let y = ALTURA - MARGEM

  const linha = (texto: string, tamanho: number, fonte: PDFFont, cor = TINTA) => {
    y -= tamanho + 4
    pagina.drawText(texto, { x: MARGEM, y, size: tamanho, font: fonte, color: cor })
  }

  const novaPagina = () => {
    pagina = doc.addPage([LARGURA, ALTURA])
    y = ALTURA - MARGEM
  }

  linha("Requerimento de atividades complementares", 17, negrito)
  linha("Bacharelado em Ciência da Computação - UFSCar Sorocaba", 10, normal, CINZA)
  y -= 10
  linha(`Semestre de validação: ${semestre}`, 11, normal)
  linha(`Gerado em ${formatarData(hojeISO())}`, 11, normal, CINZA)

  y -= 18
  for (const campo of ["Nome do aluno", "Número de RA", "Assinatura"]) {
    linha(`${campo}:`, 10, normal, CINZA)
    y -= 12
    pagina.drawLine({
      start: { x: MARGEM, y },
      end: { x: LARGURA - MARGEM, y },
      color: CINZA,
      thickness: 0.5,
    })
    y -= 6
  }

  y -= 20
  const cabecalho = () => {
    for (const coluna of COLUNAS) {
      pagina.drawText(coluna.rotulo, {
        x: coluna.x,
        y,
        size: 9,
        font: negrito,
        color: TINTA,
      })
    }
    y -= 6
    pagina.drawLine({
      start: { x: MARGEM, y },
      end: { x: LARGURA - MARGEM, y },
      color: CINZA,
      thickness: 0.5,
    })
    y -= 12
  }

  cabecalho()

  atividades.forEach((atividade, indice) => {
    const titulo = quebrar(atividade.titulo, normal, 9, COLUNAS[1].largura)
    const categoria = quebrar(
      rotuloCategoria(atividade.categoria),
      normal,
      9,
      COLUNAS[2].largura,
    )
    const alturaLinha = Math.max(titulo.length, categoria.length) * 11 + 5

    if (y - alturaLinha < MARGEM + 90) {
      novaPagina()
      cabecalho()
    }

    const celulas = [
      [String(indice + 1)],
      titulo,
      categoria,
      [formatarData(atividade.data)],
      [`${atividade.horas} h`],
      [STATUS_ROTULO[atividade.status]],
    ]

    celulas.forEach((linhas, coluna) => {
      const { x, largura, rotulo } = COLUNAS[coluna]
      linhas.forEach((texto, indiceLinha) => {
        const deslocamento =
          rotulo === "Horas" ? largura - normal.widthOfTextAtSize(texto, 9) : 0
        pagina.drawText(texto, {
          x: x + deslocamento,
          y: y - indiceLinha * 11,
          size: 9,
          font: normal,
          color: TINTA,
        })
      })
    })

    y -= alturaLinha
  })

  if (y < MARGEM + 130) novaPagina()

  y -= 6
  pagina.drawLine({
    start: { x: MARGEM, y },
    end: { x: LARGURA - MARGEM, y },
    color: CINZA,
    thickness: 0.5,
  })
  y -= 8

  const horasTotais = atividades.reduce((total, item) => total + item.horas, 0)
  linha("Totais por categoria", 11, negrito)

  const porCategoria = new Map<string, number>()
  for (const atividade of atividades) {
    const rotulo = rotuloCategoria(atividade.categoria)
    porCategoria.set(rotulo, (porCategoria.get(rotulo) ?? 0) + atividade.horas)
  }

  for (const [rotulo, horas] of porCategoria) {
    linha(
      `${rotulo}: ${horas} h (${creditosDe(horas)} crédito(s))`,
      10,
      normal,
    )
  }

  y -= 6
  linha(
    `Total: ${atividades.length} atividade(s), ${horasTotais} h, ${creditosDe(horasTotais)} crédito(s).`,
    11,
    negrito,
  )
  linha(`1 crédito equivale a ${HORAS_POR_CREDITO} horas.`, 9, normal, CINZA)
}

function abrirSeparador(
  doc: PDFDocument,
  negrito: PDFFont,
  normal: PDFFont,
  numero: number,
  titulo: string,
): void {
  const pagina = doc.addPage([LARGURA, ALTURA])
  const topo = ALTURA - 160

  pagina.drawRectangle({
    x: 0,
    y: topo,
    width: LARGURA,
    height: 70,
    color: PETROLEO,
  })
  pagina.drawText(`Comprovante nº ${numero}`, {
    x: MARGEM,
    y: topo + 42,
    size: 16,
    font: negrito,
    color: PAPEL,
  })

  quebrar(titulo, normal, 12, LARGURA - 2 * MARGEM)
    .slice(0, 1)
    .forEach((texto) => {
      pagina.drawText(texto, {
        x: MARGEM,
        y: topo + 20,
        size: 12,
        font: normal,
        color: PAPEL,
      })
    })
}

function ajustarImagem(imagem: {
  width: number
  height: number
}): { x: number; y: number; width: number; height: number } {
  const escala = Math.min(
    (LARGURA - 2 * MARGEM) / imagem.width,
    (ALTURA - 2 * MARGEM) / imagem.height,
  )
  const width = imagem.width * escala
  const height = imagem.height * escala
  return {
    x: (LARGURA - width) / 2,
    y: (ALTURA - height) / 2,
    width,
    height,
  }
}

/** Prepara o comprovante e devolve a função que o acrescenta ao documento. */
async function prepararComprovante(
  doc: PDFDocument,
  atividade: Activity,
): Promise<(() => void) | null> {
  const blob = await lerArquivo(atividade.arquivo.id)
  if (!blob) return null

  const bytes = new Uint8Array(await blob.arrayBuffer())

  if (atividade.arquivo.tipo === "application/pdf") {
    const origem = await PDFDocument.load(bytes)
    const paginas = await doc.copyPages(origem, origem.getPageIndices())
    return () => paginas.forEach((pagina) => doc.addPage(pagina))
  }

  const imagem =
    atividade.arquivo.tipo === "image/png"
      ? await doc.embedPng(bytes)
      : await doc.embedJpg(bytes)

  return () => {
    const pagina = doc.addPage([LARGURA, ALTURA])
    pagina.drawImage(imagem, ajustarImagem(imagem))
  }
}

/** Monta o requerimento e os comprovantes das atividades num PDF só. */
export async function gerarRelatorio(
  semestre: string,
  atividades: Activity[],
): Promise<Relatorio> {
  const doc = await PDFDocument.create()
  doc.setTitle(`Atividades complementares - validação em ${semestre}`)

  const normal = await doc.embedFont(StandardFonts.Helvetica)
  const negrito = await doc.embedFont(StandardFonts.HelveticaBold)

  escreverRequerimento(doc, normal, negrito, semestre, atividades)

  const faltando: string[] = []
  let numero = 0

  for (const atividade of atividades) {
    numero += 1
    try {
      const anexar = await prepararComprovante(doc, atividade)
      if (!anexar) {
        faltando.push(atividade.titulo)
        continue
      }
      abrirSeparador(doc, negrito, normal, numero, atividade.titulo)
      anexar()
    } catch {
      faltando.push(atividade.titulo)
    }
  }

  const bytes = await doc.save()

  return {
    blob: new Blob([bytes as BlobPart], { type: "application/pdf" }),
    nome: `relatorio-ac-${semestre.replace(".", "-")}.pdf`,
    faltando,
  }
}
