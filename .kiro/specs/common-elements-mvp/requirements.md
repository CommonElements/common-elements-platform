# Requirements Document

## Introduction

Common Elements is a community association industry platform that connects community members (board presidents, property managers, etc.) with service vendors through two core features: a forum system called "The Common Area" for community discussions, and an RFP Hub for managing service requests and proposals. The MVP focuses on delivering essential functionality for user onboarding, forum participation, and RFP management within a 2-3 week timeline.

## Glossary

- **Platform**: The Common Elements web application
- **User**: Any authenticated person using the Platform
- **Community Member**: A User associated with a property/association (board president, property manager, attorney, committee member, or resident)
- **Vendor**: A User representing a service company
- **Forum System**: The discussion area where Users create posts and comments
- **Post**: A discussion topic created by a User in the Forum System
- **Comment**: A response to a Post or another Comment
- **RFP**: Request for Proposal created by Community Members
- **Private RFP**: An RFP where details are only visible to the creator and approved Vendors
- **Public RFP**: An RFP where all details are visible to all Vendors
- **Proposal**: A bid submitted by a Vendor in response to an RFP
- **Approved Vendor**: A Vendor granted permission by a Community Member to view Private RFP details and submit Proposals
- **Profile**: User account information including role, location, and business details
- **Authentication System**: The Supabase-based system managing user login and sessions
- **RFP Status**: The current state of an RFP (Draft, Open, Reviewing, Awarded, Closed)
- **Proposal Status**: The current state of a Proposal (Submitted, Under Review, Accepted, Rejected)
- **Accepted File Types**: File formats allowed for uploads (PDF, DOC, DOCX, XLS, XLSX, JPG, PNG)

## Requirements

### Requirement 1: User Registration and Authentication

**User Story:** As a new user, I want to create an account and complete my profile, so that I can access the platform features appropriate to my role.

#### Acceptance Criteria

1. WHEN a new user submits valid email and password credentials, THE Authentication System SHALL create a user account and establish an authenticated session.

2. WHEN a user account is created, THE Platform SHALL redirect the user to an onboarding flow.

3. THE Platform SHALL require the user to select exactly one account type from the options Community Member or Vendor during onboarding.

4. WHERE the user selects Community Member as account type, THE Platform SHALL require the user to provide role, property name, and property location before completing onboarding.

5. WHERE the user selects Vendor as account type, THE Platform SHALL require the user to provide company name, service categories, and service areas before completing onboarding.

6. WHEN a user completes the onboarding flow, THE Platform SHALL mark the Profile as complete and redirect the user to the dashboard.

7. WHEN a user with valid credentials submits login information, THE Authentication System SHALL establish an authenticated session with seven-day expiry.

### Requirement 2: Forum Post Creation and Display

**User Story:** As a community member or vendor, I want to create and view forum posts, so that I can participate in community discussions.

#### Acceptance Criteria

1. WHEN an authenticated User navigates to the forum homepage, THE Platform SHALL display a list of forum categories and recent Posts.

2. WHEN an authenticated User submits a new Post with title, content, and category, THE Platform SHALL create the Post and display it in the forum feed immediately.

3. THE Platform SHALL display the author's name, role or company, and location badge on every Post.

4. WHEN a User views a Post, THE Platform SHALL display all associated Comments in threaded format with one level of nesting.

5. WHEN a User submits a Comment on a Post, THE Platform SHALL create the Comment and display it immediately below the Post or parent Comment.

6. THE Platform SHALL allow Users to upvote or downvote each Post and Comment exactly once.

7. THE Platform SHALL display vote counts on all Posts and Comments without affecting post ordering or ranking.

### Requirement 3: Private RFP Creation and Management

**User Story:** As a community member, I want to create private RFPs and control which vendors can see the details, so that I can manage sensitive property information while soliciting bids.

#### Acceptance Criteria

1. WHERE a User has Community Member account type, THE Platform SHALL provide access to create RFPs.

2. WHEN a Community Member submits an RFP with title, category, description, deadline, and visibility set to private, THE Platform SHALL create the RFP with limited public information.

3. WHERE an RFP has private visibility, THE Platform SHALL display only title, category, and general location to Vendors who are not approved.

4. WHEN a Community Member creates a Private RFP, THE Platform SHALL store property address, contact information, and detailed scope in a separate private details section.

