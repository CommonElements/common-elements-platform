# Implementation Plan

## Overview

This implementation plan breaks down the Common Elements MVP into discrete, manageable coding tasks. Each task builds incrementally on previous work, with all code integrated as it's written. The plan follows a bottom-up approach: infrastructure → shared packages → core features → integration.

## Task List

- [x] 1. Initialize Turborepo monorepo and project structure
  - Create Turborepo monorepo with npm
  - Set up apps/web Next.js application
  - Create packages directory structure (ui, database, auth, validations, config-*)
  - Configure turbo.json with build, dev, lint, and type-check pipelines
  - Set up root package.json with workspace configuration
  - _Requirements: Foundation for all subsequent work_

- [x] 2. Configure shared packages and tooling
  - [x] 2.1 Set up config packages (eslint, typescript, tailwind)
    - Create shared ESLint configuration in packages/config-eslint
    - Create shared TypeScript configuration in packages/config-typescript
    - Create shared Tailwind configuration in packages/config-tailwind
    - Configure each package with proper exports and dependencies
    - _Requirements: Consistent tooling across monorepo_
  
  - [x] 2.2 Initialize packages/database
    - Create package.json with Supabase dependencies
    - Set up Supabase client configuration (client.ts and server.ts)
    - Create types.ts placeholder for generated database types
    - Create queries directory structure
    - _Requirements: 2.1, 3.3, 1.2_
  
  - [x] 2.3 Initialize packages/auth
    - Create package.json with required dependencies
    - Implement session management utilities
    - Create auth helper functions structure
    - _Requirements: 1.1, 1.7_
  
  - [x] 2.4 Initialize packages/validations
    - Create package.json with Zod dependency
    - Set up index.ts with exports structure
    - _Requirements: All form-related requirements_
  
  - [x] 2.5 Initialize packages/ui
    - Create package.json with React and Lucide dependencies
    - Set up index.ts with exports structure
    - Install and configure Shadcn UI in apps/web
    - _Requirements: UI consistency across application_


- [x] 3. Set up Supabase database schema and RLS policies
  - [x] 3.1 Create core user tables
    - Write migration for users table (extends auth.users)
    - Write migration for community_profiles table
    - Write migration for vendor_profiles table
    - Add indexes on user_id columns
    - _Requirements: 1.1, 1.3, 1.4, 1.5_
  
  - [x] 3.2 Create forum tables
    - Write migration for forum_categories table with seed data
    - Write migration for forum_posts table with indexes
    - Write migration for forum_comments table with parent_comment_id
    - Write migration for forum_votes table with unique constraint
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_
  
  - [x] 3.3 Create RFP tables
    - Write migration for rfps table with status and visibility
    - Write migration for rfp_private_details table
    - Write migration for rfp_approved_vendors table
    - Write migration for proposals table with unique constraint
    - Write migration for rfp_messages table
    - Add indexes on foreign keys and frequently queried columns
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 7.3, 7.4_
  
  - [x] 3.4 Create database triggers and functions
    - Implement update_vote_count() trigger function
    - Implement update_comment_count() trigger function
    - Implement update_proposal_count() trigger function
    - Implement update_updated_at() trigger function
    - Apply triggers to all relevant tables
    - _Requirements: 2.6, 2.7, 5.6_
  
  - [x] 3.5 Implement Row Level Security policies
    - Create RLS policies for users and profiles tables
    - Create RLS policies for forum tables (posts, comments, votes)
    - Create RLS policies for rfps and rfp_private_details tables
    - Create RLS policies for proposals and rfp_messages tables
    - Enable RLS on all tables
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_
  
  - [x] 3.6 Generate TypeScript types from database schema
    - Run Supabase CLI to generate types
    - Update packages/database/src/types.ts with generated types
    - Export types from packages/database
    - _Requirements: Type safety across application_

- [x] 4. Implement authentication and onboarding
  - [x] 4.1 Create auth utilities in packages/auth
    - Implement middleware.ts for route protection
    - Implement session.ts for session management
    - Implement utils.ts with getUser, requireAuth helpers
    - Export all auth utilities from index.ts
    - _Requirements: 1.1, 1.6, 1.7_
  
  - [x] 4.2 Build signup and login pages
    - Create app/(auth)/signup/page.tsx with form
    - Create app/(auth)/login/page.tsx with form
    - Implement Zod schemas in packages/validations for auth forms
    - Create server actions for signup and login
    - Add form validation and error handling
    - _Requirements: 1.1, 1.7_
  
  - [x] 4.3 Build onboarding flow
    - Create app/onboarding/page.tsx with account type selection
    - Create CommunityMemberForm component for community member onboarding
    - Create VendorForm component for vendor onboarding
    - Implement Zod schemas for onboarding forms
    - Create server actions to save profile data
    - Redirect to dashboard after completion
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6_
  
  - [x] 4.4 Implement auth middleware
    - Create middleware.ts in apps/web root
    - Protect all (platform) routes with auth check
    - Redirect unauthenticated users to login
    - Check profile completion and redirect to onboarding if needed
    - _Requirements: 1.1, 1.6, 1.7_


