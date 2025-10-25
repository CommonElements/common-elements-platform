import { notFound, redirect } from 'next/navigation'
import { getRFP, getRFPMessages } from '@repo/database'
import { requireAuth, getUserProfile } from '@repo/auth'
import { MessagingInterfaceWrapper } from './messaging-interface-wrapper'

interface MessagesPageProps {
  params: {
    id: string
  }
  searchParams: {
    with?: string // User ID to message with
  }
}

export default async function MessagesPage({
  params,
  searchParams,
}: MessagesPageProps) {
  // Require authentication
  await requireAuth()
  const userProfile = await getUserProfile()

  if (!userProfile) {
    redirect('/login')
  }

  // Fetch RFP
  let rfp
  try {
    rfp = await getRFP(params.id)
  } catch (error) {
    notFound()
  }

  // Determine the other party in the conversation
  let recipientId: string | null = null
  let recipientName: string = ''

  if (userProfile.account_type === 'community_member') {
    // Community member messaging with a vendor
    if (!searchParams.with) {
      // Need to specify which vendor to message
      redirect(`/rfps/${params.id}/proposals`)
    }
    recipientId = searchParams.with

    // Verify the vendor has submitted a proposal
    const supabase = await (
      await import('@repo/database/server')
    ).createServerSupabaseClient()
    const { data: proposal } = await supabase
      .from('proposals')
      .select(
        `
        id,
        vendor:vendor_profiles!proposals_vendor_id_fkey (
          user_id,
          company_name,
          user:users!vendor_profiles_user_id_fkey (
            id,
            full_name
          )
        )
      `
      )
      .eq('rfp_id', params.id)
      .eq('vendor.user_id', recipientId)
      .single()

    if (!proposal) {
      notFound()
    }

    recipientName =
      (proposal.vendor as any)?.company_name ||
      (proposal.vendor as any)?.user?.full_name ||
      'Vendor'
  } else if (userProfile.account_type === 'vendor') {
    // Vendor messaging with RFP creator
    // Verify vendor has submitted a proposal
    const supabase = await (
      await import('@repo/database/server')
    ).createServerSupabaseClient()
    const { data: proposal } = await supabase
      .from('proposals')
      .select('id')
      .eq('rfp_id', params.id)
      .eq('vendor_id', userProfile.profile?.id)
      .single()

    if (!proposal) {
      return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-yellow-900 mb-2">
              No Access
            </h2>
            <p className="text-sm text-yellow-800">
              You need to submit a proposal before you can message the RFP
              creator.
            </p>
          </div>
        </div>
      )
    }

    recipientId = rfp.creator.user_id
    recipientName = rfp.creator.user.full_name
  } else {
    notFound()
  }

  // Fetch messages
  const messages = await getRFPMessages(params.id)

  // Filter messages between current user and recipient
  const {
    data: { user },
  } = await (
    await import('@repo/database/server')
  ).createServerSupabaseClient().then((s) => s.auth.getUser())

  if (!user) {
    redirect('/login')
  }

  const filteredMessages = messages.filter(
    (msg) =>
      (msg.sender.id === user.id && msg.recipient.id === recipientId) ||
      (msg.sender.id === recipientId && msg.recipient.id === user.id)
  )

  // Transform messages to match component interface
  const transformedMessages = filteredMessages.map((msg) => ({
    id: msg.id,
    content: msg.content,
    created_at: msg.created_at,
    read_at: msg.read_at,
    sender: {
      id: msg.sender.id,
      name: msg.sender.full_name,
      avatarUrl: msg.sender.avatar_url || undefined,
      accountType: msg.sender.account_type,
    },
    recipient: {
      id: msg.recipient.id,
      name: msg.recipient.full_name,
      avatarUrl: msg.recipient.avatar_url || undefined,
      accountType: msg.recipient.account_type,
    },
  }))

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <a
          href={`/rfps/${params.id}`}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          ← Back to RFP
        </a>
      </div>

      <div className="h-[calc(100vh-12rem)]">
        <MessagingInterfaceWrapper
          messages={transformedMessages}
          currentUserId={user.id}
          recipientId={recipientId}
          recipientName={recipientName}
          rfpId={params.id}
          rfpTitle={rfp.title}
        />
      </div>
    </div>
  )
}
