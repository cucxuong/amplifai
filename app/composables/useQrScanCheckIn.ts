/**
 * Shared scan → check-in resolution for agenda sessions and AMPQR campaigns.
 */
export function useQrScanCheckIn(getSessionId?: () => string | undefined) {
  const agendaStore = useAgendaStore()
  const checkInStore = useCheckInStore()
  const { isInUserCalendar, toggleSchedule } = useAgendaSchedule()

  function validate(text: string) {
    const sessionId = getSessionId?.()
    const target = resolveQrScan(text)
    if (!target)
      return { ok: false as const }

    if (target.type === 'checkin' || target.type === 'campaign' || target.type === 'order')
      return { ok: true as const, target }

    const item = agendaStore.items.find(i => i.id === target.id)
    if (!item || (sessionId && sessionId !== target.id))
      return { ok: false as const }

    return { ok: true as const, target, item }
  }

  async function complete(text: string) {
    const result = validate(text)
    if (!result.ok)
      return false

    if (result.target.type === 'campaign') {
      const success = await checkInStore.redeemCampaignQr(result.target.code)
      if (!success)
        return false
      await navigateTo(`/checkin/${result.target.code}`)
      return true
    }

    if (result.target.type === 'order') {
      const success = await checkInStore.redeemOrderByShortId(result.target.shortId)
      if (!success)
        return false
      await navigateTo('/sparks')
      return true
    }

    if (result.target.type === 'checkin') {
      const success = await checkInStore.checkInByQr(result.target.qrCode)
      if (!success)
        return false
      await navigateTo(`/checkin/${checkInStore.lastSuccess?.routeId ?? result.target.qrCode}`)
      return true
    }

    // For agenda session check-in
    if (!isInUserCalendar(result.target.id))
      await toggleSchedule(result.target.id)

    // Call API to check in for the session
    const success = await checkInStore.checkInBySessionId(result.target.id)
    if (!success)
      return false

    await navigateTo(`/checkin/${result.target.id}`)
    return true
  }

  return { validate, complete }
}
