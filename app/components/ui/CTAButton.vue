<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    disabled?: boolean
    loading?: boolean
    type?: 'button' | 'submit'
    to?: string
    href?: string
    prefetch?: boolean
    size?: 'default' | 'lg'
  }>(),
  {
    type: 'button',
    prefetch: false,
    size: 'default',
  },
)

const isInactive = computed(() => props.disabled || props.loading)

const gradientStyle = {
  background: 'linear-gradient(157.57deg, #FF6E00 0%, #FF003B 100%)',
}

const ctaClass = computed(() => [
  'flex justify-center w-full outline-none! appearance-none rounded-[20px] font-bold leading-6 select-none text-white disabled:bg-subtle disabled:text-muted',
  props.size === 'lg'
    ? 'h-13 items-center text-base active:scale-[1.02] transition-transform'
    : 'px-5 py-3.5 active:scale-[1.015] transition-all',
])
</script>

<template>
  <NuxtLink
    v-if="to"
    :to="to"
    :prefetch="prefetch"
    v-bind="$attrs"
    :class="[ctaClass, $attrs.class]"
    :style="gradientStyle"
  >
    <slot />
  </NuxtLink>
  <a
    v-else-if="href"
    :href="href"
    v-bind="$attrs"
    :class="[ctaClass, $attrs.class]"
    :style="gradientStyle"
  >
    <slot />
  </a>
  <button
    v-else
    :type="type"
    v-bind="$attrs"
    :class="[ctaClass, $attrs.class]"
    :style="isInactive ? undefined : gradientStyle"
    :disabled="isInactive"
  >
    <slot />
  </button>
</template>
