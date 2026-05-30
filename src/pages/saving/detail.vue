<template>
  <view class="detail-page">
    <view class="detail-header" :style="{ paddingTop: `${statusBarHeight}px` }">
      <button class="back-btn" @click="goBack">‹</button>
      <text class="header-title">储蓄详情</text>
      <view class="header-spacer"></view>
    </view>

    <scroll-view v-if="saving" scroll-y class="detail-scroll">
      <view class="detail-content">
        <view class="goal-card">
          <view class="goal-top">
            <view class="goal-title-wrap">
              <text class="goal-icon">{{ saving.icon || '💰' }}</text>
              <view class="goal-copy">
                <text class="goal-name">{{ saving.name }}</text>
                <text v-if="saving.deadline" class="goal-date">截止 {{ saving.deadline }}</text>
              </view>
            </view>
            <text class="status-badge" :class="saving.status === 1 ? 'badge-done' : 'badge-active'">
              {{ saving.status === 1 ? '已完成' : '进行中' }}
            </text>
          </view>

          <view class="amount-line">
            <view class="amount-main">
              <text class="amount-label">已存</text>
              <text class="saved-amount">¥{{ formatMoney(saving.currentAmount) }}</text>
            </view>
            <text class="target-amount">目标 ¥{{ formatMoney(saving.targetAmount) }}</text>
          </view>

          <view class="progress-row">
            <view class="progress-bar">
              <view class="progress-fill" :style="{ width: progress + '%' }"></view>
            </view>
            <text class="progress-pct">{{ progress }}%</text>
          </view>

          <button v-if="saving.status !== 1" class="deposit-entry" @click="openDeposit">+ 记录存款</button>
        </view>

        <view class="panel">
          <text class="panel-title">贡献占比</text>
          <view class="contrib">
            <view class="contrib-pie" :style="{ background: pieGradient }"></view>
            <view class="contrib-legend">
              <view class="contrib-line">
                <text class="contrib-dot contrib-dot-a"></text>
                <text>{{ getRoleName('A') }} ¥{{ formatMoney(saving.userAAmount) }}</text>
              </view>
              <view class="contrib-line">
                <text class="contrib-dot contrib-dot-b"></text>
                <text>{{ getRoleName('B') }} ¥{{ formatMoney(saving.userBAmount) }}</text>
              </view>
            </view>
          </view>
        </view>

        <view class="panel">
          <text class="panel-title">存款记录</text>
          <view v-if="records.length > 0" class="record-list">
            <view v-for="record in records" :key="record.id" class="record-item">
              <view class="record-left">
                <text class="record-user">{{ getRecordUser(record) }}</text>
                <text class="record-note">{{ record.note || '存款' }}</text>
              </view>
              <view class="record-right">
                <text class="record-amount">+¥{{ formatMoney(record.amount) }}</text>
                <text class="record-time">{{ formatTime(record.createdAt) }}</text>
              </view>
            </view>
          </view>
          <view v-else class="empty-record">
            <text>暂无存款记录</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <AppSheet :open="showDepositSheet" title="记录存款" @close="closeDeposit">
      <view class="sheet-form">
        <view class="form-group">
          <text class="form-label">存入目标</text>
          <view class="readonly-field">{{ saving?.name || '当前目标' }}</view>
        </view>

        <view class="form-group">
          <text class="form-label">金额（元）</text>
          <input v-model="depositForm.amount" class="form-input" placeholder="例如：500" type="digit" />
        </view>

        <view class="form-group">
          <text class="form-label">存款人</text>
          <view class="person-row">
            <button
              v-for="person in depositors"
              :key="person.role"
              class="person-btn"
              :class="{ selected: depositForm.depositorRole === person.role }"
              @click="depositForm.depositorRole = person.role"
            >
              {{ person.name }}
            </button>
          </view>
        </view>

        <view class="form-group">
          <text class="form-label">备注（可选）</text>
          <input v-model="depositForm.note" class="form-input" placeholder="例如：这个月工资结了" />
        </view>

        <button class="btn-primary" @click="doDeposit">确认存入</button>
      </view>
    </AppSheet>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { coupleApi, savingApi, userApi } from '@/api'
import AppSheet from '@/components/AppSheet.vue'

const CONTRIB_A_COLOR = '#E8637A'
const CONTRIB_B_COLOR = '#9B8EC4'

const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 0)
const savingId = ref<number | null>(null)
const saving = ref<any>(null)
const records = ref<any[]>([])
const showDepositSheet = ref(false)
const currentUserId = ref(0)

const depositors = ref([
  { role: 'A', name: '我' },
  { role: 'B', name: 'TA' }
])

const depositForm = ref({
  amount: '',
  note: '',
  depositorRole: 'A'
})

const progress = computed(() => {
  if (!saving.value || !saving.value.targetAmount) return 0
  return Math.min(100, Math.round((toNumber(saving.value.currentAmount) / toNumber(saving.value.targetAmount)) * 100))
})

