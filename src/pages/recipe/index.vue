<template>
  <view class="recipe-page">
    <!-- 分类Tab -->
    <view class="tabs">
      <scroll-view scroll-x class="tab-scroll">
        <view 
          v-for="cat in categories" 
          :key="cat.value"
          class="tab"
          :class="{ active: activeCategory === cat.value }"
          @click="activeCategory = cat.value"
        >
          {{ cat.icon }} {{ cat.label }}
        </view>
      </scroll-view>
    </view>
    
    <!-- 菜谱列表 -->
    <view class="recipe-list">
      <view v-for="recipe in filteredList" :key="recipe.id" class="recipe-card" @click="goDetail(recipe.id)">
        <image 
          v-if="recipe.coverImage" 
          class="recipe-cover" 
          :src="recipe.coverImage" 
          mode="aspectFill" 
        />
        <view v-else class="recipe-cover-placeholder">
          <text>🍳</text>
        </view>
        <view class="recipe-info">
          <text class="recipe-name">{{ recipe.name }}</text>
          <view class="recipe-meta">
            <text class="difficulty">{{ getDifficultyText(recipe.difficulty) }}</text>
            <text v-if="recipe.cookTime" class="cook-time">⏱ {{ recipe.cookTime }}分钟</text>
          </view>
          <view class="recipe-stats">
            <text v-if="recipe.tryCount > 0" class="try-count">做过 {{ recipe.tryCount }} 次</text>
            <text v-if="recipe.isFavorite" class="favorite-tag">❤️</text>
          </view>
        </view>
      </view>
      
      <view v-if="filteredList.length === 0" class="empty-state">
        <text class="empty-icon">👨‍🍳</text>
        <text class="empty-text">还没有菜谱</text>
        <text class="empty-tip">记录你们的专属美食吧~</text>
      </view>
    </view>
    
    <!-- 添加按钮 -->
    <view class="fab-btn" @click="goEdit()">
      <text>+</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { recipeApi } from '@/api'

const categories = [
  { value: '', label: '全部', icon: '📋' },
  { value: 'staple', label: '主食', icon: '🍚' },
  { value: 'cold', label: '凉菜', icon: '🥗' },
  { value: 'soup', label: '汤羹', icon: '🍲' },
  { value: 'dessert', label: '甜品', icon: '🍰' },
  { value: 'drink', label: '饮品', icon: '🥤' }
]

const activeCategory = ref('')
const recipeList = ref<any[]>([])

const filteredList = computed(() => {
  if (!activeCategory.value) return recipeList.value
  return recipeList.value.filter(r => r.category === activeCategory.value)
})

const getDifficultyText = (d: number) => {
  const map: Record<number, string> = { 1: '⭐ 简单', 2: '⭐⭐ 中等', 3: '⭐⭐⭐ 困难' }
  return map[d] || '⭐ 简单'
}

const loadList = async () => {
  try {
    const data = await recipeApi.getList()
    recipeList.value = data || []
  } catch (e) {
    console.error('加载菜谱失败', e)
  }
}

const goDetail = (id: number) => {
  uni.navigateTo({ url: `/pages/recipe/detail?id=${id}` })
}

const goEdit = (id?: number) => {
  const url = id ? `/pages/recipe/edit?id=${id}` : '/pages/recipe/edit'
  uni.navigateTo({ url })
}

onShow(() => {
  loadList()
})
</script>

<style scoped>
.recipe-page {
  min-height: 100vh;
  background: #F5F5F5;
  padding-bottom: 120rpx;
}

.tabs {
  background: #fff;
  padding: 16rpx 0;
}

.tab-scroll {
  white-space: nowrap;
  padding: 0 16rpx;
}

.tab {
  display: inline-block;
  padding: 16rpx 28rpx;
  font-size: 26rpx;
  color: #666;
  background: #F5F5F5;
  border-radius: 32rpx;
  margin-right: 16rpx;
}

.tab.active {
  background: #FFE4EC;
  color: #FF6B9D;
}

.recipe-list {
  padding: 24rpx;
}

.recipe-card {
  display: flex;
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.recipe-cover {
  width: 200rpx;
  height: 200rpx;
  flex-shrink: 0;
}

.recipe-cover-placeholder {
  width: 200rpx;
  height: 200rpx;
  background: #FFF5F7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60rpx;
  flex-shrink: 0;
}

.recipe-info {
  flex: 1;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.recipe-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 12rpx;
}

.recipe-meta {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 8rpx;
}

.difficulty {
  font-size: 24rpx;
  color: #F39C12;
}

.cook-time {
  font-size: 24rpx;
  color: #999;
}

.recipe-stats {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.try-count {
  font-size: 22rpx;
  color: #999;
  background: #F5F5F5;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
}

.favorite-tag {
  font-size: 24rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
}

.empty-icon { font-size: 100rpx; margin-bottom: 24rpx; }
.empty-text { font-size: 32rpx; color: #333; margin-bottom: 16rpx; }
.empty-tip { font-size: 26rpx; color: #999; }

.fab-btn {
  position: fixed;
  right: 40rpx;
  bottom: 200rpx;
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #FF6B9D, #FF8E9E);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  color: #fff;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 157, 0.4);
}
</style>
