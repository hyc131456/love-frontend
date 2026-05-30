<template>
  <view class="wish-page">
    <AppNavBar title="心愿" />

    <view class="summary-bar">
      <view class="summary-chip">
        <view class="chip-dot chip-dot--todo"></view>
        <text>{{ getStatusText(0) }} {{ todoCount }}</text>
      </view>
      <view class="summary-chip">
        <view class="chip-dot chip-dot--doing"></view>
        <text>进行中 {{ doingCount }}</text>
      </view>
      <view class="summary-chip">
        <view class="chip-dot chip-dot--done"></view>
        <text>已完成 {{ completedCount }}</text>
      </view>
    </view>

    <SegmentTabs v-model="activeTab" :items="tabItems" />
    
    <view class="wish-list">
      <view
        v-for="wish in filteredWishes"
        :key="wish.id"
        class="wish-card"
        :class="{ completed: wish.status === 2 }"
        @click="handleWishClick(wish)"
        @longpress.stop="showStatusSheet(wish)"
        @longtap.stop="showStatusSheet(wish)"
      >
        <view class="wish-header">
          <view class="wish-category">{{ getCategoryIcon(wish.category) }}</view>
          <view class="wish-heading">
            <text class="wish-title" :class="{ done: wish.status === 2 }">{{ wish.title }}</text>
          </view>
          <text class="wish-status" :class="getStatusClass(wish.status)">{{ getStatusText(wish.status) }}</text>
        </view>
        
        <text v-if="wish.description" class="wish-desc">{{ wish.description }}</text>
        
        <view v-if="wish.budget" class="wish-budget">
          <text>预算: ¥{{ wish.budget }}</text>
        </view>
        
        <view class="wish-footer">
          <text class="wish-date">{{ wish.targetDate || '无期限' }}</text>
          <text class="status-hint">长按修改状态</text>
        </view>
      </view>
      
      <EmptyState
        v-if="filteredWishes.length === 0 && !loading"
        icon="♡"
        title="还没有心愿"
        desc="把想一起完成的事放在这里。"
      />
    </view>
    
    <AppFab icon="+" @click="showAddModal = true" />
    
    <AppSheet :open="showAddModal" :title="isEditMode ? '编辑心愿' : '添加心愿'" @close="closeModal">
      <scroll-view scroll-y class="sheet-scroll">
        <input v-model="newWish.title" class="input" placeholder="心愿标题" />
        
        <textarea 
          v-model="newWish.description" 
          class="textarea" 
          placeholder="详细描述（可选）"
        />
        
        <view class="category-list">
          <view 
            v-for="cat in categories" 
            :key="cat.value"
            class="category-item"
            :class="{ active: newWish.category === cat.value }"
            @click="newWish.category = cat.value"
          >
            {{ cat.icon }} {{ cat.label }}
          </view>
        </view>
        
        <input 
          v-model="newWish.budget" 
          class="input" 
          type="digit" 
          placeholder="预算金额（可选）" 
        />
        
        <view class="date-picker-wrapper">
          <picker 
            mode="date" 
            :value="newWish.targetDate" 
            :start="today"
            @change="onDateChange"
          >
            <view class="date-picker-display">
              <text class="date-label">目标日期</text>
              <text class="date-value">{{ newWish.targetDate || '选择日期（可选）' }}</text>
            </view>
          </picker>
          <text v-if="newWish.targetDate" class="date-clear" @click.stop="newWish.targetDate = ''">×</text>
        </view>
      </scroll-view>
      <button class="btn-primary" @click="saveWish">{{ isEditMode ? '保存修改' : '保存心愿' }}</button>
    </AppSheet>

    <AppSheet :open="showStatusModal" title="修改心愿状态" @close="closeStatusSheet">
      <view class="status-options">
        <view
          v-for="item in statusOptions"
          :key="item.value"
          class="status-option"
          :class="{ selected: selectedWish?.status === item.value }"
          @click="selectStatus(item.value)"
        >
          <text class="wish-status" :class="getStatusClass(item.value)">{{ getStatusText(item.value) }}</text>
          <text v-if="selectedWish?.status === item.value" class="status-current">当前状态</text>
        </view>
      </view>
    </AppSheet>

    <AppTabBar current="/pages/wish/index" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { wishApi } from '@/api'
import { useUserStore } from '@/stores/user'
import AppFab from '@/components/AppFab.vue'
import AppNavBar from '@/components/AppNavBar.vue'
import AppSheet from '@/components/AppSheet.vue'
import AppTabBar from '@/components/AppTabBar.vue'
import EmptyState from '@/components/EmptyState.vue'
import SegmentTabs from '@/components/SegmentTabs.vue'

const userStore = useUserStore()

const categories = [
  { value: 'travel', label: '旅行', icon: '✈️' },
  { value: 'gift', label: '礼物', icon: '🎁' },
  { value: 'experience', label: '体验', icon: '🎪' },
  { value: 'home', label: '家居', icon: '🏠' },
  { value: 'other', label: '其他', icon: '💫' }
]

