# RentNest

RentNest is a rental marketplace where tenants can discover homes, send rental requests, make payments, and manage their rental activity. Landlords can manage listings and requests, while administrators can manage users, properties, rentals, payments, categories, and reviews.

This repository contains the Next.js frontend. The Express/Prisma backend is maintained in the sibling `RentNest` project.
# Payment
Card: 4242 4242 4242 4242

## Features

- Public property discovery, search, categories, and property details
- Tenant registration, login, saved homes, rental requests, payments, and reviews
- Landlord property management and rental request management
- Admin management for users, properties, categories, rentals, payments, and reviews
- Role-based dashboard routing for `TENANT`, `LANDLORD`, and `ADMIN`
- Stripe checkout flow with success/cancel redirects
- Profile photo support for all dashboard roles
- TanStack Query caching and request deduplication
- Server-side property pagination
- Loading skeletons and optimized remote images

## Tech stack

- Next.js 15 App Router
- React 19 and TypeScript
- TanStack Query
- Lucide React
- PostgreSQL, Prisma, Express, and Stripe in the backend

## Requirements

- Node.js 18 or newer
- npm or pnpm
- The RentNest backend running locally or deployed
- PostgreSQL for a local backend setup

## Installation

Install frontend dependencies:

```bash
npm install
```

Or with pnpm:

```bash
pnpm install
```

Create `.env.local` in the frontend root:

```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
```

For a deployed backend, replace the value with its API URL, for example:

```env
NEXT_PUBLIC_API_URL="https://your-backend-domain.vercel.app/api"
```

## Running locally

Start the backend first from the sibling backend project:

```bash
cd ..\RentNest
pnpm dev
```

Then start the frontend:

```bash
cd ..\RentNest frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

If Next.js reports a stale webpack module or `.next` runtime error, use the clean development command:

```bash
npm run dev:clean
```

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run dev:clean` | Remove the Next.js cache and start development mode |
| `npm run build` | Create a production build and run type checks |
| `npm run start` | Start the production server after building |
| `npm run lint` | Run the configured lint command |

## Main routes

### Public

- `/` — Home page
- `/properties` — Property listing and search
- `/properties/[id]` — Property details and rental request
- `/login` — Login
- `/register` — Registration

### Tenant dashboard

- `/user-dashboard`
- `/user-dashboard/my-rentals`
- `/user-dashboard/payments`
- `/user-dashboard/reviews`
- `/user-dashboard/saved-homes`
- `/user-dashboard/profile`

### Landlord dashboard

- `/landlord-dashboard`
- `/landlord-dashboard/properties`
- `/landlord-dashboard/rentals`
- `/landlord-dashboard/payments`
- `/landlord-dashboard/profile`

### Admin dashboard

- `/admin-dashboard`
- `/admin-dashboard/users`
- `/admin-dashboard/properties`
- `/admin-dashboard/categories`
- `/admin-dashboard/rentals`
- `/admin-dashboard/payments`
- `/admin-dashboard/reviews`
- `/admin-dashboard/profile`

## Authentication and redirects

The frontend stores the access token in browser storage and uses the backend auth cookies through the same-origin `/backend-api` proxy.

- Admin login redirects to `/admin-dashboard`
- Landlord login redirects to `/landlord-dashboard`
- Tenant login from the home page redirects to `/`
- Tenant login from a property booking action redirects back to that property

Protected dashboard routes use a role gate. The cached auth user is shared through TanStack Query so the header, role gate, profile menu, and dashboard do not make duplicate user requests.

## API and performance architecture

API calls are defined in `lib/api.ts`. Browser requests use the Next.js `/backend-api/[...path]` proxy, which forwards requests to `NEXT_PUBLIC_API_URL`.

Performance features include:

- TanStack Query cache for shared server state
- In-flight request deduplication
- A short-lived GET cache for legacy API consumers
- Public properties and categories cached by the frontend proxy
- Property pagination instead of loading every listing at once
- Home page loading only featured listings
- Lazy/optimized Next Image rendering
- Route-level loading skeletons
- Auth checks skipped for logged-out public visitors

## Payment flow

1. A landlord approves a tenant rental request.
2. The tenant opens **Pay now** from `/user-dashboard/my-rentals`.
3. The frontend creates a Stripe checkout session through `/api/payments/create`.
4. Stripe redirects to the backend success callback.
5. The backend confirms the Stripe session and redirects to the tenant dashboard.

For deployed payments, configure the backend environment variables correctly:

```env
APP_URL=https://rent-nest-frontend-iota.vercel.app
SERVER_URL=https://rentnest-backend-rho.vercel.app
```

`APP_URL` must point to the frontend. `SERVER_URL` must point to the backend.

## Troubleshooting

### `502` from `/backend-api/*`

The frontend proxy cannot reach the configured backend. Check that:

- The backend is running on port `5000` for local development
- `NEXT_PUBLIC_API_URL` is correct
- The deployed backend URL is reachable directly
- The backend database and required environment variables are configured

### `signal is aborted without reason`

This indicates a backend request timeout. Check backend cold starts, database connectivity, and large admin queries. Restart the frontend with `npm run dev:clean` after changing dependencies or Next.js build settings.

### Admin or landlord dashboard does not open

Confirm that the logged-in account has the expected role and that `/api/auth/me` returns a valid authenticated user. Then clear the browser access token and log in again if an old session is cached.

### Profile photo does not appear

The profile photo must be a publicly accessible `http` or `https` URL. A local file path or private URL cannot be rendered by the browser.

## Backend reference

The backend README contains the complete API endpoint list, role rules, request examples, Prisma setup, Stripe webhook configuration, and deployment notes. From this frontend directory, it is available at:

```txt
..\RentNest\README.md
```

## Production checklist

- Set `NEXT_PUBLIC_API_URL` to the deployed backend API
- Set backend `APP_URL` to the deployed frontend URL
- Set backend `SERVER_URL` to the deployed backend URL
- Configure PostgreSQL and Prisma environment variables
- Configure Stripe secret and webhook variables
- Run `npm run build`
- Start with `npm run start` or deploy to Vercel
