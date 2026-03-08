<template>
  <view class="detail-page">
    <view v-if="saving" class="detail-content">
      <!-- 基本信息 -->
      <view class="info-card">
        <text class="saving-icon">{{ saving.icon || '💰' }}</text>
        <text class="saving-name">{{ saving.name }}</text>
        <text v-if="saving.status === 1" class="completed-badge">🎉 已达成！</text>
      </view>
      
      <!-- 进度展示 -->
      <view class="progress-card">
        <view class="amount-display">
          <text class="current-amount">¥{{ saving.currentAmount || 0 }}</text>
          <text class="target-amount">/ ¥{{ saving.targetAmount }}</text>
        </view>
        
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: progress + '%' }"></view>
        </view>
        <text class="progress-percent">{{ progress }}%</text>
        
        <view v-if="saving.deadline" class="deadline-info">
          <text>📅 截止日期: {{ saving.deadline }}</text>
        </view>
      </view>
      
      <!-- 贡献占比 -->
      <view class="contrib-card">
        <text class="card-title">贡献占比</text>
        <view class="contrib-visual">
          <view class="contrib-bar">
            <view class="contrib-a" :style="{ width: contribA + '%' }"></view>
          </view>
          <view class="contrib-labels">
            <text>🔵 我 {{ contribA }}%</text>
            <text>🔴 TA {{ 100 - contribA }}%</text>
          </view>
        </view>
      </view>
      
      <!-- 存款操作 -->
      <view v-if="saving.status === 0" class="deposit-card">
        <text class="card-title">记录存款</text>
        <view class="deposit-form">
          <input v-model="depositAmount" class="input" placeholder="存款金额" type="digit" />
          <input v-model="depositNote" class="input" placeholder="备注（可选）" />
          <button class="btn-primary" @click="doDeposit">存入</button>
        </view>
      </view>
      
      <!-- 存款记录 -->
      <view class="records-card">
        <text class="card-title">存款记录</text>
        <view v-if="records.length > 0" class="record-list">
          <view v-for="record in records" :key="record.id" class="record-item">
            <view class="record-info">
              <text class="record-user">{{ record.userId === currentUserId ? '我' : 'TA' }}</text>
              <text class="record-note">{{ record.note || '存款' }}</text>
            </view>
            <view class="record-right">
              <text class="record-amount">+¥{{ record.amount }}</text>
              <text class="record-time">{{ formatTime(record.createdAt) }}</text>
            </view>
          </view>
        </view>
        <view v-else class="empty-tip">
          <text>暂无存款记录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { savingApi } from '@/api'

const saving = ref<any>(null)
const records = ref<any[]>([])
const depositAmount = ref('')
const depositNote = ref('')
const currentUserId = ref(0)

const progress = computed(() => {
  if (!saving.value || !saving.value.targetAmount) return 0
  return Math.min(100, Math.round((saving.value.currentAmount || 0) / saving.value.targetAmount * 100))
})

const contribA = computed(() => {
  if (!saving.value) return 50
  const total = (saving.value.userAAmount || 0) + (saving.value.userBAmount || 0)
  if (total === 0) return 50
  return Math.round((saving.value.userAAmount || 0) / total * 100)
})

const loadDetail = async (id: number) => {
  try {
    const data = await savingApi.getDetail(id)
    saving.value = data
    // 从存款记录中获取
    records.value = data.records || []
  } catch (e) {
    console.error('加载详情失败', e)
  }
}

const doDeposit = async () => {
  if (!depositAmount.value || parseFloat(depositAmount.value) <= 0) {
    uni.showToast({ title: '请输入有效金额', icon: 'none' })
    return
  }
  
  try {
    await savingApi.deposit(
      saving.value.id,
      parseFloat(depositAmount.value),
      depositNote.value || undefined
    )
    depositAmount.value = ''
    depositNote.value = ''
    loadDetail(saving.value.id)
    uni.showToast({ title: '存入成功！', icon: 'success' })
  } catch (e) {
    console.error('存款失败', e)
  }
}

const formatTime = (time: string) => {
  if (!time) return ''
  return time.substring(0, 10)
}

onLoad((options: any) => {
  if (options?.id) {
    loadDetail(parseInt(options.id))
  }
  const userInfo = uni.getStorageSync('userInfo')
  if (userInfo) {
    currentUserId.value = JSON.parse(userInfo).id || 0
  }
})
</script>

<style scoped>
.detail-page {
  min-height: 100vh;
  background: #F5F5F5;
  padding-bottom: 40rpx;
}

.detail-content {
  padding: 24rpx;
}

.info-card {
  background: linear-gradient(135deg, #FF6B9D, #FF8E9E);
  border-radius: 24rpx;
  padding: 48rpx;
  text-align: center;
  margin-bottom: 24rpx;
}

.saving-icon {
  font-size: 72rpx;
  display: block;
  margin-bottom: 16rpx;
}

.saving-name {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: #fff;
  margin-bottom: 12rpx;
}

.completed-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.3);
  padding: 8rpx 24rpx;
  border-radius: 20rpx;
  font-size: 26rpx;
  color: #fff;
}

.progress-card, .contrib-card, .deposit-card, .records-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
}

.amount-display {
  text-align: center;
  margin-bottom: 24rpx;
}

.current-amount {
  font-size: 48rpx;
  font-weight: 700;
  color: #FF6B9D;
}

.target-amount {
  font-size: 28rpx;
  color: #999;
  margin-left: 8rpx;
}

.progress-bar {
  height: 20rpx;
  background: #F0F0F0;
  border-radius: 10rpx;
  overflow: hidden;
  margin-bottom: 12rpx;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FF6B9D, #FF8E9E);
  border-radius: 10rpx;
}

.progress-percent {
  display: block;
  text-align: center;
  font-size: 28rpx;
  color: #FF6B9D;
  font-weight: 600;
  margin-bottom: 16rpx;
}

.deadline-info {
  text-align: center;
  font-size: 26rpx;
  color: #999;
}

.card-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 24rpx;
}

.contrib-bar {
  height: 12rpx;
  background: #FFCDD2;
  border-radius: 6rpx;
  overflow: hidden;
  margin-bottom: 16rpx;
}

.contrib-a {
  height: 100%;
  background: #4A90D9;
}

.contrib-labels {
  display: flex;
  justify-content: space-between;
  font-size: 26rpx;
  color: #666;
}

.deposit-form {
  display: flex;
  flex-direction: column;
}

.input {
  width: 100%;
  height: 88rpx;
  background: #F8F8F8;
  border-radius: 16rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  margin-bottom: 20rpx;
  box-sizing: border-box;
}

.btn-primary {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(135deg, #FF6B9D, #FF8E9E);
  border-radius: 44rpx;
  color: #fff;
  font-size: 32rpx;
  border: none;
}

.record-list {
  max-height: 600rpx;
  overflow-y: auto;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #F5F5F5;
}

.record-item:last-child {
  border-bottom: none;
}

.record-user {
  display: inline-block;
  background: #FFE4EC;
  color: #FF6B9D;
  padding: 4rpx 16rpx;
  border-radius: 16rpx;
  font-size: 24rpx;
  margin-right: 12rpx;
}

.record-note {
  font-size: 28rpx;
  color: #333;
}

.record-right {
  text-align: right;
}

.record-amount {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #27AE60;
  margin-bottom: 4rpx;
}

.record-time {
  font-size: 22rpx;
  color: #999;
}

.empty-tip {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 26rpx;
}
</style>
