<script setup lang="ts">
const open = defineModel<boolean>('open', { required: true })
const code = defineModel<string>({ required: true })

defineProps<{
  error?: boolean
  submitting?: boolean
}>()

const emit = defineEmits<{
  close: []
  submit: []
}>()

const sheetRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const ignoreOutsideClick = ref(true)

const { style: viewportOverlayStyle } = useVisualViewportOverlay(open)

function close() {
  inputRef.value?.blur()
  open.value = false
}

function onAfterLeave() {
  resetDrag()
  emit('close')
}

const {
  isDragging,
  sheetDragStyle,
  onDragStart,
  onDragMove,
  onDragEnd,
  resetDrag,
} = useBottomSheetDrag(close)

const canSubmit = computed(() => code.value.trim().length > 0)

onClickOutside(sheetRef, () => {
  if (ignoreOutsideClick.value || isDragging.value || !open.value)
    return

  close()
})

function clearCode() {
  code.value = ''
}

watch(open, async (isOpen) => {
  if (!isOpen)
    return

  ignoreOutsideClick.value = true
  await nextTick()
  requestAnimationFrame(() => {
    inputRef.value?.focus({ preventScroll: true })
    ignoreOutsideClick.value = false
  })
})

function onInputMounted() {
  inputRef.value?.focus({ preventScroll: true })
  ignoreOutsideClick.value = false
}

onUnmounted(resetDrag)
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
      @after-leave="onAfterLeave"
    >
      <div
        v-if="open"
        class="pointer-events-none fixed inset-x-0 z-30"
        :style="viewportOverlayStyle"
      >
        <div
          class="absolute inset-0 bg-black/40"
          aria-hidden="true"
        />

        <Transition
          enter-active-class="transition-transform duration-300 ease-out"
          enter-from-class="translate-y-full"
          enter-to-class="translate-y-0"
          leave-active-class="transition-transform duration-200 ease-in"
          leave-from-class="translate-y-0"
          leave-to-class="translate-y-full"
          appear
        >
          <div
            v-if="open"
            ref="sheetRef"
            class="pointer-events-auto absolute inset-x-0 z-10 flex max-h-[min(92dvh,844px)] flex-col overflow-hidden rounded-t-[32px] bg-white touch-manipulation"
            :class="open ? '-bottom-(--app-scroll-bottom) pb-(--app-scroll-bottom)' : 'bottom-0'"
            :style="sheetDragStyle"
          >
            <div
              class="cursor-grab touch-none select-none active:cursor-grabbing"
              @pointerdown="onDragStart"
              @pointermove="onDragMove"
              @pointerup="onDragEnd"
              @pointercancel="onDragEnd"
            >
              <div class="flex flex-col items-center pt-[5px] pb-1">
                <span class="h-[5px] w-9 rounded-full bg-[#d2d2d4]" />
              </div>

              <div class="grid h-[58px] grid-cols-[auto_1fr_auto] items-center gap-2.5 px-4 py-2.5">
                <button
                  type="button"
                  class="appearance-none outline-none! px-4 py-2.5 text-label font-bold text-subtle"
                  @pointerdown.stop
                  @click="close"
                >
                  Cancel
                </button>
                <p class="text-base font-bold leading-5 text-center text-[#0b0f17]">
                  Enter manual
                </p>
                <span class="invisible px-4 py-2.5 text-label font-bold">Add</span>
              </div>
            </div>

            <div class="flex flex-col gap-6 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-6">
              <div class="flex flex-col gap-1">
                <div
                  class="flex h-12 items-center gap-1 rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3"
                  :class="error ? 'border-[#ff003b]' : ''"
                >
                  <input
                    ref="inputRef"
                    v-model="code"
                    type="text"
                    autocomplete="off"
                    autocapitalize="characters"
                    inputmode="text"
                    placeholder="Enter code number"
                    class="min-w-0 flex-1 appearance-none bg-transparent text-base font-bold leading-[18px] text-[#0b0f17] outline-none placeholder:text-subtle"
                    @vue:mounted="onInputMounted"
                    @keyup.enter="canSubmit && emit('submit')"
                  >
                  <button
                    v-if="code"
                    type="button"
                    class="appearance-none outline-none! grid size-5 shrink-0 place-content-center"
                    aria-label="Clear code"
                    @click="clearCode"
                  >
                    <Icon
                      name="amplif:x"
                      :size="20"
                      class="text-[#0b0f17]"
                    />
                  </button>
                </div>

                <div
                  v-if="error"
                  class="flex items-start gap-2 pt-0.5"
                >
                  <Icon
                    name="amplif:alert-circle"
                    :size="16"
                    class="mt-0.5 shrink-0 text-[#ff003b]"
                  />
                  <p class="text-caption font-bold leading-4 text-[#ff003b]">
                    This code isn't recognized
                  </p>
                </div>
              </div>

              <button
                type="button"
                class="appearance-none outline-none! flex h-[52px] w-full items-center justify-center rounded-[20px] text-base font-bold leading-6 transition-all select-none"
                :class="canSubmit
                  ? 'text-primary active:scale-[1.015]'
                  : 'bg-[#e5e7eb] text-subtle'"
                :style="canSubmit ? { background: 'linear-gradient(171.74deg, #ff6e00 0%, #ff003b 100%)' } : undefined"
                :disabled="!canSubmit || submitting"
                @click="emit('submit')"
              >
                Search
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
