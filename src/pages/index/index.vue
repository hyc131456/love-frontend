<template>
  <view class="home-page">
    <AppNavBar title="心迹" />

    <scroll-view scroll-y class="home-scroll">
      <view class="couple-card">
        <view class="avatar-pair">
          <view class="person">
            <image class="avatar" :src="userInfo?.avatar || '/static/default-avatar.svg'" mode="aspectFill" />
            <text class="name">{{ userInfo?.nickname || '我' }}</text>
          </view>
          <text class="heart">{{ coupleInfo?.partner ? '♥' : '♡' }}</text>
          <view class="person">
            <image
              class="avatar"
              :class="{ muted: !coupleInfo?.partner }"
              :src="coupleInfo?.partner?.avatar || '/static/default-avatar.svg'"
              mode="aspectFill"
            />
            <text class="name">{{ coupleInfo?.partner?.nickname || '等待 TA' }}</text>
          </view>
        </view>

        <view v-if="coupleInfo?.partner" class="couple-meta">
          <text class="level">{{ coupleInfo?.intimacyLevel || '稳定期' }}</text>
          <text class="days">在一起 {{ coupleInfo?.daysTogether || 0 }} 天</text>
          <view class="pill" @click="goTo('/pages/anniversary/index')">查看纪念日</view>
        </view>
        <view v-else class="couple-meta">
          <text class="level muted-text">开启一段专属旅程</text>
          <view class="pill" @click="goTo('/pages/couple/index')">去配对</view>
        </view>
      </view>

      <view v-if="upcomingEvent" class="reminder-card" @click="goTo('/pages/anniversary/index')">
        <view class="reminder-mark">♡</view>
        <view class="reminder-main">
          <text class="reminder-title">{{ upcomingEvent.title }}</text>
          <text class="reminder-date">{{ upcomingEvent.dateText }}</text>
        </view>
        <text class="chevron">›</text>
      </view>

      <view class="module-grid">
        <view v-for="item in modules" :key="item.label" class="module-item" @click="goTo(item.url)">
          <text class="module-icon">{{ item.icon }}</text>
          <text class="module-label">{{ item.label }}</text>
        </view>
      </view>

      <view class="section">
        <view class="section-title">最近动态</view>
        <view class="activity-card">
          <view v-for="item in activities" :key="item.id" class="activity-item">
            <view class="activity-dot"></view>
            <text class="activity-text">{{ item.content }}</text>
            <text class="activity-time">{{ item.time }}</text>
          </view>
          <EmptyState
            v-if="activities.length === 0"
            icon="▤"
            title="还没有动态"
            desc="记录一篇日记，给这里添上第一段回忆。"
          />
        </view>
      </view>
    </scroll-view>

    <AppTabBar current="/pages/index/index" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { calendarApi, diaryApi } from '@/api'
import { useUserStore } from '@/stores/user'
import AppNavBar from '@/components/AppNavBar.vue'
import AppTabBar from '@/components/AppTabBar.vue'
import EmptyState from '@/components/EmptyState.vue'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)
const coupleInfo = computed(() => userStore.coupleInfo)
const upcomingEvent = ref<any>(null)
const activities = ref<any[]>([])

const modules = [
  { label: '日历', icon: '▣', url: '/pages/calendar/index' },
  { label: '纪念日', icon: '♡', url: '/pages/anniversary/index' },
  { label: '日记', icon: '▤', url: '/pages/diary/edit' },
  { label: '心愿', icon: '☆', url: '/pages/wish/index' },
  { label: '储蓄', icon: '¥', url: '/pages/saving/index' },
  { label: '菜谱', icon: '♨', url: '/pages/recipe/index' },
  { label: '图库', icon: '▧', url: '/pages/gallery/index' },
  { label: '成就', icon: '◎', url: '/pages/achieve/index' },
  { label: '姨妈期', icon: '☾', url: '/pages/period/index' }
]

const tabBarPages = [
  '/pages/index/index',
  '/pages/calendar/index',
  '/pages/diary/index',
  '/pages/wish/index',
  '/pages/mine/index'
]

const goTo = (url: string) => {
  if (tabBarPages.some(page => url.startsWith(page))) {
    uni.switchTab({ url })
    return
  }
  uni.navigateTo({ url })
}

const buildReminderDateText = (item: any) => {
  const daysUntil = Number(item?.daysUntil ?? -1)
  const nextOccurrence = item?.nextOccurrence || ''
  if (daysUntil === 0) return '今天就是纪念日'
  if (daysUntil === 1) return `明天 · ${nextOccurrence}`
  if (daysUntil > 1) return `还有 ${daysUntil} 天 · ${nextOccurrence}`
  return nextOccurrence
}

