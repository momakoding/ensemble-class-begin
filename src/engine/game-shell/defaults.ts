/**
 * 引擎级缺省配置 —— 当游戏未显式覆盖时 shell 使用的 fallback 值。
 *
 * DPR：将画布物理像素扩大为设备像素比倍数，消除 HiDPI 屏上的模糊。
 * 上限取 2，避免在 3× 设备上生成过大画布。
 */
export const DPR = Math.min(
  typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1,
  2
)

export const SHELL_DEFAULTS = {
  width: Math.round(1280 * DPR),
  height: Math.round(720 * DPR),
}
