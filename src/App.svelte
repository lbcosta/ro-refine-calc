<script lang="ts">
  import { carregarPlano, carregarPrecos, salvarPlano, salvarPrecos } from './lib/armazenamento'
  import { calcular, type Plano, type Precos } from './lib/calculo'
  import PainelItem from './components/PainelItem.svelte'
  import Resumo from './components/Resumo.svelte'
  import TabelaSteps from './components/TabelaSteps.svelte'
  import ListaCompras from './components/ListaCompras.svelte'
  import TabelaPrecos from './components/TabelaPrecos.svelte'

  type Aba = 'plano' | 'precos'
  const ABAS: { id: Aba; nome: string }[] = [
    { id: 'plano', nome: 'Plano' },
    { id: 'precos', nome: 'Preços' },
  ]

  let plano = $state<Plano>(carregarPlano())
  let precos = $state<Precos>(carregarPrecos())
  let aba = $state<Aba>('plano')

  const resultado = $derived(calcular(plano, precos))

  $effect(() => salvarPlano($state.snapshot(plano)))
  $effect(() => salvarPrecos($state.snapshot(precos)))

  function irPara(destino: Aba) {
    aba = destino
    document.getElementById(`aba-${destino}`)?.focus()
    window.scrollTo({ top: 0 })
  }

  function teclaNasAbas(evento: KeyboardEvent) {
    const atual = ABAS.findIndex((a) => a.id === aba)
    const delta = evento.key === 'ArrowRight' ? 1 : evento.key === 'ArrowLeft' ? -1 : 0
    if (!delta) return
    evento.preventDefault()
    irPara(ABAS[(atual + delta + ABAS.length) % ABAS.length].id)
  }
</script>

<a class="pular" href="#conteudo">Pular para o conteúdo</a>

<header class="topo">
  <div class="topo-interno">
    <h1>Calculadora de Refino <span class="servidor">bRO</span></h1>
    <div class="abas" role="tablist" aria-label="Seções" tabindex="-1" onkeydown={teclaNasAbas}>
      {#each ABAS as a (a.id)}
        <button
          id="aba-{a.id}"
          role="tab"
          type="button"
          aria-selected={aba === a.id}
          aria-controls="painel-{a.id}"
          tabindex={aba === a.id ? 0 : -1}
          onclick={() => irPara(a.id)}
        >
          {a.nome}
          {#if a.id === 'precos' && resultado.precosFaltando.length}
            <span class="contador" aria-label="{resultado.precosFaltando.length} preços faltando">{resultado.precosFaltando.length}</span>
          {/if}
        </button>
      {/each}
    </div>
  </div>
</header>

<main id="conteudo">
  {#if aba === 'plano'}
    <div id="painel-plano" role="tabpanel" aria-labelledby="aba-plano" class="pilha">
      <PainelItem bind:plano />
      <Resumo {resultado} {plano} irParaPrecos={() => irPara('precos')} />
      <TabelaSteps bind:plano {resultado} />
      <ListaCompras {resultado} {precos} />
    </div>
  {:else}
    <div id="painel-precos" role="tabpanel" aria-labelledby="aba-precos" class="pilha">
      <TabelaPrecos bind:precos {resultado} />
    </div>
  {/if}
</main>

<footer class="rodape">
  <p>
    Chances, minérios e receitas:
    <a href="https://browiki.org/index.php?title=Refinamento&amp;oldid=49868" target="_blank" rel="noopener">bROWiki — Refinamento (rev. 49868)</a>.
    As taxas de refino do NPC vêm de uma versão antiga do wiki e ainda precisam ser confirmadas no jogo.
  </p>
  <p>Tudo é calculado e salvo só neste aparelho.</p>
</footer>
