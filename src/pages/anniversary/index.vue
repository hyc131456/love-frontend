<template>
  <view class="anniversary-page">
    <view v-if="!hasCoupled" class="empty-card">
      <text class="empty-title">还没有可查看的纪念日</text>
      <text class="empty-desc">完成配对后，这里会集中展示恋爱纪念日和你们添加的纪念日事件。</text>
      <button class="primary-btn" @click="goTo('/pages/couple/index')">去配对</button>
    </view>

    <template v-else>
      <view v-if="relationshipAnniversary" class="hero-card">
        <view class="hero-badge">恋爱纪念日</view>
        <text class="hero-days">{{ relationshipDaysText }}</text>
        <text class="hero-date">{{ formatOriginalDate(relationshipAnniversary.eventDate) }}</text>
        <text class="hero-next">{{ formatCountdown(relationshipAnniversary) }}</text>
      </view>

      <view class="section-card">
        <view class="section-header">
          <text class="section-title">提醒状态</text>
          <text class="section-tip">{{ reminderStatusText }}</text>
        </view>
        <text class="section-desc">首页会展示最近 30 天内的纪念日提醒，通知开关可在“我的”页面调整。</text>
      </view>

      <view class="section-card">
        <view class="section-header">
          <text class="section-title">全部纪念日</text>
          <text class="section-tip">{{ anniversaries.length }} 条</text>
        </view>

        <view v-if="anniversaries.length" class="anniversary-list">
          <view v-for="item in anniversaries" :key="item.id" class="anniversary-item">
            <view class="item-icon" :style="{ background: item.color || '#FF6B9D' }">
              {{ item.icon || '💖' }}
            </view>
            <view class="item-main">
              <view class="item-title-row">
                <text class="item-title">{{ item.title }}</text>
                <text v-if="item.systemGenerated === 1" class="item-tag">系统</text>
              </view>
              <text class="item-date">{{ formatOriginalDate(item.eventDate) }}</text>
              <text class="item-reminder">{{ item.reminderSummary || '应用内提醒' }}</text>
            </view>
            <view class="item-side">
              <text class="item-countdown">{{ formatCountdown(item) }}</text>
              <text class="item-next">{{ formatNextDate(item.nextOccurrence) }}</text>
            </view>
          </view>
        </view>

        <view v-else class="empty-inline">
          <text>还没有单独添加纪念日，先去日历里新建一个吧。</text>
        </view>
      </view>

      <button class="primary-btn" @click="goTo('/pages/calendar/index')">去日历管理纪念日</button>
    </template>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { calendarApi } from '@/api'
import { useUserStore } from '@/stores/user'

interface AnniversaryItem {
  id: number
  title: string
  eventDate: string
  nextOccurrence?: string
  daysUntil?: number
  reminderSummary?: string
  color?: string
  icon?: string
  systemGenerated?: number
}

const userStore = useUserStore()
const anniversaries = ref<AnniversaryItem[]>([])

const hasCoupled = computed(() => !!userStore.userInfo?.coupleId)
const relationshipAnniversary = computed(() =>
  anniversaries.value.find(item => item.systemGenerated === 1) || null
)
const relationshipDaysText = computed(() => {
  const days = userStore.coupleInfo?.daysTogether || 0
  return days > 0 ? `在一起第 ${days} 天` : '从心动开始的每一天'
})
const reminderStatusText = computed(() =>
  userStore.userInfo?.enableNotification === 0 ? '已关闭' : '已开启'
)

const loadAnniversaries = async () => {
  if (!hasCoupled.value) {
    anniversaries.value = []
    return
  }

  try {
    const data = await calendarApi.getAnniversaries()
    anniversaries.value = Array.isArray(data) ? data : []
  } catch (e) {
    anniversaries.value = []
    console.error('加载纪念日失败', e)
  }
}

const formatOriginalDate = (date?: string) => {
  if (!date) return ''
  return `${date.slice(0, 4)}年${date.slice(5, 7)}月${date.slice(8, 10)}日`
}

