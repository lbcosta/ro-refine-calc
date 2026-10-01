<script lang="ts">
  import { ITENS, type Item, type ItemId, type Origem } from '../data/itens'
  import { origemDe, type Precos, type Resultado } from '../lib/calculo'
  import { zeny } from '../lib/formato'
  import CampoPreco from './CampoPreco.svelte'

  let { precos = $bindable(), resultado }: { precos: Precos; resultado: Resultado } = $props()

  const itens = Object.values(ITENS)
  const mercado = itens.filter((i) => i.obtencao.tipo === 'mercado')
  const fabricados = itens.filter((i) => i.obtencao.tipo === 'fabricado')
  const npc = itens.filter((i) => i.obtencao.tipo === 'npc')
  const cash = itens.filter((i) => i.obtencao.tipo === 'cash')
  const ORIGENS: [Origem, string][] = [
    ['fabricar', 'Fabricar no NPC'],
    ['comprar', 'Comprar pronto'],
  ]

  const usados = $derived(
    new Set<ItemId>([...resultado.levar.keys(), ...resultado.fabricar.keys(), ...resultado.comprarNpc.keys(), ...resultado.cash.keys()]),
  )

  function definirPreco(id: ItemId, valor: number | undefined) {
    if (valor == null) delete precos.valores[id]
    else precos.valores[id] = valor
  }

  function definirOrigem(id: ItemId, origem: Origem) {
    precos.origem[id] = origem
  }

  function receita(item: Item): string {
    if (item.obtencao.tipo !== 'fabricado') return ''
    return [zeny(item.obtencao.receita.zeny), ...item.obtencao.receita.insumos.map((i) => `${i.qtd} ${ITENS[i.item].nome}`)].join(' + ')
  }
</script>

<section class="cartao" aria-labelledby="titulo-precos">
  <h2 id="titulo-precos">Preços de mercado</h2>
  <p class="dica">
    Preço por unidade, em zeny. Deixe em branco o que você não sabe: o total avisa o que está faltando. Itens marcados com
    <span class="tag tag-plano">No plano</span> são usados no plano atual.
  </p>
  <ul class="precos">
    {#each mercado as item (item.id)}
      <li>
        <CampoPreco
          id={item.id}
          nome={item.nome}
          noPlano={usados.has(item.id)}
          valor={precos.valores[item.id]}
          onmudar={(v) => definirPreco(item.id, v)}
        />
      </li>
    {/each}
  </ul>
</section>

<section class="cartao" aria-labelledby="titulo-fabricados">
  <h2 id="titulo-fabricados">Minérios fabricáveis</h2>
  <p class="dica">Escolha se você fabrica no NPC da refinaria ou compra pronto de outros jogadores.</p>
  <ul class="precos">
    {#each fabricados as item (item.id)}
      {@const origem = origemDe(item.id, precos)}
      <li class="fabricavel">
        <fieldset>
          <legend>
            {item.nome}
            {#if usados.has(item.id)}<span class="tag tag-plano">No plano</span>{/if}
          </legend>
          <p class="receita">Receita: {receita(item)}</p>
          <div class="segmentado">
            {#each ORIGENS as [valor, texto] (valor)}
              <label>
                <input
                  type="radio"
                  name="origem-{item.id}"
                  value={valor}
                  checked={origem === valor}
                  onchange={() => definirOrigem(item.id, valor)}
                />
                <span>{texto}</span>
              </label>
            {/each}
          </div>
          {#if origem === 'comprar'}
            <CampoPreco
              id={item.id}
              nome="Preço de {item.nome} pronto"
              valor={precos.valores[item.id]}
              onmudar={(v) => definirPreco(item.id, v)}
            />
          {/if}
        </fieldset>
      </li>
    {/each}
  </ul>
</section>

<section class="cartao" aria-labelledby="titulo-fixos">
  <h2 id="titulo-fixos">Preço fixo e cash</h2>
  <ul class="lista">
    {#each npc as item (item.id)}
      <li>
        <span>{item.nome}</span>
        <span class="lista-qtd">{item.obtencao.tipo === 'npc' ? zeny(item.obtencao.zeny) : ''}</span>
        <small class="lista-sub">Vendido pelo NPC da refinaria</small>
      </li>
    {/each}
    {#each cash as item (item.id)}
      <li>
        <span>{item.nome} <span class="tag">Cash</span></span>
        <span class="lista-qtd">—</span>
        <small class="lista-sub">Só por JoyCoins e não negociável: fica fora do total em zeny</small>
      </li>
    {/each}
  </ul>
</section>
