<template>
  <view class="edit-page">
    <!-- 内容输入 -->
    <textarea 
      v-model="content"
      class="content-input"
      placeholder="记录今天的点点滴滴..."
      maxlength="1000"
      auto-height
    />
    
    <!-- 图片区 -->
    <view class="images-section">
      <view v-for="(img, index) in images" :key="index" class="image-item">
        <image :src="img" mode="aspectFill" />
        <view class="remove-btn" @click="removeImage(index)">×</view>
      </view>
      <view v-if="images.length < 9" class="add-image" @click="chooseImage">
        <text>+</text>
      </view>
    </view>
    
    <!-- 选项区 -->
    <view class="options-section">
      <!-- 心情 -->
      <view class="option-row">
        <text class="option-label">心情</text>
        <view class="mood-list">
          <view 
            v-for="mood in moods" 
            :key="mood.value"
            class="mood-item"
            :class="{ active: selectedMood === mood.value }"
            @click="selectedMood = mood.value"
          >
            {{ mood.icon }}
          </view>
        </view>
      </view>
      
      <!-- 天气 -->
      <view class="option-row">
        <text class="option-label">天气</text>
        <view class="weather-list">
          <view 
            v-for="weather in weathers" 
            :key="weather.value"
            class="weather-item"
            :class="{ active: selectedWeather === weather.value }"
            @click="selectedWeather = weather.value"
          >
            {{ weather.icon }}
          </view>
        </view>
      </view>
      
      <!-- 位置 -->
      <view class="option-row" @click="chooseLocation">
        <text class="option-label">位置</text>
        <text class="option-value">{{ locationName || '点击选择位置' }}</text>
        <text class="arrow">›</text>
      </view>
      
      <!-- 公开设置 -->
      <view class="option-row">
        <text class="option-label">对TA可见</text>
        <switch :checked="isPublic" @change="isPublic = !isPublic" color="#FF6B9D" />
      </view>
    </view>
    
    <!-- 发布按钮 -->
    <view class="footer">
      <button class="btn-publish" @click="publish" :loading="publishing">
        {{ isEditMode ? '保存修改' : '发布日记' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { diaryApi, uploadApi } from '@/api'

const moods = [
  { value: 'happy', icon: '😊' },
  { value: 'love', icon: '🥰' },
  { value: 'sad', icon: '😢' },
  { value: 'angry', icon: '😠' },
  { value: 'miss', icon: '🥺' },
  { value: 'tired', icon: '😴' }
]

const weathers = [
  { value: 'sunny', icon: '☀️' },
  { value: 'cloudy', icon: '⛅' },
  { value: 'rainy', icon: '🌧️' },
  { value: 'snowy', icon: '❄️' }
]

// 编辑模式
const isEditMode = ref(false)
const editingId = ref<number | null>(null)

const content = ref('')
const images = ref<string[]>([])
const selectedMood = ref('happy')
const selectedWeather = ref('sunny')
const locationName = ref('')
const latitude = ref<number | null>(null)
const longitude = ref<number | null>(null)
const isPublic = ref(true)
const publishing = ref(false)

// 页面标题
const pageTitle = computed(() => isEditMode.value ? '编辑日记' : '写日记')

// 页面加载
onLoad((options: any) => {
  if (options?.id) {
    isEditMode.value = true
    editingId.value = parseInt(options.id)
    loadDiaryDetail(editingId.value)
    // 设置导航栏标题
    uni.setNavigationBarTitle({ title: '编辑日记' })
  }
})

// 加载日记详情
const loadDiaryDetail = async (id: number) => {
  try {
    uni.showLoading({ title: '加载中...' })
    const data = await diaryApi.getDetail(id)
    
    content.value = data.content || ''
    selectedMood.value = data.mood || 'happy'
    selectedWeather.value = data.weather || 'sunny'
    locationName.value = data.locationName || ''
    latitude.value = data.latitude
    longitude.value = data.longitude
    isPublic.value = data.isPublic === 1
    
    // 处理图片
    if (data.images && data.images.length > 0) {
      images.value = data.images.map((img: any) => img.url || img)
    }
    
    uni.hideLoading()
  } catch (e) {
    uni.hideLoading()
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

// 上传图片
const uploadImages = async (tempPaths: string[]) => {
  uni.showLoading({ title: '正在上传图片...' })
  try {
    for (const path of tempPaths) {
      const result = await uploadApi.uploadImage(path)
      // 上传成功后推入真实远程 URL
      images.value.push(result.url)
    }
  } catch (e) {
    console.error('图片上传出错', e)
    uni.showToast({ title: '部分图片上传失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

// 选择图片
const chooseImage = () => {
  uni.chooseImage({
    count: 9 - images.value.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      uploadImages(res.tempFilePaths)
    }
  })
}

// 移除图片
const removeImage = (index: number) => {
  images.value.splice(index, 1)
}

// 选择位置
const chooseLocation = () => {
  uni.chooseLocation({
    success: (res) => {
      locationName.value = res.name || res.address
      latitude.value = res.latitude
      longitude.value = res.longitude
    }
  })
}

// 发布/更新
const publish = async () => {
  if (!content.value.trim()) {
    uni.showToast({ title: '请输入内容', icon: 'none' })
    return
  }
  
  publishing.value = true
  
  try {
    // 构建图片数据
    const imageData = images.value.map(url => ({
      url,
      thumbUrl: url
    }))
    
    const diaryData = {
      content: content.value,
      images: imageData,
      mood: selectedMood.value,
      weather: selectedWeather.value,
      locationName: locationName.value,
      latitude: latitude.value,
      longitude: longitude.value,
      isPublic: isPublic.value ? 1 : 0
    }
    
    if (isEditMode.value && editingId.value) {
      // 更新模式
      await diaryApi.update({ id: editingId.value, ...diaryData })
      uni.showToast({ title: '更新成功', icon: 'success' })
    } else {
      // 创建模式
      await diaryApi.create(diaryData)
      uni.showToast({ title: '发布成功', icon: 'success' })
    }
    
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (e) {
    console.error('发布失败', e)
  } finally {
    publishing.value = false
  }
}
</script>

<style scoped>
.edit-page {
  min-height: 100vh;
  background: #fff;
  padding: 32rpx;
  padding-bottom: 180rpx;
}

.content-input {
  width: 100%;
  min-height: 300rpx;
  font-size: 30rpx;
  line-height: 1.6;
  color: #333;
}

.images-section {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin: 32rpx 0;
}

.image-item {
  width: calc(33.33% - 12rpx);
  aspect-ratio: 1;
  position: relative;
  border-radius: 12rpx;
  overflow: hidden;
}

.image-item image {
  width: 100%;
  height: 100%;
}

.remove-btn {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 40rpx;
  height: 40rpx;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
}

.add-image {
  width: calc(33.33% - 12rpx);
  aspect-ratio: 1;
  background: #F8F8F8;
  border: 2rpx dashed #DDD;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60rpx;
  color: #CCC;
}

.options-section {
  background: #F8F8F8;
  border-radius: 24rpx;
  padding: 16rpx 32rpx;
}

.option-row {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #EEE;
}

.option-row:last-child {
  border-bottom: none;
}

.option-label {
  width: 140rpx;
  font-size: 28rpx;
  color: #666;
}

.mood-list, .weather-list {
  display: flex;
  flex: 1;
  gap: 16rpx;
}

.mood-item, .weather-item {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  border-radius: 50%;
  background: #fff;
}

.mood-item.active, .weather-item.active {
  background: #FFE4EC;
  box-shadow: 0 0 0 4rpx #FF6B9D;
}

.option-value {
  flex: 1;
  font-size: 28rpx;
  color: #999;
}

.arrow {
  font-size: 32rpx;
  color: #CCC;
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.btn-publish {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, #FF6B9D 0%, #FF8E9E 100%);
  border-radius: 48rpx;
  color: #fff;
  font-size: 32rpx;
  font-weight: 500;
  border: none;
}
</style>
