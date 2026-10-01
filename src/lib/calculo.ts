import { CHANCES } from '../data/chances'
import { ITENS, type ItemId, type Origem } from '../data/itens'
import { mineriosDisponiveis, type Minerio } from '../data/minerios'
import { CONSUMO_BSB, taxaInformada, taxaPorTentativa } from '../data/refino'
import { tipoPorId, type TipoId } from '../data/tipos'

export type Otimismo = 'muitoPessimista' | 'pessimista' | 'otimista' | 'muitoOtimista'

export const OTIMISMOS: readonly { id: Otimismo; nome: string }[] = [
  { id: 'muitoPessimista', nome: 'Muito Pessimista' },
  { id: 'pessimista', nome: 'Pessimista' },
  { id: 'otimista', nome: 'Otimista' },
  { id: 'muitoOtimista', nome: 'Muito Otimista' },
]

export interface ConfigStep {
  minerio?: ItemId
  otimismo?: Otimismo | 'padrao'
  bsb?: boolean
}

export interface Plano {
  tipo: TipoId
  atual: number
  alvo: number
  evento: boolean
  sempreBsb: boolean
  otimismo: Otimismo
  /** Escolhas por step, indexadas pelo step (N = de +(N-1) para +N). */
  steps: Record<number, ConfigStep>
}

export interface Precos {
  /** Preço unitário em zeny de itens comprados de jogadores. */
  valores: Partial<Record<ItemId, number>>
  /** Para itens fabricáveis: fabricar no NPC ou comprar pronto. */
  origem: Partial<Record<ItemId, Origem>>
}

export type ConsequenciaFalha =
  | { tipo: 'semRisco' }
  | { tipo: 'protegido' }
  | { tipo: 'perde'; niveis: number; voltaPara: number }
  | { tipo: 'destroi' }

export interface LinhaStep {
  step: number
  /** Step abaixo do refino atual, refeito por causa de quedas nos steps acima. */
  repasse: boolean
  minerio: Minerio
  opcoesMinerio: Minerio[]
  otimismoEscolhido: Otimismo | 'padrao'
  otimismo: Otimismo
  bsbDisponivel: boolean
  bsbTravado: boolean
  bsb: boolean
  chance: number
  provaveis: number
  passagens: number
  efetivas: number
  falha: ConsequenciaFalha
  itensDestruidos: number
  zenyTaxa: number
  zenyFabricacao: number
  zeny: number
  minerioBase: ItemId
  minerioBaseQtd: number
  po: number
  bsbQtd: number
}

export interface Resultado {
  linhas: LinhaStep[]
  /** Zeny pago ao NPC: taxas de refino + fabricação/compra de minérios. */
  zenyNpc: number
  zenyTaxas: number
  zenyFabricacao: number
  custoMercado: number
  totalZeny: number
  /** Quantidade de cada minério usado diretamente nas tentativas. */
  minerios: Map<ItemId, number>
  po: number
  bsb: number
  itensDestruidos: number
  /** Itens comprados de jogadores para levar ao refinador. */
  levar: Map<ItemId, number>
  /** Itens de cash (JoyCoins), fora do total em zeny. */
  cash: Map<ItemId, number>
  /** Minérios fabricados no NPC da refinaria. */
  fabricar: Map<ItemId, number>
  /** Itens comprados do NPC da refinaria por preço fixo. */
  comprarNpc: Map<ItemId, number>
  precosFaltando: ItemId[]
  taxaInformada: boolean
}

const PO: ItemId = 'poEter'

/** Tentativas prováveis para passar de um step, conforme o otimismo. `chance` em %. */
export function tentativasProvaveis(chance: number, otimismo: Otimismo): number {
  if (chance >= 100) return 1
  // Arredonda em 6 casas como a planilha, para 1/0,2 não virar 5,000000001.
  const x = Math.round((100 / chance) * 1e6) / 1e6
  switch (otimismo) {
    case 'muitoPessimista':
      return Math.ceil(x) + 1
    case 'pessimista':
      return Math.ceil(x)
    case 'otimista':
      return Math.floor(x)
    case 'muitoOtimista':
      return Math.max(Math.floor(x) - 1, 1)
  }
}

