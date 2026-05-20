/** Printed / booth QR campaigns (admin: QR Point Campaigns). */
export interface QrCampaign {
  code: string
  name: string
  description?: string
  category: 'activity' | 'booth'
  sparks: number
  /** Max redemptions per user; omit = unlimited */
  maxScansPerUser?: number
}

export const QR_CAMPAIGN_CODE_PATTERN = /^AMPQR-[A-Z0-9]{10}$/i

export const useQrCampaignsStore = defineStore('qrCampaigns', () => {
  const campaigns = ref<QrCampaign[]>([
    {
      code: 'AMPQR-2EFR7813TZ',
      name: 'test',
      category: 'activity',
      sparks: 20,
    },
    {
      code: 'AMPQR-628EGNAJHN',
      name: 'QR game',
      description: 'Printed Booth QR - +20 points',
      category: 'booth',
      sparks: 20,
      maxScansPerUser: 1,
    },
  ])

  const redeemedByUser = ref<Record<string, string[]>>({})

  function normalizeCode(code: string) {
    return code.trim().toUpperCase()
  }

  function getByCode(raw: string): QrCampaign | undefined {
    const code = normalizeCode(raw)
    return campaigns.value.find(c => c.code === code)
  }

  function userRedemptions(userKey: string, code: string) {
    return redeemedByUser.value[userKey]?.filter(c => c === code).length ?? 0
  }

  function canRedeem(code: string, userKey = 'default') {
    const campaign = getByCode(code)
    if (!campaign) return false
    if (campaign.maxScansPerUser == null) return true
    return userRedemptions(userKey, campaign.code) < campaign.maxScansPerUser
  }

  function redeem(code: string, userKey = 'default') {
    const normalized = normalizeCode(code)
    if (!canRedeem(normalized, userKey)) return false
    const list = redeemedByUser.value[userKey] ?? []
    redeemedByUser.value[userKey] = [...list, normalized]
    return true
  }

  return {
    campaigns,
    getByCode,
    canRedeem,
    redeem,
    normalizeCode,
  }
})
