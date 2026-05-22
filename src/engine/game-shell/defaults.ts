/**
 * 引擎级缺省配置 —— 当游戏未显式覆盖时 shell 使用的 fallback 值。
 *
 * 这不是"游戏内容"，而是 shell 的内部兜底行为：
 *   - 游戏想要自定义画幅时，在初始场景的 init()/create() 里调用
 *     `this.scale.resize(width, height)` 即可。
 *   - 想要换物理系统、开 debug 时，同样在场景内通过 Phaser API 临时覆盖。
 *
 * 这样 engine 与 game 之间保持零耦合，签名不被 config 对象污染。
 */
export const SHELL_DEFAULTS = {
  width: 1280,
  height: 720,
} as const
