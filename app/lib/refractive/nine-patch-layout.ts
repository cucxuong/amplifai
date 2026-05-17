import type { NineSliceParts } from './refractive-core'

export interface FePatch {
  href: string
  x: number
  y: number
  width: number
  height: number
  result: string
}

export function displacementPatchImages(
  prefix: string,
  parts: NineSliceParts,
  widthPx: number,
  heightPx: number,
  cornerPx: number,
): FePatch[] {
  const r = cornerPx
  const w = widthPx
  const h = heightPx
  const v = w - r
  const yBottom = h - r
  return [
    { href: parts.topLeft, x: 0, y: 0, width: r, height: r, result: `${prefix}_topLeft` },
    { href: parts.top, x: 0, y: 0, width: w, height: r, result: `${prefix}_top` },
    { href: parts.topRight, x: v, y: 0, width: r, height: r, result: `${prefix}_topRight` },
    { href: parts.left, x: 0, y: 0, width: r, height: h, result: `${prefix}_left` },
    { href: parts.center, x: 0, y: 0, width: w, height: h, result: `${prefix}_base` },
    { href: parts.right, x: v, y: 0, width: r, height: h, result: `${prefix}_right` },
    { href: parts.bottomLeft, x: 0, y: yBottom, width: r, height: r, result: `${prefix}_bottomLeft` },
    { href: parts.bottom, x: 0, y: yBottom, width: w, height: r, result: `${prefix}_bottom` },
    { href: parts.bottomRight, x: v, y: yBottom, width: r, height: r, result: `${prefix}_bottomRight` },
  ]
}

/** Same order as package composite chain after string filter. */
export const NINE_PATCH_EDGE_ORDER = [
  'top',
  'left',
  'right',
  'bottom',
  'topLeft',
  'topRight',
  'bottomLeft',
  'bottomRight',
] as const
