<template>
  <view class="saving-page">
    <view class="saving-header" :style="{ paddingTop: `${statusBarHeight}px` }">
      <button class="back-btn" @click="goBack">‹</button>
      <text class="header-title">共同储蓄</text>
      <view class="header-action" @click="openMainSheet">+ 记录存款</view>
    </view>

    <view class="saving-hero">
      <text class="hero-label">{{ savingList.length }} 个目标合计已存</text>
      <text class="hero-amount">¥{{ formatMoney(totalSaved) }}</text>
      <text class="hero-sub">目标总额 ¥{{ formatMoney(totalTarget) }} · 完成 {{ totalProgress }}%</text>
    </view>

    <scroll-view scroll-y class="saving-scroll">
      <view class="saving-list">
        <view v-for="item in savingList" :key="item.id" class="saving-card">
          <view class="card-top">
            <text class="card-name">{{ getGoalIcon(item) }} {{ item.name }}</text>
            <text class="card-badge" :class="item.status === 1 ? 'badge-done' : 'badge-active'">
              {{ item.status === 1 ? '已完成' : '进行中' }}
            </text>
          </view>

          <view class="progress-row">
            <view class="progress-bar">
              <view class="progress-fill" :style="{ width: getProgress(item) + '%', background: getGoalColor(item) }"></view>
            </view>
            <text class="progress-pct">{{ getProgress(item) }}%</text>
          </view>

          <view class="amount-row">
            <text class="amount-text">已存 <text class="amount-strong">¥{{ formatMoney(item.currentAmount) }}</text></text>
            <text class="amount-text">目标 <text class="amount-strong">¥{{ formatMoney(item.targetAmount) }}</text></text>
          </view>

          <view class="contrib">
            <view class="contrib-pie" :style="{ background: getPieGradient(item) }"></view>
            <view class="contrib-legend">
              <view class="contrib-line">
                <text class="contrib-dot contrib-dot-a"></text>
                <text>{{ getRoleName('A') }} ¥{{ formatMoney(item.userAAmount) }}</text>
              </view>
              <view class="contrib-line">
                <text class="contrib-dot contrib-dot-b"></text>
                <text>{{ getRoleName('B') }} ¥{{ formatMoney(item.userBAmount) }}</text>
              </view>
            </view>
          </view>

          <view class="card-actions">
            <button
              class="card-btn btn-outline"
              :disabled="item.status === 1"
              @click.stop="openDeposit(item)"
            >
              + 存款
            </button>
            <button class="card-btn btn-fill" @click.stop="goDetail(item.id)">查看详情</button>
          </view>
        </view>

        <view v-if="savingList.length === 0" class="empty-card">
          <text class="empty-icon">¥</text>
          <text class="empty-title">还没有储蓄目标</text>
          <text class="empty-desc">点击右上角记录存款，先新建一个目标吧。</text>
        </view>
      </view>
    </scroll-view>

    <AppSheet :open="showSavingSheet" title="共同储蓄" @close="closeSavingSheet">
      <view class="sheet-tabs">
        <view
          class="sheet-tab"
          :class="{ active: sheetMode === 'deposit' }"
          @click="switchSheetMode('deposit')"
        >
          记录存款
        </view>
        <view
          class="sheet-tab"
          :class="{ active: sheetMode === 'create' }"
          @click="switchSheetMode('create')"
        >
          新建目标
        </view>
      </view>

      <view v-if="sheetMode === 'deposit'" class="sheet-form">
        <view v-if="activeSavingList.length > 0">
          <view class="form-group">
            <text class="form-label">存入目标</text>
            <picker
              mode="selector"
              :range="activeSavingList"
              range-key="name"
              :value="pickerIndex"
              @change="onTargetChange"
            >
              <view class="select-field">
                <text>{{ selectedSavingName || '选择储蓄目标' }}</text>
                <text class="select-arrow">›</text>
              </view>
            </picker>
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

          <button class="btn-primary" @click="submitDeposit">确认存入</button>
        </view>

        <view v-else class="sheet-empty">
          <text class="sheet-empty-title">还没有可存款目标</text>
          <text class="sheet-empty-desc">先新建一个储蓄目标，再开始一起存钱。</text>
          <button class="btn-primary" @click="switchSheetMode('create')">新建目标</button>
        </view>
      </view>

      <view v-else class="sheet-form">
        <scroll-view scroll-y class="sheet-scroll">
          <input v-model="newSaving.name" class="form-input large" placeholder="目标名称" />
          <input v-model="newSaving.targetAmount" class="form-input large" placeholder="目标金额" type="digit" />

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

          <picker mode="date" :start="today" @change="onDateChange">
            <view class="date-picker-display">
              <text class="date-label">截止日期</text>
              <text class="date-value">{{ newSaving.deadline || '选择日期（可选）' }}</text>
            </view>
          </picker>
        </scroll-view>
        <button class="btn-primary" @click="createSaving">开始储蓄</button>
      </view>
    </AppSheet>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { coupleApi, savingApi, userApi } from '@/api'
