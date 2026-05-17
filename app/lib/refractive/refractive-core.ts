/**
 * Ported from @hashintel/refractive (MIT OR Apache-2.0)
 * https://github.com/hashintel/hash/tree/main/libs/%40hashintel/refractive
 * Do not import React package in production — logic only.
 */

/** Squircle / Apple-style bezel profile */
export function convex(x: number): number {
  return (1 - (1 - x) ** 4) ** (1 / 4)
}

export function convexCircle(x: number): number {
  return Math.sqrt(1 - (1 - x) ** 2)
}

export function concave(x: number): number {
  return 1 - convexCircle(x)
}

export function lip(x: number): number {
  const a = convex(x * 2)
  const b = concave(x) + 0.1
  const r = 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3
  return a * (1 - r) + b * r
}

type ProcessPixel = (
  dx: number,
  dy: number,
  data: Uint8ClampedArray,
  di: number,
  distToCenter: number,
  t: number,
  norm: number,
  ang: number,
  fac: number,
) => void

interface CircleMapOpts {
  width: number
  height: number
  radius: number
  maximumDistanceToBorder?: number
  fillColor: number
  processPixel: ProcessPixel
}

function calculateCircleMap(opts: CircleMapOpts): ImageData {
  const { processPixel: n, maximumDistanceToBorder: maxDist } = opts
  const i = Math.round(opts.width)
  const a = Math.round(opts.height)
  const o = new ImageData(i, a)
  new Uint32Array(o.data.buffer).fill(opts.fillColor)
  const s = Math.min(opts.radius, i / 2, a / 2)
  const c = i - s * 2
  const l = a - s * 2
  const u = s ** 2
  const d = (s + 1) ** 2
  const f = maxDist ? (s - maxDist) ** 2 : 0
  for (let e = 0; e < a; e++) {
    for (let t = 0; t < i; t++) {
      const r = (e * i + t) * 4
      const p = t < s
      const m = t >= i - s
      const h = e < s
      const g = e >= a - s
      const _ = p ? t - s : m ? t - s - c : 0
      const v = h ? e - s : g ? e - s - l : 0
      const y = _ * _ + v * v
      if (y <= d && y >= f) {
        const distBorder = Math.sqrt(y)
        const tFrac = s - distBorder
        const iFrac = tFrac / s
        const aAng = Math.atan2(v, _)
        const cFac = y > u ? 1 - tFrac : 1
        n(_, v, o.data, r, distBorder, tFrac, iFrac, aAng, cFac)
      }
    }
  }
  return o
}

/** Corner vector helper: (innerR, outerR, nx, ny) = package (e,t,n,r). */
function insetCornerVector(innerR: number, outerR: number, nx: number, ny: number): [number, number] {
  const i = Math.atan2(outerR - innerR, outerR)
  const a = Math.atan2(outerR, outerR - innerR)
  const o = a - i
  const s = Math.atan2(Math.abs(ny), Math.abs(nx))
  if (s <= i || s >= a) {
    return Math.abs(ny) > Math.abs(nx)
      ? [Math.abs(nx / ny) * outerR * Math.sign(nx), outerR * Math.sign(ny)]
      : [outerR * Math.sign(nx), Math.abs(ny / nx) * outerR * Math.sign(ny)]
  }
  else {
    const a2 = (s - i) / (o / (Math.PI / 2))
    const c = Math.cos(a2)
    const l = Math.sin(a2)
    return [(outerR - innerR + c * innerR) * Math.sign(nx), (outerR - innerR + l * innerR) * Math.sign(ny)]
  }
}

interface RoundedMapOpts extends CircleMapOpts {
  maximumDistanceToBorder: number
}

function calculateRoundedRectMap(opts: RoundedMapOpts): ImageData {
  if (
    opts.maximumDistanceToBorder === undefined
    || opts.maximumDistanceToBorder <= opts.radius
  ) {
    return calculateCircleMap(opts)
  }
  const { processPixel: n } = opts
  const r = Math.round(opts.width)
  const i = Math.round(opts.height)
  const a = new ImageData(r, i)
  new Uint32Array(a.data.buffer).fill(opts.fillColor)
  const o = Math.min(opts.radius, r / 2, i / 2)
  const s = Math.max(o, Math.min(opts.maximumDistanceToBorder, r / 2, i / 2))
  const c = r - s * 2
  const l = i - s * 2
  const u = (o + 1) ** 2
  for (let e = 0; e < i; e++) {
    for (let t = 0; t < r; t++) {
      const d = (e * r + t) * 4
      const f = t < s
      const p = t >= r - s
      const h = e < s
      const g = e >= i - s
      const _ = f ? t - s : p ? t - s - c : 0
      const v = h ? e - s : g ? e - s - l : 0
      const [y, b] = insetCornerVector(o, s, _, v)
      const x = _ * _ + v * v
      const S = (y - _) ** 2 + (b - v) ** 2
      const C = Math.abs(_) > s - o && Math.abs(v) > s - o
      const w = C && (Math.abs(_) - (s - o)) ** 2 + (Math.abs(v) - (s - o)) ** 2 >= u
      if (!C || !w) {
        const dist0 = Math.sqrt(x)
        const dist1 = Math.sqrt(S)
        const ratio = dist1 / (dist0 + dist1)
        const ang = Math.atan2(v, _)
        const fac = w ? 1 - dist1 : 1
        n(_, v, a.data, d, dist0, dist1, ratio, ang, fac)
      }
    }
  }
  return a
}

