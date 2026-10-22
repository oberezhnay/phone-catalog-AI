# Phone Catalog

**Phone Catalog** is a full-stack store for mobile phones, tablets and accessories. Shoppers can browse the catalog, view product details, sign in, manage a cart and favorites, place orders and leave reviews. Admins can manage products and orders from an admin panel. The project is a practice ground for scalable React and TypeScript front-end work, backed by an Express API and PostgreSQL.

## 🎨 Design Reference

- [Figma design](https://www.figma.com/file/T5ttF21UnT6RRmCQQaZc6L/Phone-catalog-(V2)-Original)

## Features

- 📋 Catalog with category pages, sorting and pagination (state kept in the URL)
- 🔍 Product details with images, specifications and related products
- 🔐 Registration, login and JWT sessions; the session survives a page refresh
- ❤️ Favorites, stored on the server per user
- 🛒 Cart with quantity control, stored on the server per user
- 📦 Checkout that creates an order and clears the cart; order history page (`/orders`)
- ⭐ Product reviews with average rating; one review per user and product
- 🛠 Admin panel (admin role only): product create, edit and delete; order list with status filter and status changes (`/admin`, `/admin/orders`)
- 📱 Responsive layout

Cart and favorites need an account: logged-out users who try to add an item are sent to the login page.

## Technologies

**Frontend:** React 18, TypeScript, Vite, React Router, TanStack Query, SCSS modules, Swiper, Vitest and Testing Library

**Backend:** Node.js, Express 4, TypeScript, Prisma 5, PostgreSQL, zod (validation), JWT and bcrypt (auth), Vitest and supertest

## Project Structure

```
.
├── src/                 # React app (imports use the @/ alias for src)
│   ├── api/             # HTTP client and endpoint functions
│   ├── contexts/        # Auth, cart and favorites state
│   ├── hooks/queries/   # TanStack Query hooks
│   ├── modules/         # Pages and page components
│   └── styles/          # Shared SCSS tokens, mixins and globals
├── docs/PLAN.md         # Build plan, decisions and current status
└── backend/
    ├── prisma/          # Schema, migrations, seed data
    └── src/
        ├── modules/     # auth, products, cart, favorites, orders, reviews
        ├── middleware/  # auth, admin check, validation, error handling
        └── utils/
```

Each backend module has `*.routes.ts`, `*.controller.ts`, `*.service.ts` and, where needed, `*.schema.ts`.

## Getting Started

### Prerequisites

- Node.js 20 or newer
- PostgreSQL (local, or a hosted database such as Neon)

### 1. Install dependencies

```bash
npm install
cd backend && npm install && cd ..
```

### 2. Configure the backend

Copy `backend/.env.example` to `backend/.env` and set:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `DIRECT_URL` | Direct connection string (used by Prisma migrations) |
| `JWT_SECRET` | Secret for signing tokens; at least 32 characters |
| `CORS_ORIGIN` | Comma-separated list of allowed frontend origins, e.g. `http://localhost:5173` |
| `PORT` | API port, default `4000` |

To point the frontend at a different API, set `VITE_API_URL` (default `http://localhost:4000/api`). See the root `.env.example`.

### 3. Set up the database

```bash
cd backend
npm run db:migrate   # apply migrations
npm run db:seed      # load the sample catalog
```

The seed does not create users. Register an account in the app; to make it an admin, set its `role` to `admin` in the database (for example with `npx prisma studio`).

### 4. Run the app

Start the API and the frontend in two terminals:

```bash
# terminal 1: API on http://localhost:4000
cd backend
npm run dev

# terminal 2: frontend on http://localhost:5173
npm start
```

## Scripts

| Where | Command | What it does |
| --- | --- | --- |
| root | `npm start` | Vite dev server |
| root | `npm run build` | Production build to `dist/` |
| root | `npm run preview` | Serve the production build |
| root | `npm test` | Frontend tests (Vitest, jsdom) |
| root | `npm run typecheck` | TypeScript check without emitting |
| root | `npm run lint` | Format SCSS and TypeScript |
| backend | `npm run dev` | API with hot reload |
| backend | `npm run build` / `npm start` | Compile; run migrations and start the compiled API |
| backend | `npm test` | Backend tests (Vitest, mocked Prisma) |
| backend | `npm run lint` / `format` / `typecheck` | ESLint, Prettier, TypeScript check |
| backend | `npm run db:migrate` / `db:seed` / `db:reset` | Database management |

## Tests

- **Backend:** service, middleware, utility and schema tests, plus HTTP route tests with supertest (including the admin order endpoints). Prisma is mocked, so tests need no database or `.env`.
- **Frontend:** unit tests for utilities and the API client, and component tests for `Modal`, `Pagination`, `ProtectedRoute` and the admin orders page.

```bash
npm test                # frontend
cd backend && npm test  # backend
```

## Manual Checks

Run these after changes to auth, reviews or the admin panel:

- Submit a review on a product page. The average rating should update, and submitting again as the same user should replace the earlier review, not add a second one.
- Log in as a non-admin user and open `/admin`. You should be redirected away from it.
- Log in as an admin user. Create, edit and delete a product. Each change should be saved to PostgreSQL and show up in the catalog straight away.
- As an admin, open `/admin/orders`, filter by status and change an order's status. The order list should update.

## Design Notes

[docs/PLAN.md](./docs/PLAN.md) records the build plan, the decisions made along the way (such as requiring sign-in for cart and favorites), the API and routes, and what is left to do (cloud deployment).
