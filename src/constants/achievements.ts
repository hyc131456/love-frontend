export interface AchievementDefinition {
  badgeId: string
  badgeName: string
  icon: string
  description: string
}

export const achievementDefinitions: AchievementDefinition[] = [
  { badgeId: 'first_meet', badgeName: '初次相遇', icon: '💕', description: '完成配对' },
  { badgeId: 'first_diary', badgeName: '初心', icon: '📝', description: '发布第一篇日记' },
  { badgeId: 'diary_10', badgeName: '记录者', icon: '📚', description: '累计发布10篇日记' },
  { badgeId: 'diary_50', badgeName: '回忆收藏家', icon: '🎭', description: '累计发布50篇日记' },
  { badgeId: 'first_wish', badgeName: '许愿人', icon: '⭐', description: '创建第一个心愿' },
  { badgeId: 'wish_complete', badgeName: '圆梦者', icon: '🌟', description: '完成第一个心愿' },
  { badgeId: 'saving_1000', badgeName: '小金库', icon: '💰', description: '储蓄达到1000元' },
  { badgeId: 'together_30', badgeName: '一个月', icon: '🌙', description: '在一起30天' },
  { badgeId: 'together_100', badgeName: '百日纪念', icon: '💯', description: '在一起100天' },
  { badgeId: 'together_365', badgeName: '周年庆', icon: '🎂', description: '在一起一年' },
  { badgeId: 'first_recipe', badgeName: '初试锋芒', icon: '🍳', description: '创建第一个菜谱' },
  { badgeId: 'recipe_10', badgeName: '家庭大厨', icon: '👨‍🍳', description: '累计10个菜谱' }
]

export const lockedAchievementDefinitions = () => achievementDefinitions.map(badge => ({
  ...badge,
  unlocked: false,
  isNew: false,
  unlockedAt: null
}))