const loadActivities = async () => {
  try {
    const res = await diaryApi.getList(1, 5)
    activities.value = (res?.list || []).map((item: any) => ({
      id: item.id,
      content: `发布了新日记：${item.content ? item.content.substring(0, 12) : '记录生活'}...`,
      time: item.createdAt ? item.createdAt.substring(0, 16) : ''
    }))
  } catch (e) {
    console.error('获取动态失败', e)
    activities.value = []
  }
}

const loadUpcomingReminder = async () => {
  try {
    const data = await calendarApi.getUpcomingReminder()
    upcomingEvent.value = data ? { ...data, dateText: buildReminderDateText(data) } : null
  } catch (e) {
    console.error('获取纪念日提醒失败', e)
    upcomingEvent.value = null
  }
}

onShow(async () => {
  uni.hideTabBar()
  await userStore.fetchUserInfo()

  if (userStore.userInfo?.coupleId) {
    await Promise.all([loadActivities(), loadUpcomingReminder()])
    return
  }

  activities.value = []
  upcomingEvent.value = null
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #F7F5F3;
}

.home-scroll {
  height: calc(100vh - 59px);
  padding-bottom: 120px;
}

.couple-card {
  margin: 24rpx 32rpx;
  padding: 44rpx 32rpx 32rpx;
  border-radius: 32rpx;
  background: linear-gradient(160deg, #FDE8EC 0%, #F3EEFF 58%, #E8F4FF 100%);
  border: 1rpx solid rgba(255, 255, 255, 0.72);
  box-shadow: 0 4rpx 16rpx rgba(28, 27, 46, 0.06);
}

.avatar-pair {
  display: flex;
  align-items: center;
  justify-content: center;
}

.person {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar {
  width: 128rpx;
  height: 128rpx;
  border-radius: 50%;
  border: 6rpx solid #FFFFFF;
  background: #FFFFFF;
  box-shadow: 0 8rpx 24rpx rgba(28, 27, 46, 0.12);
}

.avatar.muted {
  opacity: 0.55;
  filter: grayscale(1);
}

.name {
  margin-top: 16rpx;
  font-size: 26rpx;
  color: #1C1B2E;
}

.heart {
  margin: 0 44rpx;
  font-size: 48rpx;
  color: #E8637A;
}

.couple-meta {
  margin-top: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.level {
  font-size: 28rpx;
  color: #E8637A;
  font-weight: 600;
}

.muted-text {
  color: #8A8A9A;
}

.days {
  margin-top: 8rpx;
  font-size: 34rpx;
  color: #1C1B2E;
  font-weight: 700;
}

.pill {
  margin-top: 22rpx;
  padding: 12rpx 28rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.82);
  color: #E8637A;
  font-size: 24rpx;
  font-weight: 600;
  border: 1rpx solid rgba(232, 99, 122, 0.14);
}

.reminder-card {
  margin: 0 32rpx 24rpx;
  padding: 28rpx 32rpx;
  display: flex;
  align-items: center;
  border-radius: 32rpx;
  background: #E8637A;
  color: #FFFFFF;
  box-shadow: 0 8rpx 28rpx rgba(232, 99, 122, 0.28);
}

.reminder-mark {
  margin-right: 24rpx;
  font-size: 42rpx;
}

.reminder-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.reminder-title {
  font-size: 30rpx;
  font-weight: 600;
}

.reminder-date {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.82);
}

.chevron {
  font-size: 44rpx;
  color: rgba(255, 255, 255, 0.82);
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
  padding: 0 32rpx 32rpx;
}

.module-item {
  min-height: 150rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 28rpx;
  background: #FFFFFF;
  border: 1rpx solid #EBEBF0;
  box-shadow: 0 4rpx 16rpx rgba(28, 27, 46, 0.05);
}

.module-item:active {
  transform: scale(0.97);
}

.module-icon {
  height: 52rpx;
  font-size: 44rpx;
  line-height: 52rpx;
  color: #E8637A;
}

.module-label {
  margin-top: 12rpx;
  font-size: 26rpx;
  color: #1C1B2E;
}

.section {
  padding: 0 32rpx 32rpx;
}

.section-title {
  margin-bottom: 20rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #1C1B2E;
}

.activity-card {
  border-radius: 32rpx;
  background: #FFFFFF;
  border: 1rpx solid #EBEBF0;
  box-shadow: 0 4rpx 16rpx rgba(28, 27, 46, 0.06);
  overflow: hidden;
}

.activity-item {
  min-height: 96rpx;
  padding: 0 32rpx;
  display: flex;
  align-items: center;
  border-bottom: 1rpx solid #EBEBF0;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-dot {
  width: 12rpx;
  height: 12rpx;
  margin-right: 20rpx;
  border-radius: 50%;
  background: #E8637A;
}

.activity-text {
  flex: 1;
  min-width: 0;
  font-size: 26rpx;
  color: #1C1B2E;
}

.activity-time {
  margin-left: 20rpx;
  font-size: 22rpx;
  color: #8A8A9A;
}
</style>
