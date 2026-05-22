<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ExternalLink } from 'lucide-vue-next'
import GameButton from '@/components/game-button.vue'
import MmkdStarterCredit from '@/components/mmkd-starter-credit.vue'
import { TEAM_INFO, GAME_META } from '@/contents/game-info'

const router = useRouter()

function goHome() {
  router.push({ name: 'home' })
}
</script>

<template>
  <div class="about-us scrollable">

    <!-- ① Hero -->
    <header class="about-us__hero">
      <p class="about-us__eyebrow">CREDITS</p>
      <h2 class="about-us__title">关于我们</h2>
      <div class="about-us__hero-line" aria-hidden="true" />
    </header>

    <!-- ② 卡片区 -->
    <div class="about-us__cards" :class="{ 'about-us__cards--single': !GAME_META.showGameCard }">

      <!-- 团队卡片 -->
      <section class="about-card about-card--team">
        <p class="about-card__eyebrow">团队</p>
        <h3 class="about-card__heading">{{ TEAM_INFO.teamName }}</h3>
        <p class="about-card__text">{{ TEAM_INFO.description }}</p>

        <ul class="about-card__members">
          <li v-for="m in TEAM_INFO.members" :key="m.name" class="member-row">
            <span class="member-row__avatar">{{ m.avatar ?? '👤' }}</span>
            <span class="member-row__name">{{ m.name }}</span>
            <span class="member-row__role">{{ m.role }}</span>
          </li>
        </ul>
      </section>

      <!-- 游戏卡片（showGameCard 控制） -->
      <section v-if="GAME_META.showGameCard" class="about-card about-card--game">
        <p class="about-card__eyebrow">游戏</p>
        <h3 class="about-card__heading">{{ GAME_META.title }}</h3>
        <p v-if="GAME_META.description" class="about-card__text">{{ GAME_META.description }}</p>
        <div v-if="GAME_META.tags?.length" class="about-card__tags">
          <span v-for="tag in GAME_META.tags" :key="tag" class="game-tag">{{ tag }}</span>
        </div>
      </section>
    </div>

    <!-- ③ 开源技术 -->
    <section class="oss-section">
      <div class="oss-section__header">
        <p class="about-card__eyebrow">开源技术</p>
        <h3 class="oss-section__title">站在巨人的肩膀上</h3>
        <p class="oss-section__desc">本游戏使用以下开源技术构建，感谢所有贡献者。</p>
      </div>

      <div class="oss-section__grid">
        <!-- 脚手架（独立组件） -->
        <div class="oss-section__featured">
          <p class="oss-section__label">脚手架</p>
          <MmkdStarterCredit />
        </div>

        <!-- 依赖列表（数据驱动） -->
        <div v-if="GAME_META.ossCredits?.length" class="oss-section__deps">
          <p class="oss-section__label">依赖</p>
          <ul class="oss-list">
            <li v-for="oss in GAME_META.ossCredits" :key="oss.name" class="oss-list__item">
              <span class="oss-list__dot" aria-hidden="true" />
              <a
                v-if="oss.url"
                :href="oss.url"
                target="_blank"
                rel="noopener noreferrer"
                class="oss-list__name oss-list__name--link"
              >
                {{ oss.name }}
                <ExternalLink class="oss-list__icon" :size="10" />
              </a>
              <span v-else class="oss-list__name">{{ oss.name }}</span>
              <span class="oss-list__desc">{{ oss.desc }}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- ④ Footer（保持原有 sticky 固定布局） -->
    <footer class="about-us__footer">
      <p class="about-us__footer-text">使用 Momakoding GameJam Starter Web 构建</p>
      <GameButton label="返回主页" @click="goHome" />
    </footer>

  </div>
</template>

<style scoped>
@reference "@/style.css";

/* ═══════════════════════════════════════════
   页面容器
   ═══════════════════════════════════════════ */
.about-us {
  @apply flex h-screen flex-col items-center gap-14 py-16 pb-0;
}

/* ═══════════════════════════════════════════
   ① Hero
   ═══════════════════════════════════════════ */
.about-us__hero {
  @apply flex flex-col items-center gap-3 text-center;
}

