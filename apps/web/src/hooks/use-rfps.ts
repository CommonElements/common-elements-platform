'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { getRFPs, getRFP } from '@repo/database'

/**
 * Hook to fetch RFPs with filters
 */
export function useRFPs(filters?: {
  status?: string
  category?: string
  visibility?: 'public' | 'private'
  limit?: number
  offset?: number
}) {
  return useQuery({
    queryKey: queryKeys.rfps.list(filters),
    queryFn: () => getRFPs(filters),
    staleTime: 3 * 60 * 1000, // 3 minutes
  })
}

/**
 * Hook to fetch a single RFP with details
 */
export function useRFP(rfpId: string) {
  return useQuery({
    queryKey: queryKeys.rfps.detail(rfpId),
    queryFn: () => getRFP(rfpId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch proposals for an RFP
 */
export function useRFPProposals(rfpId: string) {
  return useQuery({
    queryKey: queryKeys.rfps.proposals(rfpId),
    queryFn: async () => {
      // This would be implemented in the database package
      // For now, return empty array as placeholder
      return []
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook to fetch messages for an RFP
 */
export function useRFPMessages(rfpId: string) {
  return useQuery({
    queryKey: queryKeys.rfps.messages(rfpId),
    queryFn: async () => {
      // This would be implemented in the database package
      // For now, return empty array as placeholder
      return []
    },
    staleTime: 30 * 1000, // 30 seconds - messages should be fresh
    refetchInterval: 30 * 1000, // Poll every 30 seconds for new messages
  })
}
