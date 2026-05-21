<script setup lang="ts">
interface LeaderBoardPlayerRow {
  id: number
  name: string
  img: string
  score: number
  rank: number
  isYou?: boolean
}

const LEADER_BOARD_PLAYERS: LeaderBoardPlayerRow[] = [
  {
    id: 1,
    name: 'Lina Park',
    img: '/player-5.jpg',
    score: 385,
    rank: 11,
  },
  {
    id: 2,
    name: 'Tariq M.',
    img: '/player-4.jpg',
    score: 340,
    rank: 12,
  },
  {
    id: 3,
    name: 'You',
    img: '/player-3.jpg',
    score: 240,
    rank: 13,
    isYou: true,
  },
  {
    id: 4,
    name: 'Pierre L.',
    img: '/player-2.jpg',
    score: 230,
    rank: 14,
  },
  {
    id: 5,
    name: 'Andy Brown',
    img: '/player-1.jpg',
    score: 200,
    rank: 15,
  },
]

</script>

<template>
  <div
    id="leader-board-page"
    class="page-content h-full min-h-0 grid grid-rows-[auto_minmax(0,1fr)_auto]"
  >
    <AppTopBar class="p-4 py-2.5 h-auto z-10">
      <UiBackButton fallback="/agenda" />
    </AppTopBar>

    <main class="flex flex-col">
      <div class="flex flex-col gap-2 isolate z-10 relative px-4">
        <div class="text-heading">Leaderboard</div>
        <div class="font-bold text-secondary">
          Live ranking · 287 players
        </div>
      </div>

      <div class="bottom-[50dvh] px-4 fixed inset-x-0 top-0 isolate z-0 after:content-[''] after:absolute after:inset-x-0 after:top-0 after:h-16 after:bg-linear-to-b after:from-black after:to-black/0">
        <div class="absolute -bottom-8 left-1/2 -translate-x-1/2 z-0">
          <div
            inert
            class="size-[116px] absolute bottom-[calc(100%-20px)] left-1/2 -translate-x-1/2 isolate -z-1"
          >
            <div
              class="size-[543px] rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[-1]"
              style="background: linear-gradient(180deg, #0B0F17 0%, rgba(1, 14, 69, 0.00) 97.58%), linear-gradient(180deg, #00061E 0%, #01155C 100%); box-shadow: 0 16px 20px 0 rgba(102, 154, 255, 0.10) inset;"
            />
            <div
              class="size-[344px] rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[-1]"
              style="background: linear-gradient(180deg, #0B0F17 0%, rgba(1, 14, 69, 0.00) 97.58%); box-shadow: 0 16px 20px 0 rgba(102, 154, 255, 0.16) inset;"
            />
            <UiRankBg
              rank="0"
              :size="207"
              class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            />
          </div>
          <NuxtImg
            src="/rank-1.svg"
            class="w-30 z-0"
          />
          <NuxtImg
            src="/rank-1-cap.svg"
            class="w-30 absolute top-0 left-0 z-1"
          />
          <div class="absolute inset-0 flex items-end justify-center text-[60px] font-bold text-[rgb(243,244,246)]/20 pb-11">1</div>
          <div class="absolute bottom-[calc(100%-20px)] left-1/2 -translate-x-1/2 z-1">
            <UiRankBg
              rank="1"
              :size="116"
            />
            <NuxtImg
              src="/rank-1-avatar.jpg"
              class="size-[90px] object-cover rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            />

            <div class="absolute top-full -translate-y-2.5 left-1/2 -translate-x-1/2 text-center min-w-max flex flex-col items-center gap-1">
              <div class="text-label">Sophie C.</div>
              <div class="text-caption py-0.5 px-2 rounded-lg inline-flex items-center justify-center bg-[linear-gradient(135deg,#FF6E00,#FF003B)]">
                <span class="font-bold">540</span>
                <NuxtImg
                  src="/star-four.png"
                  class="size-4 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="absolute -bottom-7 right-1/2 -translate-x-full z-0">
          <NuxtImg
            src="/rank-2.svg"
            class="w-21 z-0"
          />
          <NuxtImg
            src="/rank-2-cap.svg"
            class="w-21 absolute top-0 left-0 z-1"
          />
          <div class="absolute inset-0 flex items-end justify-center text-[40px] font-bold text-[rgb(243,244,246)]/20 pb-8 z-1">2</div>
          <div class="absolute bottom-[calc(100%-12px)] left-1/2 -translate-x-1/2 isolate z-1">
            <UiRankBg
              rank="2"
            />
            <NuxtImg
              src="/rank-2-avatar.jpg"
              class="size-[73px] object-cover rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            />

            <div class="absolute top-full -translate-y-2.5 left-1/2 -translate-x-1/2 text-center min-w-max flex flex-col items-center gap-1">
              <div class="text-label">Marie L.</div>
              <div class="text-caption py-0.5 px-2 rounded-lg inline-flex items-center justify-center bg-[#CCF3FF] text-[#0057FF]">
                <span class="font-bold">485</span>
                <NuxtImg
                  src="/star-four.png"
                  class="size-4 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="absolute -bottom-7 left-1/2 translate-x-full z-0">
          <NuxtImg
            src="/rank-3.svg"
            class="w-21 z-0"
          />
          <NuxtImg
            src="/rank-3-cap.svg"
            class="w-21 absolute top-0 left-0 z-1"
          />
          <div class="absolute inset-0 flex items-end justify-center text-[40px] font-bold text-[rgb(243,244,246)]/20 pb-8 z-1">3</div>
          <div class="absolute bottom-[calc(100%-12px)] left-1/2 -translate-x-1/2 isolate z-1">
            <UiRankBg
              rank="3"
            />
            <NuxtImg
              src="/rank-3-avatar.jpg"
              class="size-[73px] object-cover rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            />

            <div class="absolute top-full -translate-y-2.5 left-1/2 -translate-x-1/2 text-center min-w-max flex flex-col items-center gap-1">
              <div class="text-label">Karim B.</div>
              <div class="text-caption py-0.5 px-2 rounded-lg inline-flex items-center justify-center bg-[#CCF3FF] text-[#0057FF]">
                <span class="font-bold">420</span>
                <NuxtImg
                  src="/star-four.png"
                  class="size-4 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="top-[50dvh] px-4 p-5 fixed inset-x-0 bottom-0 h-[50dvh] bg-white text-surface isolate z-10 grid grid-rows-[auto_minmax(0,1fr)]">
        <div class="text-title">All Players</div>

        <div class="flex flex-col overflow-y-auto overflow-x-clip">
          <div class="grid grid-cols-[auto_auto_auto_minmax(0,1fr)_auto] gap-x-4 divide-y divide-[#E5E7EB] overflow-y-auto flex-1 min-h-0 mt-3">
            <div
              v-for="player in LEADER_BOARD_PLAYERS"
              :key="player.id"
              class="col-span-full grid grid-cols-subgrid items-center py-4 first:pt-0 last:pb-0 px-2.5 pr-3"
              :class="player.isYou ? 'bg-[#FFF3EC]' : ''"
            >
              <Icon
                name="amplif:cup"
                size="16"
                :class="player.isYou ? 'text-[#FF6E00]' : 'text-[#6D7280]'"
              />
              <div class="font-bold">{{ player.rank }}</div>
              <NuxtImg
                :src="player.img"
                class="size-9 object-cover rounded-full"
              />
              <div class="text-label">{{ player.name }}</div>
              <div
                class="font-bold inline-flex items-center gap-1"
                style="background: linear-gradient(135deg, var(--Radiant-Orange-5, #FF6E00) 0%, var(--Red-5, #FF003B) 100%); background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent;"
              >
                {{ player.score }}
                <NuxtImg
                  src="/ai-colored.svg"
                  class="size-4 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
