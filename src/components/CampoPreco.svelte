<script lang="ts">
  import { lerPreco, mostrarPreco } from '../lib/formato'

  let {
    id,
    nome,
    valor,
    noPlano = false,
    onmudar,
  }: { id: string; nome: string; valor: number | undefined; noPlano?: boolean; onmudar: (valor: number | undefined) => void } =
    $props()

  function digitar(evento: Event & { currentTarget: HTMLInputElement }) {
    const campo = evento.currentTarget
    // Reformata com separadores de milhar mantendo o cursor depois do mesmo dígito.
    const digitosAntes = campo.value.slice(0, campo.selectionStart ?? campo.value.length).replace(/\D/g, '').length
    const novo = lerPreco(campo.value)
    campo.value = mostrarPreco(novo)
    let pos = 0
    for (let vistos = 0; pos < campo.value.length && vistos < digitosAntes; pos++) {
      if (/\d/.test(campo.value[pos])) vistos++
    }
    campo.setSelectionRange(pos, pos)
    onmudar(novo)
  }
</script>

<label class="campo-preco" for="preco-{id}">
  <span class="campo-preco-nome">
    {nome}
    {#if noPlano}<span class="tag tag-plano">No plano</span>{/if}
  </span>
  <span class="campo-preco-entrada">
    <input
      id="preco-{id}"
      type="text"
      inputmode="numeric"
      autocomplete="off"
      placeholder="Sem preço"
      value={mostrarPreco(valor)}
      oninput={digitar}
    />
    <span class="sufixo" aria-hidden="true">z</span>
  </span>
</label>