5. THE Platform SHALL allow Community Members to attach files up to ten megabytes per file to RFPs.

6. WHERE an RFP has private visibility, THE Platform SHALL allow the creating Community Member to review Vendor profiles and approve specific Vendors.

7. WHEN a Community Member approves a Vendor for a Private RFP, THE Platform SHALL grant that Vendor access to view all private details and submit a Proposal.

### Requirement 4: Public RFP Creation and Visibility

**User Story:** As a community member, I want to create public RFPs that all vendors can see and bid on, so that I can maximize the number of proposals I receive.

#### Acceptance Criteria

1. WHEN a Community Member submits an RFP with visibility set to public, THE Platform SHALL make all RFP details visible to all Vendors immediately.

2. WHERE an RFP has public visibility, THE Platform SHALL allow any Vendor to submit a Proposal without requiring approval.

3. THE Platform SHALL display the same information fields for public RFPs as private RFPs including title, category, description, deadline, and attachments.

### Requirement 5: Vendor Proposal Submission

**User Story:** As a vendor, I want to submit proposals to RFPs I have access to, so that I can bid on projects.

#### Acceptance Criteria

1. WHERE a Vendor has access to an RFP (either public or approved for private), THE Platform SHALL allow the Vendor to submit exactly one Proposal per RFP.

2. WHEN a Vendor submits a Proposal, THE Platform SHALL require cover letter, timeline, cost, and payment terms.

3. THE Platform SHALL allow Vendors to attach files up to ten megabytes per file to Proposals.

4. WHEN a Vendor submits a Proposal, THE Platform SHALL set the Proposal status to submitted.

5. THE Platform SHALL allow Vendors to edit their Proposals while the Proposal status is submitted.

6. WHEN a Community Member views an RFP they created, THE Platform SHALL display all submitted Proposals with Vendor identity, cost, and timeline.

### Requirement 6: Vendor Access Request for Private RFPs

**User Story:** As a vendor, I want to request access to private RFPs that interest me, so that I can view full details and submit a proposal.

#### Acceptance Criteria

1. WHEN a Vendor views a Private RFP listing, THE Platform SHALL display a request to bid action.

2. WHEN a Vendor submits a request to bid on a Private RFP, THE Platform SHALL add the request to the Community Member's pending approval list and display the Vendor's profile for review.

3. THE Platform SHALL display all pending Vendor approval requests on the Community Member's dashboard.

4. WHEN a Community Member approves a Vendor request, THE Platform SHALL grant the Vendor access to all private details of that RFP.

### Requirement 7: RFP and Proposal Messaging

**User Story:** As a community member or vendor, I want to send messages related to RFPs and proposals, so that I can clarify details and negotiate terms.

#### Acceptance Criteria

1. WHERE a Vendor has submitted a Proposal, THE Platform SHALL allow the RFP creator and the Vendor to exchange messages.

2. WHEN a User sends a message, THE Platform SHALL display the message to both sender and recipient immediately.

3. THE Platform SHALL restrict message visibility to only the sender and recipient.

4. THE Platform SHALL display message history in chronological order within the RFP context.

### Requirement 8: User Profile Management

**User Story:** As a user, I want to view and edit my profile information, so that I can keep my account details current and accurate.

#### Acceptance Criteria

1. THE Platform SHALL allow Users to view their complete Profile including all information provided during onboarding.

2. THE Platform SHALL allow Users to edit their Profile information except for account type.

3. WHERE a User is a Community Member, THE Platform SHALL allow the User to toggle visibility of property name in public displays.

4. WHEN a User updates Profile information, THE Platform SHALL save the changes and reflect them immediately in all displays.

### Requirement 9: Dashboard and Navigation

**User Story:** As a user, I want to access a dashboard that shows relevant activity and navigate easily between platform features, so that I can efficiently manage my tasks.

#### Acceptance Criteria

1. WHEN an authenticated User accesses the Platform, THE Platform SHALL display a dashboard as the default landing page.

2. WHERE a User is a Community Member, THE Platform SHALL display active RFPs with proposal counts, pending Vendor approval requests, and recent messages on the dashboard.

3. WHERE a User is a Vendor, THE Platform SHALL display available RFPs, submitted Proposals with status, and recent messages on the dashboard.

