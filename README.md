# Common Elements

Community association platform connecting members with service vendors.

## Project Structure

This is a Turborepo monorepo containing:

### Apps
- `apps/web`: Next.js 14 web application

### Packages
- `packages/ui`: Shared React UI components
- `packages/database`: Database utilities and Supabase client
- `packages/auth`: Authentication utilities
- `packages/validations`: Zod validation schemas
- `packages/config-eslint`: Shared ESLint configuration
- `packages/config-typescript`: Shared TypeScript configuration
- `packages/config-tailwind`: Shared Tailwind CSS configuration

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Build all apps and packages:
```bash
npm run build
```

## Available Scripts

- `npm run dev` - Start development servers for all apps
- `npm run build` - Build all apps and packages
- `npm run lint` - Lint all apps and packages
- `npm run type-check` - Type check all apps and packages
- `npm run format` - Format code with Prettier

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Validation**: Zod
- **Monorepo**: Turborepo