const contribA = computed(() => {
  if (!saving.value) return 50
  const total = toNumber(saving.value.userAAmount) + toNumber(saving.value.userBAmount)
  if (total <= 0) return 50
  return Math.round((toNumber(saving.value.userAAmount) / total) * 100)
})

const pieGradient = computed(() => {
  return `conic-gradient(${CONTRIB_A_COLOR} 0% ${contribA.value}%, ${CONTRIB_B_COLOR} ${contribA.value}% 100%)`
})

const toNumber = (value: any) => Number(value || 0)

const formatMoney = (value: any) => {
  return toNumber(value).toLocaleString('zh-CN', { maximumFractionDigits: 0 })
}

const parseStoredUser = () => {
  const stored = uni.getStorageSync('userInfo')
  if (!stored) return null
  return typeof stored === 'string' ? JSON.parse(stored) : stored
}

const getRoleName = (role: string) => {
  return depositors.value.find(person => person.role === role)?.name || (role === 'A' ? '我' : 'TA')
}

const getRecordUser = (record: any) => {
  if (record.userName) return record.userName
  return record.userId === currentUserId.value ? '我' : 'TA'
}

const loadPeople = async () => {
  let current = parseStoredUser()
  try {
    current = await userApi.getProfile()
  } catch (e) {
    console.warn('加载当前用户失败', e)
  }

  currentUserId.value = current?.id || 0

  let partner: any = null
  try {
    partner = await coupleApi.getPartner()
  } catch (e) {
    console.warn('加载伴侣信息失败', e)
  }

  const currentRole = current?.role || 'A'
  const partnerRole = partner?.role || (currentRole === 'A' ? 'B' : 'A')
  depositForm.value.depositorRole = currentRole
  depositors.value = [
    { role: currentRole, name: current?.nickname || current?.username || '我' },
    { role: partnerRole, name: partner?.nickname || partner?.username || 'TA' }
  ].sort((a, b) => a.role.localeCompare(b.role))
}

const loadDetail = async () => {
  if (!savingId.value) return
  try {
    const data = await savingApi.getDetail(savingId.value)
    saving.value = data
    records.value = data.records || []
  } catch (e) {
    console.error('加载详情失败', e)
  }
}

const openDeposit = () => {
  if (!saving.value || saving.value.status === 1) {
    uni.showToast({ title: '该目标已完成', icon: 'none' })
    return
  }
  depositForm.value.amount = ''
  depositForm.value.note = ''
  showDepositSheet.value = true
}

const closeDeposit = () => {
  showDepositSheet.value = false
}

const doDeposit = async () => {
  const amount = parseFloat(depositForm.value.amount)
  if (!saving.value?.id) return
  if (!amount || amount <= 0) {
    uni.showToast({ title: '请输入有效金额', icon: 'none' })
    return
  }

  try {
    await savingApi.deposit(
      saving.value.id,
      amount,
      depositForm.value.note || undefined,
      depositForm.value.depositorRole
    )
    closeDeposit()
    await loadDetail()
    uni.showToast({ title: '存入成功', icon: 'success' })
  } catch (e) {
    console.error('存款失败', e)
  }
}

const goBack = () => {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack({ delta: 1 })
    return
  }
  uni.navigateTo({ url: '/pages/saving/index' })
}

const formatTime = (time: string) => {
  if (!time) return ''
  return time.substring(0, 10)
}

onLoad((options: any) => {
  if (options?.id) {
    savingId.value = parseInt(options.id)
    loadDetail()
  }
  loadPeople()
})

onShow(() => {
  if (savingId.value) loadDetail()
})
</script>

<style scoped>
.detail-page {
  min-height: 100vh;
  background: #F7F5F3;
  color: #1C1B2E;
}

.detail-page button {
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  line-height: 1;
  overflow: visible;
}

.detail-page button::after {
  border: none;
}

.detail-header {
  min-height: 116rpx;
  padding: 20rpx 40rpx 24rpx;
  box-sizing: border-box;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  background: #FFFFFF;
  border-bottom: 1rpx solid #EBEBF0;
}

.back-btn,
.header-spacer {
  width: 64rpx;
  height: 44rpx;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  color: #1C1B2E !important;
  font-size: 56rpx;
  font-weight: 500;
}

.header-title {
  flex: 1;
  text-align: center;
  font-size: 34rpx;
  line-height: 44rpx;
  font-weight: 700;
}

.detail-scroll {
  height: calc(100vh - 116rpx);
}

.detail-content {
  padding: 32rpx;
}

.goal-card,
.panel {
  margin-bottom: 24rpx;
  padding: 32rpx;
  box-sizing: border-box;
  border-radius: 32rpx;
  background: #FFFFFF;
  box-shadow: 0 2rpx 12rpx rgba(28, 27, 46, 0.06);
}

.goal-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.goal-title-wrap {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 18rpx;
}

.goal-icon {
  font-size: 48rpx;
}

.goal-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.goal-name {
  font-size: 34rpx;
  line-height: 44rpx;
  font-weight: 700;
}

