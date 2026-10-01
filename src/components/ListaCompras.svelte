<script lang="ts">
  import { ITENS, type ItemId } from '../data/itens'
  import type { Precos, Resultado } from '../lib/calculo'
  import { emKk, qtd, zeny } from '../lib/formato'

  let { resultado, precos }: { resultado: Resultado; precos: Precos } = $props()

  /** Quantos níveis de fabricação existem abaixo do item (Bradium antes de Bradium de Éter). */
  function profundidade(id: ItemId): number {
    const obtencao = ITENS[id].obtencao
    if (obtencao.tipo !== 'fabricado') return 0
    return 1 + Math.max(0, ...obtencao.receita.insumos.map((i) => (resultado.fabricar.has(i.item) ? profundidade(i.item) : 0)))
  }

  const fabricar = $derived([...resultado.fabricar].sort(([a], [b]) => profundidade(a) - profundidade(b)))

  function custoUnitario(id: ItemId): number {
    const obtencao = ITENS[id].obtencao
    if (obtencao.tipo === 'fabricado') return obtencao.receita.zeny
    if (obtencao.tipo === 'npc') return obtencao.zeny
    return 0
  }

  function receita(id: ItemId): string {
    const obtencao = ITENS[id].obtencao
    if (obtencao.tipo !== 'fabricado') return ''
    return [zeny(obtencao.receita.zeny), ...obtencao.receita.insumos.map((i) => `${i.qtd} ${ITENS[i.item].nome}`)].join(' + ')
  }
</script>

<section class="cartao" aria-labelledby="titulo-compras">
  <h2 id="titulo-compras">Lista de compras</h2>

  <h3>Levar para o refinador</h3>
  <ul class="lista">
    <li>
      <span>Zeny</span>
      <span class="lista-qtd">{emKk(resultado.zenyNpc)}</span>
      <small class="lista-sub">{zeny(resultado.zenyNpc)}: taxas de refino + fabricação e compras no NPC</small>
    </li>
    {#each [...resultado.levar] as [id, n] (id)}
      {@const preco = precos.valores[id]}
      <li>
        <span>{ITENS[id].nome}</span>
        <span class="lista-qtd">{qtd(n)}</span>
        <small class="lista-sub">
          {#if preco == null}
            <span class="texto-aviso">sem preço</span>
          {:else}
            {zeny(preco)} cada · {emKk(preco * n)}
          {/if}
        </small>
      </li>
    {/each}
    {#each [...resultado.cash] as [id, n] (id)}
      <li>
        <span>{ITENS[id].nome} <span class="tag">Cash</span></span>
        <span class="lista-qtd">{qtd(n)}</span>
        <small class="lista-sub">JoyCoins, fora do total em zeny</small>
      </li>
    {/each}
  </ul>

  {#if fabricar.length || resultado.comprarNpc.size}
    <h3>Fabricar ou comprar no refinador</h3>
    <p class="dica">Feitos no NPC da refinaria com os itens acima. O zeny já está incluído no valor a levar.</p>
    <ul class="lista">
      {#each [...resultado.comprarNpc] as [id, n] (id)}
        <li>
          <span>Comprar {ITENS[id].nome}</span>
          <span class="lista-qtd">{qtd(n)}</span>
          <small class="lista-sub">{zeny(custoUnitario(id))} cada · {emKk(custoUnitario(id) * n)}</small>
        </li>
      {/each}
      {#each fabricar as [id, n] (id)}
        <li>
          <span>Fabricar {ITENS[id].nome}</span>
          <span class="lista-qtd">{qtd(n)}</span>
          <small class="lista-sub">{receita(id)} cada · {emKk(custoUnitario(id) * n)}</small>
        </li>
      {/each}
    </ul>
  {/if}
</section>
