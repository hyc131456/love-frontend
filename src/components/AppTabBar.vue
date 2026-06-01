<template>
  <view class="app-tabbar safe-area-bottom">
    <view
      v-for="item in tabs"
      :key="item.path"
      class="app-tabbar__item"
      :class="{ 'app-tabbar__item--active': item.path === current }"
      @click="go(item.path)"
    >
      <image
        class="app-tabbar__icon"
        :src="item.path === current ? item.activeIcon : item.icon"
        mode="aspectFit"
      />
      <text class="app-tabbar__label">{{ item.label }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  current: string
}>()

const tabs = [
  {
    path: '/pages/calendar/index',
    label: '日历',
    icon: '/static/tabbar/calendar.svg',
    activeIcon: '/static/tabbar/calendar-active.svg'
  },
  {
    path: '/pages/diary/index',
    label: '日记',
    icon: '/static/tabbar/diary.svg',
    activeIcon: '/static/tabbar/diary-active.svg'
  },
  {
    path: '/pages/index/index',
    label: '首页',
    icon: '/static/tabbar/home.svg',
    activeIcon: '/static/tabbar/home-active.svg'
  },
  {
    path: '/pages/wish/index',
    label: '心愿',
    icon: '/static/tabbar/wish.svg',
    activeIcon: '/static/tabbar/wish-active.svg'
  },
  {
    path: '/pages/mine/index',
    label: '我的',
    icon: '/static/tabbar/mine.svg',
    activeIcon: '/static/tabbar/mine-active.svg'
  }
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
  left: 50%;
  right: auto;
  bottom: 0;
  width: 100%;
  max-width: 390px;
  transform: translateX(-50%);
  z-index: 80;
  height: calc(60px + env(safe-area-inset-bottom));
  padding-top: 18rpx;
  padding-bottom: env(safe-area-inset-bottom);
  display: flex;
  align-items: flex-start;
  box-sizing: border-box;
  background: #FFFFFF;
  border-top: 1rpx solid #EBEBF0;
  box-shadow: 0 -8rpx 28rpx rgba(28, 27, 46, 0.04);
  backdrop-filter: blur(12px);
}

.app-tabbar__item {
  flex: 1;
  min-width: 0;
  height: 112rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 2rpx;
  color: #8A8A9A;
}

.app-tabbar__icon {
  width: 44rpx;
  height: 44rpx;
  display: block;
}

.app-tabbar__label {
  font-size: 20rpx;
  line-height: 26rpx;
}

.app-tabbar__item--active {
  color: #E8637A;
}
</style>
