# Requisitos: Calculadora de Refino (bRO)

PWA, *mobile first*, para o jogador planejar um refino antes de ir ao NPC: quantas tentativas, quais minérios, quanto Pó de Éter, quantas Bênçãos do Ferreiro (BSB) e quanto zeny levar.

## Fontes de dados

| Dado | Fonte |
|---|---|
| Chances de sucesso (comum/especial × normal/evento, +1 a +20) | [bROWiki — Refinamento, rev. 49868](https://browiki.org/index.php?title=Refinamento&oldid=49868). Bate célula por célula com a planilha original até +14. |
| Minérios: faixa de uso, penalidade de falha, receita no NPC | Mesma página, seção "Minérios" |
| Consumo de BSB | Mesma página, seção "Outros" |
| Taxa do NPC por tentativa | Versão antiga do wiki. **A confirmar no jogo** (ver Pendências). |

A planilha original está em [`dados/Calculadora_de_Refino_2.0_-_Dados.csv`](dados/Calculadora_de_Refino_2.0_-_Dados.csv), só como referência.

## Convenções

- **Step N** é a tentativa de levar o item de +(N−1) para +N.
- "Refina entre X ao Y" no wiki significa que o item pode estar de +X a +Y, ou seja, **steps X+1 a Y+1**.

## Entradas

### Globais
- **Tipo de item:** Arma Nv 1–5, Equipamento Nv 1–2, Arma Sombria (Manopla) e Equipamento Sombrio.
- **Refino atual:** de +0 até o máximo − 1.
- **Refino alvo:** de atual + 1 até o máximo. O máximo é **+20**, ou **+10 nos sombrios**.
- **Em período de evento:** só troca a tabela de chances.
- **Sempre usar BSB:** quando ligado, **trava** a BSB em todos os steps elegíveis.
- **Otimismo padrão:** Muito Pessimista, Pessimista, Otimista ou Muito Otimista.

### Por step
- **Minério:** só os válidos para o tipo e o step. O padrão é o minério **comum** da faixa.
- **Otimismo:** "Padrão" (segue o global) ou um dos 4 níveis.
- **BSB:** só nos steps 8 a 14 (+7→+8 até +13→+14) e nunca em sombrios.

Mudar o tipo de item descarta as escolhas por step.

### Aba Preços
- **Preço unitário em zeny** dos itens comprados de jogadores, digitado com máscara de milhar. Campo vazio = preço não informado (o total avisa).
- **Minérios fabricáveis:** opção **Fabricar no NPC / Comprar pronto**. O padrão é fabricar, exceto Eteridecon e Eterium Enriquecido, cujo padrão é comprar pronto. Ao escolher comprar, aparece o campo de preço.
- **Fracon (200z) e Emveretarcon (1.000z):** preço fixo do NPC. Não entram na tabela de preços.
- **Oridecon e Elunium Enriquecido:** são de cash (JoyCoins). Ficam fora do total em zeny e aparecem listados à parte.

## Regras de minério

| Minério | Tipos | Steps | Classe | Se falhar | Obtenção |
|---|---|---|---|---|---|
| Fracon | Arma 1 | 1–10 | comum | destrói | NPC 200z |
| Emveretarcon | Arma 2 | 1–10 | comum | destrói | NPC 1.000z |
| Oridecon | Arma 3–4, Arma Sombria | 1–10 | comum | destrói | mercado |
| Bradium | Arma 1–4 | 11–20 | comum | −3 | 50.000z + 3 Oridecon |
| Eteridecon | Arma 5 | 1–10 | comum | −3 | 10.000z + 1 Oridecon + 1 Pó |
| Bradium de Éter | Arma 5 | 11–20 | comum | destrói | 30.000z + 1 Bradium + 3 Pó |
| Oridecon Enriquecido | Arma 3–4, Arma Sombria | 1–10 | especial | destrói | cash |
| Oridecon Perfeito | Arma 3–4, Arma Sombria | 8–10 | especial | −1 | mercado |
| Bradium Perfeito | Arma 1–4 | 11–20 | especial | −1 | mercado |
| Eteridecon Enriquecido | Arma 5 | 1–10 | especial | −1 | mercado, ou 20.000z + 1 Oridecon Enriq. + 2 Pó |
| Eteridecon Perfeito | Arma 5 | 11–15 | especial | destrói | 50.000z + 1 Oridecon Perfeito + 3 Pó |
| Bradium de Éter Perfeito | Arma 5 | 16–20 | especial | destrói | 50.000z + 1 Bradium Perfeito + 3 Pó |
| Elunium | Equip 1, Equip Sombrio | 1–10 | comum | destrói | mercado |
| Carnium | Equip 1 | 11–20 | comum | −3 | 50.000z + 3 Elunium |
| Eterium | Equip 2 | 1–10 | comum | −3 | 10.000z + 1 Elunium + 1 Pó |
| Carnium de Éter | Equip 2 | 11–20 | comum | destrói | 50.000z + 1 Carnium + 3 Pó |
| Elunium Enriquecido | Equip 1, Equip Sombrio | 1–10 | especial | destrói | cash |
| Elunium Perfeito | Equip 1, Equip Sombrio | 8–10 | especial | −1 | mercado |
| Carnium Perfeito | Equip 1 | 11–20 | especial | −1 | mercado |
| Eterium Enriquecido | Equip 2 | 1–10 | especial | −1 | mercado, ou 20.000z + 1 Elunium Enriq. + 2 Pó |
| Eterium Perfeito | Equip 2 | 11–15 | especial | destrói | 50.000z + 1 Elunium Perfeito + 3 Pó |
| Carnium de Éter Perfeito | Equip 2 | 16–20 | especial | destrói | 50.000z + 1 Carnium Perfeito + 3 Pó |

- **Classe:** minérios **especiais** (inclusive os Perfeitos) usam a tabela "Minérios Especiais" do wiki.
- **Sombrios:** a Manopla Sombria usa os minérios da Arma Nv 4, e os demais sombrios os do Equipamento Nv 1. Os dois usam a coluna **Sombrio** da tabela de chances.
- **"Minério de …":** nunca é considerado material base.

## Cálculo

### Tentativas prováveis `A(s)`, por passagem pelo step

Com `x = ROUND(100 / chance%; 6)`:

| Otimismo | Fórmula |
|---|---|
| Muito Pessimista | `CEILING(x) + 1` |
| Pessimista | `CEILING(x)` |
| Otimista | `FLOOR(x)` |
| Muito Otimista | `MAX(FLOOR(x) − 1; 1)` |

Com **100% de chance, sempre 1**, em qualquer nível.

### Tentativas efetivas (cascata de quedas)
- Uma falha no step `s` com perda de `k` refinos leva o item a `+(s−1−k)` e obriga a refazer os steps `s−k … s−1`.
- `Passagens(j)` = `[j está entre atual+1 e alvo]` + Σ `(A(s) − 1) × Passagens(s)`, somando os steps `s > j` cuja falha **perde refino** (sem BSB) e cuja queda alcança `j` (`s − k ≤ j`).
- `Efetivas(j)` = `A(j) × Passagens(j)`.
- Com `A = 1/p` sem arredondar, essa fórmula é exatamente o valor esperado, o que foi validado por simulação. O otimismo arredonda em cada step, então o desvio cresce em cascatas longas.
- **Repasse:** quando a cascata alcança steps abaixo do refino atual, eles aparecem como linhas de repasse, com minério, otimismo e BSB próprios, e entram nos totais.
- **Destruição:** um minério que destrói o item, usado sem BSB, **não gera cascata**. A linha mostra "PERDE O ITEM" em destaque e "itens destruídos prováveis" = `(A − 1) × Passagens`. O custo de repor o item não é calculado.
- **BSB:** na falha, o item não é destruído nem perde refino, com qualquer minério. Consome `consumo(step) × Efetivas` (8:1, 9:2, 10:4, 11:7, 12:11, 13:16, 14:22).

### Custos
- **Zeny do step** = Efetivas × (taxa do NPC + custo de fabricação ou compra no NPC do minério). Receitas são desmontadas em níveis, respeitando a escolha Fabricar/Comprar de cada item.
- **Total em zeny** = zeny para o NPC + Σ (quantidade × preço) dos itens comprados de jogadores. Itens de cash ficam de fora.

## Saídas

1. **Total:**
   - Total em zeny (kk), zeny para o NPC (taxas + fabricação) e materiais comprados.
   - Pó de Éter, BSBs e minérios por tipo.
   - Itens de cash.
   - Alertas: itens destruídos prováveis, preços faltando e taxa não informada.
2. **Refinos por step:**
   - Colunas: Step, Minério, Otimismo, BSB, Chance, Tentativas prováveis, Tentativas efetivas, Se falhar, Zeny (kk), Minério base (quantidade e nome), Pó de Éter e BSBs.
   - No celular, cada step vira um cartão, com os custos expansíveis. A partir de 960px, é uma tabela.
3. **Lista de compras:**
   - "Levar para o refinador": zeny e itens comprados de jogadores, com subtotal, mais os itens de cash.
   - "Fabricar ou comprar no refinador": minérios fabricados, em ordem de fabricação, e compras de preço fixo no NPC.

Valores em zeny aparecem em **kk com 2 casas**, com o valor inteiro ao lado.

## Persistência
Preços, escolhas Fabricar/Comprar e o último plano ficam salvos no `localStorage` do aparelho. Não há conta nem servidor.

## Fora do escopo da v1
Graus (e Bênção do Éter), Pergaminhos de Refino, Cubos e Martelos de Refino, e o 5º nível de otimismo "Média".

## Pendências
- **Taxas do NPC por tentativa.**
  - Hoje o app usa Arma Nv 1: 50z, Nv 2: 200z, Nv 3: 5.000z, Nv 4: 20.000z e Equip. Nv 1: 2.000z, até +10. Do +10 em diante (step 11+), 100.000z.
  - Arma Nv 5, Equip. Nv 2 e Sombrios estão em 0, e o app sinaliza isso.
  - Não se sabe se a taxa varia por minério.
  - Para corrigir, basta editar `src/data/refino.ts`.

## Tecnologia e fluxo
- Svelte 5, TypeScript e Vite, com `vite-plugin-pwa` (offline e instalável).
- Testes do motor de cálculo com Vitest.
- Git Flow:
  - `main` é produção: o deploy automático para o GitHub Pages sai dela.
  - `develop` é integração.
  - As features vêm por PR para a `develop`.
