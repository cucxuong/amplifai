<script setup lang="ts">
/**
 * SVG filter defs for refractive glass (@hashintel/refractive algorithm).
 * Parent applies backdrop-filter: url(#filterId) on an absolute layer.
 */
import {
  NINE_PATCH_EDGE_ORDER,
  displacementPatchImages,
} from '~/lib/refractive/nine-patch-layout'
import {
  buildDisplacementMap,
  buildSpecularMap,
  convex,
  precomputeDisplacementRadial,
  splitImageDataToNineParts,
} from '~/lib/refractive/refractive-core'

const props = withDefaults(
  defineProps<{
    filterId: string
    width: number
    height: number
    radius: number
    blur: number
    glassThickness: number
    bezelWidth: number
    refractiveIndex: number
    specularOpacity: number
    specularAngle: number
    pixelRatio?: number
    scaleRatio?: number
  }>(),
  {
    pixelRatio: 6,
    scaleRatio: 1,
  },
)

const graph = computed(() => {
  if (
    !import.meta.client
    || props.width <= 0
    || props.height <= 0

  )
    return null

  const T = Math.max(props.radius, props.bezelWidth)
  const E = T * 2 + 1
  const pre = precomputeDisplacementRadial(
    props.glassThickness,
    props.bezelWidth,
    convex,
    props.refractiveIndex,
  )
  const maxD = Math.max(...pre.map(Math.abs))
  const dispImg = buildDisplacementMap({
    width: E,
    height: E,
    radius: props.radius,
    bezelWidth: props.bezelWidth,
    precomputedDisplacementMap: pre,
    maximumDisplacement: maxD,
    pixelRatio: props.pixelRatio,
  })
  const specImg = buildSpecularMap({
    width: E,
    height: E,
    radius: props.radius,
    specularAngle: props.specularAngle,
    pixelRatio: props.pixelRatio,
  })

  const partsD = splitImageDataToNineParts(dispImg, T, props.pixelRatio)
  const partsS = splitImageDataToNineParts(specImg, T, props.pixelRatio)

  const dispPatches = displacementPatchImages(
    'displacement_map',
    partsD,
    props.width,
    props.height,
    T,
  )
  const specPatches = displacementPatchImages(
    'specular_map',
    partsS,
    props.width,
    props.height,
    T,
  )

  const dispPrefix = 'displacement_map'
  const dispComposites = NINE_PATCH_EDGE_ORDER.map((edge, i, arr) => ({
    op: 'over' as const,
    in: `${dispPrefix}_${edge}`,
    in2: i === 0 ? `${dispPrefix}_base` : `${dispPrefix}_composite_${i - 1}`,
    result: i === arr.length - 1 ? dispPrefix : `${dispPrefix}_composite_${i}`,
  }))

  const specPrefix = 'specular_map'
  const specComposites = NINE_PATCH_EDGE_ORDER.map((edge, i, arr) => ({
    op: 'over' as const,
    in: `${specPrefix}_${edge}`,
    in2: i === 0 ? `${specPrefix}_base` : `${specPrefix}_composite_${i - 1}`,
    result: i === arr.length - 1 ? specPrefix : `${specPrefix}_composite_${i}`,
  }))

  const dispScale = maxD * props.scaleRatio

  return {
    dispPatches,
    dispComposites,
    specPatches,
    specComposites,
    dispScale,
  }
})
</script>

<template>
  <!-- HASH uses display:none on defs svg; opacity/1px caused unreliable filter resolution in some Chromium builds -->
  <svg
    v-if="graph"
    xmlns="http://www.w3.org/2000/svg"
    class="pointer-events-none fixed left-0 top-0"
    aria-hidden="true"
    color-interpolation-filters="sRGB"
    style="display: none"
  >
    <defs>
      <filter
        :id="filterId"
        color-interpolation-filters="sRGB"
      >
        <feGaussianBlur
          in="SourceGraphic"
          :stdDeviation="blur"
          result="blurred_source"
        />
        <feImage
          v-for="p in graph.dispPatches"
          :key="p.result"
          :href="p.href"
          :x="p.x"
          :y="p.y"
          :width="p.width"
          :height="p.height"
          :result="p.result"
          preserveAspectRatio="none"
        />
        <feComposite
          v-for="(c, idx) in graph.dispComposites"
          :key="`dc-${idx}`"
          operator="over"
          :in="c.in"
          :in2="c.in2"
          :result="c.result"
        />
        <feImage
          v-for="p in graph.specPatches"
          :key="`s-${p.result}`"
          :href="p.href"
          :x="p.x"
          :y="p.y"
          :width="p.width"
          :height="p.height"
          :result="p.result"
          preserveAspectRatio="none"
        />
        <feComposite
          v-for="(c, idx) in graph.specComposites"
          :key="`sc-${idx}`"
          operator="over"
          :in="c.in"
          :in2="c.in2"
          :result="c.result"
        />
        <feDisplacementMap
          in="blurred_source"
          in2="displacement_map"
          :scale="graph.dispScale"
          x-channel-selector="R"
          y-channel-selector="G"
          result="displaced_source"
        />
        <feColorMatrix
          in="specular_map"
          type="luminanceToAlpha"
          result="specular_alpha"
        />
        <feComponentTransfer
          in="specular_alpha"
          result="specular_with_opacity"
        >
          <feFuncA
            type="linear"
            :slope="specularOpacity"
          />
        </feComponentTransfer>
        <feFlood
          flood-color="white"
          result="white_layer"
        />
        <feComposite
          in="white_layer"
          in2="specular_with_opacity"
          operator="in"
          result="masked_specular"
        />
        <feComposite
          in="masked_specular"
          in2="displaced_source"
          operator="over"
        />
      </filter>
    </defs>
  </svg>
</template>
