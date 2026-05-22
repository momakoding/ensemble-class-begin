<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'
import GameButton from '@/components/game-button.vue'
// Vite 的 ?raw 导入，直接拿到 .md 文件的原始字符串
import howToPlayMd from '@/contents/game-info/how-to-play.md?raw'

const route = useRoute()
const router = useRouter()

const fromStart = computed(() => route.query.from === 'start')

const contentHtml = ref('')
onMounted(async () => {
  contentHtml.value = await marked.parse(howToPlayMd)
})

function handleAction() {
  if (fromStart.value) {
    router.push({ name: 'game' })
  } else {
    router.push({ name: 'home' })
  }
}
</script>

<template>
  <div class="how-to-play">
    <h2 class="how-to-play__title">玩法介绍</h2>
    <div class="how-to-play__content prose" v-html="contentHtml" />
    <GameButton
      :label="fromStart ? '开始游戏' : '返回主页'"
      @click="handleAction"
    />
  </div>
</template>

<style lang="css" scoped>
@reference "@/style.css";

.how-to-play {
  @apply flex min-h-screen flex-col items-center justify-center gap-10 px-6 py-14;
}
.how-to-play__title {
  @apply text-4xl font-bold text-accent-light;
}
 

.how-to-play__content {
  @apply w-full max-w-lg text-text-secondary;
}

/* markdown 渲染样式 */
.how-to-play__content :deep(h1) {
  @apply text-2xl font-bold text-accent-light mb-4;
}
.how-to-play__content :deep(h2) {
  @apply text-lg font-semibold text-accent-light mt-6 mb-2;
}
.how-to-play__content :deep(h3) {
  @apply text-base font-semibold text-text-primary mt-4 mb-1;
}
.how-to-play__content :deep(p) {
  @apply leading-relaxed mb-3;
}
.how-to-play__content :deep(ul) {
  @apply list-disc pl-5 space-y-1 mb-3;
}
.how-to-play__content :deep(ol) {
  @apply list-decimal pl-5 space-y-1 mb-3;
}
.how-to-play__content :deep(blockquote) {
  @apply border-l-4 border-accent/50 pl-4 text-text-secondary italic mb-3;
}
.how-to-play__content :deep(table) {
  @apply w-full text-sm border-collapse mb-3;
}
.how-to-play__content :deep(th) {
  @apply border border-game-border bg-border-subtle/50 px-3 py-1.5 text-left text-text-primary;
}
.how-to-play__content :deep(td) {
  @apply border border-border-subtle px-3 py-1.5;
}
.how-to-play__content :deep(code) {
  @apply rounded bg-border-subtle/60 px-1 py-0.5 text-xs text-accent-light font-mono;
}
</style>
