<script setup lang="ts">
useHead({
  title: 'Privacy Notice · AmplifAI Week',
})

const sections = [
  {
    heading: 'Who handles your data',
    body: 'AmplifAI Week is operated on L\'Oréal\'s behalf by an external vendor acting as the data processor. The vendor maintains the minisite, attendance tracking, and event communications for the duration of the event.',
  },
  {
    heading: 'What we collect and why',
    body: 'We collect your name, work email, persona selection, and event activity (sessions attended, sparks earned, QR check-ins) for three purposes: registering you for the event, tracking attendance, and sending event-related updates.',
  },
  {
    heading: 'How long we keep it',
    body: 'All personal data collected for AmplifAI Week will be permanently deleted by the vendor within one (1) month after the end of the event. Aggregated, non-identifying statistics may be retained for internal reporting.',
  },
  {
    heading: 'Your data protection rights',
    body: 'You can request access to, correction of, or deletion of your personal data at any time. To exercise these rights, contact the project team at amplifai-privacy@loreal.com — we will respond within 30 days.',
  },
]
</script>

<template>
  <div
    id="privacy-page"
    class="page-content h-dvh min-h-0 grid grid-rows-[auto_minmax(0,1fr)_auto]"
  >
    <AppTopBar class="px-4 py-2.5 h-auto">
      <UiBackButton fallback="/" />
    </AppTopBar>

    <main class="flex flex-col gap-6 px-4 py-5 overflow-y-auto overflow-x-clip overscroll-contain">
      <div class="space-y-2">
        <h1 class="text-heading">
          Privacy Notice
        </h1>
        <p class="text-secondary">
          How AmplifAI Week handles your personal data.
        </p>
      </div>

      <div class="flex flex-col gap-3">
        <GlassPanel
          v-for="section in sections"
          :key="section.heading"
          class="rounded-[20px] bg-white/10 p-5"
        >
          <h2 class="font-bold text-base leading-5 text-primary mb-2">
            {{ section.heading }}
          </h2>
          <p class="text-sm leading-5 text-secondary">
            {{ section.body }}
          </p>
        </GlassPanel>
      </div>

      <p class="text-caption text-tertiary">
        This notice is provided for transparency under L'Oréal's internal privacy
        standards. Contact <strong>amplifai-privacy@loreal.com</strong> for any
        questions about how your data is processed during AmplifAI Week.
      </p>
    </main>

    <AppBottomBar class="px-4 pt-4 pb-10">
      <p class="text-center text-caption text-subtle">
        INTERNAL · L'ORÉAL EMPLOYEES ONLY
      </p>
    </AppBottomBar>
  </div>
</template>
