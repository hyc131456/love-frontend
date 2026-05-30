<template>
  <view class="recipe-page">
    <AppNavBar title="" back />

    <view class="recipe-header">
      <view class="header-row">
        <text class="header-title">家庭菜谱</text>
        <button class="create-btn" @click="goEdit()">+ 创建菜谱</button>
      </view>

      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input
          v-model="searchKeyword"
          class="search-input"
          placeholder="搜索菜名、食材…"
          confirm-type="search"
        />
      </view>

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
            <text v-if="recipe.tryCount > 0" class="try-count">已尝试 {{ recipe.tryCount }} 次</text>
            <text v-if="recipe.isFavorite" class="favorite-tag">❤️</text>
          </view>
        </view>
      </view>
      
      <EmptyState
        v-if="filteredList.length === 0"
        icon="🍳"
        :title="emptyTitle"
        desc="记录你们的专属美食吧。"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { recipeApi } from '@/api'
import AppNavBar from '@/components/AppNavBar.vue'
import EmptyState from '@/components/EmptyState.vue'

const categories = [
  { value: '', label: '全部', icon: '📋' },
  { value: 'staple', label: '主食', icon: '🍚' },
  { value: 'cold', label: '凉菜', icon: '🥗' },
  { value: 'soup', label: '汤羹', icon: '🍲' },
  { value: 'dessert', label: '甜品', icon: '🍰' },
  { value: 'drink', label: '饮品', icon: '🥤' }
]

const activeCategory = ref('')
const searchKeyword = ref('')
const recipeList = ref<any[]>([])

const filteredList = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  return recipeList.value.filter(recipe => {
    const matchesCategory = !activeCategory.value || recipe.category === activeCategory.value
    if (!matchesCategory) return false
    if (!keyword) return true

    const haystack = [
      recipe.name,
      recipe.ingredients,
      recipe.tips
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return haystack.includes(keyword)
  })
})

const emptyTitle = computed(() => {
  return searchKeyword.value.trim() ? '没有找到相关菜谱' : '还没有菜谱'
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
  background: #F7F5F3;
  padding-bottom: 40rpx;
}

.recipe-header {
  background: #FFFFFF;
  padding: 18rpx 32rpx 0;
  border-bottom: 1rpx solid #EBEBF0;
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.header-title {
  font-size: 36rpx;
  line-height: 44rpx;
  font-weight: 700;
  color: #1C1B2E;
}

.create-btn {
  height: 60rpx;
  padding: 0 28rpx;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 999rpx;
  background: #E8637A;
  color: #FFFFFF;
  font-size: 26rpx;
  line-height: 1;
  font-weight: 600;
}

.search-box {
  height: 72rpx;
  margin-bottom: 16rpx;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  gap: 14rpx;
  border-radius: 20rpx;
  background: #F7F5F3;
}

.search-icon {
  flex-shrink: 0;
  font-size: 28rpx;
  color: #8A8A9A;
}

.search-input {
  flex: 1;
  min-width: 0;
  height: 72rpx;
  font-size: 28rpx;
  color: #1C1B2E;
}

.tab-scroll {
  white-space: nowrap;
  padding: 0;
}

.tab {
  display: inline-block;
  padding: 16rpx 28rpx;
  font-size: 26rpx;
  color: #5B5A6D;
  background: #F7F5F3;
  border-radius: 32rpx;
  margin-right: 16rpx;
}

.tab.active {
  background: #FEF0F2;
  color: #E8637A;
}

.recipe-list {
  padding: 24rpx 32rpx;
}

.recipe-card {
  display: flex;
  background: #fff;
  border-radius: 28rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
  border: 1rpx solid #EBEBF0;
  box-shadow: 0 4rpx 16rpx rgba(28, 27, 46, 0.06);
}

.recipe-cover {
  width: 200rpx;
  height: 200rpx;
  flex-shrink: 0;
}

.recipe-cover-placeholder {
  width: 200rpx;
  height: 200rpx;
  background: #FEF0F2;
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
  color: #1C1B2E;
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
  color: #F5A623;
}

.cook-time {
  font-size: 24rpx;
  color: #8A8A9A;
}

.recipe-stats {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.try-count {
  font-size: 22rpx;
  color: #8A8A9A;
  background: #F7F5F3;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
}

.favorite-tag {
  font-size: 24rpx;
}

</style>
