# Project Structure

This is a Turborepo monorepo with a clear separation between applications and shared packages.

## Directory Layout

```
common-elements/
├── apps/                    # Application workspaces
│   └── web/                # Next.js web application
│       ├── src/
│       │   └── app/        # Next.js App Router pages
│       ├── next.config.js
│       └── package.json
│
├── packages/               # Shared packages
│   ├── ui/                # Shared React components
│   ├── database/          # Database utilities & Supabase client
│   ├── auth/              # Authentication utilities
│   ├── validations/       # Zod validation schemas
│   ├── config-eslint/     # Shared ESLint configs
│   ├── config-typescript/ # Shared TypeScript configs
│   └── config-tailwind/   # Shared Tailwind configs
│
├── turbo.json             # Turborepo configuration
└── package.json           # Root workspace configuration
```

## Workspace Conventions

### Package Naming
- Apps: Simple names (e.g., `web`)
- Shared packages: Scoped with `@repo/` prefix (e.g., `@repo/ui`, `@repo/auth`)

### Package Structure
Each package follows a consistent structure:
```
package-name/
├── src/
│   └── index.ts          # Main entry point
├── package.json
├── tsconfig.json
└── .eslintrc.js
```

### Configuration Packages
- `config-eslint`: Contains `library.js` and `next.js` configs
- `config-typescript`: Contains `base.json`, `nextjs.json`, `react-library.json`
- `config-tailwind`: Contains shared Tailwind configuration

## Import Patterns
- Internal packages are imported using workspace protocol: `@repo/ui`, `@repo/auth`, etc.
- All packages export from `src/index.ts`
- TypeScript paths are configured for direct source imports

## Build Pipeline
Turborepo manages the build pipeline with dependency awareness:
1. Shared packages build first (`^build` dependency)
2. Applications build after their dependencies
3. Caching optimizes subsequent builds
