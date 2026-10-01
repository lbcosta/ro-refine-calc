import { describe, expect, it } from 'vitest'
import { CHANCES } from '../data/chances'
import { mineriosDisponiveis } from '../data/minerios'
import { TIPOS } from '../data/tipos'
import { calcular, tentativasProvaveis, type Plano, type Precos } from './calculo'

const semPrecos: Precos = { valores: {}, origem: {} }

function plano(parcial: Partial<Plano>): Plano {
  return {
    tipo: 'equip1',
    atual: 0,
    alvo: 1,
    evento: false,
    sempreBsb: false,
    otimismo: 'pessimista',
    steps: {},
    ...parcial,
  }
}

const porStep = (r: ReturnType<typeof calcular>) => Object.fromEntries(r.linhas.map((l) => [l.step, l]))

describe('tentativasProvaveis', () => {
  it('segue as fórmulas da planilha', () => {
    expect(['muitoPessimista', 'pessimista', 'otimista', 'muitoOtimista'].map((o) => tentativasProvaveis(20, o as never))).toEqual([6, 5, 5, 4])
    expect(['muitoPessimista', 'pessimista', 'otimista', 'muitoOtimista'].map((o) => tentativasProvaveis(30, o as never))).toEqual([5, 4, 3, 2])
    expect(['muitoPessimista', 'pessimista', 'otimista', 'muitoOtimista'].map((o) => tentativasProvaveis(8, o as never))).toEqual([14, 13, 12, 11])
    expect(['muitoPessimista', 'pessimista', 'otimista', 'muitoOtimista'].map((o) => tentativasProvaveis(60, o as never))).toEqual([3, 2, 1, 1])
  })

  it('com 100% de chance é sempre 1 tentativa', () => {
    for (const o of ['muitoPessimista', 'pessimista', 'otimista', 'muitoOtimista'] as const) {
      expect(tentativasProvaveis(100, o)).toBe(1)
    }
  })
})

describe('minérios por tipo e step', () => {
  it('todo tipo tem um minério comum em todos os steps até o refino máximo', () => {
    for (const tipo of TIPOS) {
      for (let step = 1; step <= tipo.refinoMax; step++) {
        const opcoes = mineriosDisponiveis(tipo.id, step)
        expect(opcoes.some((m) => m.classe === 'comum'), `${tipo.id} step ${step}`).toBe(true)
        for (const m of opcoes) expect(CHANCES[m.classe].normal[tipo.colunaChance][step - 1]).not.toBeNull()
      }
    }
  })

  it('segue as faixas do wiki ("Refina entre X ao Y" = steps X+1 a Y+1)', () => {
    const ids = (tipo: Parameters<typeof mineriosDisponiveis>[0], step: number) => mineriosDisponiveis(tipo, step).map((m) => m.id)
    expect(ids('arma4', 10)).toEqual(['oridecon', 'oriEnriquecido', 'oriPerfeito'])
    expect(ids('arma4', 11)).toEqual(['bradium', 'bradiumPerfeito'])
    expect(ids('arma1', 10)).toEqual(['fracon'])
    expect(ids('arma5', 10)).toEqual(['eteridecon', 'eteriEnriquecido'])
    expect(ids('arma5', 15)).toEqual(['bradiumEter', 'eteriPerfeito'])
    expect(ids('arma5', 16)).toEqual(['bradiumEter', 'bradiumEterPerfeito'])
    expect(ids('equip2', 16)).toEqual(['carniumEter', 'carniumEterPerfeito'])
    expect(ids('armaSombria', 8)).toEqual(['oridecon', 'oriEnriquecido', 'oriPerfeito'])
    expect(ids('equipSombrio', 7)).toEqual(['elunium', 'eluEnriquecido'])
  })
})

