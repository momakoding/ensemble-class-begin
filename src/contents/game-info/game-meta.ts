/**
 * 游戏基本信息 — 只放数据，类型定义见 types.ts
 *
 * ── 修改指引 ──────────────────────────────────────────
 *  title       游戏名称，显示在主页标题和 About 页游戏卡片
 *  subtitle    副标题（可选），显示在主页标题下方
 *  description 游戏简介（可选），显示在 About 页游戏卡片
 *  tags        游戏标签列表（可选），如 ['动作', '解谜', 'Game Jam']
 *  ossCredits  开源依赖列表（可选），显示在 About 页开源技术区
 * ─────────────────────────────────────────────────────
 */

import type { GameMeta } from './types'

export const GAME_META: GameMeta = {
  title: '合奏课',
  subtitle: 'Ensemble Class Begins',
  description: '倾听学生的故事，把它们弹成歌。',
  tags: ['音游', '叙事', '教育×艺术'],
  showGameCard: true,
  ossCredits: [
    { name: 'Phaser 4',     desc: '游戏引擎',    url: 'https://phaser.io' },
    { name: 'Vue 3',        desc: 'UI 框架',      url: 'https://vuejs.org' },
    { name: 'Vite',         desc: '构建工具',     url: 'https://vitejs.dev' },
    { name: 'Tailwind CSS', desc: '原子化 CSS',   url: 'https://tailwindcss.com' },
    { name: 'Pinia',        desc: '状态管理',     url: 'https://pinia.vuejs.org' },
    { name: 'Vue Router',   desc: '路由',         url: 'https://router.vuejs.org' },
    { name: 'VueUse',       desc: '组合式工具集', url: 'https://vueuse.org' },
    { name: 'Lucide Icons', desc: '图标库',       url: 'https://lucide.dev' },
  ],
}
