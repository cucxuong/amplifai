/** Printed / booth admin QR — resolved via minisite /api/qr/redeem. */
export const QR_CAMPAIGN_CODE_PATTERN = /^AMPQR-[A-Z0-9]{10}$/i

/** Gift shop order pickup / payment — minisite POST /api/orders/redeem. */
export const ORDER_SHORT_ID_PATTERN = /^AMP-\d{4}-[A-Z0-9]{6}$/i

/** Session / booth check-in — minisite POST /api/check-in (excludes AMPQR and order IDs). */
export const SESSION_CHECKIN_CODE_PATTERN = /^AMP-(?!QR)[A-Z0-9-]+$/i

export type QrScanTarget =
  | { type: 'checkin'; qrCode: string }
  | { type: 'agenda'; id: string }
  | { type: 'campaign'; code: string }
  | { type: 'order'; shortId: string }

export function normalizeQrCampaignCode(text: string): string | null {
  const upper = text.trim().toUpperCase()
  const match = upper.match(QR_CAMPAIGN_CODE_PATTERN)
  return match ? match[0] : null
}

export function normalizeOrderShortId(text: string): string | null {
  const upper = text.trim().toUpperCase()
  const match = upper.match(ORDER_SHORT_ID_PATTERN)
  return match ? match[0] : null
}

/** Minisite session/booth check-in codes (AMP-D1-OPEN01, AMP-BTH-AIBT1, AMP-XXXXXXXX). */
export function normalizeCheckInQrCode(text: string): string | null {
  const upper = text.trim().toUpperCase()
  if (upper.startsWith('AMPQR-'))
    return null
  if (ORDER_SHORT_ID_PATTERN.test(upper))
    return null
  const match = upper.match(SESSION_CHECKIN_CODE_PATTERN)
  return match ? match[0] : null
}

function resolveSegment(segment: string): QrScanTarget | null {
  const campaign = normalizeQrCampaignCode(segment)
  if (campaign)
    return { type: 'campaign', code: campaign }

  const order = normalizeOrderShortId(segment)
  if (order)
    return { type: 'order', shortId: order }

  const checkIn = normalizeCheckInQrCode(segment)
  if (checkIn)
    return { type: 'checkin', qrCode: checkIn }

  return { type: 'agenda', id: segment }
}

/** Extract agenda item id from raw QR text or check-in URL paths. */
export function parseAgendaIdFromQr(text: string): string {
  const target = resolveQrScan(text)
  if (target?.type === 'agenda')
    return target.id
  if (target?.type === 'campaign')
    return target.code
  if (target?.type === 'checkin')
    return target.qrCode
  if (target?.type === 'order')
    return target.shortId
  return text.trim()
}

/** Resolve scanned payload to minisite check-in, order, campaign, or legacy agenda id. */
export function resolveQrScan(text: string): QrScanTarget | null {
  const trimmed = text.trim()
  if (!trimmed)
    return null

  const campaignFromText = normalizeQrCampaignCode(trimmed)
  if (campaignFromText)
    return { type: 'campaign', code: campaignFromText }

  const orderFromText = normalizeOrderShortId(trimmed)
  if (orderFromText)
    return { type: 'order', shortId: orderFromText }

  const checkInCode = normalizeCheckInQrCode(trimmed)
  if (checkInCode)
    return { type: 'checkin', qrCode: checkInCode }

  try {
    const url = trimmed.includes('://')
      ? new URL(trimmed)
      : new URL(trimmed.startsWith('/') ? trimmed : `/${trimmed}`, 'https://amplif.ai')

    const qrPath = url.pathname.match(/\/qr\/(AMPQR-[A-Z0-9]{10})/i)
    if (qrPath?.[1]) {
      const code = normalizeQrCampaignCode(qrPath[1])
      if (code)
        return { type: 'campaign', code }
    }

    const codeParam = url.searchParams.get('code') ?? url.searchParams.get('qr')
    if (codeParam) {
      const campaign = normalizeQrCampaignCode(codeParam)
      if (campaign)
        return { type: 'campaign', code: campaign }
      const order = normalizeOrderShortId(codeParam)
      if (order)
        return { type: 'order', shortId: order }
      const checkIn = normalizeCheckInQrCode(codeParam)
      if (checkIn)
        return { type: 'checkin', qrCode: checkIn }
    }

    const sessionMatch = url.pathname.match(/\/(?:checkin|scan)\/([^/]+)/)
    if (sessionMatch?.[1])
      return resolveSegment(sessionMatch[1])
  }
  catch {
    // not a URL
  }

  const pathMatch = trimmed.match(/\/(?:checkin|scan|qr)\/([^/\s?#]+)/i)
  if (pathMatch?.[1])
    return resolveSegment(pathMatch[1])

  const embeddedCampaign = trimmed.match(/(AMPQR-[A-Z0-9]{10})/i)
  if (embeddedCampaign?.[1]) {
    const code = normalizeQrCampaignCode(embeddedCampaign[1])
    if (code)
      return { type: 'campaign', code }
  }

  const embeddedOrder = trimmed.match(/(AMP-\d{4}-[A-Z0-9]{6})/i)
  if (embeddedOrder?.[1]) {
    const shortId = normalizeOrderShortId(embeddedOrder[1])
    if (shortId)
      return { type: 'order', shortId }
  }

  const embeddedCheckIn = trimmed.match(/(AMP-(?!QR)[A-Z0-9-]+)/i)
  if (embeddedCheckIn?.[1]) {
    const qrCode = normalizeCheckInQrCode(embeddedCheckIn[1])
    if (qrCode)
      return { type: 'checkin', qrCode: qrCode }
  }

  return { type: 'agenda', id: trimmed }
}
