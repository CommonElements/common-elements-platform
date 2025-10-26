# Common Elements - Production Deployment Guide

## Overview

Common Elements is a community association platform built with Next.js 15, Turborepo, and Supabase. This guide covers deployment, monitoring, and maintenance in production environments.

## Prerequisites

- Node.js 20+ and npm 11.6.0+
- Supabase project with configured database
- Domain name with DNS control
- SSL certificates for HTTPS
- (Optional) Vercel account for managed deployment
- (Optional) Docker for containerized deployment

## Environment Configuration

### Required Environment Variables

Create `.env.production` from `.env.production.example`:

```bash
cp apps/web/.env.production.example apps/web/.env.production
```

Essential variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only)
- `NEXT_PUBLIC_APP_URL` - Your production domain

Optional services:
- `NEXT_PUBLIC_GA_ID` - Google Analytics tracking ID
- `NEXT_PUBLIC_SENTRY_DSN` - Sentry error tracking DSN
- `SMTP_*` - Email service credentials

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Connect Repository**
   ```bash
   npm i -g vercel
   vercel link
   ```

2. **Configure Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Option 2: Docker Deployment

1. **Build Image**
   ```bash
   docker build -t common-elements:latest .
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **With Custom SSL Certificates**
   - Place certificates in `./ssl/cert.pem` and `./ssl/key.pem`
   - Update `nginx.conf` with your domain

### Option 3: Manual Node.js Deployment

1. **Build Application**
   ```bash
   npm ci --production
   npm run build
   ```

2. **Start Production Server**
   ```bash
   npm run start
   ```

3. **Setup Process Manager (PM2)**
   ```bash
   npm install -g pm2
   pm2 start npm --name "common-elements" -- start
   pm2 save
   pm2 startup
   ```

## Security Checklist

- [x] Environment variables secured and not exposed
- [x] HTTPS enforced with valid SSL certificates
- [x] Security headers configured (CSP, HSTS, etc.)
- [x] Rate limiting implemented on API routes
- [x] Input validation on all forms
- [x] SQL injection prevention via parameterized queries
- [x] XSS protection through React's built-in escaping
- [x] CORS properly configured
- [x] Authentication tokens expire and refresh properly
- [x] Error messages don't leak sensitive information

## Performance Optimization

### Current Optimizations

- **Image Optimization**: Next.js Image component with AVIF/WebP formats
- **Code Splitting**: Automatic with Next.js App Router
- **Bundle Size**: SWC minification enabled
- **Caching**: Static assets cached for 1 year, API routes uncached
- **Database Queries**: Optimized with proper indexes and column selection
- **CSS**: Optimized with experimental CSS optimization flag

### Monitoring Performance

1. **Core Web Vitals**
   - Monitor via Google PageSpeed Insights
   - Track in Google Analytics with Web Vitals library

2. **Bundle Analysis**
   ```bash
   npm run build
   npm run analyze
   ```

3. **Database Performance**
   - Monitor slow queries in Supabase dashboard
   - Check index usage with EXPLAIN ANALYZE

## Monitoring & Analytics

### Google Analytics

Analytics are automatically tracked for:
- Page views
- User sign-ups and logins
- RFP creation and proposal submissions
- Forum activity
- Search queries

Configuration in `apps/web/lib/analytics.ts`

### Sentry Error Tracking

Errors are automatically captured and reported with:
- User context
- Breadcrumbs for user actions
- Performance monitoring
- Session replay on errors

Configuration in `sentry.*.config.ts` files

### Health Monitoring

Health check endpoint: `GET /api/health`

Returns:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "checks": {
    "database": true,
    "server": true
  },
  "version": "1.0.0",
  "environment": "production"
}
```

## CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci.yml`) includes:

1. **Linting & Type Checking** - Ensures code quality
2. **Testing** - Runs test suite
3. **Building** - Verifies production build
4. **Security Scanning** - Checks for vulnerabilities
5. **Preview Deployments** - For pull requests
6. **Production Deployment** - Automatic on main branch

### Setting up CI/CD

1. Add GitHub secrets:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL`

2. Optional: Add `SNYK_TOKEN` for security scanning

## Database Management

### Migrations

Run migrations in Supabase:
1. Navigate to SQL Editor in Supabase Dashboard
2. Execute migration files in order
3. Verify with health check endpoint

### Backups

1. **Automatic Backups**: Enabled in Supabase (Pro plan)
2. **Manual Backups**:
   ```bash
   pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
   ```

### Monitoring

- Check slow query logs in Supabase Dashboard
- Monitor connection pool usage
- Review index performance regularly

## Scaling Considerations

### Current Architecture Supports

- **Horizontal Scaling**: Stateless Next.js app can run multiple instances
- **CDN Integration**: Static assets served from edge locations
- **Database Connection Pooling**: Via Supabase Pooler
- **Edge Functions**: For compute-intensive operations

### When to Scale

Monitor these metrics:
- Response times > 1s consistently
- Database connections > 80% of pool
- Memory usage > 85% consistently
- Error rate > 1%

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check Supabase service status
   - Verify connection string
   - Check SSL mode requirements

2. **Build Failures**
   - Clear `.next` and `node_modules`
   - Verify all environment variables set
   - Check Node.js version (requires 20+)

3. **Authentication Issues**
   - Verify Supabase Auth settings
   - Check JWT expiry configuration
   - Review CORS settings

### Debug Mode

Enable debug logging:
```bash
DEBUG=* npm run dev
```

### Log Aggregation

Production logs available in:
- Vercel: Function logs in dashboard
- Docker: `docker-compose logs -f web`
- PM2: `pm2 logs common-elements`

## Maintenance

### Regular Tasks

**Daily:**
- Monitor error rates in Sentry
- Check health endpoint status

**Weekly:**
- Review slow query logs
- Check security advisories
- Monitor bundle size trends

**Monthly:**
- Update dependencies (security patches)
- Review and rotate API keys
- Analyze user analytics for optimization opportunities
- Database maintenance (VACUUM, ANALYZE)

### Upgrade Process

1. **Test in Staging**
   ```bash
   git checkout -b upgrade/dependencies
   npm update
   npm run build
   npm run test
   ```

2. **Deploy to Preview**
   - Create pull request
   - Verify preview deployment
   - Run integration tests

3. **Production Deployment**
   - Merge to main branch
   - Monitor error rates closely
   - Be ready to rollback if needed

## Rollback Procedure

### Vercel
```bash
vercel rollback
```

### Docker
```bash
docker-compose down
docker pull common-elements:previous-version
docker-compose up -d
```

### Database Rollback
Always backup before migrations:
```bash
psql $DATABASE_URL < backup_previous.sql
```

## Support & Resources

- **Documentation**: See README.md and CLAUDE.md
- **Supabase Dashboard**: https://app.supabase.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Sentry Dashboard**: https://sentry.io
- **Status Page**: Set up with Uptime Robot or similar

## Emergency Contacts

Configure these in your incident response plan:
- On-call engineer rotation
- Database administrator
- Security team contact
- Customer support lead

## Compliance & Legal

Ensure compliance with:
- GDPR (if serving EU users)
- CCPA (if serving California residents)
- Industry-specific regulations
- Data retention policies
- Privacy policy and terms of service

---

Last updated: December 2024
Version: 1.0.0