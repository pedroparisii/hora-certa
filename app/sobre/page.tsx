import type { Metadata } from "next"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  AVISO_PRAZO_DIAS,
  HORAS_POR_CREDITO,
  META_HORAS,
  MIN_CATEGORIAS,
  TETO_HORAS_SEMESTRE,
  creditosDe,
} from "@/lib/rules"

export const metadata: Metadata = {
  title: "Sobre o projeto",
  description:
    "O problema, a solução, as regras aplicadas, as decisões de acessibilidade e um roteiro para testar o protótipo.",
}

const FLUXO = [
  {
    titulo: "Registrar a atividade com o comprovante",
    texto:
      "Título, categoria, carga horária, data e o certificado em PDF, PNG ou JPG. Sem comprovante a atividade não entra.",
  },
  {
    titulo: "Acompanhar progresso e prazos",
    texto:
      "O painel soma as horas aprovadas, mostra quanto falta e avisa sobre prazos e sobre o teto de horas por semestre.",
  },
  {
    titulo: "Gerar o PDF do semestre",
    texto:
      "O card de relatório junta o requerimento e os comprovantes das atividades pendentes do semestre num arquivo só.",
  },
  {
    titulo: "Entregar à coordenação",
    texto:
      "O mesmo PDF serve para imprimir e protocolar na secretaria ou para anexar no e-mail da coordenação.",
  },
  {
    titulo: "Atualizar o status no painel",
    texto:
      "Quando a resposta chega, o aluno marca a atividade como aprovada ou recusada e anota o motivo da recusa.",
  },
]

const ACESSIBILIDADE = [
  {
    titulo: "Fonte Atkinson Hyperlegible Next",
    texto:
      "Desenhada pelo Braille Institute para quem tem baixa visão: letras parecidas, como “l”, “1” e “I”, foram feitas para não se confundirem.",
  },
  {
    titulo: "Status nunca só por cor",
    texto:
      "Aprovada, em análise, pendente e recusada aparecem sempre com ícone e palavra escrita. A mesma informação chega a quem não distingue verde de vermelho.",
  },
  {
    titulo: "Teclado do começo ao fim",
    texto:
      "Todo o fluxo funciona sem mouse, com foco visível, ordem previsível e um atalho para pular direto ao conteúdo.",
  },
  {
    titulo: "Tema e tamanho do texto",
    texto:
      "No menu do cabeçalho dá para trocar entre claro, escuro e o tema do sistema, e aumentar o texto para 112,5% ou 125% sem quebrar o layout.",
  },
  {
    titulo: "Linguagem simples",
    texto:
      "Frases curtas, uma ação principal por tela e confirmação antes de apagar. Erros dizem o que houve e como corrigir.",
  },
  {
    titulo: "Contraste e alvos grandes",
    texto:
      "Texto e componentes seguem a WCAG 2.2 AA nos dois temas, e os botões têm pelo menos 44 por 44 pixels.",
  },
]

const STACK = [
  { nome: "Next.js", papel: "App Router, páginas estáticas" },
  { nome: "TypeScript", papel: "modo strict" },
  { nome: "Tailwind CSS", papel: "tokens de cor e tipografia" },
  { nome: "shadcn/ui", papel: "componentes sobre Radix" },
  { nome: "Radix UI", papel: "diálogos, menus e foco" },
  { nome: "Zod", papel: "validação de formulário e de importação" },
  { nome: "pdf-lib", papel: "requerimento e comprovantes num PDF só" },
  { nome: "localStorage", papel: "as atividades, no lugar de um banco" },
  { nome: "IndexedDB", papel: "os comprovantes, no lugar de um banco" },
  { nome: "Atkinson Hyperlegible Next", papel: "tipografia legível" },
  { nome: "Vercel", papel: "publicação" },
]

function Secao({
  id,
  titulo,
  children,
}: {
  id: string
  titulo: string
  children: React.ReactNode
}) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <h2 id={id} className="font-heading text-xl font-semibold">
        {titulo}
      </h2>
      {children}
    </section>
  )
}

