# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Layout

Two separate npm packages, no workspaces: the React frontend at the repo root and the Express API in `backend/`. Install and run each on its own. `docs/PLAN.md` describes the current state, the design decisions (for example, cart and favorites require sign-in; there is no guest cart) and the deployment.

## Commands

Frontend (repo root, Vite dev server on http://localhost:5173):

```bash
npm start                                # dev server
npm run build                            # production build to dist/
npm test                                 # vitest run (jsdom)
npx vitest run src/utils/cart.test.ts    # one file
npx vitest run -t "parseOption"          # tests whose name matches
npm run typecheck                        # tsc --noEmit (not part of build)
npm run lint                             # stylelint --fix + prettier --write (rewrites files)
```

Backend (`cd backend`, API on http://localhost:4000):

```bash
npm run dev            # tsx watch
npm test               # vitest run; same single-file / -t usage as above
npm run typecheck      # tsc --noEmit (includes tests)
npm run lint           # eslint src and prisma
npm run format         # prettier --write
npm run build          # tsc -p tsconfig.build.json (tests excluded from dist/)
npm run db:migrate     # prisma migrate dev
npm run db:seed        # load the sample catalog (deletes all data first)
npm run db:reset       # drop, migrate, seed
```

Both packages typecheck cleanly; keep it that way.

Backend config: copy `backend/.env.example` to `backend/.env`. `JWT_SECRET` must be at least 32 characters, and `CORS_ORIGIN` must include `http://localhost:5173`; `config/env.ts` exits on invalid env. The frontend reads `VITE_API_URL` (default `http://localhost:4000/api`). The admin role is only set in the database; the seed creates no users.

### Pre-commit hook

`.git/hooks/pre-commit` runs `npx mate-scripts lint`: ESLint on staged `src/**/*.ts(x)` and stylelint on staged `.scss`. Backend files are not linted by the hook; run `npm run lint` in `backend/`. Notes:
- It is slow (1–3 minutes), so run `git commit` in the background or with a long timeout. Do not bypass it with `--no-verify`.
- It may apply Prettier to files after they are staged. Check `git status` after committing and commit any leftover formatting changes.
- ESLint rules that often fail here: `@typescript-eslint/indent` rejects Prettier's multi-line unions with leading `|` (split long unions into shorter type aliases), and `@typescript-eslint/no-shadow`.
- `@mate-academy/scripts` is used by the hook, and `.eslintrc.cjs` extends `plugin:cypress/recommended`, so `cypress` and `eslint-plugin-cypress` must stay installed even though there are no Cypress tests.
- Git prints LF/CRLF warnings on Windows; a diff that disappears with `git diff --ignore-cr-at-eol` is line endings only.

## Backend architecture (`backend/src`)

- Each feature in `modules/<name>/` has `*.routes.ts`, `*.controller.ts`, `*.service.ts`, and `*.schema.ts` (zod) where it takes input. Routers declare full paths (`/api/products/...`) and are mounted in `app.ts` (`createApp()`) without a base path. Unknown `/api/*` routes return a JSON 404.
- Controllers are wrapped in `utils/asyncHandler` and contain no try/catch. Services hold the Prisma logic and throw `ApiError` (`utils/ApiError.ts`) for expected failures.
- `middleware/validate.ts`: `validate(schema, 'body' | 'query' | 'params')`. Parsed `body` and `query` replace the raw values. `params` are only checked, so handlers still convert them with `Number(req.params.id)`. Shared param schemas are in `utils/schemas.ts`.
- `middleware/auth.ts` (`auth`) is the only guard for signed-in routes: it requires `Authorization: Bearer <token>` and sets `req.user`. `requireAdmin` follows it on admin routes (`/api/admin/*`, product create/update/delete).
- `middleware/errorHandler.ts` returns `{ error, code? }`. It maps `ApiError` to its status, Prisma `P2002` to 409, `P2003` and `P2025` to 404, malformed JSON to 400, and everything else to 500. Only unexpected errors are logged.
- API contract the frontend relies on: the product list adds `fullPrice`/`price` aliases (for `priceRegular`/`priceDiscount`), and product details add `productId` (equal to `id`). Cart and favorites endpoints return the whole updated list after every change. `GET /api/products` query values fall back to defaults instead of failing; `perPage` is `all` or 1–100.
- Tests mock Prisma: import `prismaMock` from `src/test/prismaMock.ts` (vitest-mock-extended), which replaces `lib/prisma.js`. For `$transaction`, the existing tests pass `prismaMock` as `tx`. `app.routes.test.ts` covers HTTP routes with supertest. No database or `.env` is needed (`vitest.config.ts` sets the env).
- The backend is ESM: relative imports use the `.js` extension.
- `prisma` is a runtime dependency because `npm start` runs `prisma migrate deploy`.

## Frontend architecture (`src`)

- Imports use the `@/` alias for `src` (vite, vitest and tsconfig all define it).
- `api/`: one file per resource, built on `api/http.ts`. Functions that need auth take the token as their first argument. `http` throws `ApiError` with `.status` and the server's `error` message.
- State lives in contexts (`contexts/`), all created with `utils/createRequiredContext`:
  - `AuthContext` keeps the token in `localStorage` (`authToken`) and loads the user from `/auth/me`; `isAdmin` comes from `user.role`.
  - `CartContext` and `FavoritesContext` wrap React Query hooks from `hooks/queries/`. Queries are keyed `['cart' | 'favorites', token]` and disabled without a token. Mutations replace the cached list with the server response. The context APIs (`cart`, `toggleCart`, `increase`, `favorites`, `toggleFavorite`, ...) are what pages use.
  - `useRequireAuth` sends guests to `/login` instead of performing a cart or favorite action.
- Server data otherwise comes from TanStack Query hooks in `hooks/queries/` (products, product details, admin products, admin orders). `HomePage` and `ProductReviews` still fetch in `useEffect`.
- Pages are `modules/<Name>Page/`; shared pieces are in `modules/shared/`. Routes are defined in `src/AppRoutes.tsx`, with `ProtectedRoute` for signed-in pages and `forAdmin(...)` for admin pages.
- Types: `types/ProductRecord.ts` is the full product row; `Product` (list item), `ProductDescription` (details, adds `productId`) and `AdminProduct` derive from it. Categories come from `PRODUCT_CATEGORIES` / `isProductCategory` in `types/ProductCategory.ts`; the backend zod enums repeat this list, so change both together. Values read from the URL are checked with `utils/parseOption` instead of being cast.
- Styles are SCSS modules. A module starts with `@use '@/styles/tokens' as *;`, which provides variables, breakpoints and mixins (`on-tablet`, `on-desktop`, `content-padding-in-line`, `page-grid`) and emits no CSS. Global rules (reset, fonts, `.container`, `.App`) live only in `styles/global.scss`, imported once in `index.tsx`; do not `@use` it from modules, or the rules are duplicated into every chunk.
- Tests run in jsdom with Testing Library and jest-dom (`src/test/setup.ts`) and match `src/**/*.test.{ts,tsx}`, so component tests are picked up.

## Deployment

Production runs on Vercel (two projects from this repo) and Neon; see the Deployment section of `docs/PLAN.md`. Things that affect code changes:
- A push to `main` deploys both projects; the backend build applies Prisma migrations to the production database.
- Vercel installs with `npm install`, not `npm ci`, so a peer dependency conflict breaks the deploy. Check new backend dependencies with a plain `npm install` (no `--legacy-peer-deps`).
- On Vercel the backend entry is `backend/api/index.js`, which imports the compiled `dist/app.js`; `backend/src/index.ts` (`app.listen`) is only for local and Node-host runs.
- Never run the seed against the production database: it deletes all data first.
