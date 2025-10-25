# Deployment Guide - Common Elements MVP

This guide walks through deploying the Common Elements platform to production using Vercel and Supabase.

## Prerequisites

- [ ] Vercel account (free tier works for MVP)
- [ ] Supabase account (free tier works for MVP)
- [ ] GitHub repository with the code
- [ ] Domain name (optional, Vercel provides free subdomain)

## Part 1: Set Up Supabase Production Project

### 1.1 Create Production Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in project details:
   - **Name**: `common-elements-prod`
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free (can upgrade later)
4. Click "Create new project"
5. Wait 2-3 minutes for project to initialize

### 1.2 Run Database Migrations

1. Install Supabase CLI if not already installed:
   ```bash
   npm install -g supabase
   ```

2. Link to your production project:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```
   
   Find your project ref in: Project Settings > General > Reference ID

3. Run migrations:
   ```bash
   supabase db push
   ```

4. Verify migrations in Supabase Dashboard:
   - Go to Table Editor
   - Confirm all tables exist: users, community_profiles, vendor_profiles, forum_posts, rfps, etc.

### 1.3 Set Up Storage Buckets

1. Go to Storage in Supabase Dashboard
2. Create buckets:
   - **avatars**: Public bucket for user avatars
   - **rfp-attachments**: Private bucket for RFP files
   - **proposal-attachments**: Private bucket for proposal files

3. Set bucket policies:

**avatars bucket** (public):
```sql
-- Allow public read access
CREATE POLICY "Public avatars are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**rfp-attachments bucket** (private):
```sql
-- RFP creators and approved vendors can view attachments
CREATE POLICY "RFP attachments viewable by authorized users"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'rfp-attachments'
  AND (
    -- RFP creator can view
    EXISTS (
      SELECT 1 FROM rfps r
      JOIN community_profiles cp ON r.creator_id = cp.id
      WHERE r.id::text = (storage.foldername(name))[1]
        AND cp.user_id = auth.uid()
    )
    OR
    -- Approved vendor can view
    EXISTS (
      SELECT 1 FROM rfp_approved_vendors rav
      JOIN vendor_profiles vp ON rav.vendor_id = vp.id
      WHERE rav.rfp_id::text = (storage.foldername(name))[1]
        AND rav.status = 'approved'
        AND vp.user_id = auth.uid()
    )
    OR
    -- Public RFP - all vendors can view
    EXISTS (
      SELECT 1 FROM rfps r
      WHERE r.id::text = (storage.foldername(name))[1]
        AND r.visibility = 'public'
    )
  )
);

-- Only RFP creators can upload attachments
CREATE POLICY "RFP creators can upload attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'rfp-attachments'
  AND EXISTS (
    SELECT 1 FROM rfps r
    JOIN community_profiles cp ON r.creator_id = cp.id
    WHERE r.id::text = (storage.foldername(name))[1]
      AND cp.user_id = auth.uid()
  )
);
```

**proposal-attachments bucket** (private):
```sql
-- RFP creator and proposal vendor can view
CREATE POLICY "Proposal attachments viewable by authorized users"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'proposal-attachments'
  AND (
    -- Proposal vendor can view
    EXISTS (
      SELECT 1 FROM proposals p
      JOIN vendor_profiles vp ON p.vendor_id = vp.id
      WHERE p.id::text = (storage.foldername(name))[1]
        AND vp.user_id = auth.uid()
    )
    OR
    -- RFP creator can view
    EXISTS (
      SELECT 1 FROM proposals p
      JOIN rfps r ON p.rfp_id = r.id
      JOIN community_profiles cp ON r.creator_id = cp.id
      WHERE p.id::text = (storage.foldername(name))[1]
        AND cp.user_id = auth.uid()
    )
  )
);

-- Only proposal vendors can upload
CREATE POLICY "Vendors can upload proposal attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'proposal-attachments'
  AND EXISTS (
    SELECT 1 FROM proposals p
    JOIN vendor_profiles vp ON p.vendor_id = vp.id
    WHERE p.id::text = (storage.foldername(name))[1]
      AND vp.user_id = auth.uid()
  )
);
```

### 1.4 Configure Authentication

1. Go to Authentication > Settings
2. Configure Site URL:
   - **Site URL**: `https://your-domain.vercel.app` (update after Vercel deployment)
3. Configure Redirect URLs:
   - Add: `https://your-domain.vercel.app/**`
4. Email Templates (optional):
   - Customize confirmation and password reset emails
