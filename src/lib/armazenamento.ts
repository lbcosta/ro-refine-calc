import { ITENS, type ItemId } from '../data/itens'
import { TIPOS } from '../data/tipos'
import { OTIMISMOS, limitarFaixa, type Plano, type Precos } from './calculo'

const CHAVE_PLANO = 'ro-refine-calc:v1:plano'
const CHAVE_PRECOS = 'ro-refine-calc:v1:precos'

export const PLANO_PADRAO: Plano = {
  tipo: 'arma4',
  atual: 0,
  alvo: 10,
  evento: false,
  sempreBsb: false,
  otimismo: 'pessimista',
  steps: {},
}

export const PRECOS_PADRAO: Precos = { valores: {}, origem: {} }

function ler(chave: string): unknown {
  try {
    const bruto = localStorage.getItem(chave)
    return bruto ? JSON.parse(bruto) : undefined
  } catch {
    return undefined
  }
}

function gravar(chave: string, valor: unknown) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor))
  } catch {
    // Sem armazenamento (aba anônima, cota cheia): o app segue funcionando sem salvar.
  }
}

const ehObjeto = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

export function carregarPlano(): Plano {
  const salvo = ler(CHAVE_PLANO)
  if (!ehObjeto(salvo)) return structuredClone(PLANO_PADRAO)
  const plano: Plano = {
    tipo: TIPOS.some((t) => t.id === salvo.tipo) ? (salvo.tipo as Plano['tipo']) : PLANO_PADRAO.tipo,
    atual: typeof salvo.atual === 'number' ? salvo.atual : PLANO_PADRAO.atual,
    alvo: typeof salvo.alvo === 'number' ? salvo.alvo : PLANO_PADRAO.alvo,
    evento: salvo.evento === true,
    sempreBsb: salvo.sempreBsb === true,
    otimismo: OTIMISMOS.some((o) => o.id === salvo.otimismo) ? (salvo.otimismo as Plano['otimismo']) : PLANO_PADRAO.otimismo,
    // Escolhas inválidas por step são ignoradas pelo cálculo, então basta garantir o formato.
    steps: ehObjeto(salvo.steps) ? (salvo.steps as Plano['steps']) : {},
  }
  return limitarFaixa(plano)
}

export function carregarPrecos(): Precos {
  const salvo = ler(CHAVE_PRECOS)
  if (!ehObjeto(salvo)) return structuredClone(PRECOS_PADRAO)
  const precos: Precos = { valores: {}, origem: {} }
  if (ehObjeto(salvo.valores)) {
    for (const [id, valor] of Object.entries(salvo.valores)) {
      if (id in ITENS && typeof valor === 'number' && Number.isFinite(valor) && valor >= 0) precos.valores[id as ItemId] = valor
    }
  }
  if (ehObjeto(salvo.origem)) {
    for (const [id, origem] of Object.entries(salvo.origem)) {
      if (id in ITENS && (origem === 'fabricar' || origem === 'comprar')) precos.origem[id as ItemId] = origem
    }
  }
  return precos
}

export const salvarPlano = (plano: Plano) => gravar(CHAVE_PLANO, plano)
export const salvarPrecos = (precos: Precos) => gravar(CHAVE_PRECOS, precos)
