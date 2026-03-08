<template>
  <view class="recipe-edit-page">
    <view class="form-section">
      <!-- 封面图 -->
      <view class="cover-section" @click="chooseCover">
        <image v-if="form.coverImage" class="cover-preview" :src="form.coverImage" mode="aspectFill" />
        <view v-else class="cover-placeholder">
          <text class="cover-icon">📷</text>
          <text class="cover-text">添加封面图</text>
        </view>
      </view>
      
      <!-- 基本信息 -->
      <input v-model="form.name" class="input" placeholder="菜名（必填）" />
      
      <view class="row-field">
        <text class="field-label">分类</text>
        <view class="type-selector">
          <view 
            v-for="cat in categories" 
            :key="cat.value"
            class="type-item"
            :class="{ active: form.category === cat.value }"
            @click="form.category = cat.value"
          >
            {{ cat.icon }} {{ cat.label }}
          </view>
        </view>
      </view>
      
      <view class="row-field">
        <text class="field-label">难度</text>
        <view class="type-selector">
          <view 
            v-for="d in difficulties" 
            :key="d.value"
            class="type-item"
            :class="{ active: form.difficulty === d.value }"
            @click="form.difficulty = d.value"
          >
            {{ d.label }}
          </view>
        </view>
      </view>
      
      <input v-model="form.cookTime" class="input" placeholder="烹饪时间（分钟，可选）" type="number" />
      
      <!-- 食材 -->
      <view class="list-section">
        <text class="section-title">🥬 食材</text>
        <view v-for="(item, index) in ingredients" :key="index" class="ingredient-item">
          <input v-model="item.name" class="input-sm" placeholder="食材名" />
          <input v-model="item.amount" class="input-sm" placeholder="用量" />
          <text class="remove-btn" @click="ingredients.splice(index, 1)">✕</text>
        </view>
        <view class="add-item-btn" @click="ingredients.push({ name: '', amount: '' })">
          + 添加食材
        </view>
      </view>
      
      <!-- 步骤 -->
      <view class="list-section">
        <text class="section-title">📝 步骤</text>
        <view v-for="(step, index) in steps" :key="index" class="step-item">
          <text class="step-num">{{ index + 1 }}</text>
          <textarea v-model="step.content" class="step-input" placeholder="步骤描述" />
          <text class="remove-btn" @click="steps.splice(index, 1)">✕</text>
        </view>
        <view class="add-item-btn" @click="steps.push({ content: '' })">
          + 添加步骤
        </view>
      </view>
      
      <!-- 小贴士 -->
      <textarea v-model="form.tips" class="textarea" placeholder="小贴士（可选）" />
    </view>
    
    <button class="btn-primary" @click="saveSaving">{{ isEdit ? '保存修改' : '保存菜谱' }}</button>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { recipeApi, uploadApi } from '@/api'

const categories = [
  { value: 'staple', label: '主食', icon: '🍚' },
  { value: 'cold', label: '凉菜', icon: '🥗' },
  { value: 'soup', label: '汤羹', icon: '🍲' },
  { value: 'dessert', label: '甜品', icon: '🍰' },
  { value: 'drink', label: '饮品', icon: '🥤' }
]

const difficulties = [
  { value: 1, label: '⭐ 简单' },
  { value: 2, label: '⭐⭐ 中等' },
  { value: 3, label: '⭐⭐⭐ 困难' }
]

const isEdit = ref(false)
const editId = ref<number | null>(null)

const form = ref({
  name: '',
  category: 'staple',
  difficulty: 1,
  cookTime: '',
  coverImage: '',
  tips: ''
})

const ingredients = ref<{ name: string; amount: string }[]>([
  { name: '', amount: '' }
])

const steps = ref<{ content: string }[]>([
  { content: '' }
])

const chooseCover = () => {
  uni.chooseImage({
    count: 1,
    success: async (res) => {
      try {
        const result = await uploadApi.uploadImage(res.tempFilePaths[0])
        form.value.coverImage = result.url
      } catch (e) {
        console.error('上传失败', e)
      }
    }
  })
}