export function origemDe(item: ItemId, precos: Precos): Origem | null {
  const obtencao = ITENS[item].obtencao
  if (obtencao.tipo !== 'fabricado') return null
  return precos.origem[item] ?? obtencao.padrao
}

interface Expansao {
  zenyFabricacao: number
  /** Comprados de jogadores ou de cash. */
  levar: Map<ItemId, number>
  fabricar: Map<ItemId, number>
  comprarNpc: Map<ItemId, number>
}

function somar(mapa: Map<ItemId, number>, item: ItemId, qtd: number) {
  if (qtd) mapa.set(item, (mapa.get(item) ?? 0) + qtd)
}

/** Desmonta `qtd` unidades de um item até chegar no que precisa ser comprado. */
export function expandir(item: ItemId, qtd: number, precos: Precos, acc?: Expansao): Expansao {
  const exp = acc ?? { zenyFabricacao: 0, levar: new Map(), fabricar: new Map(), comprarNpc: new Map() }
  const obtencao = ITENS[item].obtencao
  if (obtencao.tipo === 'npc') {
    somar(exp.comprarNpc, item, qtd)
    exp.zenyFabricacao += obtencao.zeny * qtd
  } else if (obtencao.tipo === 'fabricado' && origemDe(item, precos) === 'fabricar') {
    somar(exp.fabricar, item, qtd)
    exp.zenyFabricacao += obtencao.receita.zeny * qtd
    for (const insumo of obtencao.receita.insumos) expandir(insumo.item, insumo.qtd * qtd, precos, exp)
  } else {
    somar(exp.levar, item, qtd)
  }
  return exp
}

function minerioEscolhido(opcoes: Minerio[], config: ConfigStep | undefined): Minerio {
  const escolhido = opcoes.find((m) => m.id === config?.minerio)
  if (escolhido) return escolhido
  const padrao = opcoes.find((m) => m.classe === 'comum') ?? opcoes[0]
  if (!padrao) throw new Error('Nenhum minério disponível para o step')
  return padrao
}

/** Normaliza atual/alvo para a faixa válida do tipo de item. */
export function limitarFaixa(plano: Plano): Plano {
  const max = tipoPorId(plano.tipo).refinoMax
  const atual = Math.min(Math.max(Math.trunc(plano.atual), 0), max - 1)
  const alvo = Math.min(Math.max(Math.trunc(plano.alvo), atual + 1), max)
  return { ...plano, atual, alvo }
}

