# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Layout

Two separate npm packages, no workspaces: the React frontend at the repo root and the Express API in `backend/`. Install and run each on its own. `PLAN.md` is the phased build plan and records design decisions (for example, cart and favourites require sign-in; there is no guest cart).

## Commands

Frontend (repo root, Vite dev server on http://localhost:5173):

```bash
npm start                                # dev server
npm run build                            # production build to dist/
npm test                                 # vitest run
npx vitest run src/utils/cart.test.ts    # one file
npx vitest run -t "parseOption"          # tests whose name matches
npx tsc --noEmit -p tsconfig.json        # typecheck (not part of build)
npm run lint                             # stylelint --fix + prettier --write (rewrites files)
```

Backend (`cd backend`, API on http://localhost:4000):

```bash
npm run dev            # tsx watch
npm test               # vitest run; same single-file / -t usage as above
npx tsc --noEmit       # typecheck
npm run db:migrate     # prisma migrate dev
npm run db:seed        # load the sample catalog
npm run db:reset       # drop, migrate, seed
```

Backend config: copy `backend/.env.example` to `backend/.env`. `JWT_SECRET` must be at least 32 characters, and `CORS_ORIGIN` must include `http://localhost:5173`; `config/env.ts` exits on invalid env. The frontend reads `VITE_API_URL` (default `http://localhost:4000/api`). The admin role is only set in the database; the seed creates no admin user.

### Known type errors

`tsc` is not clean on either side, so compare against the baseline instead of expecting zero:
- Frontend: 7 errors, in `src/api/http.ts`, `CartPage/components/CartItem`, and the `HomePage` sliders.
- Backend: 3 errors, missing `@types/cors` and `@types/bcryptjs`, and the `$transaction` mock typing in `orders.service.test.ts`.

### Pre-commit hook

`.git/hooks/pre-commit` runs `npx mate-scripts lint`: ESLint on staged `.ts/.tsx` and stylelint on staged `.scss`. Notes:
- It is slow (1–3 minutes), so run `git commit` in the background or with a long timeout. Do not bypass it with `--no-verify`.
- It applies Prettier to the files after they are staged. The commit contains the pre-format version and the working tree is left with formatting changes; check `git status` after committing and commit those as well.
- ESLint rules that often fail here: `@typescript-eslint/indent` rejects Prettier's multi-line unions with leading `|` (split long unions into shorter type aliases), and `@typescript-eslint/no-shadow`.
- `@mate-academy/scripts`, `cypress` and `eslint-plugin-cypress` look unused but are required by the hook and `.eslintrc.cjs`.
- Git prints LF/CRLF warnings on Windows; a diff that disappears with `git diff --ignore-cr-at-eol` is line endings only.

## Backend architecture (`backend/src`)

- Each feature in `modules/<name>/` has `*.routes.ts`, `*.controller.ts`, `*.service.ts`, and `*.schema.ts` (zod) where it takes input. Routers declare full paths (`/api/products/...`) and are mounted in `app.ts` without a base path. Unknown `/api/*` routes return a JSON 404.
- Controllers are wrapped in `utils/asyncHandler` and contain no try/catch. Services hold the Prisma logic and throw `ApiError` (`utils/ApiError.ts`) for expected failures.
- `middleware/validate.ts`: `validate(schema, 'body' | 'query' | 'params')`. Parsed `body` and `query` replace the raw values. `params` are only checked, so handlers still convert them with `Number(req.params.id)`. Shared param schemas are in `utils/schemas.ts`.
- `middleware/auth.ts` (`auth`) is the only guard for signed-in routes: it requires `Authorization: Bearer <token>` and sets `req.user`. `requireAdmin` follows it on admin routes.
- `middleware/errorHandler.ts` returns `{ error, code? }`. It maps `ApiError` to its status, Prisma `P2002` to 409, `P2003` and `P2025` to 404, malformed JSON to 400, and everything else to 500. Only unexpected errors are logged.
- API contract the frontend relies on: the product list adds `fullPrice`/`price` aliases (for `priceRegular`/`priceDiscount`), and product details add `productId` (equal to `id`). Cart and favourites endpoints return the whole updated list after every change. `GET /api/products` query values fall back to defaults instead of failing; `perPage` is `all` or 1–100.
- Tests mock Prisma: import `prismaMock` from `src/test/prismaMock.ts` (vitest-mock-extended), which replaces `lib/prisma.js`. For `$transaction`, the existing tests pass `prismaMock` as `tx`. No database is needed.
- The backend is ESM: relative imports use the `.js` extension.

## Frontend architecture (`src`)

- `api/`: one file per resource, built on `api/http.ts`. Functions that need auth take the token as their first argument. `http` throws `ApiError` with `.status` and the server's `error` message.
- State lives in contexts (`contexts/`), all created with `utils/createRequiredContext`:
  - `AuthContext` keeps the token in `localStorage` (`authToken`) and loads the user from `/auth/me`; `isAdmin` comes from `user.role`.
  - `CartContext` and `FavoritesContext` wrap React Query hooks from `hooks/queries/` (`useCartQuery`/`useCartMutation`, `useFavoritesQuery`/`useFavoritesMutation`). Queries are keyed `['cart' | 'favorites', token]` and disabled without a token. Mutations replace the cached list with the server response. The context APIs (`cart`, `toggleCart`, `increase`, `favorites`, `toggleFavorite`, ...) are what pages use.
  - `useRequireAuth` sends guests to `/login` instead of performing a cart or favourite action.
- Server data otherwise comes from TanStack Query hooks in `hooks/queries/`. `HomePage` and `ProductReviews` still fetch in `useEffect`.
- Pages are `modules/<Name>Page/`; shared pieces are in `modules/shared/`. Routes are defined in `src/index.tsx`, with `ProtectedRoute` for signed-in and admin pages.
- Types: `types/ProductRecord.ts` is the full product row; `Product` (list item), `ProductDescription` (details, adds `productId`) and `AdminProduct` derive from it. Categories come from `PRODUCT_CATEGORIES` / `isProductCategory` in `types/ProductCategory.ts`; the backend zod enums repeat this list, so change both together. Values read from the URL are checked with `utils/parseOption` instead of being cast.
- Styles are SCSS modules. A module starts with `@use '@/styles/tokens' as *;`, which provides variables, breakpoints and mixins (`on-tablet`, `on-desktop`, `content-padding-in-line`, `page-grid`) and emits no CSS. Global rules (reset, fonts, `.container`, `.App`) live only in `styles/global.scss`, imported once in `index.tsx`; do not `@use` it from modules, or the rules are duplicated into every chunk.
- Frontend tests run in the `node` environment and only match `src/**/*.test.ts`; there is no jsdom or Testing Library, so component tests (`.test.tsx`) are not picked up.
