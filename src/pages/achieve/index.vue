<template>
  <view class="achieve-page">
    <!-- 亲密值卡片 -->
    <view class="intimacy-card">
      <text class="level-icon">{{ levelIcon }}</text>
      <text class="level-name">{{ levelName }}</text>
      <view class="score-info">
        <text class="score-text">亲密值 {{ intimacyScore }}</text>
        <text class="next-level-text" v-if="nextLevelInfo">距「{{ nextLevelInfo.name }}」还差 {{ nextLevelInfo.gap }} 分</text>
        <text class="next-level-text" v-else>已达最高等级 ✨</text>
      </view>
      <view class="level-progress">
        <view class="level-bar">
          <view class="level-fill" :style="{ width: levelProgress + '%' }"></view>
        </view>
        <text class="level-text">Lv.{{ currentLevel }}</text>
      </view>
    </view>
    
    <!-- 徽章墙 -->
    <view class="badges-section">
      <view class="section-header">
        <text class="section-title">🏆 成就徽章</text>
        <text class="badge-counter">{{ unlockedCount }} / {{ allBadges.length }}</text>
      </view>
      
      <!-- 已解锁 -->
      <view v-if="unlockedList.length > 0" class="badge-group">
        <text class="group-label">已解锁</text>
        <view class="badges-grid">
          <view 
            v-for="badge in unlockedList" 
            :key="badge.badgeId"
            class="badge-item unlocked"
            :class="{ 'is-new': badge.isNew }"
            @click="showBadgeDetail(badge)"
          >
            <text class="badge-icon">{{ badge.icon }}</text>
            <text class="badge-name">{{ badge.badgeName }}</text>
            <text class="badge-date">{{ formatDate(badge.unlockedAt) }}</text>
          </view>
        </view>
      </view>
      
      <!-- 未解锁 -->
      <view v-if="lockedList.length > 0" class="badge-group">
        <text class="group-label">未解锁</text>
        <view class="badges-grid">
          <view 
            v-for="badge in lockedList" 
            :key="badge.badgeId"
            class="badge-item"
            @click="showBadgeDetail(badge)"
          >
            <text class="badge-icon">{{ badge.icon }}</text>
            <text class="badge-name">{{ badge.badgeName }}</text>
            <text class="badge-lock">🔒</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 积分规则 -->
    <view class="rules-section">
      <text class="section-title">📋 积分规则</text>
      <text class="rules-hint">每日积分上限 20 分</text>
      <view class="rule-list">
        <view class="rule-item">
          <text class="rule-action">发布日记</text>
          <text class="rule-score">+2 / 天</text>
        </view>
        <view class="rule-item">
          <text class="rule-action">完成事项</text>
          <text class="rule-score">+5</text>
        </view>
        <view class="rule-item">
          <text class="rule-action">互赞/评论</text>
          <text class="rule-score">+1 / 次（3次/天）</text>
        </view>
        <view class="rule-item">
          <text class="rule-action">纪念日互动</text>
          <text class="rule-score">+10</text>
        </view>
        <view class="rule-item">
          <text class="rule-action">记录存款</text>
          <text class="rule-score">+3 / 天</text>
        </view>
        <view class="rule-item">
          <text class="rule-action">菜谱尝试</text>
          <text class="rule-score">+3 / 天</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { achievementApi, coupleApi } from '@/api'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 等级定义
const levels = [
  { level: 1, name: '热恋期', icon: '💕', min: 0, max: 100 },
  { level: 2, name: '稳定期', icon: '💖', min: 101, max: 300 },
  { level: 3, name: '老夫老妻', icon: '💝', min: 301, max: 500 },
  { level: 4, name: '灵魂伴侣', icon: '👑', min: 501, max: 9999 }
]

const coupleInfo = ref<any>(null)
const allBadges = ref<any[]>([])

// 按解锁状态分组
const unlockedList = computed(() => allBadges.value.filter(b => b.unlocked))
const lockedList = computed(() => allBadges.value.filter(b => !b.unlocked))
const unlockedCount = computed(() => unlockedList.value.length)

const intimacyScore = computed(() => coupleInfo.value?.intimacyScore || 0)

const currentLevel = computed(() => {
  const score = intimacyScore.value
  for (let i = levels.length - 1; i >= 0; i--) {
    if (score >= levels[i].min) return levels[i].level
  }
  return 1
})

const levelName = computed(() => {
  const lv = levels.find(l => l.level === currentLevel.value)
  return lv?.name || '热恋期'
})

const levelIcon = computed(() => {
  const lv = levels.find(l => l.level === currentLevel.value)
  return lv?.icon || '💕'
})

const levelProgress = computed(() => {
  const lv = levels.find(l => l.level === currentLevel.value)
  if (!lv) return 0
  const range = lv.max - lv.min
  const current = intimacyScore.value - lv.min
  return Math.min(100, Math.round(current / range * 100))
})