describe('calcular', () => {
  it('reproduz o exemplo da entrevista (Elunium Perfeito +8 → +10, com repasse e destruição)', () => {
    const r = calcular(
      plano({ atual: 8, alvo: 10, steps: { 8: { minerio: 'eluPerfeito' }, 9: { minerio: 'eluPerfeito' }, 10: { minerio: 'eluPerfeito' } } }),
      semPrecos,
    )
    const s = porStep(r)
    expect(r.linhas.map((l) => l.step)).toEqual([7, 8, 9, 10])
    expect([s[10].passagens, s[10].efetivas]).toEqual([1, 5])
    expect([s[9].passagens, s[9].efetivas]).toEqual([5, 15])
    expect([s[8].passagens, s[8].efetivas, s[8].repasse]).toEqual([10, 30, true])
    expect(s[7].minerio.id).toBe('elunium')
    expect([s[7].passagens, s[7].efetivas, s[7].itensDestruidos]).toEqual([20, 60, 40])
    expect(s[9].falha).toEqual({ tipo: 'perde', niveis: 1, voltaPara: 7 })
    expect(r.itensDestruidos).toBe(40)
  })

  it('propaga quedas de 3 refinos (Carnium +11 → +13)', () => {
    const s = porStep(calcular(plano({ atual: 11, alvo: 13 }), semPrecos))
    expect(Object.keys(s).map(Number)).toEqual([8, 9, 10, 11, 12, 13])
    expect(s[13].efetivas).toBe(13)
    expect(s[12].efetivas).toBe(169)
    expect(s[11].efetivas).toBe(2184)
    expect([s[10].passagens, s[10].efetivas, s[10].itensDestruidos]).toEqual([2184, 26208, 24024])
    expect(s[9].passagens).toBe(2172)
    expect(s[8].passagens).toBe(2016)
  })

  it('com BSB as falhas não geram cascata e consomem BSB por tentativa', () => {
    const r = calcular(plano({ atual: 10, alvo: 12, sempreBsb: true }), semPrecos)
    const s = porStep(r)
    expect(r.linhas.map((l) => l.step)).toEqual([11, 12])
    expect(s[11].falha).toEqual({ tipo: 'protegido' })
    expect([s[11].efetivas, s[11].bsbQtd]).toEqual([13, 13 * 7])
    expect([s[12].efetivas, s[12].bsbQtd]).toEqual([13, 13 * 11])
    expect(r.bsb).toBe(13 * 18)
    expect(r.levar.get('bsb')).toBe(13 * 18)
  })

  it('BSB só vale do step 8 ao 14 e nunca em sombrios', () => {
    const r = calcular(plano({ tipo: 'arma4', atual: 6, alvo: 16, sempreBsb: true }), semPrecos)
    for (const l of r.linhas) expect(l.bsb).toBe(l.step >= 8 && l.step <= 14)
    const sombrio = calcular(plano({ tipo: 'equipSombrio', atual: 7, alvo: 10, sempreBsb: true }), semPrecos)
    expect(sombrio.linhas.every((l) => !l.bsbDisponivel && !l.bsb)).toBe(true)
  })

  it('limita sombrios ao +10', () => {
    const r = calcular(plano({ tipo: 'equipSombrio', atual: 9, alvo: 14 }), semPrecos)
    expect(r.linhas.map((l) => l.step)).toEqual([10])
  })

  it('usa as chances de evento', () => {
    const s = porStep(calcular(plano({ tipo: 'arma1', atual: 10, alvo: 11, evento: true, sempreBsb: true }), semPrecos))
    expect(s[11].chance).toBe(40)
  })

  it('monta a lista de fabricação com receitas em níveis (Bradium de Éter)', () => {
    const base = plano({ tipo: 'arma5', atual: 10, alvo: 11, sempreBsb: true, otimismo: 'otimista' })
    const r = calcular(base, { valores: { oridecon: 10_000, poEter: 5_000, bsb: 1_000_000 }, origem: {} })
    const n = porStep(r)[11].efetivas
    expect(n).toBe(12) // 8% → 12,5 → FLOOR = 12
    expect(r.fabricar.get('bradiumEter')).toBe(n)
    expect(r.fabricar.get('bradium')).toBe(n)
    expect(r.levar.get('oridecon')).toBe(3 * n)
    expect(r.levar.get('poEter')).toBe(3 * n)
    expect(r.zenyNpc).toBe(n * 80_000) // taxa de Nv 5 não informada (0)
    expect(r.taxaInformada).toBe(false)
    expect(r.custoMercado).toBe(3 * n * 10_000 + 3 * n * 5_000 + 7 * n * 1_000_000)
    expect(porStep(r)[11].minerioBase).toBe('oridecon')
    expect(porStep(r)[11].minerioBaseQtd).toBe(3 * n)

    const comprando = calcular(base, { valores: {}, origem: { bradium: 'comprar' } })
    expect(comprando.fabricar.has('bradium')).toBe(false)
    expect(comprando.levar.get('bradium')).toBe(n)
    expect(comprando.zenyNpc).toBe(n * 30_000)
    expect(comprando.precosFaltando).toEqual(['bradium', 'poEter', 'bsb'])
  })

  it('separa itens de cash do total em zeny', () => {
    const steps = Object.fromEntries([1, 2, 3, 4, 5].map((s) => [s, { minerio: 'oriEnriquecido' as const }]))
    const r = calcular(plano({ tipo: 'arma3', atual: 0, alvo: 5, steps }), { valores: {}, origem: {} })
    expect(r.cash.get('oriEnriquecido')).toBe(5)
    expect(r.levar.size).toBe(0)
    expect(r.totalZeny).toBe(5 * 5_000)
  })

  it('Eteridecon Enriquecido fabricado leva o Oridecon Enriquecido para a lista de cash', () => {
    const r = calcular(plano({ tipo: 'arma5', atual: 0, alvo: 1, steps: { 1: { minerio: 'eteriEnriquecido' } } }), {
      valores: {},
      origem: { eteriEnriquecido: 'fabricar' },
    })
    expect(r.cash.get('oriEnriquecido')).toBe(1)
    expect(r.levar.get('poEter')).toBe(2)
    expect(r.zenyNpc).toBe(20_000)
  })

  it('Fracon é comprado do NPC por preço fixo', () => {
    const r = calcular(plano({ tipo: 'arma1', atual: 0, alvo: 7 }), semPrecos)
    expect(r.comprarNpc.get('fracon')).toBe(7)
    expect(r.zenyNpc).toBe(7 * (200 + 50))
    expect(r.levar.size).toBe(0)
  })

  it('ignora escolhas de minério inválidas para o step', () => {
    const s = porStep(calcular(plano({ tipo: 'arma4', atual: 10, alvo: 11, sempreBsb: true, steps: { 11: { minerio: 'oridecon' } } }), semPrecos))
    expect(s[11].minerio.id).toBe('bradium')
  })
})
