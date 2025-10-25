-- Test Queries for Database Optimization Verification
-- Run these queries to verify indexes are being used correctly

-- ============================================================================
-- FORUM QUERIES
-- ============================================================================

-- Test 1: Forum posts by category (should use idx_forum_posts_category_created)
EXPLAIN ANALYZE
SELECT id, title, created_at, vote_count, comment_count, author_id, category_id
FROM forum_posts
WHERE category_id = (SELECT id FROM forum_categories LIMIT 1)
ORDER BY created_at DESC
LIMIT 20;
-- Expected: Index Scan using idx_forum_posts_category_created

-- Test 2: All forum posts (should use idx_forum_posts_list_covering)
EXPLAIN ANALYZE
SELECT id, title, created_at, vote_count, comment_count, author_id, category_id
FROM forum_posts
ORDER BY created_at DESC
LIMIT 20;
-- Expected: Index Scan using idx_forum_posts_list_covering

-- Test 3: Forum comments for a post (should use idx_forum_comments_post_created)
EXPLAIN ANALYZE
SELECT id, content, created_at, vote_count, author_id, parent_comment_id
FROM forum_comments
WHERE post_id = (SELECT id FROM forum_posts LIMIT 1)
ORDER BY created_at ASC;
-- Expected: Index Scan using idx_forum_comments_post_created

-- ============================================================================
-- RFP QUERIES
-- ============================================================================

-- Test 4: Open RFPs (should use idx_rfps_open partial index)
EXPLAIN ANALYZE
SELECT id, title, created_at, status, visibility, proposal_count, creator_id
FROM rfps
WHERE status = 'open'
ORDER BY created_at DESC
LIMIT 20;
-- Expected: Index Scan using idx_rfps_open

-- Test 5: Public RFPs (should use idx_rfps_public partial index)
EXPLAIN ANALYZE
SELECT id, title, created_at, status, visibility, proposal_count, creator_id
FROM rfps
WHERE visibility = 'public'
ORDER BY created_at DESC
LIMIT 20;
-- Expected: Index Scan using idx_rfps_public

-- Test 6: RFPs by status and visibility (should use idx_rfps_status_visibility)
EXPLAIN ANALYZE
SELECT id, title, created_at, status, visibility, proposal_count, creator_id
FROM rfps
WHERE status = 'open' AND visibility = 'public'
ORDER BY created_at DESC
LIMIT 20;
-- Expected: Index Scan using idx_rfps_status_visibility

-- Test 7: RFPs by category and status (should use idx_rfps_category_status)
EXPLAIN ANALYZE
SELECT id, title, created_at, status, category, proposal_count, creator_id
FROM rfps
WHERE category = 'Landscaping' AND status = 'open'
ORDER BY created_at DESC
LIMIT 20;
-- Expected: Index Scan using idx_rfps_category_status

-- ============================================================================
-- PROPOSAL QUERIES
-- ============================================================================

-- Test 8: Proposals for an RFP (should use idx_proposals_rfp)
EXPLAIN ANALYZE
SELECT id, cover_letter, cost, timeline, status, created_at, vendor_id
FROM proposals
WHERE rfp_id = (SELECT id FROM rfps LIMIT 1)
ORDER BY created_at DESC;
-- Expected: Index Scan using idx_proposals_rfp

-- Test 9: Submitted proposals (should use idx_proposals_submitted partial index)
EXPLAIN ANALYZE
SELECT id, cover_letter, cost, timeline, status, created_at, vendor_id
FROM proposals
WHERE rfp_id = (SELECT id FROM rfps LIMIT 1) AND status = 'submitted'
ORDER BY created_at DESC;
-- Expected: Index Scan using idx_proposals_submitted

-- ============================================================================
-- MESSAGE QUERIES
-- ============================================================================

-- Test 10: Unread message count (should use idx_rfp_messages_recipient_unread)
EXPLAIN ANALYZE
SELECT COUNT(*)
FROM rfp_messages
WHERE recipient_id = (SELECT id FROM users LIMIT 1)
  AND read_at IS NULL;
-- Expected: Index Only Scan using idx_rfp_messages_recipient_unread

