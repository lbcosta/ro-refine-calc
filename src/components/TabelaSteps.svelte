<script lang="ts">
  import { ITENS, type ItemId } from '../data/itens'
  import { OTIMISMOS, type ConfigStep, type LinhaStep, type Otimismo, type Plano, type Resultado } from '../lib/calculo'
  import { emKk, passo, qtd, zeny } from '../lib/formato'

  let { plano = $bindable(), resultado }: { plano: Plano; resultado: Resultado } = $props()

  let abertos = $state<Record<number, boolean>>({})

  const nomeOtimismo = (id: Otimismo) => OTIMISMOS.find((o) => o.id === id)?.nome ?? id

  function escolher(step: number, mudanca: ConfigStep) {
    plano.steps[step] = { ...plano.steps[step], ...mudanca }
  }

  function textoFalha(l: LinhaStep): string {
    switch (l.falha.tipo) {
      case 'semRisco':
        return 'Sem risco'
      case 'protegido':
        return 'Nada (BSB)'
      case 'perde':
        return `Perde ${l.falha.niveis} (volta a +${l.falha.voltaPara})`
      case 'destroi':
        return 'PERDE O ITEM'
    }
  }
</script>

<section class="cartao" aria-labelledby="titulo-steps">
  <h2 id="titulo-steps">Refinos por step</h2>
  <p class="dica">
    Tentativas efetivas = tentativas prováveis × vezes que você passa pelo step. Falhas que derrubam o refino fazem você passar de
    novo pelos steps abaixo. Os marcados como <span class="tag">Repasse</span> ficam abaixo do refino atual.
  </p>

  <div class="rolagem" role="region" aria-label="Tabela de refinos por step" tabindex="-1">
    <!-- Os roles explícitos mantêm a semântica de tabela quando o CSS vira cartões (display: block). -->
    <!-- svelte-ignore a11y_no_redundant_roles -->
    <table class="steps" role="table">
      <!-- svelte-ignore a11y_no_redundant_roles -->
      <thead role="rowgroup">
        <!-- svelte-ignore a11y_no_redundant_roles -->
        <tr role="row">
          <th role="columnheader" scope="col">Step</th>
          <th role="columnheader" scope="col">Minério</th>
          <th role="columnheader" scope="col">Otimismo</th>
          <th role="columnheader" scope="col">BSB</th>
          <th role="columnheader" scope="col" class="num">Chance</th>
          <th role="columnheader" scope="col" class="num">Tent. prováveis</th>
          <th role="columnheader" scope="col" class="num">Tent. efetivas</th>
          <th role="columnheader" scope="col">Se falhar</th>
          <th role="columnheader" scope="col" class="num">Zeny (kk)</th>
          <th role="columnheader" scope="col" class="num">Minério base qtd.</th>
          <th role="columnheader" scope="col">Minério base</th>
          <th role="columnheader" scope="col" class="num">Pó de Éter</th>
          <th role="columnheader" scope="col" class="num">BSBs</th>
        </tr>
      </thead>
      <!-- svelte-ignore a11y_no_redundant_roles -->
      <tbody role="rowgroup">
        {#each resultado.linhas as l (l.step)}
          {@const rotulo = passo(l.step)}
          <!-- svelte-ignore a11y_no_redundant_roles -->
          <tr role="row" class:repasse={l.repasse} class:destroi={l.falha.tipo === 'destroi'} class:aberto={abertos[l.step]}>
            <th role="rowheader" scope="row" class="c-step">
              {rotulo}
              {#if l.repasse}<span class="tag">Repasse</span>{/if}
            </th>
            <td role="cell" class="c-minerio" data-rotulo="Minério">
              <select
                aria-label="Minério do step {rotulo}"
                value={l.minerio.id}
                onchange={(e) => escolher(l.step, { minerio: e.currentTarget.value as ItemId })}
              >
                {#each l.opcoesMinerio as m (m.id)}
                  <option value={m.id}>{ITENS[m.id].nome}</option>
                {/each}
              </select>
            </td>
            <td role="cell" class="c-otimismo" data-rotulo="Otimismo">
              <select
                aria-label="Otimismo do step {rotulo}"
                value={l.otimismoEscolhido}
                onchange={(e) => escolher(l.step, { otimismo: e.currentTarget.value as Otimismo | 'padrao' })}
              >
                <option value="padrao">Padrão ({nomeOtimismo(plano.otimismo)})</option>
                {#each OTIMISMOS as o (o.id)}
                  <option value={o.id}>{o.nome}</option>
                {/each}
              </select>
            </td>
            <td role="cell" class="c-bsb" data-rotulo="BSB">
              {#if l.bsbDisponivel}
                <label class="caixa">
                  <input
                    type="checkbox"
                    checked={l.bsb}
                    disabled={l.bsbTravado}
                    onchange={(e) => escolher(l.step, { bsb: e.currentTarget.checked })}
                  />
                  <span>Usar<span class="sr-only"> BSB no step {rotulo}</span></span>
                </label>
              {:else}
                <span class="mudo" aria-hidden="true">—</span><span class="sr-only">BSB não se aplica neste step</span>
              {/if}
            </td>
            <td role="cell" class="c-chance num" data-rotulo="Chance"><strong>{l.chance}%</strong></td>
            <td role="cell" class="c-prov num" data-rotulo="Tent. prováveis">{qtd(l.provaveis)}</td>
            <td role="cell" class="c-efet num" data-rotulo="Tent. efetivas"><strong>{qtd(l.efetivas)}</strong></td>
            <td role="cell" class="c-falha" data-rotulo="Se falhar">
              <span class="falha falha-{l.falha.tipo}">
                {#if l.falha.tipo === 'destroi'}⚠ {/if}{textoFalha(l)}
              </span>
              {#if l.itensDestruidos > 0}
                <small class="destruidos">{qtd(l.itensDestruidos)} {l.itensDestruidos === 1 ? 'item destruído' : 'itens destruídos'} prov.</small>
              {/if}
            </td>
            <td role="cell" class="c-zeny num c-detalhe" data-rotulo="Zeny (kk)">
              <span title={zeny(l.zeny)}>{emKk(l.zeny)}</span>
            </td>
            <td role="cell" class="c-baseqtd num c-detalhe" data-rotulo="Minério base qtd.">{qtd(l.minerioBaseQtd)}</td>
            <td role="cell" class="c-base c-detalhe" data-rotulo="Minério base">{ITENS[l.minerioBase].nome}</td>
            <td role="cell" class="c-po num c-detalhe" data-rotulo="Pó de Éter">{qtd(l.po)}</td>
            <td role="cell" class="c-bsbqtd num c-detalhe" data-rotulo="BSBs">{qtd(l.bsbQtd)}</td>
            <td role="cell" class="c-alternar">
              <button
                type="button"
                class="botao-texto"
                aria-expanded={!!abertos[l.step]}
                onclick={() => (abertos[l.step] = !abertos[l.step])}
              >
                {abertos[l.step] ? 'Ocultar custos' : 'Ver custos'}<span class="sr-only"> do step {rotulo}</span>
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>
