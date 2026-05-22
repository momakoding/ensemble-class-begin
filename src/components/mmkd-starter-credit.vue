<script setup lang="ts">
// Momakoding GameJam Starter Web 署名卡片
// 展示脚手架信息、Logo 及所用开源框架

const REPO_LINK = "https://github.com/momakoding/momakoding-gamejam-starter-web"

const TECHNOLOGIES = [
  { label: 'Vue 3', cls: 'mmkd-credit__badge--vue', url: 'https://vuejs.org' },
  { label: 'Phaser 4', cls: 'mmkd-credit__badge--phaser', url: 'https://phaser.io' },
  { label: 'TypeScript', cls: 'mmkd-credit__badge--ts', },
  { label: 'Tailwind CSS v4', cls: 'mmkd-credit__badge--tw', url: "https://tailwindcss.com" },
  { label: 'Vite 8', cls: 'mmkd-credit__badge--vite' },
]
</script>

<template>
  <div class="mmkd-credit">
    <!-- 顶部：Logo + 标题 -->
    <div class="mmkd-credit__header">
      <a :href="REPO_LINK" target="_blank" rel="noopener noreferrer" class="mmkd-credit__logo-link">
        <img src="/img/logo/mmkd-transparent-bg.png" alt="Momakoding Logo" class="mmkd-credit__logo" />
      </a>
      <div class="mmkd-credit__title-group">
        <a :href="REPO_LINK" target="_blank" rel="noopener noreferrer" class="mmkd-credit__name">
          Momakoding GameJam Starter Web
        </a>
        <p class="mmkd-credit__desc">本游戏基于此开源脚手架构建</p>
      </div>
    </div>

    <!-- 技术栈徽章 -->
    <ul class="mmkd-credit__badges">
      <a
        v-for="tech in TECHNOLOGIES"
        :key="tech.label"
        :href="tech.url"
        target="_blank"
        rel="noopener noreferrer"
        class="mmkd-credit__badge"
        :class="tech.cls"
      >{{ tech.label }}</a>
    </ul>
  </div>
</template>

<style scoped>
@reference "@/style.css";

.mmkd-credit {
  @apply flex flex-col gap-4 rounded-xl border border-accent/30 bg-amber-950/20 px-5 py-4;
}

/* 顶部横排：logo + 文字 */
.mmkd-credit__header {
  @apply flex items-center gap-4;
}

.mmkd-credit__logo-link {
  @apply shrink-0 transition-opacity hover:opacity-80;
}

.mmkd-credit__logo {
  @apply h-24 w-auto object-contain;
}

.mmkd-credit__title-group {
  @apply flex flex-col gap-0.5 min-w-0;
}

.mmkd-credit__name {
  @apply inline-flex items-center gap-1.5 text-sm font-semibold text-accent-light hover:text-amber-200 transition-colors;
}

.mmkd-credit__gh-icon {
  @apply h-4 w-4 shrink-0 text-text-secondary;
}

.mmkd-credit__desc {
  @apply text-xs text-text-muted;
}

/* 徽章行 */
.mmkd-credit__badges {
  @apply flex flex-wrap gap-2;
}

.mmkd-credit__badge {
  @apply rounded-full px-2.5 py-0.5 text-xs font-medium;
}

.mmkd-credit__badge--vue {
  @apply bg-emerald-900/60 text-emerald-300 ring-1 ring-emerald-700/50;
}

.mmkd-credit__badge--phaser {
  @apply bg-violet-900/60 text-violet-300 ring-1 ring-violet-700/50;
}

.mmkd-credit__badge--ts {
  @apply bg-blue-900/60 text-blue-300 ring-1 ring-blue-700/50;
}

.mmkd-credit__badge--tw {
  @apply bg-sky-900/60 text-sky-300 ring-1 ring-sky-700/50;
}

.mmkd-credit__badge--vite {
  @apply bg-purple-900/60 text-purple-300 ring-1 ring-purple-700/50;
}
</style>
