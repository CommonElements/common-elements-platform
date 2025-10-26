import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@repo/database'

export async function GET() {
  try {
    // Check database connection - use posts table instead of users to avoid RLS recursion
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.from('posts').select('id').limit(1)

    // It's okay if no posts exist, we just want to check the connection
    // PGRST116 = no rows returned (which is fine for health check)
    const isDatabaseHealthy = !error || error.code === 'PGRST116'

    if (!isDatabaseHealthy) {
      return NextResponse.json(
        {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          checks: {
            database: false,
            server: true,
          },
        },
        { status: 503 }
      )
    }

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: true,
        server: true,
      },
      version: process.env.npm_package_version || 'unknown',
      environment: process.env.NODE_ENV,
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        checks: {
          database: false,
          server: true,
        },
      },
      { status: 503 }
    )
  }
}