const nextLevelInfo = computed(() => {
  const idx = levels.findIndex(l => l.level === currentLevel.value)
  if (idx < 0 || idx >= levels.length - 1) return null
  const next = levels[idx + 1]
  return {
    name: next.name,
    gap: next.min - intimacyScore.value
  }
})

const loadData = async () => {
  if (!userStore.userInfo?.coupleId) {
    allBadges.value = []
    coupleInfo.value = null
    return
  }
  
  // 独立请求，互不影响
  try {
    const badges = await achievementApi.getAll()
    allBadges.value = badges || []
  } catch (e) {
    console.error('加载成就数据失败', e)
    allBadges.value = []
  }
  
  try {
    const couple = await coupleApi.getInfo()
    coupleInfo.value = couple
  } catch (e) {
    console.error('加载情侣信息失败', e)
    coupleInfo.value = null
  }
}

const showBadgeDetail = (badge: any) => {
  const status = badge.unlocked ? `已解锁 ${formatDate(badge.unlockedAt)}` : '未解锁'
  uni.showModal({
    title: `${badge.icon} ${badge.badgeName}`,
    content: `${badge.description}\n\n${status}`,
    showCancel: false
  })
  
  if (badge.isNew && badge.unlocked) {
    achievementApi.markAsRead(badge.id)
    badge.isNew = false
  }
}

const formatDate = (date: string) => {
  if (!date) return ''
  return date.substring(0, 10)
}

onShow(async () => {
  await userStore.fetchUserInfo()
  loadData()
})
</script>

<style scoped>
.achieve-page {
  min-height: 100vh;
  background: #F5F5F5;
  padding-bottom: 40rpx;
}

.intimacy-card {
  background: linear-gradient(135deg, #FF6B9D, #C44569);
  margin: 24rpx;
  border-radius: 24rpx;
  padding: 48rpx;
  text-align: center;
  color: #fff;
  box-shadow: 0 8rpx 32rpx rgba(255, 107, 157, 0.3);
}

.level-icon {
  font-size: 80rpx;
  display: block;
  margin-bottom: 16rpx;
}

.level-name {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  margin-bottom: 16rpx;
}

.score-info {
  margin-bottom: 24rpx;
}

.score-text {
  display: block;
  font-size: 26rpx;
  opacity: 0.9;
  margin-bottom: 6rpx;
}

.next-level-text {
  display: block;
  font-size: 22rpx;
  opacity: 0.7;
}

.level-progress {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.level-bar {
  flex: 1;
  height: 16rpx;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 8rpx;
  overflow: hidden;
}

.level-fill {
  height: 100%;
  background: #fff;
  border-radius: 8rpx;
  transition: width 0.5s ease;
}

.level-text {
  font-size: 26rpx;
  font-weight: 600;
}

.badges-section, .rules-section {
  margin: 24rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.badge-counter {
  font-size: 26rpx;
  color: #FF6B9D;
  font-weight: 500;
}

.badge-group {
  margin-bottom: 24rpx;
}

.badge-group:last-child {
  margin-bottom: 0;
}

.group-label {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-bottom: 16rpx;
  padding-left: 4rpx;
}

.badges-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.badge-item {
  width: calc(25% - 15rpx);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 8rpx;
  border-radius: 16rpx;
  background: #F8F8F8;
  position: relative;
  transition: transform 0.2s ease;
}

.badge-item:active {
  transform: scale(0.95);
}

.badge-item.unlocked {
  background: linear-gradient(135deg, #FFF5F7, #FFE8EE);
  box-shadow: 0 4rpx 12rpx rgba(255, 107, 157, 0.1);
}

.badge-item.is-new::after {
  content: 'NEW';
  position: absolute;
  top: 4rpx;
  right: 4rpx;
  background: linear-gradient(135deg, #FF4757, #FF6B81);
  color: #fff;
  font-size: 18rpx;
  padding: 2rpx 8rpx;
  border-radius: 10rpx;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.badge-icon {
  font-size: 48rpx;
  margin-bottom: 8rpx;
}

.badge-item:not(.unlocked) .badge-icon {
  filter: grayscale(1);
  opacity: 0.5;
}

.badge-name {
  font-size: 22rpx;
  color: #333;
  text-align: center;
}

.badge-item:not(.unlocked) .badge-name {
  color: #CCC;
}

.badge-date {
  font-size: 18rpx;
  color: #999;
  margin-top: 4rpx;
}

.badge-lock {
  font-size: 20rpx;
  margin-top: 4rpx;
}

.rules-hint {
  display: block;
  font-size: 22rpx;
  color: #FF6B9D;
  margin-bottom: 16rpx;
  margin-top: -8rpx;
}

.rule-list {
  border-top: 1rpx solid #F5F5F5;
}

.rule-item {
  display: flex;
  justify-content: space-between;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #F5F5F5;
}

.rule-item:last-child {
  border-bottom: none;
}

.rule-action {
  font-size: 28rpx;
  color: #333;
}

.rule-score {
  font-size: 28rpx;
  color: #FF6B9D;
  font-weight: 500;
}
</style>
