<template>
  <view class="index-page">
    <view class="nav-bar" :style="{ paddingTop: `${statusBarHeight}px` }">
      <text class="nav-title">心迹</text>
    </view>

    <view class="couple-header" :style="{ marginTop: `${navBarHeight}px` }">
      <view class="avatars">
        <view class="avatar-wrapper">
          <image class="avatar" :src="userInfo?.avatar || '/static/default-avatar.svg'" mode="aspectFill" />
          <text class="name">{{ userInfo?.nickname || '我' }}</text>
        </view>

        <view v-if="coupleInfo?.partner" class="heart-icon">❤️</view>
        <view v-else class="heart-icon empty">💭</view>

        <view class="avatar-wrapper">
          <image
            class="avatar"
            :class="{ grayscale: !coupleInfo?.partner }"
            :src="coupleInfo?.partner?.avatar || '/static/default-avatar.svg'"
            mode="aspectFill"
          />
          <text class="name">{{ coupleInfo?.partner?.nickname || '等待 TA' }}</text>
        </view>
      </view>

      <view v-if="coupleInfo?.partner" class="stats">
        <text class="level">{{ coupleInfo?.intimacyLevel }}</text>
        <text class="days">在一起 {{ coupleInfo?.daysTogether || 0 }} 天</text>
      </view>
      <view v-else class="stats">
        <text class="level placeholder">开启一段甜蜜旅程吧</text>
      </view>

      <view v-if="coupleInfo?.partner" class="anniversary-link" @click="goTo('/pages/anniversary/index')">
        <text class="anniversary-link__icon">💖</text>
        <text class="anniversary-link__text">查看纪念日</text>
      </view>
    </view>

    <view v-if="upcomingEvent" class="reminder-card" @click="goTo('/pages/anniversary/index')">
      <view class="reminder-icon">💖</view>
      <view class="reminder-content">
        <text class="reminder-title">{{ upcomingEvent.title }}</text>
        <text class="reminder-date">{{ upcomingEvent.dateText }}</text>
      </view>
      <text class="reminder-arrow">›</text>
    </view>

    <view class="quick-entries">
      <view class="entry" @click="goTo('/pages/calendar/index')">
        <view class="entry-icon">📅</view>
        <text class="entry-text">日历</text>
      </view>
      <view class="entry" @click="goTo('/pages/anniversary/index')">
        <view class="entry-icon">💖</view>
        <text class="entry-text">纪念日</text>
      </view>
      <view class="entry" @click="goTo('/pages/diary/edit')">
        <view class="entry-icon">📝</view>
        <text class="entry-text">日记</text>
      </view>
      <view class="entry" @click="goTo('/pages/wish/index')">
        <view class="entry-icon">🎯</view>
        <text class="entry-text">心愿</text>
      </view>
      <view class="entry" @click="goTo('/pages/saving/index')">
        <view class="entry-icon">💰</view>
        <text class="entry-text">储蓄</text>
      </view>
      <view class="entry" @click="goTo('/pages/recipe/index')">
        <view class="entry-icon">🍳</view>
        <text class="entry-text">菜谱</text>
      </view>
      <view class="entry" @click="goTo('/pages/achieve/index')">
        <view class="entry-icon">🏅</view>
        <text class="entry-text">成就</text>
      </view>
    </view>

    <view class="recent-section">
      <view class="section-header">
        <text class="section-title">最近动态</text>
      </view>

      <view class="activity-list">
        <view v-for="item in activities" :key="item.id" class="activity-item">
          <view class="activity-dot"></view>
          <text class="activity-text">{{ item.content }}</text>
          <text class="activity-time">{{ item.time }}</text>
        </view>

        <view v-if="activities.length === 0" class="empty-tip">
          <text>暂时还没有动态，去记录一个新瞬间吧。</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { calendarApi, diaryApi } from '@/api'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const statusBarHeight = ref(0)
const navBarHeight = ref(88)
const userInfo = computed(() => userStore.userInfo)
const coupleInfo = computed(() => userStore.coupleInfo)
const upcomingEvent = ref<any>(null)
const activities = ref<any[]>([])

onMounted(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0
  navBarHeight.value = statusBarHeight.value + 44
})

const loadActivities = async () => {
  try {
    const res = await diaryApi.getList(1, 5)
    if (res?.list) {
      activities.value = res.list.map((item: any) => ({
        id: item.id,
        content: `发布了新日记：${item.content ? item.content.substring(0, 12) : '记录生活'}...`,
        time: item.createdAt ? item.createdAt.substring(0, 16) : ''
      }))
      return
    }
  } catch (e) {
    console.error('获取动态失败', e)
  }

  activities.value = []
}

