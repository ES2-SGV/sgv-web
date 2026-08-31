# sgv-web

Frontend do **Sistema de Gestão de Viagens**. React 19 + Vite, TanStack Router
(rotas por arquivo) e TanStack Query, com componentes shadcn/ui sobre Tailwind v4.

## Rodando

```bash
cp .env.example .env
npm install
npm run dev      # http://localhost:5173
```

A API precisa estar no ar. Duas opções, e cada uma tem sua variável no `.env`:

| Como você sobe a API | Porta | Variável usada |
| --- | --- | --- |
| `./mvnw spring-boot:run` na máquina | 8080 | `VITE_DEV_API_BASEURL` |
| `docker compose up -d db api` na raiz | 8081 | `VITE_PROD_API_BASEURL` |

`npm run dev` sempre lê a primeira; `npm run build` (que é o que roda no
dockerfile) sempre lê a segunda. Se você usa o compose para a API e o vite para
o front, aponte `VITE_DEV_API_BASEURL` para `:8081`.

O CORS da API libera as portas 5173 (vite dev) e 5174 (container do frontend).

Outros scripts: `npm run build`, `npm run check` (Biome), `npm run generate-routes`
(regenera `src/routeTree.gen.ts` — o vite plugin já faz isso em dev).

## Estrutura

```
src/
├── api/                    camada de acesso à sgv-api
│   ├── client.ts           instância axios + tradução de ApiError
│   ├── types.ts            espelho dos DTOs e enums do backend
│   ├── crud.ts             fábrica do CRUD REST comum às entidades
│   ├── query-keys.ts       chaves de cache do react-query
│   └── hooks/              use-destinos, use-colaboradores, use-viagens
├── components/
│   ├── ui/                 shadcn/ui (gerado — evite editar à mão)
│   ├── layout/             app-shell, sidebar, header, nav-user, page-header
│   └── common/             blocos reaproveitáveis entre telas
├── lib/
│   ├── session.tsx         sessão simulada (colaborador + papel)
│   ├── theme.tsx           claro/escuro/sistema
│   ├── format.ts           datas, moeda, iniciais
│   └── form.ts             erros da API → campos do formulário
└── routes/                 uma rota por arquivo
```

### Convenções

- **API**: nada de `fetch`/`axios` solto nas telas. Cada entidade tem hooks em
  `src/api/hooks/`; mutações já invalidam o cache correspondente.
- **Erros**: `getErrorMessage(error)` para mensagem legível, `aplicarErrosDaApi(form, error)`
  para jogar o `campos` do 400 nos campos do formulário.
- **Formulários**: react-hook-form + zod + `<Form>` do shadcn, dentro de um `<Dialog>`
  quando for cadastro simples (ver `routes/destinos.tsx` como referência).
- **Rotas**: declare `staticData: { titulo: "..." }` — é daí que saem as migalhas
  de pão do cabeçalho. Registre a rota em `components/layout/navigation.ts` para
  ela aparecer no menu.
- **Novos componentes shadcn**: `npx shadcn@latest add <componente>`.

### Sessão simulada

A API ainda não tem autenticação. `src/lib/session.tsx` guarda no localStorage qual
colaborador está "logado" e se ele age como colaborador ou gestor; o seletor fica no
rodapé do menu lateral. As telas consomem `useSession()` — quando o login real chegar,
só esse arquivo muda.

## O que ainda não existe

- `routes/viagens.tsx` é um stub: a camada de API (`use-viagens`) já está pronta.
- `routes/despesas.tsx` aguarda os endpoints de despesa no backend.
- Os cartões de valor gasto / custo médio do dashboard dependem dessas despesas.
