import { BrowserQRCodeReader } from '@zxing/browser'
import type { IScannerControls } from '@zxing/browser'

export type QrScannerStatus = 'idle' | 'scanning' | 'permission_denied' | 'error'

const BACK_LABEL_RE = /back|rear|environment/i
const FRONT_LABEL_RE = /front|user|selfie|facetime/i
const MOBILE_UA_RE = /iPhone|iPad|iPod|Android/i

/** Reuse same rear camera across stop/start (retry) within the session. */
let preferredBackDeviceId: string | undefined

function isFrontCamera(device: MediaDeviceInfo) {
  return FRONT_LABEL_RE.test(device.label)
}

function isBackCamera(device: MediaDeviceInfo) {
  return BACK_LABEL_RE.test(device.label) && !isFrontCamera(device)
}

async function probeEnvironmentDeviceId(
  facingMode: ConstrainDOMString,
): Promise<string | undefined> {
  let stream: MediaStream | undefined
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode },
    })
    const deviceId = stream.getVideoTracks()[0]?.getSettings().deviceId
    return deviceId || undefined
  } catch {
    return undefined
  } finally {
    stream?.getTracks().forEach(track => track.stop())
  }
}

async function probeBackCameraDeviceId(): Promise<string | undefined> {
  const ideal = await probeEnvironmentDeviceId({ ideal: 'environment' })
  if (ideal) return ideal
  return probeEnvironmentDeviceId({ exact: 'environment' })
}

function pickFromLabels(devices: MediaDeviceInfo[]): string | undefined {
  const back = devices.find(isBackCamera)
  if (back) return back.deviceId

  const notFront = devices.filter(d => !isFrontCamera(d))
  if (notFront.length > 0) return notFront[0].deviceId

  return undefined
}

function pickSafeFallback(devices: MediaDeviceInfo[]): string | undefined {
  if (devices.length === 0) return undefined
  if (devices.length >= 2 && MOBILE_UA_RE.test(navigator.userAgent))
    return devices[devices.length - 1].deviceId
  return devices[devices.length - 1]?.deviceId
}

/** Prefer environment (rear) camera; avoid devices[0] on iOS (often front). */
export async function resolveBackCameraDeviceId(): Promise<string | undefined> {
  if (preferredBackDeviceId) return preferredBackDeviceId

  const probed = await probeBackCameraDeviceId()
  if (probed) {
    preferredBackDeviceId = probed
    return probed
  }

  const devices = await BrowserQRCodeReader.listVideoInputDevices()
  const fromLabel = pickFromLabels(devices)
  if (fromLabel) {
    preferredBackDeviceId = fromLabel
    return fromLabel
  }

  const fallback = pickSafeFallback(devices)
  if (fallback) preferredBackDeviceId = fallback
  return fallback
}

export function useQrScanner(options: {
  videoRef: Ref<HTMLVideoElement | null | undefined>
  onDecode: (text: string) => void
}) {
  const status = ref<QrScannerStatus>('idle')
  let reader: BrowserQRCodeReader | null = null
  let controls: IScannerControls | null = null

  async function start() {
    if (!import.meta.client) return

    const video = options.videoRef.value
    if (!video) return

    stop()

    try {
      reader = new BrowserQRCodeReader()
      const deviceId = await resolveBackCameraDeviceId()

      if (!deviceId) {
        status.value = 'error'
        return
      }

      status.value = 'scanning'
      controls = await reader.decodeFromVideoDevice(
        deviceId,
        video,
        (result, err) => {
          if (result) options.onDecode(result.getText())
          // NotFoundException while scanning is expected — ignore
          if (err && !(err.name === 'NotFoundException')) {
            console.warn('[useQrScanner]', err)
          }
        },
      )
    } catch (e) {
      if (
        e instanceof DOMException
        && (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError')
      ) {
        status.value = 'permission_denied'
      } else {
        status.value = 'error'
      }
    }
  }

  function stop() {
    controls?.stop()
    controls = null
    reader = null
    if (status.value === 'scanning') status.value = 'idle'
  }

  onUnmounted(stop)

  return { status, start, stop }
}
