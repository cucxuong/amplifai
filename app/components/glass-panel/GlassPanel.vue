<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    as?: 'div' | 'button'
    deg?: number
  }>(),
  {
    as: 'div',
    deg: -10,
  },
)
</script>

<template>
  <component
    :is="props.as"
    v-bind="$attrs"
    :class="cn('glass-panel', $attrs.class)"
    :style="{ '--light-deg': `${props.deg}deg` }"
  >
    <slot />
  </component>
</template>