4. THE Platform SHALL provide navigation to forum, RFP hub, and profile sections from all authenticated pages.

### Requirement 10: Authorization and Access Control

**User Story:** As the platform, I want to enforce role-based permissions, so that users can only access features and data appropriate to their account type.

#### Acceptance Criteria

1. THE Platform SHALL restrict RFP creation to Users with Community Member account type.

2. THE Platform SHALL restrict Proposal submission to Users with Vendor account type.

3. THE Platform SHALL allow both Community Members and Vendors to create Posts and Comments in the Forum System.

4. WHERE an RFP has private visibility, THE Platform SHALL restrict access to private details to the creating Community Member and Approved Vendors only.

5. THE Platform SHALL allow Users to edit or delete only their own Posts, Comments, and Proposals.

6. THE Platform SHALL allow Community Members to view all Proposals submitted to their RFPs.

7. THE Platform SHALL allow Vendors to view only their own Proposals.

### Requirement 11: Performance and Responsiveness

**User Story:** As a user, I want the platform to load quickly and respond immediately to my actions, so that I can work efficiently.

#### Acceptance Criteria

1. THE Platform SHALL display the First Contentful Paint within one point five seconds of page request.

2. THE Platform SHALL achieve Time to Interactive within three seconds of page request.

3. THE Platform SHALL display skeleton loaders during data fetching operations.

4. WHEN a User submits a Post, Comment, or vote, THE Platform SHALL provide immediate visual feedback using optimistic UI updates.

5. THE Platform SHALL paginate lists of Posts, RFPs, and Proposals to display between twenty and fifty items per page.

### Requirement 12: User Profile Viewing

**User Story:** As a user, I want to view other users' profiles, so that I can learn about community members and vendors before engaging with them.

#### Acceptance Criteria

1. WHEN a User clicks on another User's name or badge, THE Platform SHALL display that User's public Profile information.

2. WHERE a User is a Community Member, THE Platform SHALL display role, location (if not hidden), and optional license information on the public Profile.

3. WHERE a User is a Vendor, THE Platform SHALL display company name, service categories, service areas, and business details on the public Profile.

4. THE Platform SHALL display a User's recent Posts and Comments on their public Profile.

5. WHERE a Community Member has enabled privacy toggle, THE Platform SHALL hide property name from the public Profile display.

### Requirement 13: File Upload and Storage

**User Story:** As a user, I want to upload files to RFPs and proposals, so that I can share supporting documents and detailed information.

#### Acceptance Criteria

1. THE Platform SHALL allow file uploads for RFP attachments and Proposal attachments.

2. THE Platform SHALL enforce a maximum file size of ten megabytes per file.

3. THE Platform SHALL validate that uploaded files match Accepted File Types before accepting uploads.

4. WHEN a User uploads a file, THE Platform SHALL store the file securely and associate it with the RFP or Proposal.

5. THE Platform SHALL allow Users to remove files they have uploaded before submitting the RFP or Proposal.

6. WHERE files are attached to an RFP or Proposal, THE Platform SHALL display file names and provide download links to authorized Users.


## Out of Scope for MVP

The following features are explicitly excluded from the MVP and deferred to future phases:

1. **Advanced Vendor Search**: Filtering vendors by service category, location, or ratings is not included. Users can view vendor profiles individually but cannot search or filter the vendor directory.

2. **Email Notifications**: All notifications are in-app only. Users will not receive email alerts for new messages, proposals, or RFP updates.

3. **Real-time Chat**: Messaging is asynchronous only. Live chat functionality is not included.

4. **Payment Processing**: No payment, escrow, or transaction features are included. Contract and payment handling occurs outside the Platform.

5. **Ratings and Reviews**: Users cannot rate or review vendors. Trust is established through profile information only.

6. **Document E-signing**: Contract signing and legal document execution must be handled outside the Platform.

7. **Multi-property Support**: Community Members can only be associated with one property. Property managers handling multiple properties must use separate accounts.

8. **Advanced Post Ranking**: Forum posts are displayed in chronological order only. Vote counts do not affect post ordering or algorithmic ranking.

9. **Content Moderation Tools**: No admin moderation interface, flagging system, or automated content filtering is included.

10. **Analytics Dashboard**: No usage statistics, reporting, or analytics features for users or administrators.
