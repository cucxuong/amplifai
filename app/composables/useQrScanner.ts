import type { BrowserQRCodeReader } from '@zxing/browser'
import { NotFoundException } from '@zxing/library'

export type QrScannerStatus = 'idle' | 'scanning' | 'permission_denied' | 'error'

const DEVICE_STORAGE_KEY = 'amplifai:preferredCameraId'
const DECODE_COOLDOWN_MS = 500
const SCAN_INTERVAL_MS = 100 // ~10 fps
const ROI_SIZE_PX = 302
const ROI_CROP_RATIO = 0.7

type ZxingBrowserModule = typeof import('@zxing/browser')
let zxingModule: ZxingBrowserModule | undefined
let zxingLoadPromise: Promise<ZxingBrowserModule> | undefined

type BarcodeDetectorLike = {
  detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue?: string }>>
}

/** Load @zxing/browser only when scan page starts camera (keeps main bundle lean). */
export async function prefetchQrScannerLibrary(): Promise<void> {
  await loadZxing()
}

async function loadZxing(): Promise<ZxingBrowserModule> {
  if (zxingModule)
    return zxingModule
  zxingLoadPromise ??= import('@zxing/browser').then((module) => {
    zxingModule = module
    return module
  })
  return zxingLoadPromise
}

function loadCachedDeviceId(): string | undefined {
  if (!import.meta.client)
    return undefined
  try {
    return sessionStorage.getItem(DEVICE_STORAGE_KEY) ?? undefined
  }
  catch {
    return undefined
  }
}

function cacheDeviceId(deviceId: string) {
  try {
    sessionStorage.setItem(DEVICE_STORAGE_KEY, deviceId)
  }
  catch {
    // ignore quota / private mode
  }
}

function buildVideoConstraints(deviceId?: string): MediaTrackConstraints {
  return {
    facingMode: deviceId ? undefined : { ideal: 'environment' },
    width: { ideal: 1280, max: 1920 },
    height: { ideal: 720, max: 1080 },
    ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
    // @ts-expect-error — focusMode supported on some mobile browsers
    focusMode: { ideal: 'continuous' },
  }
}

async function createBarcodeDetector(): Promise<BarcodeDetectorLike | null> {
  if (typeof window === 'undefined' || !('BarcodeDetector' in window))
    return null
  try {
    const Detector = (window as unknown as { BarcodeDetector: new (opts: { formats: string[] }) => BarcodeDetectorLike }).BarcodeDetector
    return new Detector({ formats: ['qr_code'] })
  }
  catch {
    return null
  }
}

async function openCameraStream(): Promise<MediaStream> {
  const cachedDeviceId = loadCachedDeviceId()
  const attempts: MediaStreamConstraints[] = []
  if (cachedDeviceId)
    attempts.push({ video: buildVideoConstraints(cachedDeviceId) })
  attempts.push({ video: buildVideoConstraints() })

  let lastError: unknown
  for (const constraints of attempts) {
    try {
      return await navigator.mediaDevices.getUserMedia(constraints)
    }
    catch (e) {
      lastError = e
    }
  }
  throw lastError
}

export function useQrScanner(options: {
  videoRef: Ref<HTMLVideoElement | null | undefined>
  onDecode: (text: string) => void
}) {
  const status = ref<QrScannerStatus>('idle')
  let reader: BrowserQRCodeReader | null = null
  let barcodeDetector: BarcodeDetectorLike | null = null
  let activeStream: MediaStream | null = null
  let rafId = 0
  let decodeLocked = false
  let lastDecodeAt = 0
  let lastScanAt = 0
  let scanning = false

  const canvas = import.meta.client ? document.createElement('canvas') : null
  const canvasCtx = canvas?.getContext('2d', { willReadFrequently: true }) ?? null

  function emitDecode(text: string) {
    const now = Date.now()
    if (decodeLocked || now - lastDecodeAt < DECODE_COOLDOWN_MS)
      return
    decodeLocked = true
    lastDecodeAt = now
    options.onDecode(text)
  }

  function drawRoiFrame(video: HTMLVideoElement): boolean {
    if (!canvas || !canvasCtx)
      return false
    if (video.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA)
      return false

    const vw = video.videoWidth
    const vh = video.videoHeight
    if (!vw || !vh)
      return false

    const cropW = vw * ROI_CROP_RATIO
    const cropH = vh * ROI_CROP_RATIO
    const sx = (vw - cropW) / 2
    const sy = (vh - cropH) / 2

    canvas.width = ROI_SIZE_PX
    canvas.height = ROI_SIZE_PX
    canvasCtx.drawImage(video, sx, sy, cropW, cropH, 0, 0, ROI_SIZE_PX, ROI_SIZE_PX)
    return true
  }

  function decodeWithZxing() {
    if (!reader || !canvas)
      return

    try {
      const result = reader.decodeFromCanvas(canvas)
      emitDecode(result.getText())
    }
    catch (e) {
      if (!(e instanceof NotFoundException))
        console.warn('[useQrScanner]', e)
    }
  }

  async function decodeWithNativeDetector() {
    if (!barcodeDetector || !canvas)
      return

    try {
      const barcodes = await barcodeDetector.detect(canvas)
      const value = barcodes[0]?.rawValue
      if (value)
        emitDecode(value)
    }
    catch {
      // fall through — ZXing runs on same canvas
    }
  }

  function scanFrame() {
    if (!scanning)
      return

    rafId = requestAnimationFrame(scanFrame)

    if (decodeLocked || !options.videoRef.value)
      return

    const now = performance.now()
    if (now - lastScanAt < SCAN_INTERVAL_MS)
      return
    lastScanAt = now

    const video = options.videoRef.value
    if (!drawRoiFrame(video))
      return

    if (barcodeDetector) {
      void decodeWithNativeDetector()
      if (!decodeLocked)
        decodeWithZxing()
    }
    else {
      decodeWithZxing()
    }
  }

  async function start() {
    if (!import.meta.client)
      return

    const video = options.videoRef.value
    if (!video)
      return

    stop()

    try {
      const { BrowserQRCodeReader } = await loadZxing()
      reader = new BrowserQRCodeReader(undefined, {
        delayBetweenScanAttempts: SCAN_INTERVAL_MS,
        delayBetweenScanSuccess: DECODE_COOLDOWN_MS,
      })
      barcodeDetector = await createBarcodeDetector()

      activeStream = await openCameraStream()
      video.srcObject = activeStream
      video.playsInline = true
      video.muted = true
      await video.play()

      const trackDeviceId = activeStream.getVideoTracks()[0]?.getSettings().deviceId
      if (trackDeviceId)
        cacheDeviceId(trackDeviceId)

      scanning = true
      status.value = 'scanning'
      lastScanAt = 0
      rafId = requestAnimationFrame(scanFrame)
    }
    catch (e) {
      if (
        e instanceof DOMException
        && (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError')
      ) {
        status.value = 'permission_denied'
      }
      else {
        status.value = 'error'
      }
    }
  }

  function stop() {
    scanning = false
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = 0
    }
    if (activeStream) {
      activeStream.getTracks().forEach(track => track.stop())
      activeStream = null
    }
    const video = options.videoRef.value
    if (video)
      video.srcObject = null
    reader = null
    barcodeDetector = null
    decodeLocked = false
    if (status.value === 'scanning')
      status.value = 'idle'
  }

  onUnmounted(stop)

  return { status, start, stop }
}