.about-us__eyebrow {
  @apply text-[10px] font-bold tracking-[0.3em] text-accent/60 uppercase;
}

.about-us__title {
  @apply text-4xl font-bold tracking-wide text-accent-light;
}

/* 装饰渐变线 */
.about-us__hero-line {
  @apply mt-1 h-px w-24 rounded-full;
  background: linear-gradient(
    90deg,
    transparent,
    var(--color-accent) 30%,
    var(--color-accent) 70%,
    transparent
  );
  opacity: 0.4;
}

/* ═══════════════════════════════════════════
   ② 卡片区
   ═══════════════════════════════════════════ */
.about-us__cards {
  @apply grid w-full max-w-3xl grid-cols-1 gap-5 md:grid-cols-2;
}

.about-us__cards--single {
  @apply md:grid-cols-1 md:max-w-lg;
}

/* ── 通用卡片 ── */
.about-card {
  @apply relative flex flex-col gap-3 overflow-hidden rounded-2xl
         border border-border-subtle/50 bg-bg-surface/30
         px-6 py-5 backdrop-blur-sm
         transition-colors duration-200;
}

.about-card:hover {
  @apply bg-bg-surface/50;
}

/* 左侧强调条 */
.about-card--team {
  @apply border-l-[3px] border-l-accent;
}

.about-card--game {
  @apply border-l-[3px] border-l-accent;
}

/* 卡片内部元素 */
.about-card__eyebrow {
  @apply text-[10px] font-bold tracking-[0.2em] uppercase text-text-muted;
}

.about-card__heading {
  @apply text-base font-bold text-text-primary;
}

.about-card__text {
  @apply text-sm leading-relaxed text-text-secondary;
}

.about-card__tags {
  @apply mt-1 flex flex-wrap gap-2;
}

/* ── 成员列表 ── */
.about-card__members {
  @apply mt-2 flex flex-col gap-2.5;
}

.member-row {
  @apply flex items-center gap-2.5 text-sm;
}

.member-row__avatar {
  @apply text-base leading-none;
}

.member-row__name {
  @apply font-medium text-text-primary;
}

.member-row__role {
  @apply ml-auto text-xs text-text-muted;
}

/* ═══════════════════════════════════════════
   ③ 开源技术区
   ═══════════════════════════════════════════ */
.oss-section {
  @apply flex w-full max-w-3xl flex-col gap-5
         rounded-2xl border border-border-subtle/30
         bg-bg-surface/15 px-6 py-6;
}

.oss-section__header {
  @apply flex flex-col gap-1;
}

.oss-section__title {
  @apply text-base font-bold text-text-primary;
}

.oss-section__desc {
  @apply text-sm text-text-secondary;
}

.oss-section__grid {
  @apply grid grid-cols-1 gap-5 sm:grid-cols-2;
}

.oss-section__label {
  @apply mb-2 text-[10px] font-bold tracking-[0.2em] uppercase text-text-muted;
}

/* ── 依赖列表 ── */
.oss-list {
  @apply flex flex-col gap-2;
}

.oss-list__item {
  @apply flex items-baseline gap-2 text-sm;
}

.oss-list__dot {
  @apply mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent/50;
}

.oss-list__name {
  @apply shrink-0 font-medium text-text-primary;
}

.oss-list__name--link {
  @apply inline-flex items-center gap-1
         underline decoration-accent/20 underline-offset-2
         transition-colors duration-150
         hover:text-accent-light hover:decoration-accent/50;
}

.oss-list__icon {
  @apply inline-block opacity-40;
}

.oss-list__name--link:hover .oss-list__icon {
  @apply opacity-70;
}

.oss-list__desc {
  @apply text-xs text-text-muted;
}

/* ═══════════════════════════════════════════
   ④ Footer（保持原有 sticky 固定布局不变）
   ═══════════════════════════════════════════ */
.about-us__footer {
  @apply sticky bottom-0 mt-auto flex w-full flex-col items-center gap-4 px-6 py-6
         bg-bg-page/80 backdrop-blur-sm shadow-[0_-8px_24px_rgba(0,0,0,0.4)];
}

.about-us__footer-text {
  @apply text-xs text-text-muted;
}
</style>
