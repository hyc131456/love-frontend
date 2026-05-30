<template>
  <view v-if="open" class="app-sheet-mask" @click="$emit('close')">
    <view class="app-sheet" @click.stop>
      <view class="app-sheet__handle"></view>
      <view v-if="title" class="app-sheet__title">{{ title }}</view>
      <slot></slot>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  open: boolean
  title?: string
}>()
defineEmits<{ close: [] }>()
</script>

<style scoped>
.app-sheet-mask {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: flex-end;
  background: rgba(0, 0, 0, 0.4);
}

.app-sheet {
  width: 100%;
  padding: 40rpx 40rpx calc(56rpx + env(safe-area-inset-bottom));
  border-radius: 40rpx 40rpx 0 0;
  background: #FFFFFF;
  box-shadow: 0 -16rpx 48rpx rgba(28, 27, 46, 0.14);
}

.app-sheet__handle {
  width: 72rpx;
  height: 8rpx;
  margin: 0 auto 32rpx;
  border-radius: 999rpx;
  background: #EBEBF0;
}

.app-sheet__title {
  margin-bottom: 32rpx;
  font-size: 34rpx;
  font-weight: 600;
  color: #1C1B2E;
}
</style>
