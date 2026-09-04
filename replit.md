# Importadora Mas

Tienda e-commerce responsive para descubrir productos útiles, ofertas y soluciones para el hogar, herramientas y aire libre desde Linares hacia todo Chile.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/importadora-mas` — storefront web app and local demo catalog.
- `artifacts/importadora-mas/src/App.tsx` — single-page storefront, catalog interactions, product detail, search and cart state.
- `artifacts/importadora-mas/src/index.css` — visual theme, responsive layout utilities and motion.

## Architecture decisions

- The first release is frontend-only with local demo data so the buying experience can be validated before connecting inventory or checkout services.
- Product browsing, filtering, detail views and cart behavior are implemented in the storefront to keep the prototype immediately usable.
- The design prioritizes mobile browsing while preserving a wider retail layout on desktop.

## Product

Importadora Mas showcases seasonal deals and practical products with search suggestions, category navigation, offer/new/stock/price filters, product details, local trust messaging, Linares pickup information, and a lightweight cart flow that ends in WhatsApp-style order coordination.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
