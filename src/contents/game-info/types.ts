/**
 * game-info 模块的类型定义
 * 所有接口集中在此，数据文件（game-meta.ts / team.ts）只做数据。
 * 请勿编辑 - DO NOT EDIT
 */

/* ── 游戏元信息 ── */

export interface OssCredit {
  /** 项目名称 */
  name: string
  /** 用途描述 */
  desc: string
  /** 项目主页（可选） */
  url?: string
}

export interface GameMeta {
  /** 游戏名称 */
  title: string
  /** 副标题（可选） */
  subtitle?: string
  /** 游戏简介（可选） */
  description?: string
  /** 游戏标签列表（可选），如 ['动作', '解谜', 'Game Jam'] */
  tags?: string[]
  /** 是否在 About 页显示游戏信息卡片（默认 false，填好内容后改为 true） */
  showGameCard?: boolean
  /** 开源依赖列表（可选），显示在 About 页开源技术区 */
  ossCredits?: OssCredit[]
}

/* ── 团队信息 ── */

export interface TeamMember {
  /** 成员姓名 */
  name: string
  /** 职责角色，如"策划 / 程序" */
  role: string
  /** 头像 emoji 或图片 URL（可选） */
  avatar?: string
  /** 是否有详细介绍页（对应 team-intro/<id>.md） */
  introId?: string
}

export interface TeamInfo {
  /** 团队名称 */
  teamName: string
  /** 团队简介（纯文本，较短） */
  description: string
  /** 成员列表 */
  members: TeamMember[]
}