import AppSheet from '@/components/AppSheet.vue'

const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 0)
const icons = ['✈️', '💍', '🏠', '🎁', '🎮', '💰', '🌙', '🚗']
const colors = ['#E8637A', '#5B9CF6', '#F59E0B', '#22C55E']
const CONTRIB_A_COLOR = '#E8637A'
const CONTRIB_B_COLOR = '#9B8EC4'

const savingList = ref<any[]>([])
const showSavingSheet = ref(false)
const sheetMode = ref<'deposit' | 'create'>('deposit')
const depositors = ref([
  { role: 'A', name: '我' },
  { role: 'B', name: 'TA' }
])

const depositForm = ref({
  savingId: null as number | null,
  amount: '',
  note: '',
  depositorRole: 'A'
})

const newSaving = ref({
  name: '',
  targetAmount: '',
  icon: '💰',
  deadline: ''
})

const today = new Date().toISOString().split('T')[0]

const activeSavingList = computed(() => savingList.value.filter(item => item.status !== 1))
const totalSaved = computed(() => savingList.value.reduce((sum, item) => sum + toNumber(item.currentAmount), 0))
const totalTarget = computed(() => savingList.value.reduce((sum, item) => sum + toNumber(item.targetAmount), 0))
const totalProgress = computed(() => {
  if (totalTarget.value <= 0) return 0
  return Math.min(100, Math.round((totalSaved.value / totalTarget.value) * 100))
})

const pickerIndex = computed(() => {
  const index = activeSavingList.value.findIndex(item => item.id === depositForm.value.savingId)
  return index >= 0 ? index : 0
})

const selectedSavingName = computed(() => {
  return activeSavingList.value.find(item => item.id === depositForm.value.savingId)?.name || ''
})

const toNumber = (value: any) => Number(value || 0)

const formatMoney = (value: any) => {
  return toNumber(value).toLocaleString('zh-CN', { maximumFractionDigits: 0 })
}

const getGoalIcon = (item: any) => item.icon || '💰'

const getProgress = (item: any) => {
  const target = toNumber(item.targetAmount)
  if (target <= 0) return 0
  return Math.min(100, Math.round((toNumber(item.currentAmount) / target) * 100))
}

const getContribA = (item: any) => {
  const total = toNumber(item.userAAmount) + toNumber(item.userBAmount)
  if (total <= 0) return 50
  return Math.round((toNumber(item.userAAmount) / total) * 100)
}

const getGoalColor = (item: any) => {
  const index = Math.abs(Number(item.id || 0)) % colors.length
  return colors[index]
}

const getPieGradient = (item: any) => {
  const percent = getContribA(item)
  return `conic-gradient(${CONTRIB_A_COLOR} 0% ${percent}%, ${CONTRIB_B_COLOR} ${percent}% 100%)`
}

const getRoleName = (role: string) => {
  return depositors.value.find(person => person.role === role)?.name || (role === 'A' ? '我' : 'TA')
}

const parseStoredUser = () => {
  const stored = uni.getStorageSync('userInfo')
  if (!stored) return null
  return typeof stored === 'string' ? JSON.parse(stored) : stored
}