- [x] 5. Build shared UI components in packages/ui
  - [x] 5.1 Create UserBadge component
    - Implement UserBadge with avatar, name, role/company, location
    - Add size variants (sm, md, lg)
    - Add optional location and bio display
    - Handle click events for profile viewing
    - Export from packages/ui
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_
  
  - [x] 5.2 Create VoteButtons component
    - Implement upvote/downvote buttons with count display
    - Add optimistic UI updates
    - Handle vote state (user's current vote)
    - Add disabled state and loading indicators
    - Export from packages/ui
    - _Requirements: 2.6, 2.7_
  
  - [x] 5.3 Create FileUploader component
    - Implement drag-and-drop file upload interface
    - Add file type and size validation
    - Display upload progress and existing files
    - Add file removal functionality
    - Export from packages/ui
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_
  
  - [x] 5.4 Create RichTextEditor component
    - Implement Tiptap editor with toolbar
    - Add formatting options (bold, italic, lists, links)
    - Add character count and max length validation
    - Handle placeholder and disabled states
    - Export from packages/ui
    - _Requirements: 2.2, 3.2, 4.3_

- [x] 6. Implement database query functions in packages/database
  - [x] 6.1 Create forum query functions
    - Implement getForumPosts with pagination and filters
    - Implement getForumPost with author and category joins
    - Implement getForumComments with threading
    - Implement getForumCategories
    - Export from packages/database/queries/forum.ts
    - _Requirements: 2.1, 2.2, 2.4_
  
  - [x] 6.2 Create RFP query functions
    - Implement getRFPs with filters and pagination
    - Implement getRFP with creator and proposal count
    - Implement getRFPPrivateDetails with authorization check
    - Implement getProposals for an RFP
    - Implement getRFPMessages with sender/recipient info
    - Export from packages/database/queries/rfps.ts
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 5.1, 5.6, 6.1, 6.3, 7.1, 7.4_
  
  - [x] 6.3 Create user query functions
    - Implement getUserProfile with account type detection
    - Implement getUserPosts and getUserComments
    - Implement getVendorProfile with services and areas
    - Implement getCommunityProfile with property info
    - Export from packages/database/queries/users.ts
    - _Requirements: 8.1, 12.1, 12.2, 12.3, 12.4_


- [x] 7. Build forum system
  - [x] 7.1 Create forum homepage
    - Build app/(platform)/forum/page.tsx with category list
    - Display recent posts with UserBadge, vote counts, comment counts
    - Add category filtering
    - Implement pagination
    - _Requirements: 2.1_
  
  - [x] 7.2 Create post detail page
    - Build app/(platform)/forum/[id]/page.tsx
    - Display full post content with RichTextEditor output
    - Show author with UserBadge
    - Display VoteButtons for post
    - Increment view count on page load
    - _Requirements: 2.1, 2.4, 2.6, 2.7_
  
  - [x] 7.3 Implement comment section
    - Create CommentSection component in packages/ui
    - Display comments with one-level threading
    - Add reply functionality to comments
    - Show VoteButtons for each comment
    - Add optimistic updates for new comments
    - _Requirements: 2.4, 2.5, 2.6, 2.7_
  
  - [x] 7.4 Create post creation page
    - Build app/(platform)/forum/new/page.tsx
    - Add form with title, category selection, and RichTextEditor
    - Implement Zod validation schema in packages/validations
    - Create server action to insert post
    - Redirect to post detail page after creation
    - _Requirements: 2.2, 2.3_
  
  - [x] 7.5 Implement voting functionality
    - Create server actions for upvote/downvote on posts
    - Create server actions for upvote/downvote on comments
    - Enforce one vote per user per item
    - Update vote counts via database triggers
    - Handle vote removal (clicking same button twice)
    - _Requirements: 2.6, 2.7_
  
  - [x] 7.6 Add post and comment editing
    - Add edit button to posts (only for authors)
    - Add edit button to comments (only for authors)
    - Create edit forms with pre-filled content
    - Implement server actions for updates
    - Update updated_at timestamp via trigger
    - _Requirements: 10.5_

- [x] 8. Build RFP creation and listing
  - [x] 8.1 Create RFP listing page
    - Build app/(platform)/rfps/page.tsx
    - Display RFP cards with title, category, status, deadline
    - Show proposal count for each RFP
    - Add filters for status and category
    - Implement pagination
    - Show "Create RFP" button only for community members
    - _Requirements: 3.1, 9.2, 10.1_
  
  - [x] 8.2 Create RFP creation form
    - Build app/(platform)/rfps/new/page.tsx
    - Add form fields: title, category, description, visibility, deadline
    - Add private details section: address, contact, detailed scope
    - Integrate FileUploader for attachments
    - Implement Zod validation schemas in packages/validations
    - Create server action to insert RFP and private details
    - Restrict access to community members only
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 10.1, 13.1, 13.2, 13.3, 13.4, 13.5_
  
  - [x] 8.3 Implement file upload for RFPs
    - Create server action to upload files to Supabase Storage
    - Validate file types and sizes server-side
    - Store file URLs in rfp_private_details.attachments JSONB
    - Implement storage bucket policies for access control
    - Add file removal functionality
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_
  
  - [x] 8.4 Create RFP detail page
    - Build app/(platform)/rfps/[id]/page.tsx
    - Display full RFP information with creator UserBadge
    - Show private details only if user has access
    - Display "Request to Bid" button for vendors (private RFPs)
    - Display "Submit Proposal" button for authorized vendors
    - Show proposal count and status
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 6.1, 10.4_


- [x] 9. Implement vendor approval and proposal submission
  - [x] 9.1 Create vendor approval request flow
    - Add "Request to Bid" button on private RFP detail page
    - Create server action to insert rfp_approved_vendors record with pending status
    - Add request to community member's dashboard pending list
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [x] 9.2 Build vendor approval interface
    - Create vendor approval list component for community members
    - Display vendor profile with company, services, areas
    - Add approve/reject buttons
    - Create server action to update approval status
    - Grant access to private details on approval
    - _Requirements: 3.7, 6.2, 6.4, 9.2_
  
  - [x] 9.3 Create proposal submission form
    - Build app/(platform)/rfps/[id]/proposals/new/page.tsx
    - Add form fields: cover letter, timeline, cost, payment terms
    - Integrate FileUploader for proposal attachments
    - Implement Zod validation schema in packages/validations
    - Create server action to insert proposal
    - Restrict to one proposal per vendor per RFP
    - Restrict access to vendors with RFP access
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 10.2, 13.1, 13.2, 13.3, 13.4, 13.5_
  
  - [x] 9.4 Implement file upload for proposals
    - Create server action to upload proposal files to Supabase Storage
    - Validate file types and sizes server-side
    - Store file URLs in proposals.attachments JSONB
    - Implement storage bucket policies for access control
    - Add file removal functionality
    - _Requirements: 5.3, 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_
  
  - [x] 9.5 Create proposal viewing interface
    - Build app/(platform)/rfps/[id]/proposals/page.tsx
    - Display all proposals for RFP creator
    - Show vendor info, cost, timeline for each proposal
    - Add status badges (submitted, under review, accepted, rejected)
    - Restrict access to RFP creator only
    - _Requirements: 5.6, 10.6_
  
  - [x] 9.6 Add proposal editing
    - Allow vendors to edit their proposals while status is submitted
    - Create edit form with pre-filled data
    - Implement server action for proposal updates
    - Restrict editing after status changes
    - _Requirements: 5.5, 10.7_

- [x] 10. Build messaging system
  - [x] 10.1 Create messaging interface
    - Build messaging component for RFP context
    - Display message thread between creator and vendor
    - Show sender UserBadge for each message
    - Add message input form
    - Implement real-time message display (polling or Supabase Realtime)
    - _Requirements: 7.1, 7.2, 7.4_
  
  - [x] 10.2 Implement message sending
    - Create server action to insert rfp_messages
    - Validate sender is either RFP creator or proposal vendor
    - Restrict message visibility to sender and recipient
    - Add message to thread immediately (optimistic update)
    - _Requirements: 7.1, 7.2, 7.3_
  
  - [x] 10.3 Add message notifications
    - Display unread message count on dashboard
    - Mark messages as read when viewed
    - Update read_at timestamp
    - _Requirements: 7.4, 9.2_


- [x] 11. Build dashboard and navigation
  - [x] 11.1 Create platform layout
    - Build app/(platform)/layout.tsx with navigation
    - Add sidebar or top navigation with links to forum, RFPs, profile
    - Display user info with UserBadge in navigation
    - Add logout button
    - Implement responsive navigation for mobile
    - _Requirements: 9.4_
  
  - [x] 11.2 Build community member dashboard
    - Build app/(platform)/dashboard/page.tsx for community members
    - Display active RFPs with proposal counts
    - Show pending vendor approval requests
    - Display recent messages with unread count
    - Add quick action buttons (Create RFP, View Forum)
    - _Requirements: 9.2_
  
  - [x] 11.3 Build vendor dashboard
    - Build app/(platform)/dashboard/page.tsx for vendors
    - Display available RFPs (public + approved private)
    - Show submitted proposals with status
    - Display recent messages with unread count
    - Add quick action buttons (Browse RFPs, View Forum)
    - _Requirements: 9.3_
  
  - [x] 11.4 Implement dashboard routing logic
    - Detect user account type (community_member or vendor)
    - Render appropriate dashboard component
    - Handle loading states while fetching user profile
    - _Requirements: 9.1, 9.2, 9.3_

- [x] 12. Build profile management
  - [x] 12.1 Create profile viewing page
    - Build app/(platform)/profile/[id]/page.tsx
    - Display user profile with UserBadge
    - Show community member details (role, location, license)
    - Show vendor details (company, services, areas, business info)
    - Display recent posts and comments
    - Respect privacy settings (hide property name if toggled)
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_
  
  - [x] 12.2 Create profile editing page
    - Build app/(platform)/profile/edit/page.tsx
    - Pre-fill form with current profile data
    - Allow editing all profile fields except account type
    - Add privacy toggle for community members
    - Implement Zod validation schemas
    - Create server action to update profile
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  
  - [x] 12.3 Add avatar upload
    - Integrate FileUploader for avatar images
    - Create server action to upload to Supabase Storage avatars bucket
    - Validate image types (JPG, PNG) and size
    - Update user.avatar_url in database
    - Display avatar in UserBadge throughout app
    - _Requirements: 8.4, 13.1, 13.2, 13.3_


- [-] 13. Implement performance optimizations
  - [x] 13.1 Add React Query for data fetching
    - Set up React Query provider in apps/web
    - Configure cache times and stale times
    - Implement query keys for forum posts, RFPs, proposals
    - Add optimistic updates for votes and comments
    - _Requirements: 11.3, 11.4_
  
  - [x] 13.2 Optimize database queries
    - Add database indexes on frequently queried columns
    - Implement pagination for all list views (20-50 items per page)
    - Use select() to fetch only needed columns
    - Optimize joins to avoid N+1 queries
    - _Requirements: 11.5_
  
  - [x] 13.3 Add loading states and skeletons
    - Create skeleton loaders for post lists, RFP lists
    - Add loading spinners for form submissions
    - Implement Suspense boundaries for async components
    - Show loading states during data fetching
    - _Requirements: 11.3_
  
  - [x] 13.4 Optimize images
    - Use Next.js Image component for all images
    - Configure image optimization in next.config.js
    - Add lazy loading for below-the-fold images
    - Implement responsive image sizes
    - _Requirements: 11.4_

- [x] 14. Add error handling and validation
  - [x] 14.1 Implement form validation
    - Add inline validation to all forms
    - Display field-level error messages
    - Implement Zod schemas for all form inputs
    - Add client-side validation before submission
    - _Requirements: All form-related requirements_
  
  - [x] 14.2 Create error boundaries
    - Add error.tsx files for route segments
    - Display user-friendly error messages
    - Add retry functionality for failed operations
    - Log errors for debugging
    - _Requirements: Error handling across application_
  
  - [x] 14.3 Add server-side validation
    - Validate all inputs in server actions with Zod
    - Return structured error responses
    - Check authorization before database operations
    - Handle database errors gracefully
    - _Requirements: Security and data integrity_

- [x] 15. Polish and final integration
  - [x] 15.1 Implement responsive design
    - Test all pages on mobile, tablet, desktop
    - Adjust layouts for different screen sizes
    - Ensure touch targets are 44px minimum on mobile
    - Test navigation on mobile devices
    - _Requirements: 11.5_
  
  - [x] 15.2 Add accessibility features
    - Ensure keyboard navigation works throughout
    - Add ARIA labels to interactive elements
    - Test with screen reader
    - Verify color contrast ratios
    - Add focus indicators to all focusable elements
    - _Requirements: Accessibility compliance_
  
  - [x] 15.3 Final testing and bug fixes
    - Test all user flows end-to-end
    - Verify RLS policies work correctly
    - Test file uploads with various file types
    - Verify authorization checks on all protected routes
    - Fix any discovered bugs
    - _Requirements: All requirements_
  
  - [x] 15.4 Deploy to production
    - Set up Vercel project and connect to repository
    - Configure environment variables in Vercel
    - Set up Supabase production project
    - Run database migrations on production
    - Deploy to production and verify functionality
    - _Requirements: Deployment and production readiness_

## Notes

- Each task should be completed and tested before moving to the next
- Server actions should always validate inputs and check authorization
- All database operations should respect RLS policies
- Components should be built in shared packages when reusable
- Forms should use Zod validation and React Hook Form
- File uploads should validate types and sizes on both client and server
- All mutations should use optimistic updates where appropriate
- Error handling should provide clear, actionable messages to users
