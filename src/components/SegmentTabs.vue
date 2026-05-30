<template>
  <view class="segment-tabs">
    <view
      v-for="item in items"
      :key="item.value"
      class="segment-tabs__item"
      :class="{ 'segment-tabs__item--active': item.value === modelValue }"
      @click="$emit('update:modelValue', item.value)"
    >
      {{ item.label }}
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
  items: Array<{ label: string; value: string }>
}>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<style scoped>
.segment-tabs {
  display: flex;
  gap: 8rpx;
  margin: 0 32rpx;
  padding: 8rpx;
  border-radius: 999rpx;
  background: #FFFFFF;
  border: 1rpx solid #EBEBF0;
  box-shadow: 0 4rpx 16rpx rgba(28, 27, 46, 0.04);
}

.segment-tabs__item {
  flex: 1;
  min-width: 0;
  padding: 16rpx 18rpx;
  border-radius: 999rpx;
  font-size: 26rpx;
  line-height: 32rpx;
  text-align: center;
  color: #8A8A9A;
  white-space: nowrap;
}

.segment-tabs__item--active {
  color: #E8637A;
  background: #FEF0F2;
  font-weight: 600;
}
</style>
