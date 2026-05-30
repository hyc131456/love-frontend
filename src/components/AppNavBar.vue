<template>
  <view class="app-nav" :class="{ 'app-nav--borderless': borderless }" :style="{ paddingTop: `${statusBarHeight}px` }">
    <view class="app-nav__side">
      <view v-if="back" class="app-nav__icon" @click="handleBack">‹</view>
      <slot name="left"></slot>
    </view>
    <text class="app-nav__title">{{ title }}</text>
    <view class="app-nav__side app-nav__side--right">
      <slot name="right"></slot>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  title: string
  back?: boolean
  borderless?: boolean
}>()

const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 0)

const handleBack = () => {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack({ delta: 1 })
    return
  }
  uni.switchTab({ url: '/pages/index/index' })
}
</script>

<style scoped>
.app-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  min-height: 59px;
  padding-left: 40rpx;
  padding-right: 40rpx;
  padding-bottom: 20rpx;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.96);
  border-bottom: 1rpx solid #EBEBF0;
}

.app-nav--borderless {
  border-bottom: none;
}

.app-nav__side {
  width: 72rpx;
  min-height: 44rpx;
  display: flex;
  align-items: center;
}

.app-nav__side--right {
  justify-content: flex-end;
}

.app-nav__title {
  flex: 1;
  text-align: center;
  font-size: 34rpx;
  line-height: 44rpx;
  font-weight: 600;
  color: #1C1B2E;
}

.app-nav__icon {
  width: 56rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-size: 48rpx;
  line-height: 1;
  color: #1C1B2E;
}
</style>
