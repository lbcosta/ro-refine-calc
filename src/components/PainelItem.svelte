<script lang="ts">
  import { TIPOS, tipoPorId, type TipoId } from '../data/tipos'
  import { OTIMISMOS, limitarFaixa, type Plano } from '../lib/calculo'

  let { plano = $bindable() }: { plano: Plano } = $props()

  const tipo = $derived(tipoPorId(plano.tipo))
  const temEscolhas = $derived(Object.keys(plano.steps).length > 0)

  function mudarTipo(id: TipoId) {
    // Os minérios mudam com o tipo, então as escolhas por step deixam de valer.
    Object.assign(plano, limitarFaixa({ ...plano, tipo: id, steps: {} }))
    if (!tipoPorId(id).aceitaBsb) plano.sempreBsb = false
  }

  function mudarAtual(valor: number) {
    plano.atual = valor
    if (plano.alvo <= valor) plano.alvo = valor + 1
  }
</script>

<section class="cartao" aria-labelledby="titulo-item">
  <h2 id="titulo-item">Item</h2>
  <div class="campos">
    <label class="campo campo-largo">
      <span>Tipo de item</span>
      <select value={plano.tipo} onchange={(e) => mudarTipo(e.currentTarget.value as TipoId)}>
        {#each TIPOS as t (t.id)}
          <option value={t.id}>{t.nome}</option>
        {/each}
      </select>
    </label>

    <label class="campo">
      <span>Refino atual</span>
      <select value={plano.atual} onchange={(e) => mudarAtual(Number(e.currentTarget.value))}>
        {#each { length: tipo.refinoMax } as _, i (i)}
          <option value={i}>+{i}</option>
        {/each}
      </select>
    </label>

    <label class="campo">
      <span>Refino alvo</span>
      <select bind:value={plano.alvo}>
        {#each { length: tipo.refinoMax - plano.atual } as _, i (i)}
          <option value={plano.atual + i + 1}>+{plano.atual + i + 1}</option>
        {/each}
      </select>
    </label>

    <label class="campo campo-largo">
      <span>Otimismo padrão</span>
      <select bind:value={plano.otimismo}>
        {#each OTIMISMOS as o (o.id)}
          <option value={o.id}>{o.nome}</option>
        {/each}
      </select>
    </label>

    <label class="chave campo-largo">
      <input type="checkbox" role="switch" bind:checked={plano.evento} />
      <span>Em período de evento de refino</span>
    </label>

    <label class="chave campo-largo">
      <input type="checkbox" role="switch" bind:checked={plano.sempreBsb} disabled={!tipo.aceitaBsb} aria-describedby="dica-bsb" />
      <span>Sempre usar Bênção do Ferreiro (BSB)</span>
    </label>
    <p id="dica-bsb" class="dica campo-largo">
      {#if tipo.aceitaBsb}
        Vale do +7 → +8 ao +13 → +14. Ligado, trava a BSB em todos esses steps.
      {:else}
        A Bênção do Ferreiro não funciona em equipamentos sombrios.
      {/if}
    </p>
  </div>

  {#if temEscolhas}
    <button type="button" class="botao-texto" onclick={() => (plano.steps = {})}>Desfazer escolhas feitas nos steps</button>
  {/if}
</section>
