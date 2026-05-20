/**
 * Shared scan → check-in resolution for agenda sessions and AMPQR campaigns.
 */
export function useQrScanCheckIn(getSessionId?: () => string | undefined) {
  const agendaStore = useAgendaStore()
  const qrStore = useQrCampaignsStore()
  const { isInUserCalendar, toggleSchedule } = useAgendaSchedule()

  function validate(text: string) {
    const sessionId = getSessionId?.()
    const target = resolveQrScan(text)
    if (!target) return { ok: false as const }

    if (target.type === 'campaign') {
      const campaign = qrStore.getByCode(target.code)
      if (!campaign || !qrStore.canRedeem(target.code))
        return { ok: false as const }
      return { ok: true as const, target, campaign }
    }

    const item = agendaStore.items.find(i => i.id === target.id)
    if (!item || (sessionId && sessionId !== target.id))
      return { ok: false as const }

    return { ok: true as const, target, item }
  }

  function complete(text: string) {
    const result = validate(text)
    if (!result.ok) return false

    if (result.target.type === 'campaign') {
      qrStore.redeem(result.target.code)
      navigateTo(`/checkin/${result.target.code}`)
      return true
    }

    if (!isInUserCalendar(result.target.id))
      toggleSchedule(result.target.id)
    navigateTo(`/checkin/${result.target.id}`)
    return true
  }

  return { validate, complete }
}
