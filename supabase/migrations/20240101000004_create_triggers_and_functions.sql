-- Migration: Create database triggers and functions
-- Description: Creates trigger functions for automatic vote counts, comment counts, proposal counts, and timestamp updates

-- Function to update vote counts on posts and comments
CREATE OR REPLACE FUNCTION update_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.votable_type = 'post' THEN
      UPDATE forum_posts SET vote_count = vote_count + NEW.direction WHERE id = NEW.votable_id;
    ELSIF NEW.votable_type = 'comment' THEN
      UPDATE forum_comments SET vote_count = vote_count + NEW.direction WHERE id = NEW.votable_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.votable_type = 'post' THEN
      UPDATE forum_posts SET vote_count = vote_count - OLD.direction WHERE id = OLD.votable_id;
    ELSIF OLD.votable_type = 'comment' THEN
      UPDATE forum_comments SET vote_count = vote_count - OLD.direction WHERE id = OLD.votable_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle vote direction change (e.g., upvote to downvote)
    IF OLD.votable_type = 'post' THEN
      UPDATE forum_posts 
      SET vote_count = vote_count - OLD.direction + NEW.direction 
      WHERE id = NEW.votable_id;
    ELSIF OLD.votable_type = 'comment' THEN
      UPDATE forum_comments 
      SET vote_count = vote_count - OLD.direction + NEW.direction 
      WHERE id = NEW.votable_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for vote count updates
CREATE TRIGGER forum_votes_update_count
AFTER INSERT OR DELETE OR UPDATE ON forum_votes
FOR EACH ROW EXECUTE FUNCTION update_vote_count();

-- Function to update comment counts on posts
CREATE OR REPLACE FUNCTION update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for comment count updates
CREATE TRIGGER forum_comments_update_count
AFTER INSERT OR DELETE ON forum_comments
FOR EACH ROW EXECUTE FUNCTION update_comment_count();

-- Function to update proposal counts on RFPs
CREATE OR REPLACE FUNCTION update_proposal_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE rfps SET proposal_count = proposal_count + 1 WHERE id = NEW.rfp_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE rfps SET proposal_count = proposal_count - 1 WHERE id = OLD.rfp_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for proposal count updates
CREATE TRIGGER proposals_update_count
AFTER INSERT OR DELETE ON proposals
FOR EACH ROW EXECUTE FUNCTION update_proposal_count();

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_users_updated_at 
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_community_profiles_updated_at 
BEFORE UPDATE ON community_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_vendor_profiles_updated_at 
BEFORE UPDATE ON vendor_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_forum_posts_updated_at 
BEFORE UPDATE ON forum_posts
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_forum_comments_updated_at 
BEFORE UPDATE ON forum_comments
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_rfps_updated_at 
BEFORE UPDATE ON rfps
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_rfp_private_details_updated_at 
BEFORE UPDATE ON rfp_private_details
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_proposals_updated_at 
BEFORE UPDATE ON proposals
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Add comments for documentation
COMMENT ON FUNCTION update_vote_count() IS 'Automatically updates vote_count on posts and comments when votes are added, removed, or changed';
COMMENT ON FUNCTION update_comment_count() IS 'Automatically updates comment_count on posts when comments are added or removed';
COMMENT ON FUNCTION update_proposal_count() IS 'Automatically updates proposal_count on RFPs when proposals are added or removed';
COMMENT ON FUNCTION update_updated_at() IS 'Automatically updates the updated_at timestamp when a row is modified';
