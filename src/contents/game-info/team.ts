/**
 * 团队与成员信息 — 只放数据，类型定义见 types.ts
 * 如需为某位成员添加详细介绍，在 team-intro/ 目录下创建同名 .md 文件。
 */

import type { TeamInfo } from '.'

export const TEAM_INFO: TeamInfo = {
  teamName: 'Momakoding',
  description: '为 2026 年深圳文博会 idga Vibe Jam 而作',
  members: [
    {
      name: 'Saša 萨沙',
      role: '策划 / 程序 / 音效',
      avatar: '🎹',
    },{
      name: 'Zyubin 主编',
      role: '策划 / 远程协助',
      avatar: '🎸',
    },
  ],
}
