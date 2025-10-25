'use client'

import { useState } from 'react'
import { AccountTypeSelection } from './account-type-selection'
import { CommunityMemberForm } from './community-member-form'
import { VendorForm } from './vendor-form'

type Step = 'account-type' | 'profile'
type AccountType = 'community_member' | 'vendor' | null

export function OnboardingFlow({ userId }: { userId: string }) {
  const [step, setStep] = useState<Step>('account-type')
  const [accountType, setAccountType] = useState<AccountType>(null)

  function handleAccountTypeSelect(type: 'community_member' | 'vendor') {
    setAccountType(type)
    setStep('profile')
  }

  function handleBack() {
    setStep('account-type')
    setAccountType(null)
  }

  return (
    <div className="bg-white px-6 py-8 shadow sm:rounded-lg sm:px-12">
      {step === 'account-type' && (
        <AccountTypeSelection onSelect={handleAccountTypeSelect} />
      )}

      {step === 'profile' && accountType === 'community_member' && (
        <CommunityMemberForm userId={userId} onBack={handleBack} />
      )}

      {step === 'profile' && accountType === 'vendor' && (
        <VendorForm userId={userId} onBack={handleBack} />
      )}
    </div>
  )
}
