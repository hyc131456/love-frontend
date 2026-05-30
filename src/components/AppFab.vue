<template>
  <view class="app-fab" @click="$emit('click')">
    <text>{{ icon || '+' }}</text>
  </view>
</template>

<script setup lang="ts">
defineProps<{ icon?: string }>()
defineEmits<{ click: [] }>()
</script>

<style scoped>
.app-fab {
  position: fixed;
  right: 48rpx;
  bottom: 180rpx;
  z-index: 60;
  width: 104rpx;
  height: 104rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #E8637A;
  color: #FFFFFF;
  font-size: 52rpx;
  line-height: 1;
  box-shadow: 0 8rpx 32rpx rgba(232, 99, 122, 0.34);
}

.app-fab:active {
  transform: scale(0.94);
}
</style>
