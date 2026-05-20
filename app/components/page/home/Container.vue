<template>
  <main :class="cn('flex flex-col overflow-y-auto overflow-x-clip', $attrs.class)">
    <slot />
    <div class="pb-22.5"/>
  </main>
</template>
