<script lang="ts">
  import { ITENS } from '../data/itens'
  import { tipoPorId } from '../data/tipos'
  import type { Plano, Resultado } from '../lib/calculo'
  import { emKk, qtd, zeny } from '../lib/formato'

  let { resultado, plano, irParaPrecos }: { resultado: Resultado; plano: Plano; irParaPrecos: () => void } = $props()

  const nomes = (itens: Iterable<string>) => [...itens].map((id) => ITENS[id as keyof typeof ITENS].nome).join(', ')
</script>

<section class="cartao" aria-labelledby="titulo-total">
  <h2 id="titulo-total">Total</h2>

  <div class="destaque" aria-live="polite">
    <span class="destaque-rotulo">Total em zeny</span>
    <span class="destaque-valor">{emKk(resultado.totalZeny)}</span>
    <span class="destaque-detalhe">{zeny(resultado.totalZeny)}{resultado.precosFaltando.length ? ' (incompleto)' : ''}</span>
  </div>

  <dl class="numeros">
    <div>
      <dt>Zeny para o NPC</dt>
      <dd>
        {emKk(resultado.zenyNpc)}
        <small>taxas {emKk(resultado.zenyTaxas)} · fabricação {emKk(resultado.zenyFabricacao)}</small>
      </dd>
    </div>
    <div>
      <dt>Materiais comprados</dt>
      <dd>{emKk(resultado.custoMercado)}</dd>
    </div>
    <div>
      <dt>Pó de Éter</dt>
      <dd>{qtd(resultado.po)}</dd>
    </div>
    <div>
      <dt>BSBs</dt>
      <dd>{qtd(resultado.bsb)}</dd>
    </div>
    <div class="numeros-largo">
      <dt>Minérios</dt>
      <dd>
        <ul class="lista-inline">
          {#each [...resultado.minerios] as [id, n] (id)}
            <li>{ITENS[id].nome}: <strong>{qtd(n)}</strong></li>
          {/each}
        </ul>
      </dd>
    </div>
    {#if resultado.cash.size}
      <div class="numeros-largo">
        <dt>Itens de cash (fora do total)</dt>
        <dd>
          <ul class="lista-inline">
            {#each [...resultado.cash] as [id, n] (id)}
              <li>{ITENS[id].nome}: <strong>{qtd(n)}</strong></li>
            {/each}
          </ul>
        </dd>
      </div>
    {/if}
  </dl>

  {#if resultado.itensDestruidos > 0}
    <p class="alerta alerta-perigo" role="note">
      <strong>⚠ Risco de perder o item.</strong>
      Pelo plano, você provavelmente destrói <strong>{qtd(resultado.itensDestruidos)}</strong>
      {resultado.itensDestruidos === 1 ? 'item' : 'itens'}. O cálculo não inclui a reposição deles. Use BSB ou um minério que não destrói
      nos steps marcados.
    </p>
  {/if}

  {#if resultado.precosFaltando.length}
    <p class="alerta alerta-aviso" role="note">
      <strong>Faltam preços:</strong>
      {nomes(resultado.precosFaltando)}. O total em zeny não inclui esses itens.
      <button type="button" class="botao-texto" onclick={irParaPrecos}>Preencher preços</button>
    </p>
  {/if}

  {#if !resultado.taxaInformada}
    <p class="alerta alerta-info" role="note">
      A taxa de refino do NPC para <strong>{tipoPorId(plano.tipo).nome}</strong> ainda não é conhecida e está sendo contada como 0.
    </p>
  {/if}
</section>
