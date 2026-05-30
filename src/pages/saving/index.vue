<template>
  <view class="saving-page">
    <AppNavBar title="共同储蓄" back />

    <view class="saving-list">
      <view v-for="item in savingList" :key="item.id" class="saving-card" @click="goDetail(item.id)">
        <view class="saving-header">
          <text class="saving-icon">{{ item.icon || '💰' }}</text>
          <view class="saving-info">
            <text class="saving-name">{{ item.name }}</text>
            <text class="saving-deadline" v-if="item.deadline">截止: {{ item.deadline }}</text>
          </view>
          <view v-if="item.status === 1" class="completed-tag">✅ 已完成</view>
        </view>
        
        <!-- 进度条 -->
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: getProgress(item) + '%' }"></view>
        </view>
        <view class="progress-info">
          <text class="amount">¥{{ item.currentAmount || 0 }} / ¥{{ item.targetAmount }}</text>
          <text class="percent">{{ getProgress(item) }}%</text>
        </view>
        
        <!-- 贡献占比 -->
        <view class="contribution">
          <view class="contrib-bar">
            <view class="contrib-a" :style="{ width: getContribA(item) + '%' }"></view>
          </view>
          <view class="contrib-labels">
            <text class="contrib-label">🔵 我 {{ getContribA(item) }}%</text>
            <text class="contrib-label">🔴 TA {{ 100 - getContribA(item) }}%</text>
          </view>
        </view>
      </view>
      
      <EmptyState v-if="savingList.length === 0" icon="¥" title="还没有储蓄目标" desc="一起攒钱实现梦想吧。" />
    </view>
    
    <AppFab icon="+" @click="showAddModal = true" />
    
    <AppSheet :open="showAddModal" title="新建储蓄目标" @close="showAddModal = false">
      <scroll-view scroll-y class="sheet-scroll">
        <input v-model="newSaving.name" class="input" placeholder="目标名称" />
        
        <input v-model="newSaving.targetAmount" class="input" placeholder="目标金额" type="digit" />
        
        <!-- 图标选择 -->
        <view class="icon-selector">
          <view 
            v-for="icon in icons" 
            :key="icon"
            class="icon-item"
            :class="{ active: newSaving.icon === icon }"
            @click="newSaving.icon = icon"
          >
            {{ icon }}
          </view>
        </view>
        
        <!-- 截止日期 -->
        <view class="date-picker-section">
          <picker mode="date" :start="today" @change="onDateChange">
            <view class="date-picker-display">
              <text class="date-label">截止日期</text>
              <text class="date-value">{{ newSaving.deadline || '选择日期（可选）' }}</text>
            </view>
          </picker>
        </view>
      </scroll-view>
      <button class="btn-primary" @click="createSaving">开始储蓄</button>
    </AppSheet>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { savingApi } from '@/api'
import AppFab from '@/components/AppFab.vue'
import AppNavBar from '@/components/AppNavBar.vue'
import AppSheet from '@/components/AppSheet.vue'
import EmptyState from '@/components/EmptyState.vue'

const icons = ['✈️', '💍', '🏠', '🎁', '🎓', '💰', '🌴', '🚗']

const savingList = ref<any[]>([])
const showAddModal = ref(false)
const newSaving = ref({
  name: '',
  targetAmount: '',
  icon: '💰',
  deadline: ''
})

const today = new Date().toISOString().split('T')[0]

const onDateChange = (e: any) => {
  newSaving.value.deadline = e.detail.value
}

const getProgress = (item: any) => {
  if (!item.targetAmount || item.targetAmount === 0) return 0
  return Math.min(100, Math.round((item.currentAmount || 0) / item.targetAmount * 100))
}

const getContribA = (item: any) => {
  const total = (item.userAAmount || 0) + (item.userBAmount || 0)
  if (total === 0) return 50
  return Math.round((item.userAAmount || 0) / total * 100)
}

