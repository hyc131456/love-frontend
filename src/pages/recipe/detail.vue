<template>
  <view class="recipe-detail-page">
    <AppNavBar title="菜谱详情" back />
    <view v-if="recipe" class="detail-content">
      <!-- 封面 -->
      <image v-if="recipe.coverImage" class="cover-image" :src="recipe.coverImage" mode="aspectFill" />
      
      <!-- 基本信息 -->
      <view class="info-section">
        <view class="title-row">
          <text class="recipe-name">{{ recipe.name }}</text>
          <view class="action-btns">
            <text class="action-btn" :class="{ active: recipe.isFavorite }" @click="toggleFavorite">
              {{ recipe.isFavorite ? '❤️' : '🤍' }}
            </text>
          </view>
        </view>
        
        <view class="meta-row">
          <text class="meta-item">{{ getDifficultyText(recipe.difficulty) }}</text>
          <text v-if="recipe.cookTime" class="meta-item">⏱ {{ recipe.cookTime }}分钟</text>
          <text v-if="recipe.tryCount > 0" class="meta-item">已尝试 {{ recipe.tryCount }} 次</text>
        </view>
      </view>
      
      <!-- 食材 -->
      <view class="section-card">
        <text class="section-title">🥬 食材清单</text>
        <view class="ingredient-list">
          <view v-for="(item, index) in parsedIngredients" :key="index" class="ingredient-item">
            <text class="ingredient-name">{{ item.name }}</text>
            <text class="ingredient-amount">{{ item.amount }}</text>
          </view>
        </view>
      </view>
      
      <!-- 步骤 -->
      <view class="section-card">
        <text class="section-title">📝 制作步骤</text>
        <view class="step-list">
          <view v-for="(step, index) in parsedSteps" :key="index" class="step-item">
            <text class="step-num">{{ step.order || index + 1 }}</text>
            <text class="step-content">{{ step.content }}</text>
          </view>
        </view>
      </view>
      
      <!-- 小贴士 -->
      <view v-if="recipe.tips" class="section-card">
        <text class="section-title">💡 小贴士</text>
        <text class="tips-text">{{ recipe.tips }}</text>
      </view>
      
      <!-- 底部按钮 -->
      <view class="bottom-bar">
        <button class="btn-try" @click="recordTry">尝试此菜</button>
        <button class="btn-edit" @click="goEdit">编辑</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { recipeApi } from '@/api'
import AppNavBar from '@/components/AppNavBar.vue'

const recipe = ref<any>(null)

const parsedIngredients = computed(() => {
  if (!recipe.value?.ingredients) return []
  try {
    return JSON.parse(recipe.value.ingredients)
  } catch { return [] }
})

const parsedSteps = computed(() => {
  if (!recipe.value?.steps) return []
  try {
    return JSON.parse(recipe.value.steps)
  } catch { return [] }
})

const getDifficultyText = (d: number) => {
  const map: Record<number, string> = { 1: '⭐ 简单', 2: '⭐⭐ 中等', 3: '⭐⭐⭐ 困难' }
  return map[d] || '⭐ 简单'
}

const loadDetail = async (id: number) => {
  try {
    recipe.value = await recipeApi.getDetail(id)
  } catch (e) {
    console.error('加载失败', e)
  }
}

const toggleFavorite = async () => {
  try {
    await recipeApi.toggleFavorite(recipe.value.id)
    recipe.value.isFavorite = !recipe.value.isFavorite
  } catch (e) {
    console.error('操作失败', e)
  }
}

const recordTry = async () => {
  try {
    await recipeApi.recordTry(recipe.value.id)
    recipe.value.tryCount = (recipe.value.tryCount || 0) + 1
    uni.showToast({ title: '记录成功', icon: 'success' })
  } catch (e) {
    console.error('记录失败', e)
  }
}

const goEdit = () => {
  uni.navigateTo({ url: `/pages/recipe/edit?id=${recipe.value.id}` })
}

onLoad((options: any) => {
  if (options?.id) {
    loadDetail(parseInt(options.id))
  }
})
</script>

<style scoped>
.recipe-detail-page {
  min-height: 100vh;
  background: #F7F5F3;
  padding-bottom: 160rpx;
}

.cover-image {
  width: 100%;
  height: 400rpx;
}

.info-section {
  background: #fff;
  padding: 32rpx;
  margin: -32rpx 24rpx 24rpx;
  position: relative;
  border-radius: 32rpx;
  border: 1rpx solid #EBEBF0;
  box-shadow: 0 4rpx 16rpx rgba(28, 27, 46, 0.06);
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.recipe-name {
  font-size: 36rpx;
  font-weight: 700;
  color: #1C1B2E;
}

.action-btn {
  font-size: 36rpx;
  padding: 8rpx;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.meta-item {
  font-size: 24rpx;
  color: #8A8A9A;
  background: #F7F5F3;
  padding: 6rpx 16rpx;
  border-radius: 16rpx;
}

.section-card {
  background: #fff;
  margin: 0 24rpx 24rpx;
  padding: 32rpx;
  border-radius: 32rpx;
  border: 1rpx solid #EBEBF0;
  box-shadow: 0 4rpx 16rpx rgba(28, 27, 46, 0.05);
}

.section-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #1C1B2E;
  margin-bottom: 20rpx;
}

.ingredient-list {
  border-top: 1rpx solid #F7F5F3;
}

.ingredient-item {
  display: flex;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #F7F5F3;
}

.ingredient-item:last-child { border-bottom: none; }

.ingredient-name {
  font-size: 28rpx;
  color: #1C1B2E;
}

.ingredient-amount {
  font-size: 28rpx;
  color: #8A8A9A;
}

.step-list {
  border-top: 1rpx solid #F7F5F3;
  padding-top: 16rpx;
}

.step-item {
  display: flex;
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.step-num {
  width: 48rpx;
  height: 48rpx;
  background: #E8637A;
  color: #fff;
  font-size: 26rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
  font-size: 28rpx;
  color: #1C1B2E;
  line-height: 1.6;
}

.tips-text {
  font-size: 28rpx;
  color: #5B5A6D;
  line-height: 1.6;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 20rpx;
  padding: 24rpx 32rpx;
  background: #fff;
  border-top: 1rpx solid #EBEBF0;
  box-shadow: 0 -8rpx 32rpx rgba(28, 27, 46, 0.06);
}

.btn-try {
  flex: 2;
  height: 80rpx;
  line-height: 80rpx;
  background: #E8637A;
  border-radius: 40rpx;
  color: #fff;
  font-size: 28rpx;
  border: none;
  box-shadow: 0 8rpx 28rpx rgba(232, 99, 122, 0.25);
}

.btn-edit {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  background: #F7F5F3;
  border-radius: 40rpx;
  color: #5B5A6D;
  font-size: 28rpx;
  border: none;
}
</style>

