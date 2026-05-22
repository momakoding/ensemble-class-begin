<script setup lang="ts">
import { useRouter } from 'vue-router'
import GameButton from '@/components/game-button.vue'
import { GAME_META } from '@/contents/game-info'

interface MenuItem {
	label: string
	variant: 'primary' | 'secondary'
	onClick: () => void
}

const router = useRouter()

const menuItems: MenuItem[] = [
	{
		label: '开始游戏',
		variant: 'primary',
		onClick: () => router.push({ name: 'how-to-play', query: { from: 'start' } }),
	},
	{
		label: '玩法介绍',
		variant: 'secondary',
		onClick: () => router.push({ name: 'how-to-play', query: { from: 'menu' } }),
	},
	{
		label: '关于我们',
		variant: 'secondary',
		onClick: () => router.push({ name: 'about-us' }),
	},
	{
		label: '退出游戏',
		variant: 'secondary',
		onClick: () => {
			window.close()
			window.location.href = 'about:blank'
		},
	},
]
</script>

<template>
	<div class="home-page">
		<!-- 底部渐变遮罩 -->
		<div class="home-page__scrim" />

		<!-- 底部横条 UI -->
		<div class="home-page__bar">
			<div class="home-page__title-group">
				<h1 class="home-page__title">{{ GAME_META.title }}</h1>
				<p v-if="GAME_META.subtitle" class="home-page__subtitle">{{ GAME_META.subtitle }}</p>
			</div>
			<nav class="home-page__nav">
				<GameButton v-for="item in menuItems" :key="item.label" :label="item.label" :variant="item.variant"
					@click="item.onClick" />
			</nav>
		</div>
	</div>
</template>

<style lang="css" scoped>
@reference "@/style.css";

.home-page {
	@apply relative h-screen w-screen overflow-hidden bg-stone-200;
	background-image: url('/img/game-title.png');
	background-size: cover;
	background-position: center top;
}

/* 顶部向下的深色渐变，让 UI 区域可读 */
.home-page__scrim {
	@apply absolute inset-x-0 top-0 h-48 pointer-events-none;
	background: linear-gradient(to bottom, rgba(28, 20, 12, 0.75) 0%, transparent 100%);
}

/* 顶部横条：标题 + 菜单 */
.home-page__bar {
	@apply absolute inset-x-0 top-0 flex flex-row items-center justify-between gap-8 px-16 py-8;
}

.home-page__title-group {
	@apply flex flex-col gap-1;
}

.home-page__title {
	@apply text-4xl font-bold tracking-widest text-orange-100 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)];
}

.home-page__subtitle {
	@apply text-sm tracking-widest text-orange-200/80;
}

.home-page__nav {
	@apply flex flex-row items-center gap-3;
}
</style>
