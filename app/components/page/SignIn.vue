<template>
  <div class="h-dvh grid grid-rows-[auto_minmax(0,1fr)_auto] sign-in-page">
    <AppTopBar>
      <NuxtLink
        href="/"
        prefetch
        class="outline-none! size-11 shrink-0 rounded-4xl p-0 glass-panel [--light-deg:-45deg] bg-primary/5 grid place-content-center active:scale-110 select-none"
      >
        <Icon
          name="amplif:arrow-left"
          :size="24"
        />
      </NuxtLink>
    </AppTopBar>
    <main class="space-y-9 p-4 py-5">
      <div class="space-y-2">
        <h2 class="text-heading">
          Sign in
        </h2>
        <p class="text-secondary">Welcome back to AmplifAI.</p>
      </div>
      <div class="space-y-4">
        <div class="p-4 pr-3.5 glass-panel bg-primary/5 select-none transition-all active:scale-[1.015]">
          <span class="flex w-full items-center  gap-3 text-left">
            <Icon
              name="amplif:microsoft"
              :size="36"
            />
            <div class="flex flex-col flex-1 gap-1">
              <span class="font-bold">Continue with Microsoft</span>
              <span class="text-caption text-secondary leading-[14px]">L'Oréal SSO · @loreal.com</span>
            </div>
            <Icon
              name="amplif:arrow-right"
              :size="24"
            />
          </span>
        </div>
        <div class="flex gap-2 select-none">
          <Icon
            name="amplif:alert-circle"
            :size="16"
          />
          <div class="flex flex-col flex-1 text-caption gap-0.5">
            <span class="font-bold text-secondary">Need help signing in?</span>
            <span class="text-tertiary">Contact IT support · helpdesk@loreal.com</span>
          </div>
        </div>
      </div>
    </main>
    <AppBottomBar>
      <div class="text-center text-caption text-pretty text-subtle *:inline-block">
        <strong>Privacy & data:</strong> <span>Authentication via Azure AD. Session-only.</span> <span>Data deleted 30 days post-event.</span>
      </div>
    </AppBottomBar>
  </div>
</template>
