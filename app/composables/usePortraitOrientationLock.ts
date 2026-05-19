type OrientationLockType = 'portrait' | 'portrait-primary' | 'portrait-secondary'

interface ScreenOrientationWithLock extends ScreenOrientation {
  lock(orientation: OrientationLockType): Promise<void>
}

function getLockableOrientation(): ScreenOrientationWithLock | undefined {
  const orientation = screen.orientation
  if (!orientation || !('lock' in orientation))
    return
  return orientation as ScreenOrientationWithLock
}

/**
 * Best-effort portrait lock via Screen Orientation API.
 * Often requires installed PWA / fullscreen; mobile Safari in a tab may ignore lock().
 */
export function usePortraitOrientationLock(
  mode: OrientationLockType = 'portrait',
) {
  if (!import.meta.client)
    return

  async function lock() {
    const orientation = getLockableOrientation()
    if (!orientation)
      return
    try {
      await orientation.lock(mode)
    }
    catch {
      // NotAllowedError: no gesture, not installable context, or unsupported browser
    }
  }

  onMounted(() => {
    void lock()
  })

  useEventListener(window, 'orientationchange', () => {
    void lock()
  })
}
