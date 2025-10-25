# Technology Stack

## Build System
- **Monorepo Manager**: Turborepo
- **Package Manager**: npm (v11.6.0)
- **Node Version**: >=18.0.0

## Core Technologies
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.7
- **UI Library**: React 19
- **Styling**: Tailwind CSS 3.4
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Validation**: Zod
- **Code Formatting**: Prettier

## Common Commands

### Development
```bash
npm run dev          # Start all development servers
npm run build        # Build all apps and packages
npm run lint         # Lint all workspaces
npm run type-check   # Type check all workspaces
npm run format       # Format code with Prettier
```

### Package-Specific
```bash
# From root, target specific workspace:
turbo dev --filter=web
turbo build --filter=@repo/ui
```

## Key Dependencies
- `@supabase/supabase-js` - Supabase client
- `next` - Next.js framework
- `react` & `react-dom` - React library
- `tailwindcss` - Utility-first CSS
- `typescript` - Type safety
- `eslint` - Code linting
- `prettier` - Code formatting