const saveSaving = async () => {
  if (!form.value.name.trim()) {
    uni.showToast({ title: '请输入菜名', icon: 'none' })
    return
  }
  
  const validIngredients = ingredients.value.filter(i => i.name.trim())
  const validSteps = steps.value.filter(s => s.content.trim())
  
  if (validIngredients.length === 0) {
    uni.showToast({ title: '请至少添加一种食材', icon: 'none' })
    return
  }
  if (validSteps.length === 0) {
    uni.showToast({ title: '请至少添加一个步骤', icon: 'none' })
    return
  }
  
  const data = {
    ...form.value,
    cookTime: form.value.cookTime ? parseInt(form.value.cookTime as string) : null,
    ingredients: JSON.stringify(validIngredients),
    steps: JSON.stringify(validSteps.map((s, i) => ({ order: i + 1, content: s.content })))
  }
  
  try {
    if (isEdit.value && editId.value) {
      await recipeApi.update({ ...data, id: editId.value })
    } else {
      await recipeApi.create(data)
    }
    uni.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 1000)
  } catch (e) {
    console.error('保存失败', e)
  }
}

onLoad(async (options: any) => {
  if (options?.id) {
    isEdit.value = true
    editId.value = parseInt(options.id)
    try {
      const data = await recipeApi.getDetail(editId.value)
      form.value = {
        name: data.name,
        category: data.category || 'staple',
        difficulty: data.difficulty || 1,
        cookTime: data.cookTime ? String(data.cookTime) : '',
        coverImage: data.coverImage || '',
        tips: data.tips || ''
      }
      ingredients.value = data.ingredients ? JSON.parse(data.ingredients) : [{ name: '', amount: '' }]
      steps.value = data.steps ? JSON.parse(data.steps).map((s: any) => ({ content: s.content })) : [{ content: '' }]
    } catch (e) {
      console.error('加载菜谱失败', e)
    }
  }
})
</script>

<style scoped>
.recipe-edit-page {
  min-height: 100vh;
  background: #F5F5F5;
  padding: 24rpx;
  padding-bottom: 120rpx;
}

.form-section {
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
}

.cover-section {
  margin-bottom: 24rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.cover-preview {
  width: 100%;
  height: 300rpx;
}

.cover-placeholder {
  width: 100%;
  height: 200rpx;
  background: #F8F8F8;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
  border: 2rpx dashed #DDD;
}

.cover-icon { font-size: 48rpx; margin-bottom: 8rpx; }
.cover-text { font-size: 26rpx; color: #999; }

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

.row-field {
  margin-bottom: 20rpx;
}

.field-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 12rpx;
  font-weight: 500;
}

.type-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.type-item {
  padding: 12rpx 24rpx;
  background: #F5F5F5;
  border-radius: 28rpx;
  font-size: 24rpx;
  color: #666;
}

.type-item.active {
  background: #FFE4EC;
  color: #FF6B9D;
}

.list-section {
  margin-bottom: 24rpx;
}

.section-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
}

.ingredient-item {
  display: flex;
  gap: 12rpx;
  align-items: center;
  margin-bottom: 12rpx;
}

.input-sm {
  flex: 1;
  height: 72rpx;
  background: #F8F8F8;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 26rpx;
  box-sizing: border-box;
}

.remove-btn {
  color: #FF4757;
  font-size: 28rpx;
  padding: 8rpx;
}

.step-item {
  display: flex;
  gap: 12rpx;
  align-items: flex-start;
  margin-bottom: 16rpx;
}

.step-num {
  width: 44rpx;
  height: 44rpx;
  background: #FF6B9D;
  color: #fff;
  font-size: 24rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 12rpx;
}

.step-input {
  flex: 1;
  min-height: 80rpx;
  background: #F8F8F8;
  border-radius: 12rpx;
  padding: 16rpx 20rpx;
  font-size: 26rpx;
  box-sizing: border-box;
}

.add-item-btn {
  text-align: center;
  color: #FF6B9D;
  font-size: 28rpx;
  padding: 20rpx;
  background: #FFF5F7;
  border-radius: 12rpx;
}

.textarea {
  width: 100%;
  min-height: 120rpx;
  background: #F8F8F8;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  font-size: 28rpx;
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
</style>