const formatNextDate = (date?: string) => {
  if (!date) return ''
  return `下次 ${date.slice(5, 7)}-${date.slice(8, 10)}`
}

const formatCountdown = (item: AnniversaryItem) => {
  const daysUntil = Number(item.daysUntil ?? -1)
  if (daysUntil < 0) return '日期异常'
  if (daysUntil === 0) return '就是今天'
  if (daysUntil === 1) return '明天'
  return `还有 ${daysUntil} 天`
}

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

onShow(async () => {
  await userStore.fetchUserInfo()
  await loadAnniversaries()
})
</script>

<style scoped>
.anniversary-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgba(255, 107, 157, 0.18), transparent 28%),
    linear-gradient(180deg, #fff4f7 0%, #fffdfd 50%, #fff7f2 100%);
  padding: 32rpx;
  box-sizing: border-box;
}

.hero-card,
.section-card,
.empty-card {
  background: rgba(255, 255, 255, 0.88);
  border: 1rpx solid rgba(255, 107, 157, 0.08);
  border-radius: 32rpx;
  box-shadow: 0 18rpx 50rpx rgba(214, 106, 90, 0.08);
}

.hero-card {
  padding: 40rpx 36rpx;
  margin-bottom: 24rpx;
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8e7f 100%);
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 160rpx;
  height: 52rpx;
  padding: 0 20rpx;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 999rpx;
  color: #fff;
  font-size: 24rpx;
  margin-bottom: 28rpx;
}

.hero-days {
  display: block;
  font-size: 50rpx;
  font-weight: 700;
  color: #fff;
  margin-bottom: 12rpx;
}

.hero-date,
.hero-next {
  display: block;
  color: rgba(255, 255, 255, 0.88);
  font-size: 26rpx;
}

.hero-next {
  margin-top: 10rpx;
}

.section-card {
  padding: 32rpx;
  margin-bottom: 24rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #33272a;
}

.section-tip {
  font-size: 24rpx;
  color: #ff6b9d;
}

.section-desc {
  display: block;
  font-size: 25rpx;
  line-height: 1.7;
  color: #7a6d72;
}

.anniversary-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.anniversary-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  border-radius: 24rpx;
  background: linear-gradient(180deg, #fffafb 0%, #fff6f3 100%);
}

.item-icon {
  width: 88rpx;
  height: 88rpx;
  border-radius: 26rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  color: #fff;
  margin-right: 22rpx;
  flex-shrink: 0;
}

.item-main {
  flex: 1;
  min-width: 0;
}

.item-title-row {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}

.item-title {
  font-size: 29rpx;
  font-weight: 600;
  color: #352a2d;
  margin-right: 12rpx;
}

.item-tag {
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  background: rgba(255, 107, 157, 0.12);
  color: #ff6b9d;
  font-size: 22rpx;
}

.item-date,
.item-reminder,
.item-next,
.item-countdown {
  display: block;
  font-size: 24rpx;
  color: #7b6f74;
}

.item-reminder {
  margin-top: 6rpx;
}

.item-side {
  margin-left: 20rpx;
  text-align: right;
  flex-shrink: 0;
}

.item-countdown {
  font-size: 28rpx;
  font-weight: 600;
  color: #ff6b9d;
  margin-bottom: 10rpx;
}

.empty-card {
  padding: 56rpx 40rpx;
  text-align: center;
  margin-top: 120rpx;
}

.empty-title {
  display: block;
  font-size: 34rpx;
  font-weight: 600;
  color: #352a2d;
  margin-bottom: 18rpx;
}

.empty-desc,
.empty-inline {
  display: block;
  font-size: 26rpx;
  color: #7b6f74;
  line-height: 1.7;
}

.empty-inline {
  padding: 20rpx 0;
}

.primary-btn {
  width: 100%;
  height: 92rpx;
  line-height: 92rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8e7f 100%);
  color: #fff;
  font-size: 30rpx;
  border: none;
  margin-top: 8rpx;
}
</style>