const loadPeople = async () => {
  let current = parseStoredUser()
  try {
    current = await userApi.getProfile()
  } catch (e) {
    console.warn('加载当前用户失败', e)
  }

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

const onDateChange = (e: any) => {
  newSaving.value.deadline = e.detail.value
}

const onTargetChange = (e: any) => {
  const item = activeSavingList.value[Number(e.detail.value)]
  if (item) depositForm.value.savingId = item.id
}

const switchSheetMode = (mode: 'deposit' | 'create') => {
  sheetMode.value = mode
}

const prepareDepositForm = (item?: any) => {
  depositForm.value.savingId = item?.status !== 1 && item?.id ? item.id : activeSavingList.value[0]?.id || null
  depositForm.value.amount = ''
  depositForm.value.note = ''
}

const openMainSheet = () => {
  sheetMode.value = 'create'
  showSavingSheet.value = true
}

const openDeposit = (item?: any) => {
  if (activeSavingList.value.length === 0) {
    sheetMode.value = 'create'
  } else {
    sheetMode.value = 'deposit'
    prepareDepositForm(item)
  }
  showSavingSheet.value = true
}

const closeSavingSheet = () => {
  showSavingSheet.value = false
}

const loadList = async () => {
  try {
    const data = await savingApi.getList()
    savingList.value = data || []
  } catch (e) {
    console.error('加载储蓄列表失败', e)
  }
}

const submitDeposit = async () => {
  const amount = parseFloat(depositForm.value.amount)
  if (!depositForm.value.savingId) {
    uni.showToast({ title: '请选择储蓄目标', icon: 'none' })
    return
  }
  if (!amount || amount <= 0) {
    uni.showToast({ title: '请输入有效金额', icon: 'none' })
    return
  }

  try {
    await savingApi.deposit(
      depositForm.value.savingId,
      amount,
      depositForm.value.note || undefined,
      depositForm.value.depositorRole
    )
    closeSavingSheet()
    await loadList()
    uni.showToast({ title: '存入成功', icon: 'success' })
  } catch (e) {
    console.error('存款失败', e)
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
    newSaving.value = { name: '', targetAmount: '', icon: '💰', deadline: '' }
    await loadList()
    closeSavingSheet()
    uni.showToast({ title: '创建成功', icon: 'success' })
  } catch (e) {
    console.error('创建失败', e)
  }
}

const goDetail = (id: number) => {
  uni.navigateTo({ url: `/pages/saving/detail?id=${id}` })
}

const goBack = () => {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack({ delta: 1 })
    return
  }
  uni.switchTab({ url: '/pages/index/index' })
}

onShow(() => {
  loadList()
  loadPeople()
})
</script>

<style scoped>
.saving-page {
  min-height: 100vh;
  background: #F7F5F3;
  color: #1C1B2E;
}

.saving-page button {
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  line-height: 1;
  overflow: visible;
}

.saving-page button::after {
  border: none;
}

.saving-header {
  min-height: 116rpx;
  padding: 20rpx 40rpx 24rpx;
  box-sizing: border-box;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  gap: 16rpx;
  background: #FFFFFF;
  border-bottom: 1rpx solid #EBEBF0;
}

.back-btn {
  width: 64rpx;
  height: 44rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  color: #1C1B2E !important;
  font-size: 56rpx;
  line-height: 1;
  font-weight: 500;
}

.header-title {
  flex: 1;
  min-width: 0;
  font-size: 36rpx;
  line-height: 44rpx;
  font-weight: 700;
}

.header-action {
  flex-shrink: 0;
  height: 60rpx;
  margin-left: auto;
  padding: 0 28rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999rpx;
  background: #E8637A;
  color: #FFFFFF;
  font-size: 26rpx;
  line-height: 60rpx;
  font-weight: 600;
  white-space: nowrap;
}

.saving-hero {
  padding: 40rpx 48rpx;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #E8637A 0%, #9B8EC4 100%);
  color: #FFFFFF;
}

.hero-label {
  margin-bottom: 8rpx;
  font-size: 24rpx;
  line-height: 32rpx;
  opacity: 0.82;
}

.hero-amount {
  font-size: 64rpx;
  line-height: 72rpx;
  font-weight: 700;
}

.hero-sub {
  margin-top: 8rpx;
  font-size: 24rpx;
  line-height: 32rpx;
  opacity: 0.76;
}

.saving-scroll {
  height: calc(100vh - 320rpx);
}

.saving-list {
  padding: 32rpx;
}

