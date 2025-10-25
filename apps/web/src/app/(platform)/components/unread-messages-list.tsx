import { getUnreadMessagesByRFP } from '@repo/database'
import { MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { UserBadge } from '@repo/ui'

interface UnreadMessagesListProps {
  userId: string
}

export async function UnreadMessagesList({ userId }: UnreadMessagesListProps) {
  const unreadMessages = await getUnreadMessagesByRFP(userId)

  if (unreadMessages.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-400" />
        <p className="text-sm">No unread messages</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {unreadMessages.map((msg) => (
        <Link
          key={`${msg.rfpId}-${msg.senderId}`}
          href={`/rfps/${msg.rfpId}/messages?with=${msg.senderId}`}
          className="block bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <UserBadge
                  user={{
                    id: msg.senderId,
                    name: msg.senderName,
                    avatarUrl: msg.senderAvatar || undefined,
                  }}
                  size="sm"
                  showLocation={false}
                />
              </div>
              <p className="text-sm text-gray-600 truncate">{msg.rfpTitle}</p>
            </div>
            <div className="flex-shrink-0">
              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                {msg.count}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