export function calcular(planoEntrada: Plano, precos: Precos): Resultado {
  const plano = limitarFaixa(planoEntrada)
  const tipo = tipoPorId(plano.tipo)
  const periodo = plano.evento ? 'evento' : 'normal'
  const linhas: LinhaStep[] = []

  // Os steps são resolvidos de cima para baixo: as passagens por um step dependem só das
  // falhas dos steps acima dele. Cada falha com queda de k refinos no step s obriga a refazer
  // os steps s-k ... s-1, o que pode descer abaixo do refino atual (linhas de repasse).
  let menorStep = plano.atual + 1
  for (let step = plano.alvo; step >= 1 && step >= menorStep; step--) {
    let passagens = step > plano.atual ? 1 : 0
    for (const acima of linhas) {
      if (acima.falha.tipo === 'perde' && acima.step - acima.falha.niveis <= step) {
        passagens += (acima.provaveis - 1) * acima.passagens
      }
    }
    if (passagens === 0) continue

    const config = plano.steps[step]
    const opcoesMinerio = mineriosDisponiveis(plano.tipo, step)
    const minerio = minerioEscolhido(opcoesMinerio, config)
    const chance = CHANCES[minerio.classe][periodo][tipo.colunaChance][step - 1]
    if (chance == null) throw new Error(`Sem chance de refino para ${tipo.nome} no step ${step}`)

    const otimismoEscolhido = config?.otimismo ?? 'padrao'
    const otimismo = otimismoEscolhido === 'padrao' ? plano.otimismo : otimismoEscolhido
    const bsbDisponivel = tipo.aceitaBsb && CONSUMO_BSB[step] !== undefined
    const bsbTravado = bsbDisponivel && plano.sempreBsb
    const bsb = bsbDisponivel && (plano.sempreBsb || config?.bsb === true)

    const provaveis = tentativasProvaveis(chance, otimismo)
    const efetivas = provaveis * passagens
    const falhas = (provaveis - 1) * passagens

    let falha: ConsequenciaFalha
    if (chance >= 100) falha = { tipo: 'semRisco' }
    else if (bsb) falha = { tipo: 'protegido' }
    else if (minerio.falha.tipo === 'destroi') falha = { tipo: 'destroi' }
    else {
      const niveis = minerio.falha.niveis
      falha = { tipo: 'perde', niveis, voltaPara: Math.max(step - 1 - niveis, 0) }
      if (provaveis > 1) menorStep = Math.min(menorStep, Math.max(step - niveis, 1))
    }

    const unidade = expandir(minerio.id, 1, precos)
    const minerioBase = [...unidade.levar.keys(), ...unidade.comprarNpc.keys()].find((i) => i !== PO) ?? minerio.id
    const zenyTaxa = taxaPorTentativa(plano.tipo, step) * efetivas
    const zenyFabricacao = unidade.zenyFabricacao * efetivas

    linhas.push({
      step,
      repasse: step <= plano.atual,
      minerio,
      opcoesMinerio,
      otimismoEscolhido,
      otimismo,
      bsbDisponivel,
      bsbTravado,
      bsb,
      chance,
      provaveis,
      passagens,
      efetivas,
      falha,
      itensDestruidos: falha.tipo === 'destroi' ? falhas : 0,
      zenyTaxa,
      zenyFabricacao,
      zeny: zenyTaxa + zenyFabricacao,
      minerioBase,
      minerioBaseQtd: ((unidade.levar.get(minerioBase) ?? 0) + (unidade.comprarNpc.get(minerioBase) ?? 0)) * efetivas,
      po: (unidade.levar.get(PO) ?? 0) * efetivas,
      bsbQtd: bsb ? CONSUMO_BSB[step] * efetivas : 0,
    })
  }
  linhas.reverse()

  const total: Expansao = { zenyFabricacao: 0, levar: new Map(), fabricar: new Map(), comprarNpc: new Map() }
  const minerios = new Map<ItemId, number>()
  let zenyTaxas = 0
  let zenyFabricacao = 0
  let bsbTotal = 0
  let itensDestruidos = 0
  for (const linha of linhas) {
    somar(minerios, linha.minerio.id, linha.efetivas)
    expandir(linha.minerio.id, linha.efetivas, precos, total)
    somar(total.levar, 'bsb', linha.bsbQtd)
    zenyTaxas += linha.zenyTaxa
    zenyFabricacao += linha.zenyFabricacao
    bsbTotal += linha.bsbQtd
    itensDestruidos += linha.itensDestruidos
  }

  const levar = new Map<ItemId, number>()
  const cash = new Map<ItemId, number>()
  let custoMercado = 0
  const precosFaltando: ItemId[] = []
  for (const [item, qtd] of total.levar) {
    if (ITENS[item].obtencao.tipo === 'cash') {
      cash.set(item, qtd)
      continue
    }
    levar.set(item, qtd)
    const preco = precos.valores[item]
    if (preco == null) precosFaltando.push(item)
    else custoMercado += preco * qtd
  }

  const zenyNpc = zenyTaxas + zenyFabricacao
  return {
    linhas,
    zenyNpc,
    zenyTaxas,
    zenyFabricacao,
    custoMercado,
    totalZeny: zenyNpc + custoMercado,
    minerios,
    po: total.levar.get(PO) ?? 0,
    bsb: bsbTotal,
    itensDestruidos,
    levar,
    cash,
    fabricar: total.fabricar,
    comprarNpc: total.comprarNpc,
    precosFaltando,
    taxaInformada: taxaInformada(plano.tipo),
  }
}
