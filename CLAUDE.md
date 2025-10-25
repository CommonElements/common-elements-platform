# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Common Elements is a community association platform connecting members with service vendors. Built as a Turborepo monorepo with Next.js 15, React 19, Supabase backend, and shared packages.

## Development Commands

### Root-level commands (uses Turborepo)
```bash
npm install              # Install all workspace dependencies
npm run dev              # Start all development servers
npm run build            # Build all apps and packages
npm run lint             # Lint all workspaces
npm run type-check       # Type check all workspaces
npm run format           # Format code with Prettier
```

### Web app commands (from `apps/web/`)
```bash
npm run dev              # Start Next.js dev server
npm run build            # Build production bundle
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript compiler without emit
```

### Package commands (from any `packages/*/`)
```bash
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript type checking
```

## Architecture

### Monorepo Structure
- **Turborepo pipeline**: Builds execute in dependency order (`^build`, `^lint`, `^type-check`)
- **Shared configurations**: ESLint, TypeScript, and Tailwind configs are centralized in `packages/config-*`
- **Package transpilation**: Next.js transpiles all `@repo/*` packages via `transpilePackages` config

### Apps
- **apps/web**: Next.js 15 App Router application
  - Route groups: `(auth)` for authentication, `(platform)` for main app
  - API routes in `app/api/`
  - Server Actions in route-level `actions.ts` files

### Packages
- **@repo/ui**: Shared React components
  - TipTap rich text editor
  - Form components, badges, file uploaders, messaging interface
  - Uses class-variance-authority + tailwind-merge via `lib/utils.ts`

- **@repo/database**: Supabase client and query functions
  - `client.ts`: Browser Supabase client
  - `server.ts`: Server-side Supabase client with SSR support
  - `queries/`: Domain-specific query functions (forum, RFPs, users)
  - Query optimization: Explicit column selection, index-aware filtering

- **@repo/auth**: Authentication utilities (depends on @repo/database)

- **@repo/validations**: Zod schemas for data validation (forum, RFPs, users)

### Database Query Patterns
All database queries in `packages/database/src/queries/` follow these patterns:
- Explicit column selection (no `SELECT *`)
- Join-based data fetching using Supabase named joins (e.g., `author:users!foreign_key`)
- Index-aware filtering (comments on `idx_forum_comments_post_created`, posts on `idx_forum_posts_category_created`)
- Client-side data transformation for complex structures (e.g., threading comments)

Example structure:
```typescript
export async function getForumPosts(options) {
  const supabase = await createServerSupabaseClient()
  const query = supabase
    .from('forum_posts')
    .select(`columns, author:users!fkey(cols), category:forum_categories!fkey(cols)`)
    .order(orderBy)
    .range(offset, offset + limit - 1)
  // ...
}
```

### Next.js Configuration
- Image optimization configured with AVIF/WebP formats
- Remote image patterns for Supabase storage (`**.supabase.co`)
- Transpiles workspace packages: `@repo/ui`, `@repo/database`, `@repo/auth`, `@repo/validations`

### Tech Stack
- **Framework**: Next.js 15 (App Router, React 19, React Server Components)
- **Backend**: Supabase (PostgreSQL, Auth, Storage, SSR)
- **State Management**: TanStack Query v5 for data fetching
- **Styling**: Tailwind CSS with `tailwindcss-animate`
- **Validation**: Zod schemas
- **Monorepo**: Turborepo
- **Package Manager**: npm 11.6.0
- **Node**: >=18.0.0

## Important Patterns

### Server Components & Data Fetching
- Server Components use `createServerSupabaseClient()` from `@repo/database`
- Client Components use `createClient()` for browser-side queries
- Server Actions live in route-level `actions.ts` files

### Type Safety
- Database types generated in `packages/database/src/types.ts`
- Query functions return typed interfaces (e.g., `ForumPost`, `ForumComment`)
- Zod schemas in `@repo/validations` for runtime validation

### Workspace Dependencies
- Internal packages use wildcard versioning: `"@repo/ui": "*"`
- Changes to shared packages trigger rebuilds via Turborepo dependency graph
