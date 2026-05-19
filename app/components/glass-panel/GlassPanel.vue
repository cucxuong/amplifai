<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    as?: 'div' | 'button'
    deg?: number
    class?: ClassValue
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
    v-bind="$attrs"
    :class="cn('glass-panel', props.class)"
    :style="{ '--light-deg': `${props.deg}deg` }"
  >
    <slot />
  </component>
</template>
