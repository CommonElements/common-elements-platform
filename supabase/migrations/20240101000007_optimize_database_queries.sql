-- Migration: Optimize database queries
-- Description: Add additional indexes for frequently queried columns and optimize query performance

-- ============================================================================
-- COMPOSITE INDEXES FOR COMMON QUERY PATTERNS
-- ============================================================================

-- Forum posts: frequently filtered by category and ordered by created_at
CREATE INDEX IF NOT EXISTS idx_forum_posts_category_created 
ON forum_posts(category_id, created_at DESC);

-- Forum posts: frequently filtered by category and ordered by vote_count
CREATE INDEX IF NOT EXISTS idx_forum_posts_category_votes 
ON forum_posts(category_id, vote_count DESC);

-- Forum comments: frequently queried by post with ordering
CREATE INDEX IF NOT EXISTS idx_forum_comments_post_created 
ON forum_comments(post_id, created_at ASC);

-- RFPs: frequently filtered by status and visibility together
CREATE INDEX IF NOT EXISTS idx_rfps_status_visibility 
ON rfps(status, visibility);

-- RFPs: frequently filtered by category and status
CREATE INDEX IF NOT EXISTS idx_rfps_category_status 
ON rfps(category, status);

-- RFPs: frequently filtered by visibility and ordered by created_at
CREATE INDEX IF NOT EXISTS idx_rfps_visibility_created 
ON rfps(visibility, created_at DESC);

-- Proposals: frequently filtered by status and ordered by created_at
CREATE INDEX IF NOT EXISTS idx_proposals_status_created 
ON proposals(status, created_at DESC);

-- RFP messages: frequently queried for unread messages by recipient
CREATE INDEX IF NOT EXISTS idx_rfp_messages_recipient_unread 
ON rfp_messages(recipient_id, read_at) 
WHERE read_at IS NULL;

-- RFP approved vendors: frequently filtered by status
CREATE INDEX IF NOT EXISTS idx_rfp_approved_vendors_rfp_status 
ON rfp_approved_vendors(rfp_id, status);

-- ============================================================================
-- COVERING INDEXES FOR COMMON QUERIES
-- ============================================================================

-- Forum posts list query optimization (includes commonly selected columns)
CREATE INDEX IF NOT EXISTS idx_forum_posts_list_covering 
ON forum_posts(created_at DESC, category_id) 
INCLUDE (title, vote_count, comment_count, view_count, author_id);

-- RFPs list query optimization
CREATE INDEX IF NOT EXISTS idx_rfps_list_covering 
ON rfps(created_at DESC, status, visibility) 
INCLUDE (title, category, proposal_count, deadline, creator_id);

-- ============================================================================
-- PARTIAL INDEXES FOR SPECIFIC FILTERS
-- ============================================================================

-- Index for open RFPs only (most common filter)
CREATE INDEX IF NOT EXISTS idx_rfps_open 
ON rfps(created_at DESC) 
WHERE status = 'open';

-- Index for public RFPs only
CREATE INDEX IF NOT EXISTS idx_rfps_public 
ON rfps(created_at DESC) 
WHERE visibility = 'public';

-- Index for pending vendor approvals
CREATE INDEX IF NOT EXISTS idx_rfp_approved_vendors_pending 
ON rfp_approved_vendors(rfp_id, requested_at DESC) 
WHERE status = 'pending';

-- Index for submitted proposals (most common status)
CREATE INDEX IF NOT EXISTS idx_proposals_submitted 
ON proposals(rfp_id, created_at DESC) 
WHERE status = 'submitted';

-- ============================================================================
-- OPTIMIZE EXISTING INDEXES
-- ============================================================================

-- Drop and recreate indexes with better ordering for common queries
DROP INDEX IF EXISTS idx_forum_posts_created;
CREATE INDEX idx_forum_posts_created ON forum_posts(created_at DESC, id);

DROP INDEX IF EXISTS idx_rfps_created;
CREATE INDEX idx_rfps_created ON rfps(created_at DESC, id);

DROP INDEX IF EXISTS idx_proposals_created;
CREATE INDEX idx_proposals_created ON proposals(created_at DESC, id);

-- ============================================================================
-- STATISTICS AND MAINTENANCE
-- ============================================================================

-- Update table statistics for better query planning
ANALYZE users;
ANALYZE community_profiles;
ANALYZE vendor_profiles;
ANALYZE forum_categories;
ANALYZE forum_posts;
ANALYZE forum_comments;
ANALYZE forum_votes;
ANALYZE rfps;
ANALYZE rfp_private_details;
ANALYZE rfp_approved_vendors;
ANALYZE proposals;
ANALYZE rfp_messages;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON INDEX idx_forum_posts_category_created IS 'Optimizes forum post queries filtered by category and ordered by date';
COMMENT ON INDEX idx_forum_posts_category_votes IS 'Optimizes forum post queries filtered by category and ordered by votes';
COMMENT ON INDEX idx_rfps_status_visibility IS 'Optimizes RFP queries filtered by both status and visibility';
COMMENT ON INDEX idx_rfps_category_status IS 'Optimizes RFP queries filtered by category and status';
COMMENT ON INDEX idx_rfp_messages_recipient_unread IS 'Optimizes unread message count queries';
COMMENT ON INDEX idx_rfps_open IS 'Partial index for open RFPs (most common filter)';
COMMENT ON INDEX idx_rfps_public IS 'Partial index for public RFPs';
COMMENT ON INDEX idx_proposals_submitted IS 'Partial index for submitted proposals';