const buildReminderDateText = (item: any) => {
  const daysUntil = Number(item?.daysUntil ?? -1)
  const nextOccurrence = item?.nextOccurrence || ''
  if (daysUntil === 0) {
    return '今天就是纪念日'
  }
  if (daysUntil === 1) {
    return `明天 · ${nextOccurrence}`
  }
  if (daysUntil > 1) {
    return `还有 ${daysUntil} 天 · ${nextOccurrence}`
  }
  return nextOccurrence
}

const loadUpcomingReminder = async () => {
  try {
    const data = await calendarApi.getUpcomingReminder()
    if (data) {
      upcomingEvent.value = {
        ...data,
        dateText: buildReminderDateText(data)
      }
      return
    }
  } catch (e) {
    console.error('获取纪念日提醒失败', e)
  }

  upcomingEvent.value = null
}

onShow(async () => {
  await userStore.fetchUserInfo()

  if (userStore.userInfo?.coupleId) {
    await Promise.all([loadActivities(), loadUpcomingReminder()])
    return
  }

  activities.value = []
  upcomingEvent.value = null
})

const tabBarPages = [
  '/pages/index/index',
  '/pages/calendar/index',
  '/pages/diary/index',
  '/pages/wish/index',
  '/pages/mine/index'
]

const goTo = (url: string) => {
  const isTabBarPage = tabBarPages.some(page => url.startsWith(page))
  if (isTabBarPage) {
    uni.switchTab({ url })
  } else {
    uni.navigateTo({ url })
  }
}
</script>

<style scoped>
.index-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #ffe4ec 0%, #fff9fa 30%);
  padding-bottom: 40rpx;
}

.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}

.nav-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.couple-header {
  padding: 40rpx;
  text-align: center;
}

.avatars {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
}

.avatar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar {
  width: 130rpx;
  height: 130rpx;
  border-radius: 50%;
  border: 6rpx solid #fff;
  box-shadow: 0 12rpx 32rpx rgba(255, 107, 157, 0.25);
  background: #fff;
}

.avatar.grayscale {
  filter: grayscale(100%);
  opacity: 0.6;
}

.name {
  margin-top: 16rpx;
  font-size: 28rpx;
  font-weight: 500;
  color: #555;
}

.heart-icon {
  font-size: 56rpx;
  margin: 0 40rpx;
  animation: heartbeat 1.5s ease-in-out infinite;
  filter: drop-shadow(0 4rpx 12rpx rgba(255, 107, 157, 0.4));
}

.heart-icon.empty {
  animation: none;
  opacity: 0.3;
}

@keyframes heartbeat {
  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }
}

.stats {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.level {
  font-size: 28rpx;
  color: #ff6b9d;
  margin-bottom: 8rpx;
}

.level.placeholder {
  color: #999;
  font-style: italic;
}

.days {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.anniversary-link {
  margin-top: 22rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14rpx 26rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 10rpx 26rpx rgba(255, 107, 157, 0.12);
}

.anniversary-link__icon {
  font-size: 24rpx;
  margin-right: 10rpx;
}

.anniversary-link__text {
  font-size: 24rpx;
  color: #ff6b9d;
  font-weight: 600;
}

.reminder-card {
  margin: 0 32rpx 32rpx;
  padding: 36rpx 32rpx;
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8e9e 100%);
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 12rpx 32rpx rgba(255, 107, 157, 0.3);
}

.reminder-icon {
  font-size: 48rpx;
  margin-right: 24rpx;
}

.reminder-content {
  flex: 1;
}

.reminder-title {
  display: block;
  font-size: 30rpx;
  font-weight: 500;
  color: #fff;
  margin-bottom: 8rpx;
}

.reminder-date {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.82);
}

.reminder-arrow {
  font-size: 44rpx;
  color: rgba(255, 255, 255, 0.8);
}

.quick-entries {
  display: flex;
  flex-wrap: wrap;
  padding: 0 20rpx;
  margin-bottom: 48rpx;
}

.entry {
  width: calc(33.333% - 24rpx);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32rpx 0;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  margin: 12rpx;
  border-radius: 32rpx;
  box-shadow: 0 16rpx 48rpx rgba(255, 107, 157, 0.08);
}

.entry:active {
  transform: scale(0.96);
}

.entry-icon {
  font-size: 56rpx;
  margin-bottom: 16rpx;
}

.entry-text {
  font-size: 26rpx;
  font-weight: 500;
  color: #555;
}

.recent-section {
  padding: 0 32rpx;
}

.section-header {
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.activity-list {
  background: #fff;
  border-radius: 32rpx;
  padding: 32rpx;
  box-shadow: 0 16rpx 48rpx rgba(255, 107, 157, 0.06);
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx dashed #f0f0f0;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-dot {
  width: 12rpx;
  height: 12rpx;
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8e9e 100%);
  border-radius: 50%;
  margin-right: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(255, 107, 157, 0.4);
}

.activity-text {
  flex: 1;
  font-size: 28rpx;
  color: #444;
}

.activity-time {
  font-size: 24rpx;
  color: #999;
}

.empty-tip {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 26rpx;
}
</style>
