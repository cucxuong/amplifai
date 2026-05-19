<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    as?: 'div' | 'button'
    deg?: number
    class?: string
  }>(),
  {
    as: 'div',
    deg: -10,
    class: '',
  },
)
</script>

<template>
  <component
    :is="props.as"
    :class="['glass-panel', props.class]"
    :style="{ '--light-deg': `${props.deg}deg` }"
  >
    <slot />
  </component>
</template>
