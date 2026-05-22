# Phaser + Vue 集成学习文档

> 基于 `src/pages/game-demo/` 的「收集星星」Demo 进行拆解

## 1. 整体架构

```
┌─────────────────────────────────────────┐
│  Vue 层 (index.vue)                      │
│  ┌─────────┐  ┌──────────────────────┐  │
│  │  HUD    │  │  <div ref="game">    │  │
│  │  分数/按钮│  │  ← Phaser canvas    │  │
│  └─────────┘  └──────────────────────┘  │
│       ↑ score:update    ↓ game:restart   │
│       └──── EventBus (event-bus.ts) ────┘│
│                    ↕                     │
│  ┌──────────────────────────────────┐   │
│  │  Phaser 层                        │   │
│  │  BootScene → GameScene            │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

核心原则：**Vue 只管 UI，Phaser 只管游戏逻辑，两者通过 EventBus 通信。**

## 2. 文件拆解

### 2.1 `constants.ts` — 常量集中管理

```ts
export const SCENE_KEYS = { BOOT: 'BootScene', GAME: 'GameScene' } as const
export const EVENT_KEYS = { SCORE_UPDATE: 'score:update', ... } as const
export const GAME_CONFIG = { WIDTH: 800, HEIGHT: 600, ... } as const
```

为什么这样做：

- 场景 Key 用字符串容易拼错，常量化后 TS 会帮你检查
- 游戏参数集中管理，调参时只改一个地方
- `as const` 让 TS 推断出字面量类型，更精确

### 2.2 `event-bus.ts` — 跨框架通信

基于浏览器原生 `EventTarget`，零依赖实现发布/订阅模式。

关键设计：

- `on(event, callback)` — 注册监听
- `off(event, callback)` — 移除监听
- `emit(event, ...args)` — 触发事件
- `clear()` — 一键清理所有监听（组件卸载时调用）

为什么不用 Phaser 自带的事件系统？因为 Phaser 的 EventEmitter 绑定在 Scene 上，Vue 组件拿不到 Scene 实例（也不应该拿），所以需要一个独立的桥梁。

### 2.3 `scenes/boot-scene.ts` — 启动/加载场景

学习要点：

1. **Scene 的 Class 结构**

   ```ts
   export class BootScene extends Phaser.Scene {
     constructor() { super({ key: 'BootScene' }) }
     preload() { /* 加载资源 */ }
     create() { /* 资源加载完毕后执行 */ }
   }
   ```

2. **用 Graphics 生成占位纹理**（无需真实图片）

   ```ts
   const gfx = this.make.graphics({ x: 0, y: 0 })
   gfx.fillStyle(0x4488ff, 1)
   gfx.fillRect(0, 0, 32, 48)
   gfx.generateTexture('player', 32, 48)  // 生成名为 'player' 的纹理
   gfx.destroy()  // 用完即销毁 Graphics 对象
   ```

   这是 Game Jam 的利器——先用色块跑通逻辑，后期再替换美术素材。

3. **场景跳转**

   ```ts
   this.scene.start(SCENE_KEYS.GAME)  // 切换到游戏场景
   ```

### 2.4 `scenes/game-scene.ts` — 主游戏场景（核心）

#### 生命周期

```
init(data) → preload() → create() → update() (每帧调用)
                                        ↓
                                    shutdown (场景关闭时)
```

#### Arcade 物理系统

```ts
// 静态组（不受重力影响，如平台）
this.platforms = this.physics.add.staticGroup()

// 动态精灵（受物理影响，如玩家）
this.player = this.physics.add.sprite(100, 500, 'player')
this.player.setCollideWorldBounds(true)

// 单独给玩家设重力（而非全局重力）
;(this.player.body as Phaser.Physics.Arcade.Body).setGravityY(800)

// 碰撞检测
this.physics.add.collider(player, platforms)       // 物理碰撞（会弹开）
this.physics.add.overlap(player, stars, callback)  // 重叠检测（穿过但触发回调）
```

#### 键盘输入

```ts
this.cursors = this.input.keyboard!.createCursorKeys()

// 在 update() 中检测
if (this.cursors.left.isDown) player.setVelocityX(-300)
if (this.cursors.up.isDown && body.touching.down) player.setVelocityY(-450)
```

`touching.down` 确保只有站在地面/平台上才能跳跃，防止空中连跳。

#### Group 管理

```ts
this.stars = this.physics.add.group()
// 批量创建
for (let i = 0; i < 12; i++) {
  const star = this.stars.create(x, y, 'star')
  star.setBounceY(Phaser.Math.FloatBetween(0.2, 0.5))
}
// 检查活跃数量
if (this.stars.countActive(true) === 0) { /* 全部收集完 */ }
```

#### 与 Vue 通信

```ts
// Phaser → Vue：分数更新
eventBus.emit(EVENT_KEYS.SCORE_UPDATE, this.score)

// Vue → Phaser：重启游戏
eventBus.on(EVENT_KEYS.GAME_RESTART, this.handleRestart)
```

#### 清理监听器（重要！）

```ts
this.events.on('shutdown', () => {
  eventBus.off(EVENT_KEYS.GAME_RESTART, this.handleRestart)
})
```

不清理会导致内存泄漏和重复触发。这是 Phaser 开发中最容易踩的坑。

### 2.5 `index.vue` — Vue 容器

关键职责：

1. 提供 `<div ref="gameContainer">` 作为 Phaser canvas 的挂载点
2. HUD 层用 `absolute + z-10 + pointer-events-none` 叠在 canvas 上方
3. `onMounted` 中创建 `new Phaser.Game({ parent: gameContainer })`
4. `onUnmounted` 中调用 `game.destroy(true)` 销毁实例

```ts
// 创建 Phaser 实例
game = new Phaser.Game({
  type: Phaser.AUTO,        // 自动选择 WebGL 或 Canvas
  width: 800, height: 600,
  parent: gameContainer,     // 挂载到 Vue 的 ref 元素
  physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 } } },
  scene: [BootScene, GameScene],  // 场景数组，第一个自动启动
})
```

## 3. 常见问题

### Q: 为什么重力设为 0，玩家还会掉下来？

A: 全局重力为 0，但在 GameScene 中给玩家 body 单独设了 `setGravityY(800)`。这样星星不会受重力影响（它们有 bounce 但不会一直往下掉）。

### Q: 为什么用 `generateTexture` 而不是加载图片？

A: Game Jam 快速原型阶段，逻辑先行。用色块占位可以立即跑起来，不用等美术。后期替换只需改 `preload` 里的加载逻辑。

### Q: EventBus 为什么不用 Pinia？

A: Pinia 是 Vue 的状态管理，Phaser 场景里拿不到 Vue 的响应式上下文。EventBus 是框架无关的，两边都能用。

### Q: 场景切换时为什么要手动清理事件？

A: Phaser 的 `shutdown` 会销毁场景内的游戏对象，但不会自动清理你挂在外部（EventBus）上的监听器。不清理 = 内存泄漏 + 幽灵回调。

## 4. 扩展方向

- 加入敌人（红色方块）+ 碰撞死亡 → `game:over` 事件
- 加入音效 → `this.sound.play('collect')`
- 加入粒子特效 → `this.add.particles(...)` 收集星星时爆发
- 替换占位图为真实 Sprite Sheet → 在 BootScene 的 `preload` 中 `this.load.spritesheet(...)`
- 加入关卡系统 → 多个 GameScene 配置，通过 `init(data)` 传递关卡参数
