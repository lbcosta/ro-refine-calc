// Regras de uso de cada minério: https://browiki.org/index.php?title=Refinamento&oldid=49868 (seção "Minérios").
//
// "Refina entre X ao Y" no wiki = o item pode estar de +X a +Y, ou seja, steps X+1 a Y+1,
// onde o step N é a tentativa de levar o item de +(N-1) para +N.

import type { Classe } from './chances'
import type { ItemId } from './itens'
import type { TipoId } from './tipos'

export type Falha = { tipo: 'destroi' } | { tipo: 'perde'; niveis: number }

export interface Uso {
  tipos: readonly TipoId[]
  /** Primeiro step em que o minério pode ser usado. */
  de: number
  /** Último step em que o minério pode ser usado. */
  ate: number
}

export interface Minerio {
  id: ItemId
  classe: Classe
  falha: Falha
  usos: readonly Uso[]
}

const destroi: Falha = { tipo: 'destroi' }
const perde = (niveis: number): Falha => ({ tipo: 'perde', niveis })

const ARMAS_1_A_4: readonly TipoId[] = ['arma1', 'arma2', 'arma3', 'arma4']
// A Manopla Sombria ("Arma Sombria") tem os mesmos requisitos de refino da Arma Nv 4
// e os demais equipamentos sombrios, os do Equipamento Nv 1.
const ARMAS_ORIDECON: readonly TipoId[] = ['arma3', 'arma4', 'armaSombria']
const EQUIPS_ELUNIUM: readonly TipoId[] = ['equip1', 'equipSombrio']

/** A ordem importa: o primeiro minério comum válido para o step é o padrão. */
export const MINERIOS: readonly Minerio[] = [
  // Comuns para armas
  { id: 'fracon', classe: 'comum', falha: destroi, usos: [{ tipos: ['arma1'], de: 1, ate: 10 }] },
  { id: 'emveretarcon', classe: 'comum', falha: destroi, usos: [{ tipos: ['arma2'], de: 1, ate: 10 }] },
  { id: 'oridecon', classe: 'comum', falha: destroi, usos: [{ tipos: ARMAS_ORIDECON, de: 1, ate: 10 }] },
  { id: 'bradium', classe: 'comum', falha: perde(3), usos: [{ tipos: ARMAS_1_A_4, de: 11, ate: 20 }] },
  { id: 'eteridecon', classe: 'comum', falha: perde(3), usos: [{ tipos: ['arma5'], de: 1, ate: 10 }] },
  { id: 'bradiumEter', classe: 'comum', falha: destroi, usos: [{ tipos: ['arma5'], de: 11, ate: 20 }] },
  // Especiais para armas
  { id: 'oriEnriquecido', classe: 'especial', falha: destroi, usos: [{ tipos: ARMAS_ORIDECON, de: 1, ate: 10 }] },
  { id: 'oriPerfeito', classe: 'especial', falha: perde(1), usos: [{ tipos: ARMAS_ORIDECON, de: 8, ate: 10 }] },
  { id: 'bradiumPerfeito', classe: 'especial', falha: perde(1), usos: [{ tipos: ARMAS_1_A_4, de: 11, ate: 20 }] },
  { id: 'eteriEnriquecido', classe: 'especial', falha: perde(1), usos: [{ tipos: ['arma5'], de: 1, ate: 10 }] },
  { id: 'eteriPerfeito', classe: 'especial', falha: destroi, usos: [{ tipos: ['arma5'], de: 11, ate: 15 }] },
  { id: 'bradiumEterPerfeito', classe: 'especial', falha: destroi, usos: [{ tipos: ['arma5'], de: 16, ate: 20 }] },
  // Comuns para equipamentos
  { id: 'elunium', classe: 'comum', falha: destroi, usos: [{ tipos: EQUIPS_ELUNIUM, de: 1, ate: 10 }] },
  { id: 'carnium', classe: 'comum', falha: perde(3), usos: [{ tipos: ['equip1'], de: 11, ate: 20 }] },
  { id: 'eterium', classe: 'comum', falha: perde(3), usos: [{ tipos: ['equip2'], de: 1, ate: 10 }] },
  { id: 'carniumEter', classe: 'comum', falha: destroi, usos: [{ tipos: ['equip2'], de: 11, ate: 20 }] },
  // Especiais para equipamentos
  { id: 'eluEnriquecido', classe: 'especial', falha: destroi, usos: [{ tipos: EQUIPS_ELUNIUM, de: 1, ate: 10 }] },
  { id: 'eluPerfeito', classe: 'especial', falha: perde(1), usos: [{ tipos: EQUIPS_ELUNIUM, de: 8, ate: 10 }] },
  { id: 'carniumPerfeito', classe: 'especial', falha: perde(1), usos: [{ tipos: ['equip1'], de: 11, ate: 20 }] },
  { id: 'eteriumEnriquecido', classe: 'especial', falha: perde(1), usos: [{ tipos: ['equip2'], de: 1, ate: 10 }] },
  { id: 'eteriumPerfeito', classe: 'especial', falha: destroi, usos: [{ tipos: ['equip2'], de: 11, ate: 15 }] },
  { id: 'carniumEterPerfeito', classe: 'especial', falha: destroi, usos: [{ tipos: ['equip2'], de: 16, ate: 20 }] },
]

export function mineriosDisponiveis(tipo: TipoId, step: number): Minerio[] {
  return MINERIOS.filter((m) => m.usos.some((u) => u.tipos.includes(tipo) && step >= u.de && step <= u.ate))
}

export function minerioPorId(id: ItemId): Minerio | undefined {
  return MINERIOS.find((m) => m.id === id)
}