export default function SobrePage() {
  return (
    <div className="mx-auto flex max-w-[68ch] flex-col gap-10 px-4 py-12">
      <div className="flex flex-col gap-3">
        <h1 className="font-heading text-3xl font-semibold text-balance">
          Um protótipo para as atividades complementares do BCC
        </h1>
        <p className="text-lg text-muted-foreground">
          Feito para o Hackathon SeCoT XVIII, a partir das regras reais do curso
          de Ciência da Computação da UFSCar Sorocaba.
        </p>
      </div>

      <Secao id="problema" titulo="O problema">
        <p>
          As {META_HORAS} horas de atividades complementares são obrigatórias
          para se formar, mas ninguém acompanha bem esse número durante o curso. Os
          certificados ficam espalhados entre e-mails, pastas de download e
          papéis guardados na gaveta.
        </p>
        <p>Três coisas costumam dar errado:</p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            O aluno descobre no último semestre que faltam horas, quando já não
            dá tempo de fazer mais nada.
          </li>
          <li>
            O certificado perde o prazo: a validação precisa acontecer no
            semestre seguinte ao da atividade, e quem não sabe disso entrega
            tarde.
          </li>
          <li>
            Depois de entregar, o aluno não sabe se a atividade foi aceita, nem
            por que foi recusada.
          </li>
        </ul>
      </Secao>

      <Secao id="solucao" titulo="A solução">
        <p className="text-lg">
          Um lugar onde o aluno registra cada atividade, vê quanto falta para as{" "}
          {META_HORAS} horas e sabe até quando precisa entregar cada
          comprovante.
        </p>
        <p>
          Na prática, o aluno ganha três respostas que hoje ele não tem: quanto
          já valeu, o que ainda falta entregar e o que vence primeiro. E ganha o
          requerimento pronto: um PDF único que começa com a tabela das
          atividades do semestre e segue com cada comprovante, na mesma ordem.
          É esse arquivo que vai para a Comissão de Avaliação, impresso ou por
          e-mail, sem precisar montar pasta nenhuma.
        </p>
      </Secao>

      <Secao id="fluxo" titulo="Como funciona, passo a passo">
        <ol className="flex flex-col gap-3">
          {FLUXO.map((passo, indice) => (
            <li key={passo.titulo} className="flex gap-3">
              <span
                aria-hidden="true"
                className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary font-semibold"
              >
                {indice + 1}
              </span>
              <span>
                <strong className="font-semibold">{passo.titulo}.</strong>{" "}
                {passo.texto}
              </span>
            </li>
          ))}
        </ol>
      </Secao>

      <Secao id="regras" titulo="As regras da UFSCar que o sistema aplica">
        <ul className="flex flex-col gap-2">
          {[
            `${META_HORAS} horas no total para concluir o curso.`,
            `1 crédito equivale a ${HORAS_POR_CREDITO} horas, então a meta são ${META_HORAS / HORAS_POR_CREDITO} créditos.`,
            `As horas precisam vir de pelo menos ${MIN_CATEGORIAS} categorias diferentes.`,
            "Cada atividade é validada no semestre seguinte ao da realização, e o prazo termina no último dia desse semestre.",
            `Cada semestre aproveita no máximo ${TETO_HORAS_SEMESTRE} horas, o equivalente a ${creditosDe(TETO_HORAS_SEMESTRE)} créditos.`,
            `Atividades pendentes a menos de ${AVISO_PRAZO_DIAS} dias do prazo aparecem como aviso no painel.`,
          ].map((regra) => (
            <li key={regra} className="flex gap-2">
              <span aria-hidden="true" className="text-primary">
                •
              </span>
              {regra}
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground">
          Só as atividades aprovadas entram no total. As que estão em análise
          aparecem como previsão, e as que perderam o prazo ficam marcadas e não
          somam. O semestre é calculado de forma simplificada: janeiro a junho é
          o primeiro, julho a dezembro é o segundo.
        </p>
      </Secao>

      <Secao id="acessibilidade" titulo="Acessibilidade">
        <p>
          Um aluno com baixa visão, dislexia ou TDAH não deveria precisar pedir
          ajuda para descobrir quantas horas ainda faltam. É só uma conta, e a
          conta tem que estar legível para todo mundo. Por isso a acessibilidade
          entrou nas primeiras decisões do projeto, não na revisão final.
        </p>
        <ul className="flex flex-col gap-3">
          {ACESSIBILIDADE.map((item) => (
            <li key={item.titulo}>
              <strong className="font-semibold">{item.titulo}.</strong>{" "}
              <span className="text-muted-foreground">{item.texto}</span>
            </li>
          ))}
        </ul>
      </Secao>

      <Secao id="proposta" titulo="Proposta para a UFSCar">
        <p>
          Hoje o aluno entrega os comprovantes e espera. O{" "}
          <Link href="/avaliador" className="text-primary underline underline-offset-4">
            painel da comissão
          </Link>{" "}
          mostra como esse último passo poderia acontecer dentro do próprio
          sistema: os professores responsáveis abrem a fila, veem cada
          comprovante e registram a decisão ali mesmo, com o motivo escrito
          quando recusam.
        </p>
        <p>
          É essa tela que atende ao item do edital de compartilhar as
          atividades com os professores por um painel de acesso. Ela vem sem
          login de propósito, para a banca poder abrir e testar. Numa versão
          real, seria a porta de entrada da Comissão de Avaliação do DComp-So, e
          o status que ela grava chegaria ao painel do aluno sem ninguém
          precisar digitar nada de novo.
        </p>
      </Secao>

      <Secao id="testar" titulo="Como testar em dois minutos">
        <p>
          O painel já vem com atividades de exemplo, inclusive uma com prazo
          vencido e um semestre acima do teto de horas. Sugestão de roteiro:
        </p>
        <ol className="ml-5 flex list-decimal flex-col gap-2">
          <li>
            Abra o{" "}
            <Link href="/painel" className="text-primary underline underline-offset-4">
              painel
            </Link>{" "}
            e registre uma atividade nova. O comprovante é obrigatório: use
            qualquer PDF ou imagem que você tenha à mão.
          </li>
          <li>
            Desça até o card “Gerar relatório”, escolha um semestre e baixe o
            PDF. Ele abre com o requerimento e, na sequência, os comprovantes.
          </li>
          <li>
            Edite uma atividade da lista e mude o status para aprovada ou
            recusada. A régua de progresso e os avisos mudam na hora.
          </li>
          <li>
            Abra o{" "}
            <Link href="/avaliador" className="text-primary underline underline-offset-4">
              painel da comissão
            </Link>{" "}
            para ver a prévia da análise: iniciar análise, aprovar ou recusar
            com motivo.
          </li>
        </ol>
        <p className="text-sm text-muted-foreground">
          As atividades e os comprovantes são de exemplo e ficam só no seu
          navegador. Para voltar ao estado inicial, use “Restaurar dados de
          exemplo” no fim do painel.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/painel">Abrir o painel</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/avaliador">Painel da comissão</Link>
          </Button>
        </div>
      </Secao>

      <Secao id="decisoes" titulo="Decisões e próximos passos">
        <p>
          <strong className="font-semibold">Sem banco de dados, por ora.</strong>{" "}
          Um banco exigiria servidor, hospedagem e contas de usuário para
          manter no ar durante o hackathon, e nada disso muda o que a banca
          precisa ver. Então o protótipo guarda tudo no próprio navegador: as
          atividades no <code>localStorage</code> e os comprovantes no
          IndexedDB, que aguenta arquivos sem estourar o limite de
          armazenamento. Numa versão para o curso, essa camada vira um banco de
          verdade; o resto do sistema não muda.
        </p>
        <p>
          <strong className="font-semibold">
            O status é o ponto de integração.
          </strong>{" "}
          Enquanto não existe integração, quem controla o status é o aluno: ele
          marca o que já foi aprovado e o que voltou recusado. O painel da
          comissão escreve no mesmo campo. Numa versão integrada ao SIGA, basta
          trocar essa origem pela oficial, sem mexer no resto do sistema.
        </p>
        <p>
          <strong className="font-semibold">O que viria depois.</strong>{" "}
          Autenticação pela UFSCar, leitura do histórico do aluno para já saber
          quantos créditos faltam, e uma fila de análise compartilhada entre
          coordenação e secretaria.
        </p>
      </Secao>

      <Secao id="stack" titulo="Como foi construído">
        <Card>
          <CardContent>
            <dl className="flex flex-col">
              {STACK.map((item) => (
                <div
                  key={item.nome}
                  className="flex flex-wrap items-baseline justify-between gap-x-4 border-t border-border py-2 first:border-t-0 first:pt-0 last:pb-0"
                >
                  <dt className="font-medium">{item.nome}</dt>
                  <dd className="text-sm text-muted-foreground">
                    {item.papel}
                  </dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </Secao>
    </div>
  )
}
