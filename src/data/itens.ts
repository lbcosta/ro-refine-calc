// Catálogo de tudo o que pode entrar numa lista de compras: minérios, Pó de Éter e BSB.
// Receitas e preços de NPC: https://browiki.org/index.php?title=Refinamento&oldid=49868 (seção "Minérios").

export type ItemId =
  | 'fracon'
  | 'emveretarcon'
  | 'oridecon'
  | 'elunium'
  | 'bradium'
  | 'carnium'
  | 'eteridecon'
  | 'eterium'
  | 'bradiumEter'
  | 'carniumEter'
  | 'oriEnriquecido'
  | 'eluEnriquecido'
  | 'oriPerfeito'
  | 'eluPerfeito'
  | 'bradiumPerfeito'
  | 'carniumPerfeito'
  | 'eteriEnriquecido'
  | 'eteriumEnriquecido'
  | 'eteriPerfeito'
  | 'eteriumPerfeito'
  | 'bradiumEterPerfeito'
  | 'carniumEterPerfeito'
  | 'poEter'
  | 'bsb'

export interface Receita {
  zeny: number
  insumos: readonly { item: ItemId; qtd: number }[]
}

export type Origem = 'fabricar' | 'comprar'

export type Obtencao =
  /** Comprado de outros jogadores; o preço vem da aba Preços. */
  | { tipo: 'mercado' }
  /** Só por JoyCoins: fica fora do total em zeny. */
  | { tipo: 'cash' }
  /** Vendido pelo NPC da refinaria por preço fixo. */
  | { tipo: 'npc'; zeny: number }
  /** Fabricado no NPC da refinaria; o usuário pode optar por comprar pronto. */
  | { tipo: 'fabricado'; receita: Receita; padrao: Origem }

export interface Item {
  id: ItemId
  nome: string
  obtencao: Obtencao
}

const fabricado = (zeny: number, insumos: Receita['insumos'], padrao: Origem = 'fabricar'): Obtencao => ({
  tipo: 'fabricado',
  receita: { zeny, insumos },
  padrao,
})

export const ITENS: Record<ItemId, Item> = {
  fracon: { id: 'fracon', nome: 'Fracon', obtencao: { tipo: 'npc', zeny: 200 } },
  emveretarcon: { id: 'emveretarcon', nome: 'Emveretarcon', obtencao: { tipo: 'npc', zeny: 1000 } },
  oridecon: { id: 'oridecon', nome: 'Oridecon', obtencao: { tipo: 'mercado' } },
  elunium: { id: 'elunium', nome: 'Elunium', obtencao: { tipo: 'mercado' } },
  bradium: { id: 'bradium', nome: 'Bradium', obtencao: fabricado(50_000, [{ item: 'oridecon', qtd: 3 }]) },
  carnium: { id: 'carnium', nome: 'Carnium', obtencao: fabricado(50_000, [{ item: 'elunium', qtd: 3 }]) },
  eteridecon: {
    id: 'eteridecon',
    nome: 'Eteridecon',
    obtencao: fabricado(10_000, [
      { item: 'oridecon', qtd: 1 },
      { item: 'poEter', qtd: 1 },
    ]),
  },
  eterium: {
    id: 'eterium',
    nome: 'Eterium',
    obtencao: fabricado(10_000, [
      { item: 'elunium', qtd: 1 },
      { item: 'poEter', qtd: 1 },
    ]),
  },
  bradiumEter: {
    id: 'bradiumEter',
    nome: 'Bradium de Éter',
    obtencao: fabricado(30_000, [
      { item: 'bradium', qtd: 1 },
      { item: 'poEter', qtd: 3 },
    ]),
  },
  carniumEter: {
    id: 'carniumEter',
    nome: 'Carnium de Éter',
    obtencao: fabricado(50_000, [
      { item: 'carnium', qtd: 1 },
      { item: 'poEter', qtd: 3 },
    ]),
  },
  oriEnriquecido: { id: 'oriEnriquecido', nome: 'Oridecon Enriquecido', obtencao: { tipo: 'cash' } },
  eluEnriquecido: { id: 'eluEnriquecido', nome: 'Elunium Enriquecido', obtencao: { tipo: 'cash' } },
  oriPerfeito: { id: 'oriPerfeito', nome: 'Oridecon Perfeito', obtencao: { tipo: 'mercado' } },
  eluPerfeito: { id: 'eluPerfeito', nome: 'Elunium Perfeito', obtencao: { tipo: 'mercado' } },
  bradiumPerfeito: { id: 'bradiumPerfeito', nome: 'Bradium Perfeito', obtencao: { tipo: 'mercado' } },
  carniumPerfeito: { id: 'carniumPerfeito', nome: 'Carnium Perfeito', obtencao: { tipo: 'mercado' } },
  // Os Enriquecidos de Éter são negociáveis, então o padrão é comprar pronto
  // (a receita exige o Enriquecido comum, que só sai por cash).
  eteriEnriquecido: {
    id: 'eteriEnriquecido',
    nome: 'Eteridecon Enriquecido',
    obtencao: fabricado(
      20_000,
      [
        { item: 'oriEnriquecido', qtd: 1 },
        { item: 'poEter', qtd: 2 },
      ],
      'comprar',
    ),
  },
  eteriumEnriquecido: {
    id: 'eteriumEnriquecido',
    nome: 'Eterium Enriquecido',
    obtencao: fabricado(
      20_000,
      [
        { item: 'eluEnriquecido', qtd: 1 },
        { item: 'poEter', qtd: 2 },
      ],
      'comprar',
    ),
  },
  eteriPerfeito: {
    id: 'eteriPerfeito',
    nome: 'Eteridecon Perfeito',
    obtencao: fabricado(50_000, [
      { item: 'oriPerfeito', qtd: 1 },
      { item: 'poEter', qtd: 3 },
    ]),
  },
  eteriumPerfeito: {
    id: 'eteriumPerfeito',
    nome: 'Eterium Perfeito',
    obtencao: fabricado(50_000, [
      { item: 'eluPerfeito', qtd: 1 },
      { item: 'poEter', qtd: 3 },
    ]),
  },
  bradiumEterPerfeito: {
    id: 'bradiumEterPerfeito',
    nome: 'Bradium de Éter Perfeito',
    obtencao: fabricado(50_000, [
      { item: 'bradiumPerfeito', qtd: 1 },
      { item: 'poEter', qtd: 3 },
    ]),
  },
  carniumEterPerfeito: {
    id: 'carniumEterPerfeito',
    nome: 'Carnium de Éter Perfeito',
    obtencao: fabricado(50_000, [
      { item: 'carniumPerfeito', qtd: 1 },
      { item: 'poEter', qtd: 3 },
    ]),
  },
  poEter: { id: 'poEter', nome: 'Pó de Éter', obtencao: { tipo: 'mercado' } },
  bsb: { id: 'bsb', nome: 'Bênção do Ferreiro', obtencao: { tipo: 'mercado' } },
}