const activeTab = ref<'pending' | 'completed'>('pending')
const showAddModal = ref(false)
const showStatusModal = ref(false)
const loading = ref(false)
const tabItems = [
  { label: '进行中', value: 'pending' },
  { label: '已完成', value: 'completed' }
]
const statusOptions = [
  { value: 0 },
  { value: 1 },
  { value: 2 }
]

// 心愿列表
const wishList = ref<any[]>([])

// 编辑模式
const isEditMode = ref(false)
const editingWishId = ref<number | null>(null)
const selectedWish = ref<any | null>(null)
const suppressNextClick = ref(false)

const newWish = ref({
  title: '',
  description: '',
  category: 'other',
  budget: '',
  targetDate: ''
})

// 获取今天日期
const today = new Date().toISOString().split('T')[0]

// 日期选择变更
const onDateChange = (e: any) => {
  newWish.value.targetDate = e.detail.value
}

const handleWishClick = (wish: any) => {
  if (suppressNextClick.value) {
    suppressNextClick.value = false
    return
  }
  editWish(wish)
}

// 打开编辑弹窗
const editWish = (wish: any) => {
  isEditMode.value = true
  editingWishId.value = wish.id
  newWish.value = {
    title: wish.title || '',
    description: wish.description || '',
    category: wish.category || 'other',
    budget: wish.budget ? String(wish.budget) : '',
    targetDate: wish.targetDate || ''
  }
  showAddModal.value = true
}

// 关闭弹窗并重置
const closeModal = () => {
  showAddModal.value = false
  isEditMode.value = false
  editingWishId.value = null
  newWish.value = { title: '', description: '', category: 'other', budget: '', targetDate: '' }
}

// 加载心愿列表
const loadWishList = async () => {
  // 确保判定前用户信息是最新的（调用方 onShow 已 await）
  if (!userStore.userInfo?.coupleId) {
    wishList.value = []
    loading.value = false
    return
  }
  
  loading.value = true
  try {
    const data = await wishApi.getList()
    wishList.value = data || []
  } catch (e) {
    console.error('加载心愿列表失败', e)
    // 失败时(包含3004静默错误)也需要清空，防止残留显示旧数据
    wishList.value = []
  } finally {
    loading.value = false
  }
}

// 页面显示时刷新状态并加载数据
onShow(async () => {
  uni.hideTabBar()
  await userStore.fetchUserInfo()
  loadWishList()
})

const todoCount = computed(() => wishList.value.filter(w => w.status === 0).length)
const doingCount = computed(() => wishList.value.filter(w => w.status === 1).length)
const completedCount = computed(() => wishList.value.filter(w => w.status === 2).length)

const filteredWishes = computed(() => {
  if (activeTab.value === 'pending') {
    return wishList.value.filter(w => w.status !== 2)
  }
  return wishList.value.filter(w => w.status === 2)
})

const getCategoryIcon = (category: string) => {
  return categories.find(c => c.value === category)?.icon || '💫'
}

const showStatusSheet = (wish: any) => {
  suppressNextClick.value = true
  selectedWish.value = wish
  showStatusModal.value = true
}

const closeStatusSheet = () => {
  showStatusModal.value = false
  selectedWish.value = null
  setTimeout(() => {
    suppressNextClick.value = false
  }, 200)
}

const getStatusText = (status: number) => {
  if (status === 2) return '已完成 ✓'
  if (status === 1) return '进行中'
  return `未${String.fromCharCode(24320, 22987)}`
}

const getStatusClass = (status: number) => {
  if (status === 2) return 'wish-status done'
  if (status === 1) return 'wish-status doing'
  return 'wish-status todo'
}

const updateWishStatus = async (wish: any, status: number) => {
  try {
    await wishApi.updateStatus(wish.id, status)
    wish.status = status
    closeStatusSheet()
  } catch (e) {
    // 错误已在 request 封装中处理
  }
}

const selectStatus = (status: number) => {
  const wish = selectedWish.value
  if (!wish || wish.status === status) {
    closeStatusSheet()
    return
  }

  if (wish.status === 2 && status !== 2) {
    uni.showModal({
      title: '确认修改状态',
      content: `要将这个心愿改为「${getStatusText(status)}」吗？`,
      confirmColor: '#E8637A',
      success: res => {
        if (res.confirm) {
          updateWishStatus(wish, status)
        }
      }
    })
    return
  }

  updateWishStatus(wish, status)
}

const saveWish = async () => {
  if (!newWish.value.title.trim()) {
    uni.showToast({ title: '请输入心愿', icon: 'none' })
    return
  }
  
  try {
    const data = {
      title: newWish.value.title,
      description: newWish.value.description,
      category: newWish.value.category,
      budget: newWish.value.budget ? parseFloat(newWish.value.budget) : null,
      targetDate: newWish.value.targetDate || null
    }
    
    if (isEditMode.value && editingWishId.value) {
      // 编辑模式
      await wishApi.update({ id: editingWishId.value, ...data })
      uni.showToast({ title: '修改成功', icon: 'success' })
    } else {
      // 添加模式
      await wishApi.create(data)
      uni.showToast({ title: '添加成功', icon: 'success' })
    }
    
    closeModal()
    loadWishList()
  } catch (e) {
    // 错误已在 request 封装中处理
  }
}
</script>

