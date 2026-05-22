# 合奏课 · 实施 TODO

## 阶段一：骨架注册

- [x] `constants.ts` — SCENE_KEYS / EVENT_KEYS / ASSET_KEYS / GAME_CONFIG
- [x] `game-info/game-meta.ts`
- [x] `game-info/how-to-play.md`
- [x] `game-info/team.ts`

## 阶段二：内容数据

- [x] `contents/data/kids.ts` — 三位学生 + 对白
- [x] `contents/data/charts.ts` — 四张谱面（rain/chair/cat/boss）
- [x] `contents/audio/synth.ts` — WebAudio playNote

## 阶段三：场景实现

- [x] `scenes/boot-scene.ts` — generateTexture 替换
- [x] `scenes/classroom-scene.ts` — 教室枢纽（状态靠 registry）
- [x] `scenes/dialogue-scene.ts` — 对白 + 跳 RhythmScene
- [x] `scenes/rhythm-scene.ts` — 4 键下落引擎
- [x] `scenes/boss-scene.ts` — 继承 RhythmScene，三段 waveform
- [x] `scenes/ending-scene.ts` — 谢幕

## 阶段四：接线

- [x] `scenes/index.ts` — 导出新场景，删 GameScene
- [x] `pages/game-demo/` — 删除
- [x] `pages/game.vue` — 直接 initGame + HUD

## 剩余待验收

- [ ] 跑一遍全流程：教室 → 三关 → boss → 结局
- [ ] 控制台无 TS 错误
- [ ] ESC 暂停正常工作
