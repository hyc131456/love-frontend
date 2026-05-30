<template>
  <view class="app-tabbar safe-area-bottom">
    <view
      v-for="item in tabs"
      :key="item.path"
      class="app-tabbar__item"
      :class="{ 'app-tabbar__item--active': item.path === current }"
      @click="go(item.path)"
    >
      <text class="app-tabbar__icon">{{ item.icon }}</text>
      <text class="app-tabbar__label">{{ item.label }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  current: string
}>()

const tabs = [
  { path: '/pages/calendar/index', label: '日历', icon: '▣' },
  { path: '/pages/diary/index', label: '日记', icon: '▤' },
  { path: '/pages/index/index', label: '首页', icon: '⌂' },
  { path: '/pages/wish/index', label: '心愿', icon: '♡' },
  { path: '/pages/mine/index', label: '我的', icon: '○' }
]

const go = (url: string) => {
  if (url === getCurrentPagePath()) return
  uni.switchTab({ url })
}

const getCurrentPagePath = () => {
  const pages = getCurrentPages()
  const current = pages[pages.length - 1]
  return current ? `/${current.route}` : ''
}
</script>

<style scoped>
.app-tabbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 80;
  min-height: 82px;
  padding-top: 12rpx;
  display: flex;
  align-items: flex-start;
  background: rgba(255, 255, 255, 0.96);
  border-top: 1rpx solid #EBEBF0;
  box-shadow: 0 -8rpx 28rpx rgba(28, 27, 46, 0.04);
}

.app-tabbar__item {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
  color: #8A8A9A;
}

.app-tabbar__icon {
  height: 48rpx;
  font-size: 40rpx;
  line-height: 48rpx;
  font-weight: 500;
}

.app-tabbar__label {
  font-size: 20rpx;
  line-height: 24rpx;
}

.app-tabbar__item--active {
  color: #E8637A;
}
</style>
