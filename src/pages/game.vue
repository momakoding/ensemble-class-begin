<template>
  <div class="game-page">
    <!-- Phaser 画布挂载点（撑满视口让 Scale.FIT 有空间填充） -->
    <div ref="gameContainer" class="game-page__canvas">
      <!-- Vue HUD 层：右上角记分板，judge 在 Phaser 层 -->
      <div class="game-page__hud">
        <span v-if="combo > 1" class="game-page__combo">{{ combo }}x</span>
        <span v-if="score > 0" class="game-page__score">{{ score }}</span>
      </div>
    </div>

    <!-- 暂停遮罩 -->
    <Transition name="fade">
      <div v-if="isPaused" class="game-page__overlay">
        <div class="game-page__pause-panel">
          <h2 class="game-page__pause-title">⏸ 游戏暂停</h2>
          <button class="game-page__resume-btn" @click="resumeGame">继续游戏</button>
          <button class="game-page__classroom-btn" @click="returnToClassroom">返回教室</button>
          <RouterLink to="/" class="game-page__exit-btn">退出到主页</RouterLink>
        </div>
      </div>
    </Transition>

    <button v-if="!isPaused" class="game-page__pause-trigger" @click="pauseGame" @contextmenu.prevent="showEnsembleEntry = !showEnsembleEntry">⏸ 暂停</button>
    <button v-if="showEnsembleEntry && !isPaused" class="game-page__ensemble-entry-btn" @click="jumpToEnsemble">⚡ 合奏</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {
  BootScene, ClassroomScene, DialogueScene,
  RhythmScene, BossScene, EndingScene,
  EVENT_KEYS, SCENE_KEYS,
} from '@/contents'
import { useEventBus, useGame } from '@/runtime'
import { useCharts } from '@/contents/composables/useCharts'
import { KIDS } from '@/contents/data/kids'

const gameContainer = ref<HTMLDivElement>()
const eventBus = useEventBus()
const game = useGame()

const isPaused = ref(false)
const showEnsembleEntry = ref(false)
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

const jumpToEnsemble = () => {
  showEnsembleEntry.value = false
  game.switchToScene(SCENE_KEYS.BOSS, { chartKey: 'ensemble', kidId: 'huimi', isBoss: true })
}

const returnToClassroom = () => {
  isPaused.value = false
  score.value = 0
  combo.value = 0
  eventBus.emit(EVENT_KEYS.GAME_RETURN_CLASSROOM)
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

  useCharts().loadAllCharts(KIDS)

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
  @apply pointer-events-none absolute top-3 right-4 z-10 flex flex-col items-end gap-1;
}

.game-page__score {
  @apply text-2xl font-bold text-yellow-300 tabular-nums;
}

.game-page__combo {
  @apply text-base font-bold text-green-300;
}

.game-page__overlay {
  @apply absolute inset-0 z-20 flex items-center justify-center bg-overlay-scrim/70 backdrop-blur-md;
}

.game-page__pause-panel {
  @apply flex flex-col items-center gap-3 rounded-2xl border border-border-subtle bg-bg-surface/95
         px-10 py-8 text-text-primary shadow-2xl min-w-[260px];
}

.game-page__pause-title {
  @apply w-full pb-3 text-center text-2xl font-bold border-b border-border-subtle;
}

.game-page__resume-btn {
  @apply w-full rounded-lg bg-accent px-6 py-2.5 text-base font-semibold text-text-dark
         transition hover:bg-accent-light active:scale-95;
}

.game-page__classroom-btn {
  @apply w-full rounded-lg bg-bg-overlay px-6 py-2.5 text-sm font-medium text-text-primary
         transition hover:bg-border-subtle active:scale-95;
}

.game-page__exit-btn {
  @apply mt-1 text-sm text-text-muted underline-offset-2 transition hover:text-text-primary hover:underline;
}

.game-page__pause-trigger {
  @apply absolute top-4 left-8 z-10 rounded-lg bg-bg-surface px-5 py-2.5 text-base font-semibold text-text-primary shadow-md transition hover:bg-bg-overlay hover:text-text-bright;
}

.game-page__ensemble-entry-btn {
  @apply absolute top-4 left-36 z-10 rounded-lg bg-accent/80 px-4 py-2.5 text-sm font-semibold text-text-dark shadow-md transition hover:bg-accent active:scale-95;
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