<style scoped>
.wish-page {
  min-height: 100vh;
  background: #F7F5F3;
  padding-bottom: 164rpx;
}

.summary-bar {
  display: flex;
  align-items: center;
  gap: 28rpx;
  margin: 24rpx 32rpx 20rpx;
  padding: 20rpx 24rpx;
  border-radius: 28rpx;
  background: #FFFFFF;
  border: 1rpx solid #EBEBF0;
  box-shadow: 0 4rpx 16rpx rgba(28, 27, 46, 0.05);
}

.summary-chip {
  display: flex;
  align-items: center;
  gap: 10rpx;
  font-size: 24rpx;
  line-height: 32rpx;
  color: #8A8A9A;
}

.chip-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
}

.chip-dot--todo {
  background: #8A8A9A;
}

.chip-dot--doing {
  background: #F5A623;
}

.chip-dot--done {
  background: #4CAF50;
}

.wish-list {
  padding: 24rpx 0 0;
}

.wish-card {
  background: #FFFFFF;
  margin: 0 32rpx 24rpx;
  border-radius: 32rpx;
  padding: 30rpx 32rpx;
  border: 1rpx solid #EBEBF0;
  box-shadow: 0 4rpx 16rpx rgba(28, 27, 46, 0.06);
  transition: all 0.2s ease;
}

.wish-card.completed {
  opacity: 0.72;
}

.wish-card:active {
  transform: scale(0.98);
  box-shadow: 0 8rpx 24rpx rgba(28, 27, 46, 0.08);
}

.wish-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20rpx;
}

.wish-category {
  width: 72rpx;
  height: 72rpx;
  margin-right: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 22rpx;
  background: #FEF0F2;
  font-size: 34rpx;
}

.wish-heading {
  flex: 1;
  min-width: 0;
}

.wish-title {
  display: block;
  font-size: 32rpx;
  line-height: 40rpx;
  font-weight: 600;
  color: #1C1B2E;
}

.wish-title.done {
  color: #8A8A9A;
  text-decoration: line-through;
}

.wish-status {
  flex-shrink: 0;
  margin-left: 16rpx;
  padding: 8rpx 20rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  line-height: 28rpx;
  font-weight: 600;
}

.wish-status.todo {
  background: #F7F5F3;
  color: #8A8A9A;
}

.wish-status.doing {
  background: #FFF7E6;
  color: #F5A623;
}

.wish-status.done {
  background: #F0FFF4;
  color: #4CAF50;
}

.wish-desc {
  font-size: 26rpx;
  color: #5B5A6D;
  margin-bottom: 16rpx;
}

.wish-budget {
  font-size: 26rpx;
  color: #F5A623;
  margin-bottom: 16rpx;
}

.wish-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 24rpx;
  border-top: 1rpx dashed #F0F0F0;
  margin-top: 24rpx;
}

.wish-date {
  font-size: 24rpx;
  color: #8A8A9A;
}

.status-hint {
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

.textarea {
  width: 100%;
  height: 160rpx;
  background: #F7F5F3;
  border: 2rpx solid #EBEBF0;
  border-radius: 20rpx;
  padding: 24rpx;
  font-size: 28rpx;
  margin-bottom: 24rpx;
  box-sizing: border-box;
}

.category-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.category-item {
  padding: 16rpx 24rpx;
  background: #F7F5F3;
  border-radius: 32rpx;
  font-size: 26rpx;
}

.category-item.active {
  background: #FEF0F2;
  color: #E8637A;
}

.date-picker-wrapper {
  display: flex;
  align-items: center;
  background: #F7F5F3;
  border: 2rpx solid #EBEBF0;
  border-radius: 20rpx;
  padding: 0 24rpx;
  margin-bottom: 24rpx;
  box-sizing: border-box;
}

.date-picker-display {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
}

.date-label {
  font-size: 28rpx;
  color: #1C1B2E;
}

.date-value {
  font-size: 28rpx;
  color: #8A8A9A;
}

.date-clear {
  font-size: 40rpx;
  color: #8A8A9A;
  padding: 0 16rpx;
}

.btn-primary {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: #E8637A;
  border-radius: 44rpx;
  color: #fff;
  font-size: 32rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-options {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.status-option {
  min-height: 88rpx;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 22rpx;
  background: #F7F5F3;
  border: 2rpx solid transparent;
}

.status-option.selected {
  background: #FFFFFF;
  border-color: #E8637A;
}

.status-current {
  font-size: 24rpx;
  color: #8A8A9A;
}
</style>
