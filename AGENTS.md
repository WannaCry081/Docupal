# AGENTS.md — Next.js Architecture Guide

> This guide covers **architectural decisions, coding conventions, and project-level standards** for this Next.js codebase. It is fully self-contained — no external file is required to act on any rule here.

---

## TL;DR (read this first)

- **Every component starts as a Server Component.** Add `'use client'` only when you need browser APIs, event listeners, or React state.
- **All network calls go through `modules/{feature}/api/`.** Never call `fetch()` inline in a page or component.
- **Three cache layers:** `'use cache'` (long-lived server data) → `React.cache()` (per-render dedup) → TanStack React Query (client state). Pick the right layer; don't mix them.
- **Dependency flow is one-way:** `app/ → modules/ → lib/ → types/`. Reverse imports are forbidden.
- **React Compiler is on.** Do not add `useMemo`, `useCallback`, or `React.memo` unless profiling proves it necessary.
- **Env vars are validated at startup** via Zod in `lib/env.ts`. Never access `process.env` directly outside that file.

---

## Table of Contents

1. [Core Principles](#core-principles)
2. [Project Structure](#project-structure)
3. [Routing & Rendering](#routing--rendering)
4. [Caching Architecture](#caching-architecture)
5. [Data Fetching](#data-fetching)
6. [Component Architecture](#component-architecture)
7. [Styling System](#styling-system)
8. [State Management](#state-management)
9. [Forms](#forms)
10. [Authentication](#authentication)
11. [Feature Flags](#feature-flags)
12. [Error Handling](#error-handling)
13. [Environment Variables](#environment-variables)
14. [Testing](#testing)
15. [Performance](#performance)
16. [Conventions Reference](#conventions-reference)
17. [Prefer vs Avoid](#prefer-vs-avoid)

---

## Core Principles

### 1. Server-first rendering

React Server Components are the default. Every page is an `async` server function unless interactivity requires otherwise. `'use client'` is a deliberate opt-in, not the starting point.

### 2. Domain encapsulation via modules

Business logic lives in `modules/{feature}/`, not in pages or shared components. A page orchestrates data and composes components — it does not understand domain rules. Data fetching calls a function from `modules/{feature}/api/`; domain UI comes from `modules/{feature}/components/`.

### 3. Layered architecture with one-way dependency flow

```text
app/  →  modules/  →  lib/  →  components/ui / types
```

Nothing in this chain reverses. Cross-module dependencies are mediated by `modules/shared/` or `lib/`.

### 4. Caching is intentional and layered

Three distinct caching layers, each with a different purpose and lifetime:

- **Next.js `'use cache'`** — long-lived server data
- **React `cache()`** — per-render deduplication
- **TanStack React Query** — client-side server state

Every cache has explicit lifetime and invalidation semantics.

### 5. SEO is a first-class concern

Every page exports `generateMetadata`. JSON-LD structured data is rendered on every major page type. Canonical URLs are computed from route params — never hardcoded.

### 6. The rendering budget

Before making a component a client component: does it require browser APIs, event listeners, or React state? If not, it stays on the server. Client components are leaves in the component tree, not containers.

---

## Project Structure

```text
app/                        # App Router routes
  (groups)/                 # route groups — separate concerns without affecting URLs
  @modals/                  # parallel route slot for modal overlays
  layout.tsx
  globals.css
components/
  ui/                       # shadcn/ui primitives (Button, Input, Dialog, etc.)
  {shared-component}.tsx    # shared cross-route components
modules/
  shared/                   # cross-module utilities, SEO helpers, shared types
  {feature}/
    api/                    # fetch functions, query key factories
    components/             # domain-specific components
    hooks/                  # React Query hooks and domain-specific hooks
    mappers/                # API response → internal type transforms
    seo/                    # generateMetadata helpers, JSON-LD builders
    types/                  # domain types
lib/
  utils.ts                  # cn() utility (shadcn default)
  fetch-client.ts           # base fetch wrapper + HttpError
  query-client.ts           # TanStack QueryClient config
  auth.ts                   # auth provider config (e.g. Auth.js / NextAuth)
  env.ts                    # Zod-validated env schema — the only place process.env is read
hooks/                      # shared, non-domain hooks
types/                      # shared TypeScript types
```

### Dependency flow

Permitted directions only — reverse dependencies are forbidden:

```text
app/              →  components/ | modules/ | lib/ | hooks/ | types/
components/       →  lib/ | types/
components/ui/    →  lib/utils.ts only
modules/{feature} →  lib/ | components/ui/ | types/
modules/shared/   →  lib/ | types/
lib/              →  types/
hooks/            →  lib/ | types/
```

**Forbidden:**

- `lib/` importing from `modules/`
- `components/ui/` importing from `modules/` or from `lib/` beyond `utils.ts`
- `modules/A` importing from `modules/B` directly — use `modules/shared/` or `lib/`
- Any circular dependency

---

## Routing & Rendering

### Route groups

Use route groups `(group-name)/` to separate concerns without affecting the URL structure. Common groups: `(marketing)`, `(dashboard)`, `(auth)`.

### Parallel routes and the `@modals` slot

The root layout receives a `modals` prop from the `@modals` parallel route slot. This enables intercepting routes to render overlay UIs without unmounting the background page.

```text
app/
├── layout.tsx                        ← receives { children, modals }
├── @modals/
│   └── (.)products/[slug]/           ← intercepting route → renders as modal
│       └── page.tsx
└── products/
    └── [slug]/
        └── page.tsx                  ← full-page destination (direct navigation)
```

### Intercepting routes for modal-over-page

Navigation to a detail page from a listing intercepts the route and renders the destination as a modal, reusing the same content component with a `variant` prop. Direct navigation to the URL renders the full page.

```typescript
// The same component renders in both contexts
<ProductDetailContent params={params} variant="modal" />  // in @modals
<ProductDetailContent params={params} variant="page" />   // in full-page route
```

### Dynamic segments

Dynamic segments use slugs, not IDs, in URLs. Slug-to-ID resolution happens through cached lookups, not inline in the route handler.

### Middleware

`middleware.ts` is the single entry point for cross-cutting request concerns. Responsibilities in order:

1. Site access enforcement (kill switch / maintenance mode)
2. URL rewrites (e.g. `/sitemap.xml` → internal route handler)
3. Auth feature flag check
4. Auth guard redirects for protected paths
5. Session management delegation (auth provider middleware)

### Rendering decision matrix

| Condition                                                      | Strategy                                 |
| -------------------------------------------------------------- | ---------------------------------------- |
| No browser APIs, no interactivity, no React state              | Server Component (default)               |
| Needs `useState`, `useEffect`, event handlers, or browser APIs | `'use client'`                           |
| Small, enumerable set of URL combinations                      | `generateStaticParams` (SSG)             |
| Expensive, rarely-changing server data                         | `'use cache'` + `cacheLife` + `cacheTag` |
| Per-render deduplication of the same server fetch              | React `cache()`                          |
| User-specific or highly dynamic client data                    | TanStack React Query                     |

### Server Components are async functions

Pages and layouts are `async` functions. Data is fetched with `await` directly in the component body. There is no `getServerSideProps` or `getStaticProps`.

```typescript
const ProductsPage = async ({ params, searchParams }: ProductsPageProps) => {
  const { slug } = await params;

  return (
    <>
      <ProductsContent params={Promise.resolve({ slug })} searchParams={searchParams} />
      <Suspense fallback={null}>
        <ProductsJsonLdScript slug={slug} />
      </Suspense>
    </>
  );
};
```

### `params` and `searchParams` are Promises (Next.js 15+)

Always `await` them before use. Type them as `Promise<{...}>`:

```typescript
interface ProductsPageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<ProductsFilters>;
}
```

### `generateStaticParams`

Used for pages with a bounded, enumerable parameter space. Cap combination count to control build time:

```typescript
export const generateStaticParams = async () => {
  const products = await getCachedProductList();
  return products.map(({ slug }) => ({ slug })).slice(0, 500);
};
```

### `loading.tsx` at every route

Every route that performs async work has a `loading.tsx` sibling. Loading states use purpose-built skeleton components that match the real content layout — never generic spinners at the page level.

```text
products/[slug]/
├── page.tsx
├── loading.tsx    ← exports <ProductDetailLoading variant="page" />
└── error.tsx      ← 'use client', receives reset callback from Next.js
```

Loading components accept a `variant` prop when they render in both modal and page contexts.

### `'use client'` components are leaves

Client components handle exactly one of: form interactions, tabs, infinite scroll, optimistic mutations, or browser-API-dependent UI. Never use them as layout containers.

```text
ServerPage (async)
  └── ServerDataFetch
        └── ClientInteractiveLeaf ('use client')
```

### `<Suspense>` for non-critical async sections

Wrap non-critical async sections — JSON-LD scripts, deferred widgets, geolocation prompts — in `<Suspense fallback={null}>` so they never block the visible page render.

```typescript
<Suspense fallback={null}>
  <ProductJsonLdScript slug={slug} />
</Suspense>
```

### Optional: Internationalization

If the project is multilingual, route with `[locale]/` segments. Compute hreflang alternates and canonical URLs from the locale list — never hardcode them. Keep locale constants in one place (`lib/i18n.ts` or `modules/shared/`).

---

## Caching Architecture

### Layer 1: Next.js `'use cache'` (long-lived server data)

Used for data that changes rarely and is expensive to fetch. Place the `'use cache'` directive at the top of the file; call `cacheLife` and `cacheTag` inside the function body.

```typescript
// modules/products/api/get-cached-product-list.ts
"use cache";

import { cacheLife, cacheTag } from "next/cache";

export const getCachedProductList = async (): Promise<Product[]> => {
  cacheLife({
    stale: 60 * 5,
    revalidate: 60 * 60 * 24,
    expire: 60 * 60 * 24 * 365,
  });
  cacheTag("products", "products:list");
  return fetchProducts();
};
```

Cache tags follow a namespaced hierarchy: `products` → `products:list` → `products:slug:my-item`. This allows `revalidateTag()` invalidation at any granularity.

### Layer 2: React `cache()` (per-render deduplication)

When the same server fetch may be triggered from multiple server component branches within a single render, wrap it with React's `cache()`. Use a canonical JSON string as the cache key to normalize argument ordering:

```typescript
// modules/products/api/get-memoized-product.ts
import { cache } from "react";

const getMemoizedProductByKey = cache(async (key: string) => {
  return getProduct(JSON.parse(key) as GetProductArgs);
});

/** Public API — memoizes per render via React cache(). */
export const getMemoizedProduct = (args: GetProductArgs) =>
  getMemoizedProductByKey(
    JSON.stringify({ id: args.id, locale: args.locale ?? null }),
  );
```

The outer function is the public API; the `cache()`-wrapped inner function is module-private.

### Layer 3: TanStack React Query (client-side server state)

Manages all data fetched from client components. Default `QueryClient` config in `lib/query-client.ts`:

- `staleTime`: 10 minutes
- `gcTime`: 30 minutes
- Dehydration includes pending queries (streaming support)
- Auth-related queries: `staleTime: 0`, `gcTime: 0` (always refetch)

In test environments: retries `0`, all cache times `0`.

### Cache invalidation endpoint

`POST /api/revalidate` accepts a Bearer token and a scoped invalidation request:

```typescript
{
  "domain": "products",
  "scope": "all" | "list" | "item",
  "payload": { "slugs": ["my-product"] }
}
```

The handler calls `revalidateTag()` for the appropriate tag set and returns the invalidated tags for observability.

---

## Data Fetching

### Module `api/` layer

All network calls are encapsulated in `modules/{feature}/api/`. A canonical API function:

1. Accepts typed arguments
2. Calls `fetchClient` from `lib/fetch-client.ts`
3. Checks `res.ok` and throws `HttpError` on failure
4. Maps the response through a mapper before returning

```typescript
// modules/posts/api/create-post.ts
export const createPost = async ({
  payload,
}: CreatePostArgs): Promise<Post> => {
  const res = await fetchClient("/v1/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new HttpError("Failed to create post", res.status);
  return mapPostResponse(await res.json());
};
```

### Mappers

API response shapes are separate from internal types. Mapper functions in `modules/{feature}/mappers/` transform raw API responses into internal types, decoupling the codebase from the API contract.

### Query key factories

Every module using TanStack Query exports a query key factory. Keys are namespaced by domain, structured as arrays, and typed with `as const`:

```typescript
// modules/posts/api/posts-query-keys.ts
export const postsQueryKeys = {
  all: ["posts"] as const,
  list: (query?: PostsQuery) =>
    [...postsQueryKeys.all, "list", query ?? {}] as const,
  infinite: (query: PostsInfiniteQuery) =>
    [...postsQueryKeys.all, "infinite", query] as const,
  detail: (slug: string) => [...postsQueryKeys.all, "detail", slug] as const,
};
```

### React Query hooks

Hooks in `modules/{feature}/hooks/` wrap `useQuery` / `useInfiniteQuery`. They:

- Accept typed query arguments and resolve defaults before constructing the key
- Strip cursor from the cache key for infinite queries (page 1 and page 2 share the same base entry)
- Use `keepPreviousData` for smooth pagination transitions
- Accept optional `{ enabled?: boolean }` for controlled fetching

```typescript
// modules/posts/hooks/use-posts.ts
export const usePosts = (
  query: PostsQuery,
  options?: { enabled?: boolean },
) => {
  const resolved = { ...query, pageSize: query.pageSize ?? DEFAULT_PAGE_SIZE };
  const { cursor: _cursor, ...queryWithoutCursor } = resolved;

  return useInfiniteQuery({
    queryKey: postsQueryKeys.infinite(queryWithoutCursor as PostsInfiniteQuery),
    queryFn: ({ pageParam }) =>
      getPosts({
        ...resolved,
        cursor: typeof pageParam === "string" ? pageParam : resolved.cursor,
      }),
    initialPageParam: resolved.cursor,
    getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
    placeholderData: keepPreviousData,
    ...options,
  });
};
```

### Concurrent server fetches

Multiple independent data sources are always fetched concurrently:

```typescript
const [product, relatedPosts] = await Promise.all([
  getMemoizedProduct({ slug }),
  getMemoizedRelatedPosts({ productSlug: slug }),
]);
```

---

## Component Architecture

### Compound components with Context

The primary composition pattern is compound components backed by an internal React Context. The parent provides state through Context; named child exports consume it. Consuming outside the provider throws a descriptive error.

```typescript
const TextFieldContext = React.createContext<TextFieldContextValue | null>(
  null,
);

function useTextFieldContext(componentName: string) {
  const context = React.useContext(TextFieldContext);
  if (!context)
    throw new Error(`${componentName} must be used within <TextField>`);
  return context;
}

// Public API: TextField, TextFieldInput, TextFieldSlot
// TextFieldInput calls useTextFieldContext('TextFieldInput') to inherit id / disabled / error
```

Use for: form field groups, modal shells, checkbox groups — any set of elements that share state or must behave as a unit.

### CVA for component variants

Every interactive component with visual variants uses Class Variance Authority (`cva`). Define variant names as constant objects with `SCREAMING_SNAKE_CASE` values so they are referenceable as types:

```typescript
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        DEFAULT: "bg-primary text-primary-foreground hover:bg-primary/90",
        DESTRUCTIVE:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        OUTLINE_GHOST: "border border-input bg-background hover:bg-accent",
      },
      size: {
        DEFAULT: "h-10 px-4 py-2",
        SM: "h-9 px-3",
        LG: "h-11 px-8",
      },
    },
    defaultVariants: { variant: "DEFAULT", size: "DEFAULT" },
  },
);
```

Use `compoundVariants` for state combinations requiring additional classes (e.g. focused + error).

### `cn()` for class merging

All `className` composition uses `cn()` from `@/lib/utils` — the shadcn default. It combines `clsx` (conditional classes) with `tailwind-merge` (safe Tailwind override). This is the only acceptable method for merging class names.

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
```

### Responsive composition

Components that differ across breakpoints use a composed wrapper rather than CSS `hidden`/`block`. Example: `SelectComposed` switches between a `Popover` (desktop) and a `Drawer` (mobile) based on a media query hook — same external API, different shell.

### shadcn/Radix as the primitive layer

All interactive UI components (Dialog, Select, Checkbox, RadioGroup, Label, Popover, DropdownMenu) are built on shadcn/ui or Radix UI primitives. Apply Tailwind classes via `className`; use CVA for variants; spread `React.ComponentPropsWithoutRef<typeof Primitive.Root>` to preserve full Radix API compatibility.

### Icons

All icons use `lucide-react`. Import individually; pass `size` and `strokeWidth` as props.

---

## Styling System

### Tailwind CSS 4

Tailwind classes cover all layout, spacing, typography, and color styling. Tailwind 4 is CSS-first — there is no `tailwind.config.ts`; design tokens are defined in CSS.

### Design tokens in CSS

All semantic color tokens are CSS custom properties following the shadcn convention. The `@theme inline` block maps Tailwind utility names to the custom properties:

```css
/* app/globals.css (or a dedicated theme.css) */
@import "tailwindcss";

@theme inline {
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-destructive: var(--destructive);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
}

:root {
  --background: #ffffff;
  --foreground: #1b1b1b;
  --primary: #18181b;
  --primary-foreground: #fafafa;
  --muted: #f4f4f5;
  --muted-foreground: #71717a;
  --destructive: #ef4444;
}
```

This makes `bg-primary`, `text-destructive`, `bg-muted` available and theme-aware — no per-component imports.

### Semantic token naming

Colors use semantic names, not raw hex/shade names: `text-destructive` not `text-red-600`; `bg-muted` not `bg-gray-100`. Product-specific semantic meanings get their own dedicated tokens.

### Fonts

Load via `next/font/google` or `next/font/local`. Apply CSS variables on `<body>` in the root layout; reference them as Tailwind theme tokens. Always use `display: 'swap'` to prevent FOIT.

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google';

const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={sans.variable}>{children}</body>
    </html>
  );
}
```

---

## State Management

### Zustand for client-only global state

Zustand manages global client state that is not server-derived. Stores are small, focused slices — one concern per store file. Always include a `reset()` action.

```typescript
export const useModalHistoryStore = create<ModalHistoryState>((set, get) => ({
  stack: [],
  push: (entry) => set(({ stack }) => ({ stack: [...stack, entry] })),
  reset: () => set({ stack: [] }),
}));
```

### Persist middleware for durable state

Stores that must survive page refresh use Zustand's `persist` middleware with `createJSONStorage`. Every persisted store tracks hydration to avoid SSR/client mismatch:

```typescript
const useFormStore = create<FormStore>()(
  persist(
    (set, _get, store) => ({
      step: 0,
      data: {},
      reset: () => set(store.getInitialState()),
    }),
    { name: "my-app-form", storage: createJSONStorage(() => localStorage) },
  ),
);
```

### React Query owns server-derived client state

Any data that originates from the server API is managed exclusively by React Query on the client — not duplicated into Zustand. Zustand is for pure UI state: modal history, multi-step form progress, sidebar open/closed.

### No React Context for global state

Context is used only inside compound components for internal state sharing. The root `Providers` component wires up `QueryClientProvider` and the auth session — it contains no application state.

---

## Forms

### react-hook-form + Zod

All forms use `react-hook-form` with `zodResolver`. The Zod schema is the single source of truth for both validation rules and the TypeScript type:

```typescript
const form = useForm<TContactForm>({
  resolver: zodResolver(ContactSchema),
  defaultValues: { name: "", email: "", message: "" },
  mode: "all", // validate on blur, change, and submit
});
```

### shadcn `Form` for layout

Use shadcn's `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, and `FormMessage` components for semantic grouping, label association, and error display.

### `Controller` + render props for custom inputs

Custom inputs (Select, Checkbox, custom TextField) connect to react-hook-form via `Controller`:

```typescript
<FormField
  control={form.control}
  name="category"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Category</FormLabel>
      <FormControl>
        <Select onValueChange={field.onChange} defaultValue={field.value}>
          {/* options */}
        </Select>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### `useFormContext` for multi-step forms

Sub-form components in multi-step flows call `useFormContext<TFormType>()` to access the shared instance — no prop drilling.

---

## Authentication

### Vendor-neutral provider pattern

Authentication is handled by an auth provider — [Auth.js (NextAuth)](https://authjs.dev) is the recommended default for Next.js. Three surfaces:

- **Server**: fetch session inside RSC, layouts, and route handlers
- **Client**: session hook (`useSession`) for client components
- **Middleware**: session validation and route protection

### Session as a Promise

The root layout fetches the session and passes it as `sessionPromise` to child components. This defers resolution without blocking the layout render:

```typescript
export default function RootLayout({ children }: RootLayoutProps) {
  const sessionPromise = getServerSession();
  return (
    <html lang="en">
      <body>
        <Providers sessionPromise={sessionPromise}>{children}</Providers>
      </body>
    </html>
  );
}
```

### Feature-flagged auth

The auth system is gated behind a feature flag. When the flag is off, `sessionPromise` resolves to `null` and middleware skips all auth logic. This allows auth to be disabled in environments where it is not yet active.

### Middleware route guards

Protected paths, auth entry paths, and auth flow paths are declared as constant arrays in `lib/auth.ts` or `modules/auth/constants/`. The middleware normalizes the pathname (strips locale prefix if applicable) and matches against these lists — no scattered inline checks.

---

## Feature Flags

### Typed registry

Feature flags are registered in a typed registry. Each entry requires:

- A unique key (string enum value)
- A human-readable description
- An `expectedRemoval` date

```typescript
// lib/feature-flags.ts
export enum FeatureFlag {
  NEW_CHECKOUT = "NEW_CHECKOUT",
  DARK_MODE = "DARK_MODE",
}

export const FEATURE_FLAG_REGISTRY: FeatureFlagEntry[] = [
  {
    key: FeatureFlag.NEW_CHECKOUT,
    description: "Enable the redesigned checkout flow",
    expectedRemoval: new Date("2026-12-01"),
  },
];
```

### Build-time expiration audit

`scripts/audit-feature-flags.ts` runs as a `prebuild` hook. It checks every flag's `expectedRemoval` against today:

- **`--warn-only`**: prints to stderr, continues building
- **Default (used in `prebuild`)**: exits with code 1, blocking the build

Expired flags must be cleaned up before they accumulate.

### Usage pattern

```typescript
if (!isFeatureEnabled(FeatureFlag.NEW_CHECKOUT)) {
  notFound();
}
```

Flagged-off pages call `notFound()` rather than rendering a disabled state. Flags gate both UI sections and entire pages.

---

## Error Handling

### `error.tsx` — route-level error boundaries

Every route segment that can fail has an `error.tsx` sibling. It must be a Client Component (`'use client'`) because it receives the `reset` callback from Next.js.

```text
products/[slug]/
├── page.tsx
├── loading.tsx
└── error.tsx    ← 'use client' — renders the error UI and retry button
```

```typescript
// products/[slug]/error.tsx
'use client';

import { useEffect } from 'react';

export default function ProductDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // error.digest correlates this client trigger with the server-side log entry
    reportError({ digest: error.digest, message: error.message });
  }, [error]);

  return (
    <div>
      <p>Something went wrong.</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

`error.digest` is a Next.js-generated hash — it maps the client-side boundary trigger to the corresponding server-side error log. Log it via your observability provider; never display it to the user.

### Observability integration

`reportError` is a thin wrapper around your provider — Sentry's `captureException`, Datadog's `datadogRum.addError`, etc. Keep it in `lib/observability.ts` so every `error.tsx` imports from the same place. Never log secrets or user PII inside it.

### Global `global-error.tsx`

`app/global-error.tsx` catches errors in the root layout and root template. It must render its own `<html>` and `<body>` tags because it replaces the entire document.

### `HttpError` — typed API errors

`lib/fetch-client.ts` exports `HttpError`. Catch it in Server Components and route handlers to produce typed error responses:

```typescript
try {
  const product = await getProduct({ slug });
} catch (err) {
  if (err instanceof HttpError && err.status === 404) notFound();
  throw err; // re-throw unknown errors to the nearest error boundary
}
```

Never swallow unknown errors. Re-throw anything that is not a handled `HttpError`.

### Mutation error surface

React Query mutations expose `error` on `useMutation`. Surface it through `FormMessage` (react-hook-form) or a toast — never `console.error` only.

### Error boundary decision matrix

| Error origin                            | Handler                                                    |
| --------------------------------------- | ---------------------------------------------------------- |
| Server Component data fetch (known 404) | `notFound()`                                               |
| Server Component data fetch (other)     | re-throw → nearest `error.tsx`                             |
| Client Component render                 | React error boundary (or nearest `error.tsx`)              |
| Client-side mutation                    | `useMutation` `onError` callback → toast or inline message |
| Root layout                             | `global-error.tsx`                                         |

---

## Environment Variables

### Single validated source of truth

All environment variables are parsed and validated at startup in `lib/env.ts` using Zod. No other file reads `process.env` directly.

```typescript
// lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  NEXT_PUBLIC_BASE_URL: z.string().url(),
  API_BASE_URL: z.string().url(),
  API_SECRET_KEY: z.string().min(1),
  REVALIDATE_SECRET: z.string().min(1),
});

export const env = envSchema.parse(process.env);
```

If a required variable is missing or malformed, the app fails at startup with a descriptive Zod error — not at runtime when the variable is first accessed.

### Public vs private variables

| Prefix         | Accessible in           | Rule                                                          |
| -------------- | ----------------------- | ------------------------------------------------------------- |
| `NEXT_PUBLIC_` | Server + client bundles | Safe for public values (base URL, analytics IDs)              |
| _(no prefix)_  | Server only             | Secrets, API keys, internal URLs — never expose to the client |

### Usage

Always import from `lib/env.ts`, never from `process.env`:

```typescript
// correct
import { env } from "@/lib/env";
const url = env.NEXT_PUBLIC_BASE_URL;

// forbidden
const url = process.env.NEXT_PUBLIC_BASE_URL;
```

### `.env` file conventions

| File              | Purpose                                   |
| ----------------- | ----------------------------------------- |
| `.env`            | Shared defaults, committed                |
| `.env.local`      | Local overrides, gitignored               |
| `.env.production` | Production values, committed (no secrets) |
| `.env.test`       | Test environment overrides                |

Secrets never appear in committed `.env` files. They are injected via CI/CD environment variables.

---

## Testing

### Stack: Vitest + Testing Library + MSW

All tests use **Vitest** — no Jest. UI tests use `@testing-library/react` + `@testing-library/user-event`. API calls are intercepted with MSW (Mock Service Worker); fixture response data lives in `testing/fixtures/`.

### Test setup

The global test setup mocks Next.js navigation:

- `next/navigation`: `useRouter`, `useParams`, `usePathname`, `useSearchParams`
- `next/link`

Tests never import these from Next.js directly — the mocks are transparent.

### QueryClient in tests

Create a `QueryClient` with retries and all cache times set to `0` for predictable assertions:

```typescript
// testing/query-client-test-utils.ts
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0, gcTime: 0 },
      mutations: { retry: false },
    },
  });
```

### What to test

| Target                             | Approach                                              |
| ---------------------------------- | ----------------------------------------------------- |
| Pure utility functions and mappers | Unit tests, no rendering                              |
| Middleware logic                   | Unit tests with mocked `NextRequest` / `NextResponse` |
| Complex hooks                      | `renderHook` + `QueryClientProvider` + MSW            |
| API route handlers                 | Test the handler function directly                    |
| Interactive UI                     | `@testing-library/react` + user-event + MSW           |

---

## Performance

### React Compiler

`next.config.ts` enables `reactCompiler: true`. This handles automatic memoization at the compiler level. **Do not add `useMemo`, `useCallback`, or `React.memo` unless profiling identifies a specific problem.** Manual memoization is noise — the compiler handles routine cases.

### Component-level caching

`cacheComponents: true` in `next.config.ts` enables Next.js component-level caching. This is distinct from data caching.

### Image optimization

All images use `next/image`. Declare remote domains in `remotePatterns` and set an aggressive `minimumCacheTTL`:

```typescript
// next.config.ts
images: {
  remotePatterns: [{ hostname: '<your-cdn-domain>' }],
  minimumCacheTTL: 31536000, // 1 year
},
```

### Font loading

Always use `display: 'swap'` to prevent FOIT. Font CSS variables are applied on `<body>` — Next.js controls preloading automatically.

### Suspense for secondary async work

JSON-LD scripts, deferred widgets, and other secondary async components are wrapped in `<Suspense fallback={null}>`. They never block the critical rendering path — they appear after main content.

### Loading state flicker

Use the `spin-delay` package to delay showing loading indicators, preventing UI flashes for fast operations.

### Sitemaps

Serve sitemaps via a route handler (e.g. `app/(sitemaps)/sitemap.xml/route.ts`) with HTTP cache headers:

```typescript
headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' }
```

---

## Conventions Reference

All rules below are self-contained. No external file is needed.

---

### Naming

#### Variables

`camelCase`. Spell out full words — no single-letter or abbreviated names. Acronyms stay camel: `userId` not `userID`.

```ts
const firstName = "John";
const userId = 42;
const apiUrl = "https://api.example.com";
// ❌ const u = 42;  const api_url = '...';
```

#### Constants

Module-level constants (top-level, `const`, never reassigned) use `SCREAMING_SNAKE_CASE`.

```ts
const DEFAULT_PAGE_SIZE = 20;
const MAX_RETRY_COUNT = 3;
// ❌ const defaultPageSize = 20;
```

#### Booleans

Must be prefixed with `is`, `has`, `should`, or `can`.

```ts
const isLoading = true;
const hasError = false;
const shouldRedirect = true;
// ❌ const loading = true;  const error = false;
```

#### Files & Folders

`kebab-case` for all file and folder names.

```text
✅ hooks/use-mobile.ts
✅ components/dialog-box.tsx
✅ utils/compute-day.ts
❌ hooks/useMobile.ts
❌ components/DialogBox.tsx
```

Exceptions (tool-mandated casing): `README.md`, `PULL_REQUEST_TEMPLATE.md`, `CHANGELOG.md`, `.gitignore`, `.env.local`.

File-to-export mapping — kebab-case file, PascalCase named export:

```text
employer-scorecard-loading.tsx  →  export const EmployerScorecardLoading = ...
dialog-box.tsx                  →  export const DialogBox = ...
```

#### Functions

| Context           | Style                                       | Example                           |
| ----------------- | ------------------------------------------- | --------------------------------- |
| UI Components     | Arrow function + `PascalCase`               | `const DialogBox = () => <div />` |
| Utility functions | `function` declaration + `camelCase`        | `function computeDay(date: Date)` |
| Hooks             | Arrow function + `use` prefix + `camelCase` | `const useMobile = () => ...`     |

```tsx
// ✅ component
const UserCard = ({ name }: UserCardProps) => <div>{name}</div>;

// ✅ utility
function formatCurrency(value: number): string { ... }

// ✅ hook
const useJobApplications = (query: JobApplicationsQuery) => { ... };
```

**Event handlers:** function named with `handle` prefix; the prop that receives it uses `on` prefix.

```tsx
const handleSubmit = (event: React.FormEvent) => { ... };
const handleItemClick = (id: string) => { ... };

<Button onClick={handleSubmit} />

interface DialogBoxProps {
  onClose: () => void;  // prop name uses 'on'
}
```

**Async / data-fetching functions:** verb-first — `get`, `create`, `update`, `delete`, `fetch`.

```ts
async function getScorecard(args: GetScorecardArgs) { ... }
async function createJobApplication(payload: Payload) { ... }
async function deleteReview(reviewId: string) { ... }
// ❌ async function scorecard() { ... }
```

#### Interfaces & Types

`PascalCase` for both. No `I` prefix. `T` prefix only for Zod-inferred types.

| Use case                   | Convention                   | Example                                           |
| -------------------------- | ---------------------------- | ------------------------------------------------- |
| Component props            | `interface` + `Props` suffix | `interface DialogBoxProps {}`                     |
| Extensible object shape    | `interface`                  | `interface User {}`                               |
| Zod-inferred form type     | `type` + `T` prefix          | `type TSurveyForm = z.infer<typeof SurveySchema>` |
| Union type                 | `type`                       | `type Status = 'SAVED' \| 'APPLIED'`              |
| Mapped / intersection type | `type`                       | `type PartialUser = Partial<User>`                |

```ts
// ❌
type DialogBoxProps = {}; // prefer interface for extensible shapes
interface TUser {} // T prefix is for Zod-inferred types only
```

#### Enum / String-Union Members

String-literal union values use `SCREAMING_SNAKE_CASE`.

```ts
// ✅
type ApplicationStatus = "SAVED" | "APPLIED" | "REJECTED" | "UNDER_REVIEW";
type ButtonVariant = "PRIMARY" | "OUTLINE_GHOST" | "DESTRUCTIVE";
// ❌
type ApplicationStatus = "saved" | "applied" | "rejected";
```

#### Function Props & Parameters

`camelCase`, full words — no single letters or vague abbreviations.

```ts
function filterUsers(users: User[], searchTerm: string): User[] { ... }
// ❌ function filterUsers(u: User[], s: string) { ... }
```

#### `useState`

Setter name mirrors the state variable: `set` + PascalCase of state name.

```ts
const [count, setCount] = useState<number>(0);
const [isOpen, setIsOpen] = useState<boolean>(false);
const [userName, setUserName] = useState<string>("");

setCount((previousCount) => previousCount + 1);

// ❌ const [count, setCounter] = useState(0);
// ❌ const [isOpen, toggle] = useState(false);
```

---

### Exports

Named exports everywhere. Default exports only where Next.js requires them:

| File            | Required by        |
| --------------- | ------------------ |
| `page.tsx`      | Next.js routing    |
| `layout.tsx`    | Next.js routing    |
| `loading.tsx`   | Next.js routing    |
| `error.tsx`     | Next.js routing    |
| `route.ts`      | Next.js API routes |
| `middleware.ts` | Next.js middleware |

```ts
// ✅
export const DialogBox = () => { ... };
export function computeDay() { ... }
export const useMobile = () => { ... };

// ❌
export default function DialogBox() { ... }
export default computeDay;
```

`api/` and `seo/` directories: named exports only, no exceptions.

---

### Imports

**Path rules:**

- Use `@/` when importing from outside the current directory.
- Use relative (`./` or `../`) only for files in the same directory or one level up.

```ts
// ✅
import { Button } from "@/components/ui/button";
import { getScorecard } from "@/modules/employers/api/get-scorecard";
import { InputSlot } from "./input-slot"; // same directory

// ❌ — deep relative
import { Button } from "../../../components/ui/button";
```

**Import ordering** — three groups, each separated by a blank line:

1. External packages (React and Next.js first, then other third-party)
2. Aliased internal imports (`@/...`)
3. Relative imports (`./...`)

```ts
import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import type { User } from "@/types/user";

import { InputSlot } from "./input-slot";
import type { InputProps } from "./input.types";
```

**Type-only imports:** use `import type` for anything used only as a TypeScript type. Guarantees the import is erased at compile time.

```ts
import type { User } from "@/types/user"; // ✅
import { User } from "@/types/user"; // ❌ — value import for a type
```

---

### TypeScript

**Strict mode** — `"strict": true` in `tsconfig.json`. All strict checks active.

**No `any`** — use `unknown` with a type guard when the type cannot be statically known.

```ts
// ✅
function parsePayload(raw: unknown): User {
  if (!isUser(raw)) throw new Error("Invalid payload");
  return raw;
}
// ❌
function parsePayload(raw: any): User {
  return raw as User;
}
```

**Derive types from Zod schemas** — never define a parallel manual type for a schema.

```ts
// ✅
export const SurveySchema = z.object({
  name: z.string(),
  email: z.string().email(),
});
export type TSurveyForm = z.infer<typeof SurveySchema>;

// ❌ — parallel definition
export interface TSurveyForm {
  name: string;
  email: string;
}
```

**Extend HTML elements** via `React.ComponentProps` or `React.ComponentPropsWithoutRef`.

```ts
// ✅
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

// Also correct for Radix primitives
export interface SelectProps extends React.ComponentPropsWithoutRef<
  typeof Select.Root
> {
  placeholder?: string;
}
```

---

### Comments & Documentation

Add a JSDoc block (`/** */`) to all **exported** functions, hooks, and complex types. Inline comments (`//`) explain the _why_ — not the _what_.

```ts
/**
 * Fetches the employer scorecard for a given employer and career path.
 * Results are memoized per render via React cache().
 */
export async function getMemoizedScorecard(
  args: GetScorecardArgs,
): Promise<Scorecard> {
  // Key is serialised to normalise argument-object ordering
  const key = JSON.stringify(args);
  return getMemoizedScorecardByKey(key);
}

// ❌ — commenting the obvious
// Sets count to count + 1
setCount((previousCount) => previousCount + 1);
```

Prefer clear naming over comments — a well-named function rarely needs explanation.

---

### Git

**Branch naming:** `<type>/<short-kebab-description>`

| Type     | When to use                     |
| -------- | ------------------------------- |
| `feat/`  | New feature                     |
| `fix/`   | Bug fix                         |
| `chore/` | Tooling, deps, config, refactor |
| `docs/`  | Documentation only              |
| `test/`  | Tests only                      |

```text
✅ feat/add-login-modal
✅ fix/header-overflow-bug
✅ chore/upgrade-tailwind
❌ new-feature   ❌ JohnFix   ❌ update
```

**Commit messages — Conventional Commits:** `<type>: <short imperative description>`

```text
✅ feat: add employer scorecard loading skeleton
✅ fix: resolve header overflow on mobile
✅ chore: upgrade tailwind to v4.1
✅ docs: document caching architecture
❌ fixed stuff   ❌ WIP   ❌ update
```

Common types: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `style`, `perf`, `ci`.

---

### Architecture-specific rules

#### Route-private co-location

Components and utilities used only by a single route live in `_components/` and `_utils/` next to the page file. The leading underscore signals "private to this route subtree" — nothing outside it imports from here.

```text
app/
└── products/
    └── [slug]/
        ├── page.tsx
        ├── loading.tsx
        ├── error.tsx
        ├── _components/
        │   ├── product-detail-content.tsx
        │   └── product-detail-loading.tsx
        └── _utils/
            └── require-valid-product-params.ts
```

Shared components belong in `components/` (app-level) or `modules/{feature}/components/` (domain-level).

#### Module SEO co-location

All `generateMetadata` helpers and JSON-LD builders for a domain live in `modules/{feature}/seo/`. Auth pages each have a dedicated metadata file (e.g. `modules/auth/seo/sign-in-metadata.ts`).

---

## Prefer vs Avoid

### Prefer

**Server Components by default.** Start every component server-side; add `'use client'` only when there is an undeniable client requirement.

**Module `api/` for all fetching.** Pages call functions from `modules/{feature}/api/`. They never construct `fetch()` calls inline.

**`Promise.all` for concurrent server fetches.** When a server component needs multiple independent data pieces, fetch them concurrently — never sequentially.

**`cn()` for all class composition.** Never use string interpolation for Tailwind classes.

**Compound components for related UI groups.** Share state via Context rather than prop drilling.

**`'use cache'` + `cacheTag` for long-lived server data.** Tag-based invalidation is preferred over short TTLs.

**`keepPreviousData` in paginated queries.** Pagination transitions should never blank the screen.

**Query key factories.** Keys are never defined inline in hook files.

**Skeletons, not spinners.** `loading.tsx` exports skeleton components that match the real content layout.

**Feature flags with `expectedRemoval` dates.** Flags without a removal date fail the pre-build audit.

**`<Suspense fallback={null}>` for secondary async work.** JSON-LD, modals, widgets — none of them should block the critical path.

**`error.tsx` at every async route segment.** Every route with a `loading.tsx` also has an `error.tsx`.

**`lib/env.ts` as the single env gateway.** Import `env` from there; never read `process.env` elsewhere.

### Avoid

**`'use client'` on container components.** Keep client components as the smallest possible leaf. Client containers force everything inside to render on the client.

**Raw `fetch()` in pages or components.** All fetching goes through `lib/fetch-client.ts` and the module `api/` layer.

**`React.memo`, `useMemo`, `useCallback` by default.** React Compiler handles these. Add only after profiling proves it necessary.

**`dynamic = 'force-dynamic'`.** Opt pages out of caching only with evidence; use targeted `'use cache'` invalidation instead.

**Zustand for server-derived state.** Server data lives in React Query. Mixing these causes desynchronization bugs.

**Direct cross-module imports.** `modules/products/` does not import from `modules/posts/`. Use `modules/shared/` or `lib/`.

**Hardcoded base URLs or domain strings.** Source from `env.NEXT_PUBLIC_BASE_URL` (via `lib/env.ts`).

**Generic spinner-only loading states.** Page-level `loading.tsx` exports skeleton components shaped like the real content — never a centered spinner.

**Long-lived feature flags.** Every flag needs an `expectedRemoval` date. Flags that outlive their date block the build.

**Swallowing unknown errors.** Catch `HttpError` for handled cases; re-throw everything else to the nearest error boundary.

**Reading `process.env` outside `lib/env.ts`.** Unvalidated env access causes runtime surprises. All variables are validated at startup.
