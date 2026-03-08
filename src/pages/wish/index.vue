<template>
  <view class="wish-page">
    <!-- Tab切换 -->
    <view class="tabs">
      <view 
        class="tab" 
        :class="{ active: activeTab === 'pending' }"
        @click="activeTab = 'pending'"
      >
        进行中
      </view>
      <view 
        class="tab" 
        :class="{ active: activeTab === 'completed' }"
        @click="activeTab = 'completed'"
      >
        已完成
      </view>
    </view>
    
    <!-- 心愿列表 -->
    <view class="wish-list">
      <view v-for="wish in filteredWishes" :key="wish.id" class="wish-card" @click="editWish(wish)">
        <view class="wish-header">
          <text class="wish-category">{{ getCategoryIcon(wish.category) }}</text>
          <text class="wish-title">{{ wish.title }}</text>
        </view>
        
        <text v-if="wish.description" class="wish-desc">{{ wish.description }}</text>
        
        <view v-if="wish.budget" class="wish-budget">
          <text>预算: ¥{{ wish.budget }}</text>
        </view>
        
        <view class="wish-footer">
          <text class="wish-date">{{ wish.targetDate || '无期限' }}</text>
          <view v-if="wish.status === 0" class="wish-actions">
            <text class="action-btn start" @click="startWish(wish)">开始</text>
            <text class="action-btn complete" @click="completeWish(wish)">完成</text>
          </view>
          <view v-else-if="wish.status === 1" class="wish-actions">
            <text class="action-btn complete" @click="completeWish(wish)">标记完成</text>
          </view>
          <text v-else class="completed-tag">✓ 已完成</text>
        </view>
      </view>
      
      <view v-if="filteredWishes.length === 0" class="empty-state">
        <text class="empty-icon">💫</text>
        <text class="empty-text">还没有心愿</text>
        <text class="empty-tip">许下你们的共同心愿吧~</text>
      </view>
    </view>
    
    <!-- 添加按钮 -->
    <view class="fab-btn" @click="showAddModal = true">
      <text>+</text>
    </view>
    
    <!-- 添加弹窗 -->
    <view v-if="showAddModal" class="modal-mask" @click="closeModal">
      <view class="modal-content" @click.stop>
        <text class="modal-title">{{ isEditMode ? '编辑心愿' : '添加心愿' }}</text>
        
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
        
        <button class="btn-primary" @click="saveWish">{{ isEditMode ? '保存修改' : '保存心愿' }}</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { wishApi } from '@/api'
import { useUserStore } from '@/stores/user'

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
const loading = ref(false)

// 心愿列表
const wishList = ref<any[]>([])

// 编辑模式
const isEditMode = ref(false)
const editingWishId = ref<number | null>(null)

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
  await userStore.fetchUserInfo()
  loadWishList()
})

const filteredWishes = computed(() => {
  if (activeTab.value === 'pending') {
    return wishList.value.filter(w => w.status !== 2)
  }
  return wishList.value.filter(w => w.status === 2)
})

const getCategoryIcon = (category: string) => {
  return categories.find(c => c.value === category)?.icon || '💫'
}

const startWish = async (wish: any) => {
  try {
    await wishApi.updateStatus(wish.id, 1)
    wish.status = 1
    uni.showToast({ title: '开始啦！', icon: 'success' })
  } catch (e) {
    // 错误已在 request 封装中处理
  }
}

const completeWish = async (wish: any) => {
  try {
    await wishApi.updateStatus(wish.id, 2)
    wish.status = 2
    uni.showToast({ title: '心愿达成！', icon: 'success' })
  } catch (e) {
    // 错误已在 request 封装中处理
  }
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
  background: #F5F5F5;
  padding-bottom: 120rpx;
}

.tabs {
  display: flex;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  padding: 24rpx 32rpx;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.02);
}

.tab {
  flex: 1;
  text-align: center;
  padding: 24rpx;
  font-size: 30rpx;
  color: #999;
  position: relative;
  transition: all 0.3s;
}

.tab.active {
  color: #FF6B9D;
  font-weight: 600;
  transform: scale(1.05);
}

.wish-list {
  padding: 32rpx 0;
}

.wish-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  margin: 0 32rpx 32rpx;
  border-radius: 32rpx;
  padding: 36rpx;
  box-shadow: 0 16rpx 48rpx rgba(255, 107, 157, 0.08);
  transition: all 0.2s ease;
}

.wish-card:active {
  transform: scale(0.98);
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 157, 0.04);
}

.wish-header {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.wish-category {
  font-size: 48rpx;
  margin-right: 20rpx;
  filter: drop-shadow(0 4rpx 8rpx rgba(0, 0, 0, 0.1));
}

.wish-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.wish-desc {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.wish-budget {
  font-size: 26rpx;
  color: #F39C12;
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
  color: #CCC;
}

.wish-actions {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  padding: 12rpx 32rpx;
  border-radius: 32rpx;
  font-size: 26rpx;
  font-weight: 500;
  transition: all 0.2s;
}

.action-btn:active {
  transform: scale(0.95);
}

.action-btn.start {
  background: #F8F8F8;
  color: #666;
  border: 2rpx solid #EEE;
}

.action-btn.complete {
  background: linear-gradient(135deg, #FF6B9D 0%, #FF8E9E 100%);
  color: #fff;
  box-shadow: 0 4rpx 16rpx rgba(255, 107, 157, 0.3);
}

.completed-tag {
  font-size: 28rpx;
  font-weight: 600;
  color: #FFB3C6;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #333;
  margin-bottom: 16rpx;
}

.empty-tip {
  font-size: 26rpx;
  color: #999;
}

.fab-btn {
  position: fixed;
  right: 40rpx;
  bottom: 160rpx;
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #FF6B9D 0%, #FF8E9E 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 56rpx;
  color: #fff;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 157, 0.4);
}

/* 弹窗 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99;
}

.modal-content {
  width: 85%;
  max-width: 85%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 40rpx;
  padding: 48rpx;
  box-sizing: border-box;
  box-shadow: 0 24rpx 64rpx rgba(0, 0, 0, 0.1);
}

.modal-title {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin-bottom: 40rpx;
}

.input {
  width: 100%;
  height: 88rpx;
  background: #F8F8F8;
  border-radius: 16rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  margin-bottom: 24rpx;
  box-sizing: border-box;
}

.textarea {
  width: 100%;
  height: 160rpx;
  background: #F8F8F8;
  border-radius: 16rpx;
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
  background: #F5F5F5;
  border-radius: 32rpx;
  font-size: 26rpx;
}

.category-item.active {
  background: #FFE4EC;
  color: #FF6B9D;
}

.date-picker-wrapper {
  display: flex;
  align-items: center;
  background: #F8F8F8;
  border-radius: 16rpx;
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
  color: #333;
}

.date-value {
  font-size: 28rpx;
  color: #999;
}

.date-clear {
  font-size: 40rpx;
  color: #999;
  padding: 0 16rpx;
}

.btn-primary {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(135deg, #FF6B9D 0%, #FF8E9E 100%);
  border-radius: 44rpx;
  color: #fff;
  font-size: 32rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
