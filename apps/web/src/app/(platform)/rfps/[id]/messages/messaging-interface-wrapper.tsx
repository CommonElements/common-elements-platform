'use client'

import { useState, useEffect, useCallback } from 'react'
import { MessagingInterface, type Message } from '@repo/ui'
import { sendMessage, markMessagesAsRead } from './actions'
import { useRouter } from 'next/navigation'

interface MessagingInterfaceWrapperProps {
  messages: Message[]
  currentUserId: string
  recipientId: string
  recipientName: string
  rfpId: string
  rfpTitle: string
}

export function MessagingInterfaceWrapper({
  messages: initialMessages,
  currentUserId,
  recipientId,
  recipientName,
  rfpId,
  rfpTitle,
}: MessagingInterfaceWrapperProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const router = useRouter()

  // Poll for new messages every 5 seconds
  useEffect(() => {
    const pollInterval = setInterval(() => {
      router.refresh()
    }, 5000)

    return () => clearInterval(pollInterval)
  }, [router])

  // Update messages when initialMessages change (from polling)
  useEffect(() => {
    setMessages(initialMessages)
  }, [initialMessages])

  // Mark messages as read when component mounts or messages change
  useEffect(() => {
    const unreadMessages = messages.filter(
      (msg) =>
        msg.recipient.id === currentUserId &&
        msg.sender.id === recipientId &&
        !msg.read_at
    )

    if (unreadMessages.length > 0) {
      markMessagesAsRead(rfpId, recipientId)
    }
  }, [messages, currentUserId, recipientId, rfpId])

  const handleSendMessage = useCallback(
    async (content: string) => {
      // Optimistic update
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        content,
        created_at: new Date().toISOString(),
        read_at: null,
        sender: {
          id: currentUserId,
          name: 'You',
          accountType: 'unknown',
        },
        recipient: {
          id: recipientId,
          name: recipientName,
          accountType: 'unknown',
        },
      }

      setMessages((prev) => [...prev, optimisticMessage])

      // Send message to server
      const result = await sendMessage(rfpId, recipientId, content)

      if (!result.success) {
        // Remove optimistic message on error
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== optimisticMessage.id)
        )
        throw new Error(result.error || 'Failed to send message')
      }

      // Replace optimistic message with real message
      if (result.data) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === optimisticMessage.id
              ? {
                  id: result.data.id,
                  content: result.data.content,
                  created_at: result.data.created_at,
                  read_at: result.data.read_at,
                  sender: {
                    id: (result.data.sender as any).id,
                    name: (result.data.sender as any).full_name,
                    avatarUrl: (result.data.sender as any).avatar_url,
                    accountType: (result.data.sender as any).account_type,
                  },
                  recipient: {
                    id: (result.data.recipient as any).id,
                    name: (result.data.recipient as any).full_name,
                    avatarUrl: (result.data.recipient as any).avatar_url,
                    accountType: (result.data.recipient as any).account_type,
                  },
                }
              : msg
          )
        )
      }
    },
    [currentUserId, recipientId, recipientName, rfpId]
  )

  return (
    <MessagingInterface
      messages={messages}
      currentUserId={currentUserId}
      onSendMessage={handleSendMessage}
      recipientName={recipientName}
      rfpTitle={rfpTitle}
    />
  )
}
