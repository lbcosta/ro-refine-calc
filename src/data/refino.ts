import type { TipoId } from './tipos'

/**
 * Bênçãos do Ferreiro consumidas por tentativa. Só funciona do +7 → +8 ao +13 → +14
 * e nunca em equipamentos sombrios.
 * Fonte: https://browiki.org/index.php?title=Refinamento&oldid=49868 (seção "Outros").
 */
export const CONSUMO_BSB: Readonly<Record<number, number>> = {
  8: 1,
  9: 2,
  10: 4,
  11: 7,
  12: 11,
  13: 16,
  14: 22,
}

/**
 * Taxa cobrada pelo NPC por tentativa de refino.
 *
 * A página atual do wiki não informa as taxas. Os valores abaixo vêm de uma versão antiga
 * da página e ainda precisam ser confirmados no jogo. Tipos sem fonte ficam com `null`
 * (taxa tratada como 0 e sinalizada na interface).
 */
const TAXAS_ANTIGAS: Readonly<Record<TipoId, { ate10: number; apos10: number } | null>> = {
  arma1: { ate10: 50, apos10: 100_000 },
  arma2: { ate10: 200, apos10: 100_000 },
  arma3: { ate10: 5_000, apos10: 100_000 },
  arma4: { ate10: 20_000, apos10: 100_000 },
  arma5: null,
  equip1: { ate10: 2_000, apos10: 100_000 },
  equip2: null,
  armaSombria: null,
  equipSombrio: null,
}

export function taxaInformada(tipo: TipoId): boolean {
  return TAXAS_ANTIGAS[tipo] !== null
}

/** Taxa do NPC por tentativa no step informado. "+10 em diante" = item a partir de +10 (step 11+). */
export function taxaPorTentativa(tipo: TipoId, step: number): number {
  const taxa = TAXAS_ANTIGAS[tipo]
  if (!taxa) return 0
  return step <= 10 ? taxa.ate10 : taxa.apos10
}
