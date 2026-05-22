<template>
  <div class="game-page">
    <!-- Phaser 画布挂载点（撑满视口让 Scale.FIT 有空间填充） -->
    <div ref="gameContainer" class="game-page__canvas">
      <!-- Vue HUD 层：仅 score / combo / progress，judge 在 Phaser 层 -->
      <div class="game-page__hud">
        <div class="game-page__hud-right">
          <span v-if="combo > 1" class="game-page__combo">{{ combo }}x</span>
          <span v-if="score > 0" class="game-page__score">{{ score }}</span>
          <span v-if="kidProgress" class="game-page__progress">{{ kidProgress }}</span>
        </div>
      </div>
    </div>

    <!-- 暂停遮罩 -->
    <Transition name="fade">
      <div v-if="isPaused" class="game-page__overlay">
        <div class="game-page__pause-panel">
          <h2 class="game-page__pause-title">⏸ 游戏暂停</h2>
          <button class="game-page__resume-btn" @click="resumeGame">继续游戏</button>
          <RouterLink to="/" class="game-page__exit-btn">退出到主页</RouterLink>
        </div>
      </div>
    </Transition>

    <button v-if="!isPaused" class="game-page__pause-trigger" @click="pauseGame">⏸ 暂停</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {
  BootScene, ClassroomScene, DialogueScene,
  RhythmScene, BossScene, EndingScene,
  EVENT_KEYS,
} from '@/contents'
import { useEventBus, useGame } from '@/runtime'

const gameContainer = ref<HTMLDivElement>()
const eventBus = useEventBus()
const game = useGame()

const isPaused = ref(false)
const score = ref(0)
const combo = ref(0)
const kidProgress = ref('')

let completedCount = 0

const pauseGame = () => {
  isPaused.value = true
  eventBus.emit(EVENT_KEYS.GAME_PAUSE)
}

const resumeGame = () => {
  isPaused.value = false
  eventBus.emit(EVENT_KEYS.GAME_RESUME)
}

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    if (isPaused.value) resumeGame()
    else pauseGame()
  }
}

const onRhythmHit = (payload: unknown) => {
  const { combo: c } = payload as { judge: string; combo: number }
  combo.value = c
}

const onRhythmScore = (s: unknown) => { score.value = s as number }

const onKidCompleted = () => {
  completedCount++
  kidProgress.value = `已采集素材 ${completedCount} / 3`
  score.value = 0
  combo.value = 0
}

const onBossCompleted = (payload: unknown) => {
  const { score: s } = payload as { score: number }
  score.value = s
}

onMounted(() => {
  if (!gameContainer.value) return

  eventBus.on(EVENT_KEYS.RHYTHM_HIT, onRhythmHit)
  eventBus.on(EVENT_KEYS.RHYTHM_SCORE, onRhythmScore)
  eventBus.on(EVENT_KEYS.KID_COMPLETED, onKidCompleted)
  eventBus.on(EVENT_KEYS.BOSS_COMPLETED, onBossCompleted)
  window.addEventListener('keydown', onKeyDown)

  game.initGame(gameContainer.value, BootScene)
  game.addScenes([ClassroomScene, DialogueScene, RhythmScene, BossScene, EndingScene])
})

onUnmounted(() => {
  eventBus.off(EVENT_KEYS.RHYTHM_HIT, onRhythmHit)
  eventBus.off(EVENT_KEYS.RHYTHM_SCORE, onRhythmScore)
  eventBus.off(EVENT_KEYS.KID_COMPLETED, onKidCompleted)
  eventBus.off(EVENT_KEYS.BOSS_COMPLETED, onBossCompleted)
  window.removeEventListener('keydown', onKeyDown)
  game.destroyGame(true)
})
</script>

<style lang="css" scoped>
@reference "@/style.css";

.game-page {
  @apply relative w-screen h-screen overflow-hidden bg-bg-overlay;
}

.game-page__canvas {
  @apply relative w-full h-full;
}

.game-page__hud {
  @apply pointer-events-none absolute top-0 right-0 left-0 z-10 flex items-center justify-between px-4 py-2;
}

.game-page__hud-left {
  @apply flex items-center gap-3;
}

.game-page__hud-right {
  @apply flex items-center;
}

.game-page__score {
  @apply text-xl font-bold text-yellow-300;
}

.game-page__combo {
  @apply text-lg font-bold text-green-300;
}

.game-page__progress {
  @apply text-sm text-text-primary/70;
}

.game-page__overlay {
  @apply absolute inset-0 z-20 flex items-center justify-center bg-overlay-scrim/60 backdrop-blur-sm;
}

.game-page__pause-panel {
  @apply flex flex-col items-center gap-4 rounded-xl bg-bg-surface/90 p-8 text-text-primary;
}

.game-page__pause-title {
  @apply text-2xl font-bold;
}

.game-page__resume-btn {
  @apply rounded-lg bg-success px-6 py-2 text-lg transition hover:bg-success-light;
}

.game-page__exit-btn {
  @apply rounded-lg bg-game-border px-6 py-2 text-sm transition hover:bg-text-muted;
}

.game-page__pause-trigger {
  @apply absolute top-4 left-8 z-10 rounded-lg bg-bg-surface px-5 py-2.5 text-base font-semibold text-text-primary shadow-md transition hover:bg-bg-overlay hover:text-text-bright;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
