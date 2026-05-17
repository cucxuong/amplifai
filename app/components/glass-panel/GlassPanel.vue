<script setup lang="ts">
/**
 * Refractive liquid glass (HASH / @hashintel/refractive–style SVG + backdrop-filter).
 * Chromium: refraction via SVG filter. Others: .bg-glass-*.
 */
import type { CSSProperties } from 'vue'
import GlassPanelRefractiveFilter from './GlassPanelRefractiveFilter.vue'

export type GlassRefraction = {
  radius?: number
  blur?: number
  glassThickness?: number
  bezelWidth?: number
  refractiveIndex?: number
  specularOpacity?: number
  specularAngle?: number
  pixelRatio?: number
  scaleRatio?: number
}

const props = withDefaults(
  defineProps<{
    as?: 'div' | 'button'
    mode?: 'auto' | 'refractive' | 'css'
    variant?: 'light' | 'dark'
    selected?: boolean
    refraction?: GlassRefraction
    /** Merged onto root (e.g. `position`, `left` / `top` for drag). Keep backdrop on same node as position. */
    rootStyle?: CSSProperties
    type?: 'button' | 'submit' | 'reset'
    class?: string
    contentClass?: string
  }>(),
  {
    as: 'div',
    mode: 'refractive',
    variant: 'light',
    selected: false,
    refraction: () => ({}),
    type: 'button',
    class: '',
    contentClass: '',
  },
)

/** Avoid SSR vs client hydration mismatch on the refractive branch. */
const clientReady = ref(false)
onMounted(() => {
  clientReady.value = true
})

const refractiveEngineOk = useRefractiveBackdropSupported()

const isRefractiveActive = computed(() => {
  if (!clientReady.value)
    return false
  if (props.mode === 'css')
    return false
  if (props.mode === 'refractive')
    return true
  return refractiveEngineOk.value
})

const filterDomId = `rf-${useId().replace(/[^a-zA-Z0-9_-]/g, '_')}`

const rootRef = useTemplateRef<HTMLElement>('rootRef')
const { width, height } = useElementSize(rootRef)

/**
 * Values for `GlassPanelRefractiveFilter` (HASH refractive-style maps). Set with `:refraction="{ ... }"`.
 * Only affects the refractive branch (`mode` not `css`, browser supports SVG `backdrop-filter`, etc.).
 */
const r = computed(() => ({
  /** Corner radius in px — match Tailwind radius (e.g. 16 ≈ `rounded-2xl`); use a larger value for circular buttons. */
  radius: props.refraction?.radius ?? 16,
  /** `feGaussianBlur` std deviation on the backdrop before displacement; 0 = refraction without extra frosted blur. */
  blur: props.refraction?.blur ?? 2,
  /** Virtual glass depth used in radial displacement precompute; higher ≈ stronger bend along edges. */
  glassThickness: props.refraction?.glassThickness ?? 70,
  /** Bezel width in px in the displacement map (squircle edge band); 0 uses circular edge only. */
  bezelWidth: props.refraction?.bezelWidth ?? 8,
  /** Index of refraction (IOR); typical glass ~1.45–1.55. Higher bends light more in the displacement field. */
  refractiveIndex: props.refraction?.refractiveIndex ?? 1.48,
  /** Specular highlight strength after luminance→alpha (`feFuncA` slope); 0–1 range typical. */
  specularOpacity: props.refraction?.specularOpacity ?? 0.21,
  /** Highlight direction in radians (light angle on the specular map). */
  specularAngle: props.refraction?.specularAngle ?? Math.PI / 4,
  /** Supersample factor when rasterizing corner tiles; higher = sharper maps, more CPU and data URLs. */
  pixelRatio: props.refraction?.pixelRatio ?? 6,
  /** Multiplier on `feDisplacementMap` scale (same as HASH `scaleRatio`); >1 exaggerates refraction. */
  scaleRatio: props.refraction?.scaleRatio ?? 0.1,
}))

const glassInsetShadowLight = '0px -4px 20px 0px hsla(26, 100%, 50%, 0.2) inset, 0px 4px 20px 0px hsla(220, 100%, 50%, 0.5) inset'
const glassInsetShadowDark = glassInsetShadowLight

const glassTint = computed(() =>
  props.variant === 'dark'
    ? 'hsla(233, 81%, 10%, 0.35)'
    : 'hsla(0, 0%, 100%, 0.18)',
)

const refractionBackdrop = computed(() => {
  if (!isRefractiveActive.value)
    return {}
  const u = `url(#${filterDomId})`
  return {
    backdropFilter: u,
    WebkitBackdropFilter: u,
    backgroundColor: glassTint.value,
    boxShadow: props.variant === 'dark' ? glassInsetShadowDark : glassInsetShadowLight,
  } as Record<string, string>
})

/** Backdrop-filter on root (same box as border-radius) avoids nested stacking quirks with inner layers. */
const mergedRootStyle = computed(() => ({
  borderRadius: `${r.value.radius}px`,
  ...refractionBackdrop.value,
  ...props.rootStyle,
}))
</script>

<template>
  <ClientOnly>
    <component
      :is="as"
      ref="rootRef"
      :type="as === 'button' ? type : undefined"
      :class="[
        'relative isolate min-h-11 overflow-hidden rounded-2xl transition-[box-shadow,ring] duration-200',
        selected
          ? 'ring-2 ring-pink-400/90 shadow-[0_0_22px_rgba(244,114,182,0.45)]'
          : '',
        props.class,
      ]"
      :style="mergedRootStyle"
    >
      <GlassPanelRefractiveFilter
        v-if="isRefractiveActive && width > 0 && height > 0"
        :filter-id="filterDomId"
        :width="width"
        :height="height"
        :radius="r.radius"
        :blur="r.blur"
        :glass-thickness="r.glassThickness"
        :bezel-width="r.bezelWidth"
        :refractive-index="r.refractiveIndex"
        :specular-opacity="r.specularOpacity"
        :specular-angle="r.specularAngle"
        :pixel-ratio="r.pixelRatio"
        :scale-ratio="r.scaleRatio"
      />
      <div
        v-if="!isRefractiveActive"
        class="absolute inset-0 z-0"
        :class="variant === 'dark' ? 'bg-glass-dark' : 'bg-glass-light'"
        aria-hidden="true"
      />
      <div
        :class="[
          'relative z-10 flex min-h-[inherit] w-full items-center justify-center gap-3 px-4 py-3',
          contentClass,
        ]"
      >
        <slot />
      </div>
    </component>
  </ClientOnly>
</template>
