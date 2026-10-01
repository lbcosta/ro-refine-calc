export type TipoId =
  | 'arma1'
  | 'arma2'
  | 'arma3'
  | 'arma4'
  | 'arma5'
  | 'equip1'
  | 'equip2'
  | 'armaSombria'
  | 'equipSombrio'

/** Coluna da tabela de chances do wiki. Os dois tipos sombrios usam a mesma coluna. */
export type ColunaChance = 'arma1' | 'arma2' | 'arma3' | 'arma4' | 'arma5' | 'equip1' | 'equip2' | 'sombrio'

export interface TipoItem {
  id: TipoId
  nome: string
  refinoMax: number
  aceitaBsb: boolean
  colunaChance: ColunaChance
}

export const TIPOS: readonly TipoItem[] = [
  { id: 'arma1', nome: 'Arma Nv 1', refinoMax: 20, aceitaBsb: true, colunaChance: 'arma1' },
  { id: 'arma2', nome: 'Arma Nv 2', refinoMax: 20, aceitaBsb: true, colunaChance: 'arma2' },
  { id: 'arma3', nome: 'Arma Nv 3', refinoMax: 20, aceitaBsb: true, colunaChance: 'arma3' },
  { id: 'arma4', nome: 'Arma Nv 4', refinoMax: 20, aceitaBsb: true, colunaChance: 'arma4' },
  { id: 'arma5', nome: 'Arma Nv 5', refinoMax: 20, aceitaBsb: true, colunaChance: 'arma5' },
  { id: 'equip1', nome: 'Equipamento Nv 1', refinoMax: 20, aceitaBsb: true, colunaChance: 'equip1' },
  { id: 'equip2', nome: 'Equipamento Nv 2', refinoMax: 20, aceitaBsb: true, colunaChance: 'equip2' },
  // Manopla Sombria: usa os minérios da Arma Nv 4, mas a coluna "Sombrio" da tabela de chances.
  { id: 'armaSombria', nome: 'Arma Sombria', refinoMax: 10, aceitaBsb: false, colunaChance: 'sombrio' },
  { id: 'equipSombrio', nome: 'Equipamento Sombrio', refinoMax: 10, aceitaBsb: false, colunaChance: 'sombrio' },
]

export function tipoPorId(id: TipoId): TipoItem {
  const tipo = TIPOS.find((t) => t.id === id)
  if (!tipo) throw new Error(`Tipo de item desconhecido: ${id}`)
  return tipo
}