export function precomputeDisplacementRadial(
  glassThickness = 200,
  bezelWidth = 50,
  bezelHeightFn: (x: number) => number = convex,
  refractiveIndex = 1.5,
  samples = 128,
): number[] {
  const invN = 1 / refractiveIndex
  function refractDir(ex: number, ey: number): [number, number] | null {
    const ny = ey
    const disc = 1 - invN * invN * (1 - ny * ny)
    if (disc < 0)
      return null
    const sq = Math.sqrt(disc)
    return [-(invN * ny + sq) * ex, invN - (invN * ny + sq) * ey]
  }
  return Array.from({ length: samples }, (_, idx) => {
    const s = idx / samples
    const h = bezelHeightFn(s)
    const delta = s < 1 ? 1e-4 : -1e-4
    const deriv = (bezelHeightFn(s + delta) - h) / delta
    const normLen = Math.sqrt(deriv * deriv + 1)
    const normal = [-deriv / normLen, -1 / normLen]
    const p = refractDir(normal[0], normal[1])
    if (p) {
      const thickness = h * bezelWidth + glassThickness
      return p[0] * (thickness / p[1])
    }
    return 0
  })
}

export interface BuildDisplacementMapOpts {
  width: number
  height: number
  radius: number
  bezelWidth: number
  maximumDisplacement: number
  precomputedDisplacementMap: number[]
  pixelRatio: number
}

export function buildDisplacementMap(opts: BuildDisplacementMapOpts): ImageData {
  const { pixelRatio: t, maximumDisplacement: n, precomputedDisplacementMap: r } = opts
  const i = Math.round(opts.width * t)
  const a = Math.round(opts.height * t)
  const o = Math.min(opts.radius * t, i / 2, a / 2)
  const s = Math.min(opts.bezelWidth * t, i / 2, a / 2)
  const fillColor = 4278222976
  return calculateRoundedRectMap({
    width: i,
    height: a,
    radius: o,
    maximumDistanceToBorder: s,
    fillColor,
    processPixel(dx, dy, data, di, c, l, u, d, f) {
      const p = Math.cos(d)
      const m = Math.sin(d)
      const h = s > o ? u : l / s
      const g = r[Math.round(h * r.length)] ?? 0
      const _ = -p * g / n
      const v = -m * g / n
      data[di] = 128 + _ * 127 * f
      data[di + 1] = 128 + v * 127 * f
      data[di + 2] = 0
      data[di + 3] = 255
    },
  })
}

const SPECULAR_BEZEL = 20

export interface BuildSpecularMapOpts {
  width: number
  height: number
  radius: number
  specularAngle: number
  pixelRatio: number
}

export function buildSpecularMap(opts: BuildSpecularMapOpts): ImageData {
  const { pixelRatio: t, specularAngle: n } = opts
  const r = Math.round(opts.width * t)
  const i = Math.round(opts.height * t)
  const a = Math.min(opts.radius * t, r / 2, i / 2)
  const o = [Math.cos(n), Math.sin(n)]
  return calculateCircleMap({
    width: r,
    height: i,
    fillColor: 0,
    radius: a,
    maximumDistanceToBorder: SPECULAR_BEZEL * t,
    processPixel(e, n, r, i, s, c, l, u, d) {
      const f = a - s
      const p = e / s
      const m = -n / s
      const h = Math.abs(p * o[0] + m * o[1]) * Math.sqrt(1 - (1 - f / (1 * t)) ** 2)
      const g = 255 * h
      const _ = g * h * d
      r[i] = g
      r[i + 1] = g
      r[i + 2] = g
      r[i + 3] = _
    },
  })
}

export function imageDataToDataUrl(
  image: ImageData,
  canvasWidth?: number,
  canvasHeight?: number,
  offsetX = 0,
  offsetY = 0,
): string {
  const c = document.createElement('canvas')
  c.width = canvasWidth ?? image.width
  c.height = canvasHeight ?? image.height
  const ctx = c.getContext('2d')
  if (!ctx)
    throw new Error('2d')
  ctx.putImageData(image, -offsetX, -offsetY)
  return c.toDataURL()
}

export interface NineSliceParts {
  topLeft: string
  top: string
  topRight: string
  left: string
  center: string
  right: string
  bottomLeft: string
  bottom: string
  bottomRight: string
}

export function splitImageDataToNineParts(image: ImageData, cornerWidth: number, pixelRatio: number): NineSliceParts {
  const n = cornerWidth * pixelRatio
  const r = 1 * pixelRatio
  if (image.width !== n * 2 + r)
    throw new Error('ImageData width is too small for the given corner width')
  if (image.height !== image.width)
    throw new Error('ImageData should be square')
  return {
    topLeft: imageDataToDataUrl(image, n, n, 0, 0),
    top: imageDataToDataUrl(image, r, n, n, 0),
    topRight: imageDataToDataUrl(image, n, n, n + r, 0),
    left: imageDataToDataUrl(image, n, r, 0, n),
    center: imageDataToDataUrl(image, r, r, n, n),
    right: imageDataToDataUrl(image, n, r, n + r, n),
    bottomLeft: imageDataToDataUrl(image, n, n, 0, n + r),
    bottom: imageDataToDataUrl(image, r, n, n, n + r),
    bottomRight: imageDataToDataUrl(image, n, n, n + r, n + r),
  }
}
