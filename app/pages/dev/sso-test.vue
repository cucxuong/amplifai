<script setup lang="ts">
import { onMounted } from 'vue'

interface MockUserPreset {
  email: string
  firstName: string
  lastName: string
  personaId: string | null
  description: string
}

const isDevMode = import.meta.dev
const presets = ref<Record<string, MockUserPreset>>({})
const selectedPreset = ref('dev')
const customEmail = ref('test.user@loreal.com')
const customFirstName = ref('Test')
const customLastName = ref('User')
const loading = ref(false)
const message = ref<{ type: 'success' | 'error', text: string } | null>(null)

const { loggedIn, user } = useUserSession()

onMounted(async () => {
  // Fetch available presets
  try {
    const response = await $fetch<{ presets: Record<string, MockUserPreset> }>('/api/dev/mock-presets')
    presets.value = response.presets
  }
  catch (err) {
    console.error('Failed to fetch mock presets:', err)
  }
})

async function signInWithPreset() {
  loading.value = true
  message.value = null

  try {
    const preset = presets.value[selectedPreset.value]
    if (!preset)
      throw new Error('Preset not found')

    const result = await $fetch<{ ok: boolean, message: string }>('/api/auth/dev/mock-saml', {
      method: 'POST',
      body: {
        email: preset.email,
        firstName: preset.firstName,
        lastName: preset.lastName,
      },
    })

    if (result.ok) {
      message.value = {
        type: 'success',
        text: `Signed in as ${preset.firstName} ${preset.lastName}`,
      }
      await new Promise(resolve => setTimeout(resolve, 500))
      await navigateTo('/')
    }
    else {
      throw new Error(result.message || 'Sign in failed')
    }
  }
  catch (err) {
    message.value = {
      type: 'error',
      text: `Failed to sign in: ${err instanceof Error ? err.message : 'Unknown error'}`,
    }
  }
  finally {
    loading.value = false
  }
}

async function signInWithCustom() {
  loading.value = true
  message.value = null

  try {
    const result = await $fetch<{ ok: boolean, message: string }>('/api/auth/dev/mock-saml', {
      method: 'POST',
      body: {
        email: customEmail.value,
        firstName: customFirstName.value,
        lastName: customLastName.value,
      },
    })

    if (result.ok) {
      message.value = {
        type: 'success',
        text: `Signed in as ${customFirstName.value} ${customLastName.value}`,
      }
      await new Promise(resolve => setTimeout(resolve, 500))
      await navigateTo('/')
    }
    else {
      throw new Error(result.message || 'Sign in failed')
    }
  }
  catch (err) {
    message.value = {
      type: 'error',
      text: `Failed to sign in: ${err instanceof Error ? err.message : 'Unknown error'}`,
    }
  }
  finally {
    loading.value = false
  }
}

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await navigateTo('/sign-in')
}
</script>

<template>
  <div v-if="!isDevMode" class="p-8">
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      <p class="font-bold">Development Only</p>
      <p>This page is only available in development mode.</p>
    </div>
  </div>

  <div v-else class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-2xl mx-auto space-y-8">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold">SSO Testing Panel</h1>
        <p class="text-gray-600 mt-2">Dev-only mock SAML authentication for testing</p>
      </div>

      <!-- Current Session -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-bold mb-4">Current Session</h2>
        <div class="space-y-2 text-sm">
          <p><span class="font-semibold">Logged in:</span> {{ loggedIn ? 'Yes' : 'No' }}</p>
          <p v-if="user"><span class="font-semibold">User:</span> {{ user.email }}</p>
          <p v-if="user"><span class="font-semibold">Name:</span> {{ user.name }}</p>
          <button
            v-if="loggedIn"
            @click="logout"
            class="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      <!-- Messages -->
      <div v-if="message" :class="[
        'p-4 rounded border',
        message.type === 'success'
          ? 'bg-green-50 border-green-200 text-green-800'
          : 'bg-red-50 border-red-200 text-red-800',
      ]">
        {{ message.text }}
      </div>

      <!-- Preset Users -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-bold mb-4">Mock User Presets</h2>
        <p class="text-gray-600 text-sm mb-4">Sign in with pre-configured test users</p>

        <div class="space-y-2 mb-4">
          <select
            v-model="selectedPreset"
            class="w-full p-2 border rounded"
          >
            <option
              v-for="(preset, key) in presets"
              :key="key"
              :value="key"
            >
              {{ preset.firstName }} {{ preset.lastName }} — {{ preset.description }}
            </option>
          </select>
        </div>

        <div
          v-if="presets[selectedPreset]"
          class="bg-gray-50 p-4 rounded text-sm mb-4"
        >
          <p><strong>Email:</strong> {{ presets[selectedPreset].email }}</p>
          <p><strong>Name:</strong> {{ presets[selectedPreset].firstName }} {{ presets[selectedPreset].lastName }}</p>
          <p v-if="presets[selectedPreset].personaId"><strong>Persona:</strong> {{ presets[selectedPreset].personaId }}</p>
        </div>

        <button
          @click="signInWithPreset"
          :disabled="loading"
          class="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {{ loading ? 'Signing in...' : 'Sign In with Preset' }}
        </button>
      </div>

      <!-- Custom User -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-bold mb-4">Custom User</h2>
        <p class="text-gray-600 text-sm mb-4">Create a custom test user</p>

        <div class="space-y-4 mb-4">
          <div>
            <label class="block text-sm font-semibold mb-1">Email (must be @loreal.com)</label>
            <input
              v-model="customEmail"
              type="email"
              placeholder="test.user@loreal.com"
              class="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1">First Name</label>
            <input
              v-model="customFirstName"
              type="text"
              placeholder="Test"
              class="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1">Last Name</label>
            <input
              v-model="customLastName"
              type="text"
              placeholder="User"
              class="w-full p-2 border rounded"
            />
          </div>
        </div>

        <button
          @click="signInWithCustom"
          :disabled="loading"
          class="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {{ loading ? 'Signing in...' : 'Sign In with Custom User' }}
        </button>
      </div>

      <!-- Info -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 text-sm">
        <p class="font-semibold mb-2">How to use:</p>
        <ol class="list-decimal list-inside space-y-1 text-gray-700">
          <li>Select a preset or create a custom user</li>
          <li>Click "Sign In" to create a mock SAML session</li>
          <li>You'll be signed in and redirected to dashboard</li>
          <li>Test the app as this user</li>
          <li>Click "Logout" to sign out</li>
        </ol>

        <p class="mt-4 font-semibold mb-2">Available presets:</p>
        <ul class="space-y-1 text-gray-700">
          <li>🚀 <strong>dev</strong> — Default user (no onboarding)</li>
          <li>💡 <strong>innovator</strong> — Innovator persona</li>
          <li>🔍 <strong>explorer</strong> — Explorer persona</li>
          <li>🤝 <strong>connector</strong> — Connector persona</li>
          <li>🎯 <strong>performer</strong> — Performer persona</li>
        </ul>
      </div>
    </div>
  </div>
</template>
