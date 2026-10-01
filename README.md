# ro-refine-calc

Calculadora de refino para Ragnarök Online (bRO), em formato PWA e pensada para o celular. Mostra, step a step:
- chance de sucesso;
- tentativas prováveis e efetivas, considerando as quedas de refino;
- risco de perder o item;
- minérios, Pó de Éter e Bênçãos do Ferreiro necessários;
- quanto zeny levar ao refinador.

Os requisitos e as regras de cálculo estão em [`docs/requisitos.md`](docs/requisitos.md).

## Desenvolvimento

```bash
npm install
npm run dev      # servidor local
npm test         # testes do motor de cálculo
npm run check    # checagem de tipos (svelte-check + tsc)
npm run build    # build de produção em dist/
```

O app é publicado em `/ro-refine-calc/`. Para servir em outro caminho, defina `BASE_PATH` no build (ex.: `BASE_PATH=/ npm run build`).

## Estrutura

- `src/data/`: dados do jogo, como chances, minérios, receitas, consumo de BSB e taxas do NPC.
- `src/lib/calculo.ts`: motor de cálculo (puro e testado em `calculo.test.ts`).
- `src/components/`: telas em Svelte.

## Fluxo de branches (Git Flow)

- `main`: produção. Cada push publica no GitHub Pages pelo workflow `deploy.yml`.
- `develop`: integração. As features entram por pull request.

Para o deploy funcionar, ative o GitHub Pages em **Settings → Pages → Source: GitHub Actions**.
