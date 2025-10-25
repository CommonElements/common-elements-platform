# Supabase Database Migrations

This directory contains SQL migration files for the Common Elements platform database schema.

## Migrations

Migrations are numbered sequentially and should be applied in order:

1. `20240101000001_create_core_user_tables.sql` - Creates users, community_profiles, and vendor_profiles tables
2. `20240101000002_create_forum_tables.sql` - Creates forum_categories, forum_posts, forum_comments, and forum_votes tables
3. `20240101000003_create_rfp_tables.sql` - Creates rfps, rfp_private_details, rfp_approved_vendors, proposals, and rfp_messages tables
4. `20240101000004_create_triggers_and_functions.sql` - Creates database triggers and functions for automatic counts and timestamps
5. `20240101000005_create_rls_policies.sql` - Enables Row Level Security and creates authorization policies

## Applying Migrations

### Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste each migration file in order
4. Execute each migration

### Using Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link --project-ref <your-project-ref>

# Apply all migrations
supabase db push

# Or apply migrations individually
supabase db execute --file supabase/migrations/20240101000001_create_core_user_tables.sql
```

## Generating TypeScript Types

After applying migrations, generate TypeScript types for type-safe database access:

```bash
# Generate types from remote project
supabase gen types typescript --project-ref <your-project-ref> > packages/database/src/types.ts

# Or from local Supabase instance
supabase gen types typescript --local > packages/database/src/types.ts
```

## Database Schema Overview

### Core Tables

- **users** - Extends Supabase auth.users with additional profile information
- **community_profiles** - Profile data for community members (board presidents, property managers, etc.)
- **vendor_profiles** - Profile data for service vendors

### Forum Tables

- **forum_categories** - Categories for organizing forum posts
- **forum_posts** - Discussion posts created by users
- **forum_comments** - Comments on posts with one-level threading
- **forum_votes** - Upvotes and downvotes on posts and comments

### RFP Tables

- **rfps** - Requests for Proposals created by community members
- **rfp_private_details** - Private information for RFPs (address, contact, detailed scope)
- **rfp_approved_vendors** - Vendors approved to view private RFP details
- **proposals** - Vendor proposals submitted in response to RFPs
- **rfp_messages** - Messages between RFP creators and vendors

## Row Level Security (RLS)

All tables have RLS enabled with policies that enforce:

- Users can only edit their own content
- Private RFP details are only visible to creators and approved vendors
- Proposals are only visible to the RFP creator and the vendor who submitted them
- Messages are only visible to sender and recipient

## Triggers and Functions

Automatic database triggers maintain:

- Vote counts on posts and comments
- Comment counts on posts
- Proposal counts on RFPs
- Updated timestamps on all tables

## Testing Migrations Locally

```bash
# Start local Supabase instance
supabase start

# Apply migrations
supabase db reset

# Generate types
supabase gen types typescript --local > packages/database/src/types.ts

# Stop local instance
supabase stop
```

## Rollback

If you need to rollback migrations, you can:

1. Create a new migration that reverses the changes
2. Or restore from a database backup

Always test migrations in a development environment before applying to production.
