<template>
  <view class="empty-state">
    <text class="empty-state__icon">{{ icon || '·' }}</text>
    <text class="empty-state__title">{{ title }}</text>
    <text v-if="desc" class="empty-state__desc">{{ desc }}</text>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  icon?: string
  title: string
  desc?: string
}>()
</script>

<style scoped>
.empty-state {
  padding: 96rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.empty-state__icon {
  margin-bottom: 20rpx;
  font-size: 72rpx;
  color: #8A8A9A;
}

.empty-state__title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1C1B2E;
}

.empty-state__desc {
  margin-top: 12rpx;
  font-size: 26rpx;
  line-height: 1.6;
  color: #8A8A9A;
}
</style>