.goal-date {
  margin-top: 6rpx;
  color: #8A8A9A;
  font-size: 24rpx;
  line-height: 32rpx;
}

.status-badge {
  flex-shrink: 0;
  padding: 6rpx 20rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  line-height: 28rpx;
  font-weight: 600;
}

.badge-active {
  background: #EEF6FF;
  color: #3B82F6;
}

.badge-done {
  background: #F0FDF4;
  color: #22C55E;
}

.amount-line {
  margin-top: 32rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20rpx;
}

.amount-main {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.amount-label {
  color: #8A8A9A;
  font-size: 24rpx;
  line-height: 32rpx;
}

.saved-amount {
  color: #E8637A;
  font-size: 56rpx;
  line-height: 60rpx;
  font-weight: 700;
}

.target-amount {
  color: #8A8A9A;
  font-size: 24rpx;
  line-height: 32rpx;
}

.progress-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.progress-bar {
  flex: 1;
  height: 16rpx;
  overflow: hidden;
  border-radius: 999rpx;
  background: #EBEBF0;
}

.progress-fill {
  height: 100%;
  border-radius: 999rpx;
  background: #E8637A;
  transition: width 0.3s;
}

.progress-pct {
  width: 64rpx;
  text-align: right;
  color: #E8637A;
  font-size: 24rpx;
  line-height: 32rpx;
  font-weight: 700;
}

.deposit-entry {
  width: 100%;
  height: 76rpx;
  margin-top: 28rpx !important;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20rpx;
  background: #E8637A !important;
  color: #FFFFFF !important;
  font-size: 28rpx;
  font-weight: 600;
}

.panel-title {
  display: block;
  margin-bottom: 24rpx;
  font-size: 30rpx;
  line-height: 40rpx;
  font-weight: 700;
}

.contrib {
  display: flex;
  align-items: center;
  gap: 22rpx;
}

.contrib-pie {
  width: 92rpx;
  height: 92rpx;
  flex-shrink: 0;
  border-radius: 50%;
}

.contrib-legend {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.contrib-line {
  display: flex;
  align-items: center;
  gap: 12rpx;
  color: #5B5A6D;
  font-size: 26rpx;
  line-height: 34rpx;
}

.contrib-dot {
  width: 16rpx;
  height: 16rpx;
  flex-shrink: 0;
  border-radius: 50%;
}

.contrib-dot-a {
  background: #E8637A;
}

.contrib-dot-b {
  background: #9B8EC4;
}

.record-list {
  display: flex;
  flex-direction: column;
}

.record-item {
  padding: 24rpx 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
  border-bottom: 1rpx solid #F7F5F3;
}

.record-item:last-child {
  padding-bottom: 0;
  border-bottom: none;
}

.record-left {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.record-user {
  flex-shrink: 0;
  padding: 4rpx 16rpx;
  border-radius: 999rpx;
  background: #FEF0F2;
  color: #E8637A;
  font-size: 22rpx;
  line-height: 30rpx;
}

.record-note {
  color: #1C1B2E;
  font-size: 28rpx;
  line-height: 36rpx;
}

.record-right {
  flex-shrink: 0;
  text-align: right;
}

.record-amount {
  display: block;
  color: #22C55E;
  font-size: 30rpx;
  line-height: 38rpx;
  font-weight: 700;
}

.record-time {
  margin-top: 4rpx;
  display: block;
  color: #8A8A9A;
  font-size: 22rpx;
  line-height: 30rpx;
}

.empty-record {
  padding: 40rpx 0;
  text-align: center;
  color: #8A8A9A;
  font-size: 26rpx;
}

.sheet-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 24rpx;
}

.form-label {
  display: block;
  margin-bottom: 10rpx;
  color: #8A8A9A;
  font-size: 24rpx;
  line-height: 32rpx;
}

.form-input,
.readonly-field {
  width: 100%;
  height: 84rpx;
  padding: 0 24rpx;
  box-sizing: border-box;
  border: 1rpx solid #EBEBF0;
  border-radius: 20rpx;
  background: #F7F5F3;
  color: #1C1B2E;
  font-size: 28rpx;
}

.readonly-field {
  display: flex;
  align-items: center;
}

.person-row {
  display: flex;
  gap: 16rpx;
}

.person-btn {
  flex: 1;
  height: 84rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1rpx solid #EBEBF0 !important;
  border-radius: 20rpx;
  background: #F7F5F3 !important;
  color: #1C1B2E !important;
  font-size: 28rpx;
  line-height: 1;
  font-weight: 600;
}

.person-btn.selected {
  border-color: #E8637A !important;
  background: #FEF0F2 !important;
  color: #E8637A !important;
}

.btn-primary {
  width: 100%;
  height: 88rpx;
  margin-top: 8rpx !important;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 24rpx;
  background: #E8637A !important;
  color: #FFFFFF !important;
  font-size: 30rpx;
  font-weight: 600;
}
</style>
