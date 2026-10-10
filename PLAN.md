# Plan: Make phone-catalog-AI Full-Stack

## Context

`phone-catalog-AI` is currently a pure static-JSON-driven React SPA (Mate Academy Vite starter): it fetches `public/api/*.json` with raw `fetch()`, stores cart/favorites in `localStorage` via React Context, and has zero backend, auth, or persistence beyond the browser. The goal is to turn it into a real full-stack e-commerce app — PostgreSQL (via Neon) for data, a Node/Express/TypeScript REST API with JWT auth and `user`/`admin` roles, an admin panel for product CRUD, and a React/TanStack Query frontend — deployed to Vercel (frontend) + Railway/Render (backend) + Neon (DB).

Decisions locked in with the user before this plan:
- **Monorepo**: add `backend/` as an npm-workspace sibling; frontend stays at root (avoids churning existing Vite/ESLint/Cypress config for one frontend package).
- **ORM**: Prisma.
- **Guest cart/favorites**: ~~stay localStorage-only for anonymous users (unchanged UX); merge into the server on login/register.~~ **Revised mid-Phase-3, decided with the user:** no guest cart at all. Cart/favorites are available only to authenticated users; `localCart.ts`/`localFavorites.ts` were deleted outright rather than kept as a guest-branch fallback. Attempting to add to cart/favorites while logged out redirects to `/login` (via a new `useRequireAuth` hook) instead of operating on local state. Cart/favorites API routes are 100% auth-required — no guest-cart backend endpoints, and no merge-on-login flow (there's nothing to merge).
- **Favorites**: also gets a DB table + merge-on-login, same pattern as cart, even though not in the original table list.

## Key existing code to build around (do not rename/break these shapes)

- `src/types/Product.ts` (list/card shape) and `src/types/ProductFull.ts` (`ProductDescription`, detail shape) — field names are the API contract; the backend maps into these, not the other way around.
- `src/contexts/CartContext.tsx` / `src/contexts/FavoritesContext.tsx` — Context API returning `{ cart, toggleCart, removeFromCart, increase, decrease, clearCart }` / `{ favorites, toggleFavorite }`. Every consumer (`ProductCard`, `Header`, `CartPage`, `FavoritesPage`, `ProductDetails.tsx`) only uses this shape, so it stayed stable while the internals switched from pure-localStorage to a server-only API (see Phase 3 note below — the originally planned local/server hybrid was dropped in favor of auth-only).
- `src/api/localCart.ts` / `src/api/localFavorites.ts` — ~~existing localStorage read/write helpers, reused for the guest branch and for reading data to merge on login~~. **Deleted in Phase 3** — guest cart/favorites were dropped, so these had no remaining purpose.
- `src/modules/Catalog/CatalogPage.tsx` — owns the URL-param contract (`sort` ∈ `title|price|age`, `perPage` ∈ `4|8|16|all`, `page`) and expects `Pagination`'s `total` prop to be a total item count. The new products API must satisfy this contract so this component barely changes.
- `src/modules/ProductDetailsPage/ProductDetails.tsx` — today does `Promise.all([getProducts(), getProductsDetails(category)])` and cross-matches by `itemId` purely because the two static datasets were never merged; once the backend returns one unified row per SKU, this collapses to a single query.
- `vite.config.ts` — `base: '/phone-catalog-react-ts/'` (GitHub Pages) and `@` → `src` alias.
- Root `.gitignore` does **not** currently ignore `.env` — must fix before adding secrets.

## 1. Monorepo layout

Keep frontend at repo root; add `backend/` as an npm workspace member.

```
phone-catalog-AI/
├── package.json            # add "workspaces": ["backend"], keep existing frontend deps/scripts
├── vercel.json              # NEW — SPA rewrite for BrowserRouter
├── .env.example             # NEW — VITE_API_URL
├── .gitignore                # UPDATED — add .env, .env.local
├── src/, public/             # existing frontend, mostly unchanged
└── backend/                  # NEW workspace
    ├── package.json          # express, prisma, zod, jsonwebtoken, bcryptjs, cors
    ├── tsconfig.json
    ├── .env.example           # DATABASE_URL, DIRECT_URL, JWT_SECRET, CORS_ORIGIN, PORT
    ├── prisma/
    │   ├── schema.prisma
    │   ├── seed.ts            # reads ../public/api/*.json
    │   └── migrations/
    └── src/
        ├── index.ts, app.ts
        ├── config/env.ts       # zod-validated process.env
        ├── lib/prisma.ts       # PrismaClient singleton
        ├── middleware/         # auth.ts, requireRole.ts, validate.ts, errorHandler.ts
        ├── utils/               # jwt.ts, password.ts, ApiError.ts
        └── modules/
            ├── auth/ products/ cart/ favorites/ orders/ reviews/
            └── each: {feature}.routes.ts / .controller.ts / .service.ts / .schema.ts
```

## 2. PostgreSQL schema (Prisma)

Model `Product` as one denormalized row per SKU, matching today's `itemId` granularity (194 rows in `products.json`) — this mirrors the source data (each color/capacity combo is already a fully independent record) and avoids inventing a variant-relationship the source data doesn't cleanly support. DB columns use `priceRegular`/`priceDiscount`; the products **list** API maps these to `fullPrice`/`price` so `Product.ts` needs no renames, and the **detail** API maps 1:1 onto `ProductFull.ts` plus one additive field (`productId: number`, the numeric SKU id `ProductDetails.tsx` needs for cart/favorites, alongside the existing string slug `id`).

```prisma
enum ProductCategory { phones tablets accessories }
enum Role { user admin }
enum OrderStatus { pending paid shipped delivered cancelled }

model Product {
  id                Int             @id @default(autoincrement()) // preserves legacy numeric id
  itemId            String          @unique                        // slug
  namespaceId       String
  category          ProductCategory
  name              String
  capacity          String
  capacityAvailable String[]
  color             String
  colorsAvailable   String[]
  priceRegular      Int
  priceDiscount     Int
  screen            String
  resolution        String?
  processor         String?
  ram               String
  camera            String?
  zoom              String?
  cell              String[]
  year              Int
  image             String
  images            String[]
  description       Json            // { title, text[] }[]
  stock             Int             @default(20)   // NEW, not in source data
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  cartItems  CartItem[]
  orderItems OrderItem[]
  favorites  Favorite[]
  reviews    Review[]
  @@index([category])
}

model User {
  id Int @id @default(autoincrement())
  email String @unique
  passwordHash String
  name String
  role Role @default(user)
  createdAt DateTime @default(now())
  cart Cart?
  favorites Favorite[]
  orders Order[]
  reviews Review[]
}

model Cart {
  id Int @id @default(autoincrement())
  userId Int @unique
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  items CartItem[]
  updatedAt DateTime @updatedAt
}

model CartItem {
  id Int @id @default(autoincrement())
  cartId Int
  cart Cart @relation(fields: [cartId], references: [id], onDelete: Cascade)
  productId Int
  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  quantity Int @default(1)
  @@unique([cartId, productId])
}

model Favorite {
  id Int @id @default(autoincrement())
  userId Int
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  productId Int
  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  @@unique([userId, productId])
}

model Order {
  id Int @id @default(autoincrement())
  userId Int
  user User @relation(fields: [userId], references: [id])
  status OrderStatus @default(pending)
  total Int
  items OrderItem[]
  createdAt DateTime @default(now())
}

model OrderItem {
  id Int @id @default(autoincrement())
  orderId Int
  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId Int
  product Product @relation(fields: [productId], references: [id])
  quantity Int
  priceAtPurchase Int   // snapshot so later price edits don't rewrite history
}

model Review {
  id Int @id @default(autoincrement())
  productId Int
  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  userId Int
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  rating Int          // 1-5, validated via zod
  comment String?
  createdAt DateTime @default(now())
  @@unique([productId, userId])  // one review per user per product
}
```

`datasource db` uses `url = env("DATABASE_URL")` (Neon pooled) and `directUrl = env("DIRECT_URL")` (Neon direct, required for `migrate deploy` against Neon's pooler).

## 3. Seed strategy (`backend/prisma/seed.ts`)

1. Read `public/api/products.json` (194 list rows) + `public/api/{phones,tablets,accessories}.json` (detail rows, keyed by `id` == slug).
2. Merge each list row with its matching detail row by `itemId`; log a warning for any unmatched itemId.
3. Insert with **explicit numeric `id`** taken from `products.json` so any dev-created localStorage cart/favorite entries keep resolving to the same rows.
4. After seeding, reset the Postgres identity sequence (`setval(pg_get_serial_sequence(...))`) so admin-created products get ids beyond the seeded range.
5. Wire via `"prisma": {"seed": "tsx prisma/seed.ts"}` in `backend/package.json`, run with `npx prisma db seed`.
6. Images stay as static files served by the frontend (`public/img/**`) — no image migration needed, paths copied as-is into `image`/`images` columns.
7. Once Phase 1 (below) is verified end-to-end, delete `public/api/*.json` (dead weight after `src/api/products.ts` stops using them).

## 4. Express REST API

Structure: `backend/src/modules/<feature>/{routes,controller,service,schema}.ts`. Single `PrismaClient` in `backend/src/lib/prisma.ts`. Zod schemas + a `validate(schema)` middleware. `auth.ts` (verifies JWT, sets `req.user`), `requireRole('admin')` guard. Central `errorHandler.ts` mapping `ApiError` + Prisma error codes (`P2002`→409, `P2025`→404) to JSON. CORS allow-list from `CORS_ORIGIN` env var.

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/health` | none | |
| POST | `/api/auth/register` | none | `{email,password,name}` → `{user, token}` |
| POST | `/api/auth/login` | none | `{email,password}` → `{user, token}` |
| GET | `/api/auth/me` | required | |
| GET | `/api/products` | none | query `category,sort,page,perPage,search` → `{items, total}` — matches `CatalogPage.tsx` contract |
| GET | `/api/products/:category/:itemId` | none | unified detail shape |
| POST/PUT/DELETE | `/api/products[/:id]` | admin | product CRUD |
| GET/POST/PATCH/DELETE | `/api/cart[/:productId]` | required | cart CRUD — *implemented as-is, no `/merge` route (no guest cart to merge)* |
| GET/POST/DELETE | `/api/favorites[/:productId]` | required | favorites CRUD — *same: no `/merge` route* |
| POST/GET | `/api/orders` | required | create order (snapshots prices, clears server cart) / list own orders |
| GET | `/api/orders/:id` | owner or admin | |
| GET | `/api/admin/orders` | admin | filter by status |
| PATCH | `/api/admin/orders/:id/status` | admin | |
| GET/POST | `/api/products/:productId/reviews` | none / required | list + avg rating / upsert own review |
| DELETE | `/api/reviews/:id` | owner or admin | |

No guest-cart backend endpoints exist by design. Unlike the original plan, there's no guest-side `localCart.ts`/`localFavorites.ts` touchpoint either — anonymous users simply can't add to cart/favorites; the UI redirects them to `/login` instead.

## 5. Frontend integration

- Add `@tanstack/react-query` (+ devtools). New `src/lib/queryClient.ts`.
- Provider order in `src/index.tsx`: `QueryClientProvider > AuthProvider (new) > CartProvider > FavoritesProvider > BrowserRouter (was HashRouter)`.
- New `src/api/http.ts`: fetch wrapper reading `VITE_API_URL`, attaching `Authorization: Bearer <token>`, throwing typed `ApiError`.
- Rewrite `src/api/products.ts` to call the backend (`getProducts(params)` → `{items,total}`, `getProductDetails(category,itemId)`); new query hooks under `src/hooks/queries/` replace the manual fetch/useState in `useProducts.ts`, `CatalogPage.tsx`, and the `Promise.all` dance in `ProductDetails.tsx` (collapses to one query now the backend returns a unified row).
- `CatalogPage.tsx`: sort/perPage/page become query params sent to the API; `Pagination`'s `total` comes from the API response instead of `sortedProducts.length`. URL-param contract unchanged.
- `ProductFull.ts`: add `productId: number` field (additive only); `ProductDetails.tsx` uses it instead of the separately-fetched `baseProduct.id`.
- New `src/contexts/AuthContext.tsx`: JWT in localStorage (`authToken`), `login/register/logout/user/isAuthenticated/isAdmin`, hydrates via `GET /api/auth/me` on mount.
- New pages/routes: `/login`, `/register`, `/profile` (order history), `/admin` + `/admin/products/new` + `/admin/products/:id/edit` (wrapped in new `ProtectedRoute` checking `isAuthenticated && isAdmin`), reviews UI inside `ProductDetails.tsx`. Checkout reuses `CartPage.tsx`'s existing Modal-confirm flow, wired to a create-order mutation instead of just `clearCart()`.
- `CartContext`/`FavoritesContext`: kept the exact same returned shape (zero changes needed in `ProductCard`, `Header`, `CartPage`, `FavoritesPage`, `ProductDetails.tsx`). **Revised from the original local/server-hybrid design**: internals fully replaced with server-backed state (`src/api/cart.ts`/`src/api/favorites.ts`), gated on `useAuth().isAuthenticated` — logged-out state is simply an empty array, nothing is read from or written to `localStorage`. A new `useRequireAuth` hook wraps the `toggleCart`/`toggleFavorite` call sites in `ProductCard`/`ProductDetails.tsx`: if the user isn't authenticated it redirects to `/login` (passing `state.from` so the user lands back where they started after logging in) instead of letting the action proceed. No merge-on-login step exists or is needed.
- Env: new root `.env.example` (`VITE_API_URL=http://localhost:4000/api`); fix root `.gitignore` to add `.env`/`.env.local`; add `backend/.gitignore`.
- Router: switch `HashRouter`→`BrowserRouter` (real hosting now, not GH Pages subpath). Update `vite.config.ts` `base` to default. Add root `vercel.json` SPA rewrite (`/(.*) → /index.html`). `gh-pages` script/dep become dead weight — flagged for removal, not blocking.

## 6. Deployment

- **Neon**: create project, grab pooled (`DATABASE_URL`) + direct (`DIRECT_URL`) connection strings. Commit `backend/prisma/migrations/` from local `prisma migrate dev` runs.
- **Backend (Railway/Render)**: Root Directory = **repo root** (not `backend/` — npm workspaces hoist deps to root `node_modules`). Build: `npm install && npm run build -w backend`. Start: `npm run start -w backend`, where backend's `start` script is `prisma migrate deploy && node dist/index.js` (safe/idempotent migration on every boot). Env vars: `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `NODE_ENV=production`, `PORT`.
- **Frontend (Vercel)**: Root Directory = repo root, Framework = Vite, Build = default, Output = `dist`. Env: `VITE_API_URL=https://<backend-domain>/api`. `vercel.json` rewrite already added in Phase 1.
- Backend/frontend deploys are independent at build time (frontend never calls the API during build); just ensure backend is live before merging frontend changes that depend on new endpoints.

## 7. Phased execution (app stays demoable at every step)

0. **Backend scaffold** — `.gitignore` fixes, `"workspaces"` in root `package.json`, Express+TS+Prisma skeleton with just `/api/health`, full `schema.prisma` + first migration (avoids repeated migration churn). Frontend untouched.
1. **Products read API + TanStack Query + router swap** — `seed.ts`, products GET routes; frontend gets `@tanstack/react-query`, rewritten `products.ts`/`useProducts.ts`/`CatalogPage.tsx`/`ProductDetails.tsx`, `productId` field, `BrowserRouter` + `vercel.json`. Delete `public/api/*.json` once verified. Cart/favorites still localStorage-only.
2. **Auth** — users table + JWT routes/middleware; `AuthContext`, `/login`, `/register`, Header login state. Cart/favorites still unaffected.
3. **Cart & favorites, auth-only** — backend `cart`/`favorites` modules (100% auth-required, no guest-cart endpoints); `CartContext`/`FavoritesContext` evolve per §5 (full server replacement, not a local/server hybrid); new `useRequireAuth` hook redirects guests to `/login` on add-to-cart/favorite. *Deviates from the original guest-cart-with-merge design — decided with the user mid-phase in favor of a simpler auth-required flow; no merge-on-login step was built.*
4. **Orders/checkout** — order creation + snapshot pricing; `CartPage.tsx` Modal wired to create-order mutation; `ProfilePage` order history.
5. **Reviews** — endpoints + avg rating; `Reviews` component on `ProductDetails.tsx`.
6. **Admin panel CRUD** — admin product endpoints; `ProtectedRoute`, `AdminPage` table + create/edit forms, delete via existing `Modal`.
7. **Cloud deployment** — Neon + Railway/Render + Vercel per §6.

## Verification

- After Phase 0: `curl http://localhost:4000/api/health` returns 200; `npx prisma migrate dev` succeeds against a local/Neon dev DB.
- After Phase 1: run frontend (`npm run start`) + backend (`npm run dev:backend`) together; browse `/`, a category page (sort/perPage/pagination), a product detail page, and confirm data now comes from Postgres (kill the backend and confirm the frontend errors instead of silently falling back to JSON).
- After Phase 2: register + login via UI, confirm JWT persists across refresh, confirm `/api/auth/me` returns the right role.
- After Phase 3: confirm a logged-out click on "Add to cart"/the favorite heart redirects to `/login` instead of adding anything; after logging in, confirm cart/favorites actions hit the server (`GET /api/cart`/`GET /api/favorites`) and persist across logout/login.
- After Phase 4: full guest→signup→cart→checkout→order-history flow works end-to-end; verify `OrderItem.priceAtPurchase` snapshots correctly if the product price is edited afterward.
- After Phase 5: submit a review, confirm average rating updates, confirm duplicate review by same user is rejected/upserted.
- After Phase 6: log in as a non-admin and confirm `/admin` redirects; log in as admin and confirm create/edit/delete product round-trips to Postgres and reflects on the catalog immediately.
- After Phase 7: hit the deployed Vercel URL, confirm it talks to the deployed Railway/Render API and Neon DB (check network tab for `VITE_API_URL`), hard-refresh a deep link (e.g. a product detail page) to confirm the Vercel SPA rewrite works.
