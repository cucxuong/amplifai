import { QR_CAMPAIGN_CODE_PATTERN } from '~/stores/qrCampaigns'

export type QrScanTarget =
  | { type: 'agenda'; id: string }
  | { type: 'campaign'; code: string }

export function normalizeQrCampaignCode(text: string): string | null {
  const upper = text.trim().toUpperCase()
  const match = upper.match(QR_CAMPAIGN_CODE_PATTERN)
  return match ? match[0] : null
}

/** Extract agenda item id from raw QR text or check-in URL paths. */
export function parseAgendaIdFromQr(text: string): string {
  const target = resolveQrScan(text)
  if (target?.type === 'agenda') return target.id
  if (target?.type === 'campaign') return target.code
  return text.trim()
}

/** Resolve scanned payload to agenda session or AMPQR campaign. */
export function resolveQrScan(text: string): QrScanTarget | null {
  const trimmed = text.trim()
  if (!trimmed) return null

  const campaignFromText = normalizeQrCampaignCode(trimmed)
  if (campaignFromText)
    return { type: 'campaign', code: campaignFromText }

  try {
    const url = trimmed.includes('://')
      ? new URL(trimmed)
      : new URL(trimmed.startsWith('/') ? trimmed : `/${trimmed}`, 'https://amplif.ai')

    const qrPath = url.pathname.match(/\/qr\/(AMPQR-[A-Z0-9]{10})/i)
    if (qrPath?.[1]) {
      const code = normalizeQrCampaignCode(qrPath[1])
      if (code) return { type: 'campaign', code }
    }

    const codeParam = url.searchParams.get('code') ?? url.searchParams.get('qr')
    if (codeParam) {
      const code = normalizeQrCampaignCode(codeParam)
      if (code) return { type: 'campaign', code }
    }

    const sessionMatch = url.pathname.match(/\/(?:checkin|scan)\/([^/]+)/)
    if (sessionMatch?.[1]) {
      const segment = sessionMatch[1]
      const campaign = normalizeQrCampaignCode(segment)
      if (campaign) return { type: 'campaign', code: campaign }
      return { type: 'agenda', id: segment }
    }
  } catch {
    // not a URL
  }

  const pathMatch = trimmed.match(/\/(?:checkin|scan|qr)\/([^/\s?#]+)/i)
  if (pathMatch?.[1]) {
    const segment = pathMatch[1]
    const campaign = normalizeQrCampaignCode(segment)
    if (campaign) return { type: 'campaign', code: campaign }
    return { type: 'agenda', id: segment }
  }

  const embeddedCampaign = trimmed.match(/(AMPQR-[A-Z0-9]{10})/i)
  if (embeddedCampaign?.[1]) {
    const code = normalizeQrCampaignCode(embeddedCampaign[1])
    if (code) return { type: 'campaign', code }
  }

  return { type: 'agenda', id: trimmed }
}