const loadList = async () => {
  try {
    const data = await savingApi.getList()
    savingList.value = data || []
  } catch (e) {
    console.error('加载储蓄列表失败', e)
  }
}

const createSaving = async () => {
  if (!newSaving.value.name.trim()) {
    uni.showToast({ title: '请输入目标名称', icon: 'none' })
    return
  }
  if (!newSaving.value.targetAmount || parseFloat(newSaving.value.targetAmount) < 100) {
    uni.showToast({ title: '目标金额至少100元', icon: 'none' })
    return
  }
  
  try {
    await savingApi.create({
      ...newSaving.value,
      targetAmount: parseFloat(newSaving.value.targetAmount)
    })
    showAddModal.value = false
    newSaving.value = { name: '', targetAmount: '', icon: '💰', deadline: '' }
    loadList()
    uni.showToast({ title: '创建成功', icon: 'success' })
  } catch (e) {
    console.error('创建失败', e)
  }
}

const goDetail = (id: number) => {
  uni.navigateTo({ url: `/pages/saving/detail?id=${id}` })
}

onShow(() => {
  loadList()
})
</script>

<style scoped>
.saving-page {
  min-height: 100vh;
  background: #F7F5F3;
  padding-bottom: 140rpx;
}

.saving-list {
  padding: 24rpx 32rpx;
}

.saving-card {
  background: #fff;
  border-radius: 28rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  border: 1rpx solid #EBEBF0;
  box-shadow: 0 4rpx 16rpx rgba(28, 27, 46, 0.06);
}

.saving-header {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.saving-icon {
  font-size: 48rpx;
  margin-right: 20rpx;
}

.saving-info {
  flex: 1;
}

.saving-name {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #1C1B2E;
  margin-bottom: 4rpx;
}

.saving-deadline {
  font-size: 24rpx;
  color: #8A8A9A;
}

.completed-tag {
  font-size: 24rpx;
  color: #27AE60;
}

.progress-bar {
  height: 16rpx;
  background: #EBEBF0;
  border-radius: 8rpx;
  overflow: hidden;
  margin-bottom: 12rpx;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #E8637A, #9B8EC4);
  border-radius: 8rpx;
  transition: width 0.3s;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.amount {
  font-size: 28rpx;
  font-weight: 600;
  color: #1C1B2E;
}

.percent {
  font-size: 28rpx;
  color: #E8637A;
  font-weight: 600;
}

.contribution {
  padding-top: 16rpx;
  border-top: 1rpx solid #EBEBF0;
}

.contrib-bar {
  height: 8rpx;
  background: #FFCDD2;
  border-radius: 4rpx;
  overflow: hidden;
  margin-bottom: 12rpx;
}

.contrib-a {
  height: 100%;
  background: #4A90D9;
  border-radius: 4rpx;
}

.contrib-labels {
  display: flex;
  justify-content: space-between;
}

.contrib-label {
  font-size: 22rpx;
  color: #8A8A9A;
}

.sheet-scroll {
  max-height: 58vh;
}

.input {
  width: 100%;
  height: 88rpx;
  background: #F7F5F3;
  border: 2rpx solid #EBEBF0;
  border-radius: 20rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  margin-bottom: 24rpx;
  box-sizing: border-box;
}

.icon-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.icon-item {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F7F5F3;
  border-radius: 20rpx;
  font-size: 36rpx;
}

.icon-item.active {
  background: #FEF0F2;
  box-shadow: 0 0 0 2rpx #E8637A;
}

.date-picker-section {
  margin-bottom: 32rpx;
}

.date-picker-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  background: #F7F5F3;
  border: 2rpx solid #EBEBF0;
  border-radius: 20rpx;
}

.date-label {
  font-size: 28rpx;
  color: #1C1B2E;
}

.date-value {
  font-size: 28rpx;
  color: #8A8A9A;
}

.btn-primary {
  width: 100%;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: #E8637A;
  border-radius: 44rpx;
  color: #fff;
  font-size: 32rpx;
  border: none;
}
</style>