5. Enable Email Provider:
   - Ensure email auth is enabled
   - Configure SMTP (optional, uses Supabase's by default)

### 1.5 Get API Credentials

1. Go to Project Settings > API
2. Copy these values (you'll need them for Vercel):
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (public key)
   - **service_role key**: `eyJhbGc...` (keep secret!)

## Part 2: Deploy to Vercel

### 2.1 Connect GitHub Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." > "Project"
3. Import your GitHub repository
4. Select the repository: `common-elements`

### 2.2 Configure Build Settings

Vercel should auto-detect Next.js. Verify these settings:

- **Framework Preset**: Next.js
- **Root Directory**: `apps/web`
- **Build Command**: `npm run build` (or leave default)
- **Output Directory**: `.next` (or leave default)
- **Install Command**: `npm install` (or leave default)

### 2.3 Configure Environment Variables

Add these environment variables in Vercel:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

**Important**: 
- Use the production Supabase credentials from Part 1.5
- The `SUPABASE_SERVICE_ROLE_KEY` should be kept secret (server-side only)
- Update `NEXT_PUBLIC_APP_URL` after deployment

### 2.4 Deploy

1. Click "Deploy"
2. Wait 2-5 minutes for build to complete
3. Vercel will provide a URL: `https://common-elements-xxxxx.vercel.app`

### 2.5 Update Supabase Site URL

1. Go back to Supabase Dashboard
2. Authentication > URL Configuration
3. Update **Site URL** to your Vercel URL
4. Add Vercel URL to **Redirect URLs**

### 2.6 Configure Custom Domain (Optional)

1. In Vercel Dashboard, go to your project
2. Settings > Domains
3. Add your custom domain
4. Follow DNS configuration instructions
5. Wait for DNS propagation (can take up to 48 hours)
6. Update Supabase Site URL to custom domain

## Part 3: Verify Deployment

### 3.1 Test Core Functionality

Visit your deployed site and test:

- [ ] Homepage loads
- [ ] Sign up flow works
- [ ] Login works
- [ ] Onboarding flow completes
- [ ] Forum posts display
- [ ] Can create forum post
- [ ] Can create RFP
- [ ] File uploads work
- [ ] Dashboard displays correctly

### 3.2 Check Database Connections

1. Create a test user
2. Complete onboarding
3. Verify data appears in Supabase Dashboard:
   - Check `users` table
   - Check `community_profiles` or `vendor_profiles`

### 3.3 Test File Uploads

1. Upload an avatar
2. Create RFP with attachments
3. Verify files appear in Supabase Storage buckets

### 3.4 Monitor Errors

1. Check Vercel Logs:
   - Go to Deployments > Latest > Logs
   - Look for any errors
2. Check Supabase Logs:
   - Go to Logs > API Logs
   - Check for failed queries or auth issues

## Part 4: Post-Deployment Configuration

### 4.1 Set Up Monitoring

**Vercel Analytics** (optional):
1. Go to your project in Vercel
2. Analytics tab
3. Enable Web Analytics

**Supabase Monitoring**:
1. Monitor database usage in Dashboard
2. Set up alerts for:
   - Database size approaching limit
   - API requests approaching limit
   - Storage approaching limit

### 4.2 Configure Backups

Supabase Pro plan includes automated backups. For free tier:
1. Regularly export database:
   ```bash
   supabase db dump -f backup.sql
   ```
2. Store backups securely

### 4.3 Security Checklist

- [ ] All RLS policies enabled and tested
- [ ] Service role key kept secret (not in client code)
- [ ] CORS configured correctly in Supabase
- [ ] Rate limiting configured (Vercel Pro feature)
- [ ] File upload size limits enforced
- [ ] SQL injection prevention (using parameterized queries)

### 4.4 Performance Optimization

- [ ] Enable Vercel Edge Network (automatic)
- [ ] Configure caching headers
- [ ] Monitor Core Web Vitals in Vercel Analytics
- [ ] Optimize images (Next.js Image component)
- [ ] Enable compression (automatic in Vercel)

## Part 5: Maintenance

### 5.1 Regular Tasks

**Weekly**:
- Check error logs in Vercel
- Monitor database size in Supabase
- Review user feedback

**Monthly**:
- Review and optimize slow queries
- Check for security updates
- Backup database
- Review storage usage

### 5.2 Scaling Considerations

**When to upgrade Supabase**:
- Approaching 500MB database size (free tier limit)
- Need more than 2GB bandwidth/month
- Need automated backups
- Need more than 50,000 monthly active users

**When to upgrade Vercel**:
- Need custom domains (Pro plan)
- Need password protection
- Need advanced analytics
- Approaching bandwidth limits

### 5.3 Troubleshooting

**Build Failures**:
1. Check Vercel build logs
2. Verify all dependencies in package.json
3. Test build locally: `npm run build`
4. Check for TypeScript errors

**Database Connection Issues**:
1. Verify environment variables in Vercel
2. Check Supabase project status
3. Verify RLS policies aren't blocking queries
4. Check API logs in Supabase

**File Upload Issues**:
1. Verify storage buckets exist
2. Check storage policies
3. Verify file size limits
4. Check CORS configuration

## Environment Variables Reference

### Required Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=          # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Public anon key
SUPABASE_SERVICE_ROLE_KEY=         # Secret service role key

# App
NEXT_PUBLIC_APP_URL=               # Your deployed app URL
```

### Optional Variables

```bash
# Analytics (if using)
NEXT_PUBLIC_GA_ID=                 # Google Analytics ID
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=   # Vercel Analytics ID

# Email (if using custom SMTP)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
```

## Rollback Procedure

If deployment has critical issues:

1. **Rollback Vercel Deployment**:
   - Go to Deployments in Vercel
   - Find previous working deployment
   - Click "..." > "Promote to Production"

2. **Rollback Database Migration**:
   ```bash
   supabase db reset
   # Then re-run migrations up to last working version
   ```

3. **Notify Users**:
   - Add maintenance banner if needed
   - Communicate via email/social media

## Success Criteria

Deployment is successful when:

- [ ] Application loads without errors
- [ ] Users can sign up and log in
- [ ] All core features work (forum, RFPs, profiles)
- [ ] File uploads work correctly
- [ ] Database queries execute successfully
- [ ] No console errors in browser
- [ ] Mobile responsive design works
- [ ] Accessibility features function properly
- [ ] Performance metrics are acceptable (< 3s load time)

## Support Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Supabase Documentation**: https://supabase.com/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **Vercel Support**: support@vercel.com
- **Supabase Support**: https://supabase.com/support

## Notes

- Free tier limits are sufficient for MVP and initial users
- Monitor usage to know when to upgrade
- Keep credentials secure and never commit to git
- Test thoroughly before announcing to users
- Have a rollback plan ready

---

**Deployment Date**: _____________

**Deployed By**: _____________

**Production URL**: _____________

**Supabase Project**: _____________
