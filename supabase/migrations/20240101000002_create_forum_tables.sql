-- Migration: Create forum tables
-- Description: Creates forum_categories, forum_posts, forum_comments, and forum_votes tables

-- Create forum_categories table
CREATE TABLE forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on slug for faster lookups
CREATE INDEX idx_forum_categories_slug ON forum_categories(slug);

-- Seed forum categories with common community association topics
INSERT INTO forum_categories (slug, name, description, sort_order) VALUES
  ('general', 'General Discussion', 'General community association topics', 1),
  ('maintenance', 'Maintenance & Repairs', 'Building maintenance and repair discussions', 2),
  ('landscaping', 'Landscaping & Grounds', 'Landscaping, grounds keeping, and outdoor spaces', 3),
  ('legal', 'Legal & Compliance', 'HOA law, regulations, and compliance', 4),
  ('financial', 'Financial & Budgeting', 'Budgets, assessments, and financial planning', 5),
  ('amenities', 'Amenities & Facilities', 'Pool, gym, clubhouse, and other amenities', 6),
  ('security', 'Security & Safety', 'Security systems, safety protocols, and emergency preparedness', 7),
  ('vendors', 'Vendor Recommendations', 'Share experiences with service providers', 8);

-- Create forum_posts table
CREATE TABLE forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES forum_categories(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  vote_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_forum_posts_category ON forum_posts(category_id);
CREATE INDEX idx_forum_posts_author ON forum_posts(author_id);
CREATE INDEX idx_forum_posts_created ON forum_posts(created_at DESC);
CREATE INDEX idx_forum_posts_vote_count ON forum_posts(vote_count DESC);

-- Create forum_comments table
CREATE TABLE forum_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES forum_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  vote_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_forum_comments_post ON forum_comments(post_id);
CREATE INDEX idx_forum_comments_author ON forum_comments(author_id);
CREATE INDEX idx_forum_comments_parent ON forum_comments(parent_comment_id);
CREATE INDEX idx_forum_comments_created ON forum_comments(created_at ASC);

-- Create forum_votes table
CREATE TABLE forum_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  votable_type TEXT NOT NULL CHECK (votable_type IN ('post', 'comment')),
  votable_id UUID NOT NULL,
  direction INTEGER NOT NULL CHECK (direction IN (-1, 1)),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, votable_type, votable_id)
);

-- Create indexes for faster queries
CREATE INDEX idx_forum_votes_votable ON forum_votes(votable_type, votable_id);
CREATE INDEX idx_forum_votes_user ON forum_votes(user_id);

-- Add comments for documentation
COMMENT ON TABLE forum_categories IS 'Categories for organizing forum posts';
COMMENT ON TABLE forum_posts IS 'Forum posts created by users';
COMMENT ON TABLE forum_comments IS 'Comments on forum posts with one-level threading support';
COMMENT ON TABLE forum_votes IS 'Upvotes and downvotes on posts and comments';