.saving-card {
  margin-bottom: 24rpx;
  padding: 32rpx;
  box-sizing: border-box;
  background: #FFFFFF;
  border-radius: 32rpx;
  box-shadow: 0 2rpx 12rpx rgba(28, 27, 46, 0.06);
}

.card-top {
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.card-name {
  flex: 1;
  min-width: 0;
  font-size: 30rpx;
  line-height: 40rpx;
  font-weight: 700;
}

.card-badge {
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

.progress-row {
  margin-bottom: 14rpx;
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

.amount-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.amount-text {
  color: #8A8A9A;
  font-size: 24rpx;
  line-height: 32rpx;
}

.amount-strong {
  color: #1C1B2E;
  font-weight: 700;
}

.contrib {
  margin-top: 20rpx;
  padding-top: 20rpx;
  display: flex;
  align-items: center;
  gap: 18rpx;
  border-top: 1rpx solid #EBEBF0;
}

.contrib-pie {
  width: 72rpx;
  height: 72rpx;
  flex-shrink: 0;
  border-radius: 50%;
}

.contrib-legend {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.contrib-line {
  display: flex;
  align-items: center;
  gap: 12rpx;
  color: #5B5A6D;
  font-size: 22rpx;
  line-height: 30rpx;
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

.card-actions {
  margin-top: 20rpx;
  display: flex;
  gap: 16rpx;
}

.card-btn {
  flex: 1;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20rpx;
  font-size: 26rpx;
  font-weight: 600;
}

.btn-outline {
  border: 1rpx solid #EBEBF0 !important;
  background: #F7F5F3 !important;
  color: #1C1B2E !important;
}

.btn-outline[disabled] {
  color: #8A8A9A !important;
  opacity: 0.65;
}

.btn-fill {
  background: #E8637A !important;
  color: #FFFFFF !important;
}

.empty-card {
  padding: 72rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border-radius: 32rpx;
  background: #FFFFFF;
  box-shadow: 0 2rpx 12rpx rgba(28, 27, 46, 0.06);
}

.empty-icon {
  color: #E8637A;
  font-size: 64rpx;
  line-height: 72rpx;
  font-weight: 700;
}

.empty-title {
  margin-top: 16rpx;
  color: #1C1B2E;
  font-size: 30rpx;
  line-height: 40rpx;
  font-weight: 700;
}

.empty-desc {
  margin-top: 8rpx;
  color: #8A8A9A;
  font-size: 24rpx;
  line-height: 32rpx;
}

.sheet-tabs {
  height: 72rpx;
  margin-bottom: 28rpx;
  padding: 6rpx;
  display: flex;
  gap: 6rpx;
  border-radius: 22rpx;
  background: #F7F5F3;
}

.sheet-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18rpx;
  color: #8A8A9A;
  font-size: 26rpx;
  font-weight: 600;
}

.sheet-tab.active {
  background: #FFFFFF;
  color: #E8637A;
  box-shadow: 0 2rpx 10rpx rgba(28, 27, 46, 0.06);
}

.sheet-form {
  display: flex;
  flex-direction: column;
}

.sheet-empty {
  padding: 16rpx 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.sheet-empty-title {
  color: #1C1B2E;
  font-size: 30rpx;
  line-height: 40rpx;
  font-weight: 700;
}

.sheet-empty-desc {
  margin: 8rpx 0 28rpx;
  color: #8A8A9A;
  font-size: 24rpx;
  line-height: 32rpx;
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
.select-field {
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

.form-input.large {
  margin-bottom: 24rpx;
}

.select-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.select-arrow {
  color: #8A8A9A;
  font-size: 36rpx;
  transform: rotate(90deg);
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

.sheet-scroll {
  max-height: 58vh;
}

.icon-selector {
  margin-bottom: 24rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.icon-item {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20rpx;
  background: #F7F5F3;
  font-size: 36rpx;
}

.icon-item.active {
  background: #FEF0F2;
  box-shadow: 0 0 0 2rpx #E8637A;
}

.date-picker-display {
  margin-bottom: 32rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1rpx solid #EBEBF0;
  border-radius: 20rpx;
  background: #F7F5F3;
}

.date-label {
  color: #1C1B2E;
  font-size: 28rpx;
}

.date-value {
  color: #8A8A9A;
  font-size: 28rpx;
}
</style>