-- Test 11: Messages for an RFP (should use idx_rfp_messages_rfp)
EXPLAIN ANALYZE
SELECT id, content, created_at, sender_id, recipient_id, read_at
FROM rfp_messages
WHERE rfp_id = (SELECT id FROM rfps LIMIT 1)
ORDER BY created_at ASC;
-- Expected: Index Scan using idx_rfp_messages_rfp

-- ============================================================================
-- USER QUERIES
-- ============================================================================

-- Test 12: User's posts (should use idx_forum_posts_author)
EXPLAIN ANALYZE
SELECT id, title, created_at, vote_count, comment_count, category_id
FROM forum_posts
WHERE author_id = (SELECT id FROM users LIMIT 1)
ORDER BY created_at DESC
LIMIT 10;
-- Expected: Index Scan using idx_forum_posts_author

-- Test 13: User's comments (should use idx_forum_comments_author)
EXPLAIN ANALYZE
SELECT id, content, created_at, vote_count, post_id
FROM forum_comments
WHERE author_id = (SELECT id FROM users LIMIT 1)
ORDER BY created_at DESC
LIMIT 10;
-- Expected: Index Scan using idx_forum_comments_author

-- ============================================================================
-- VENDOR APPROVAL QUERIES
-- ============================================================================

-- Test 14: Pending vendor approvals (should use idx_rfp_approved_vendors_pending)
EXPLAIN ANALYZE
SELECT id, rfp_id, vendor_id, status, requested_at
FROM rfp_approved_vendors
WHERE status = 'pending'
ORDER BY requested_at DESC;
-- Expected: Index Scan using idx_rfp_approved_vendors_pending

-- ============================================================================
-- INDEX USAGE STATISTICS
-- ============================================================================

-- Check which indexes are being used most
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Check for unused indexes (candidates for removal)
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as scans
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan = 0
ORDER BY tablename, indexname;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ============================================================================
-- PERFORMANCE BENCHMARKS
-- ============================================================================

-- Benchmark: Forum posts query (run multiple times and average)
EXPLAIN (ANALYZE, BUFFERS, TIMING)
SELECT id, title, created_at, vote_count, comment_count, author_id, category_id
FROM forum_posts
ORDER BY created_at DESC
LIMIT 20;

-- Benchmark: RFPs query with filters
EXPLAIN (ANALYZE, BUFFERS, TIMING)
SELECT id, title, created_at, status, visibility, proposal_count, creator_id
FROM rfps
WHERE status = 'open' AND visibility = 'public'
ORDER BY created_at DESC
LIMIT 20;

-- Benchmark: Unread message count
EXPLAIN (ANALYZE, BUFFERS, TIMING)
SELECT COUNT(*)
FROM rfp_messages
WHERE recipient_id = (SELECT id FROM users LIMIT 1)
  AND read_at IS NULL;

-- ============================================================================
-- QUERY PERFORMANCE MONITORING
-- ============================================================================

-- Enable pg_stat_statements if not already enabled
-- (requires superuser or rds_superuser role)
-- CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- View slowest queries (requires pg_stat_statements)
SELECT 
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time,
  stddev_exec_time
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY mean_exec_time DESC
LIMIT 20;

-- View most frequently called queries
SELECT 
  query,
  calls,
  mean_exec_time,
  total_exec_time
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY calls DESC
LIMIT 20;

-- ============================================================================
-- MAINTENANCE COMMANDS
-- ============================================================================

-- Update table statistics (run weekly)
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

-- Vacuum tables (run monthly or when needed)
VACUUM ANALYZE forum_posts;
VACUUM ANALYZE rfps;
VACUUM ANALYZE proposals;
VACUUM ANALYZE rfp_messages;

-- ============================================================================
-- VERIFICATION CHECKLIST
-- ============================================================================

/*
Run through this checklist to verify optimizations:

1. [ ] All EXPLAIN ANALYZE queries show "Index Scan" (not "Seq Scan")
2. [ ] Execution times are < 50ms for typical queries
3. [ ] Index usage statistics show indexes are being used
4. [ ] No unused indexes (idx_scan = 0) for new indexes
5. [ ] Table sizes are reasonable (indexes < 2x table size)
6. [ ] Slow query log shows no queries > 100ms
7. [ ] Most frequent queries are using indexes
8. [ ] Buffer hits are high (> 95%)
9. [ ] No table bloat (vacuum if needed)
10. [ ] Statistics are up to date (ANALYZE run recently)

If any checks fail, investigate and optimize further.
*/
