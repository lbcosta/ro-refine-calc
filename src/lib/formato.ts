const inteiro = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const kk = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const passo = (step: number) => `+${step - 1} → +${step}`

export const qtd = (n: number) => inteiro.format(n)

export const zeny = (z: number) => `${inteiro.format(z)}z`

/** Zeny em milhões, com 2 casas (ex.: 12,35kk). */
export const emKk = (z: number) => `${kk.format(z / 1_000_000)}kk`

/** Lê um preço digitado com ou sem separadores. Campo vazio = preço não informado. */
export function lerPreco(texto: string): number | undefined {
  const digitos = texto.replace(/\D/g, '')
  return digitos ? Number(digitos) : undefined
}

export const mostrarPreco = (valor: number | undefined) => (valor == null ? '' : inteiro.format(valor))
