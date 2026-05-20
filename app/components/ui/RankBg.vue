<script setup lang="ts">
const props = withDefaults(defineProps<{
  rank: '0' | '1' | '2' | '3'
  size?: number
}>(), {
  size: 92,
})
</script>

<template>
  <div
    :class="cn('size-(--rank-bg-size) rounded-full overflow-clip flex items-center justify-center', $attrs.class)"
    :style="{ '--rank-bg-size': `${props.size}px` }"
  >
    <NuxtImg
      :src="`/rank-${props.rank}-bg.svg`"
      class="size-[calc(var(--rank-bg-size)+1px)] object-cover"
    />
  </div>
</template>
