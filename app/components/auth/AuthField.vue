<script setup lang="ts">
const model = defineModel<string>({ required: true })

const props = withDefaults(
  defineProps<{
    label: string
    type?: 'text' | 'email' | 'password'
    icon?: string
    placeholder?: string
    autocomplete?: string
    inputmode?: 'search' | 'email' | 'tel' | 'url' | 'none' | 'numeric' | 'decimal'
    disabled?: boolean
    error?: boolean
    errorMessage?: string
    clearable?: boolean
  }>(),
  {
    type: 'text',
    icon: undefined,
    placeholder: '',
    autocomplete: undefined,
    inputmode: undefined,
    disabled: false,
    error: false,
    errorMessage: '',
    clearable: true,
  },
)

const showPassword = ref(false)
const inputType = computed(() => {
  if (props.type !== 'password')
    return props.type
  return showPassword.value ? 'text' : 'password'
})

function clearValue() {
  model.value = ''
}
</script>

<template>
  <div class="py-2 space-y-2">
    <p class="text-label text-tertiary">
      {{ label }}
    </p>
    <div
      class="glass-panel flex items-center gap-2 rounded-xl px-4 py-4 bg-white/20"
      :class="error ? 'ring-1 ring-[#FF003B]' : ''"
    >
      <Icon
        v-if="icon"
        :name="icon"
        :size="20"
        class="shrink-0 text-primary"
      />
      <input
        v-model="model"
        :type="inputType"
        :name="label"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :inputmode="inputmode"
        :disabled="disabled"
        class="auth-field-input appearance-none outline-none! flex-1 min-w-0 bg-transparent text-base leading-[18px] placeholder:text-tertiary"
        :class="model ? 'text-primary' : 'text-tertiary'"
      >
      <button
        v-if="type === 'password'"
        type="button"
        class="appearance-none outline-none! shrink-0 p-0"
        :aria-label="showPassword ? 'Hide password' : 'Show password'"
        @click="showPassword = !showPassword"
      >
        <Icon
          name="amplif:eye-off"
          :size="20"
          class="text-primary"
        />
      </button>
      <button
        v-else-if="clearable && model"
        type="button"
        class="appearance-none outline-none! shrink-0 p-0"
        aria-label="Clear"
        @click="clearValue"
      >
        <Icon
          name="amplif:x"
          :size="20"
          class="text-primary"
        />
      </button>
    </div>
    <div
      v-if="error && errorMessage"
      class="flex gap-2 items-start"
      role="alert"
    >
      <Icon
        name="amplif:alert-circle"
        :size="16"
        class="shrink-0 text-[#FF003B] mt-0.5"
      />
      <p class="text-caption font-bold text-[#FF003B] leading-4">
        {{ errorMessage }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-field-input:-webkit-autofill,
.auth-field-input:-webkit-autofill:hover,
.auth-field-input:-webkit-autofill:focus {
  -webkit-text-fill-color: var(--color-primary);
  caret-color: var(--color-primary);
  transition: background-color 99999s ease-out;
  box-shadow: 0 0 0 1000px transparent inset;
}
</style>
