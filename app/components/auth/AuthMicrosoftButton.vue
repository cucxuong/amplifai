<script setup lang="ts">
defineProps<{
  loading?: boolean
  disabled?: boolean
}>()
</script>

<template>
  <GlassPanel
    as="button"
    type="button"
    :deg="-30"
    class="appearance-none outline-none! relative flex w-full items-center gap-2 rounded-[20px] pl-4 pr-3.5 py-4 text-left transition-transform active:scale-[0.99] disabled:opacity-60"
    style="background: rgba(255, 255, 255, 0.2)"
    :disabled="disabled || loading"
  >
    <div
      class="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_4px_20px_0px_rgba(0,87,255,0.5),inset_0px_-4px_20px_0px_rgba(255,110,0,0.2)]"
      aria-hidden="true"
    />
    <Icon
      name="amplif:microsoft"
      :size="36"
      class="relative shrink-0"
    />
    <div class="relative flex min-w-0 flex-1 flex-col gap-1">
      <span class="text-base font-bold leading-5 text-primary">
        Continue with Microsoft
      </span>
      <span class="text-caption text-secondary">
        L'Oréal SSO · @loreal.com
      </span>
    </div>
    <Icon
      name="amplif:arrow-right"
      :size="24"
      class="relative shrink-0 text-primary"
    />
  </GlassPanel>
</template>
