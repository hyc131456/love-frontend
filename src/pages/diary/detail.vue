<template>
  <view class="detail-page">
    <AppNavBar title="日记详情" back />
    <view v-if="diary" class="diary-detail">
      <!-- 作者信息 -->
      <view class="diary-header">
        <image class="author-avatar" :src="diary.author?.avatar || '/static/default-avatar.png'" mode="aspectFill" />
        <view class="author-info">
          <text class="author-name">{{ diary.author?.nickname || '匿名' }}</text>
          <text class="diary-time">{{ formatTime(diary.createdAt) }}</text>
        </view>
        <text class="mood-icon">{{ getMoodIcon(diary.mood) }}</text>
        <text v-if="isOwner" class="edit-btn" @click="editDiary">编辑</text>
      </view>
      
      <!-- 内容 -->
      <text class="diary-content">{{ diary.content }}</text>
      
      <!-- 图片 -->
      <view v-if="diary.images?.length" class="diary-images">
        <image 
          v-for="(img, index) in diary.images" 
          :key="index"
          class="diary-image"
          :class="{ 'single': diary.images.length === 1 }"
          :src="img.thumbUrl || img.url"
          mode="aspectFill"
          @click="previewImage(diary.images, index)"
        />
      </view>
      
      <!-- 位置 -->
      <view v-if="diary.locationName" class="diary-location">
        <text>📍 {{ diary.locationName }}</text>
      </view>
      
      <!-- 天气 -->
      <view v-if="diary.weather" class="diary-weather">
        <text>{{ getWeatherIcon(diary.weather) }} {{ getWeatherText(diary.weather) }}</text>
      </view>
      
      <!-- 互动区域 -->
      <view class="diary-actions">
        <view class="action-item" :class="{ liked: diary.isLiked }" @click="toggleLike">
          <text class="action-icon">{{ diary.isLiked ? '❤️' : '🤍' }}</text>
          <text>{{ diary.likeCount || 0 }}</text>
        </view>
        <view class="action-item">
          <text class="action-icon">💬</text>
          <text>{{ diary.commentCount || 0 }}</text>
        </view>
      </view>
      
      <!-- 评论列表 -->
      <view v-if="diary.comments?.length" class="comments-section">
        <text class="section-title">评论</text>
        <view v-for="comment in diary.comments" :key="comment.id" class="comment-item">
          <image class="comment-avatar" :src="comment.author?.avatar || '/static/default-avatar.png'" mode="aspectFill" />
          <view class="comment-content">
            <text class="comment-author">{{ comment.author?.nickname || '匿名' }}</text>
            <text class="comment-text">{{ comment.content }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 底部操作栏 -->
    <view class="footer">
      <input 
        v-model="commentText" 
        class="comment-input" 
        placeholder="写下你的评论..."
      />
      <button class="btn-send" @click="sendComment" :disabled="!commentText.trim()">发送</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { diaryApi } from '@/api'
import { useUserStore } from '@/stores/user'
import AppNavBar from '@/components/AppNavBar.vue'

const userStore = useUserStore()
const diary = ref<any>(null)
const commentText = ref('')
const currentDiaryId = ref<number | null>(null)

// 判断是否是日记作者
const isOwner = computed(() => {
  if (!diary.value || !userStore.userInfo) return false
  return diary.value.authorId === userStore.userInfo.id || 
         diary.value.author?.id === userStore.userInfo.id
})

const moodMap: Record<string, string> = {
  happy: '😊',
  love: '🥰',
  sad: '😢',
  angry: '😠',
  miss: '🥺',
  tired: '😴'
}

const weatherMap: Record<string, { icon: string, text: string }> = {
  sunny: { icon: '☀️', text: '晴天' },
  cloudy: { icon: '⛅', text: '多云' },
  rainy: { icon: '🌧️', text: '雨天' },
  snowy: { icon: '❄️', text: '雪天' }
}

const getMoodIcon = (mood: string) => moodMap[mood] || '😊'
const getWeatherIcon = (weather: string) => weatherMap[weather]?.icon || '☀️'
const getWeatherText = (weather: string) => weatherMap[weather]?.text || '晴天'

// 格式化时间
const formatTime = (time: string) => {
  if (!time) return ''
  const date = new Date(time)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 页面加载
onLoad((options: any) => {
  if (options?.id) {
    currentDiaryId.value = parseInt(options.id)
    loadDiaryDetail(currentDiaryId.value)
  }
})

// 页面显示时刷新数据（编辑后返回会触发）
onShow(() => {
  if (currentDiaryId.value) {
    loadDiaryDetail(currentDiaryId.value)
  }
})

// 加载日记详情
const loadDiaryDetail = async (id: number) => {
  try {
    uni.showLoading({ title: '加载中...' })
    const data = await diaryApi.getDetail(id)
    diary.value = data
    uni.hideLoading()
  } catch (e) {
    uni.hideLoading()
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

// 预览图片
const previewImage = (images: any[], index: number) => {
  const urls = images.map(img => img.url)
  uni.previewImage({
    current: urls[index],
    urls
  })
}

// 点赞
const toggleLike = async () => {
  if (!diary.value) return
  try {
    if (diary.value.isLiked) {
      await diaryApi.unlike(diary.value.id)
      diary.value.isLiked = false
      diary.value.likeCount = Math.max(0, (diary.value.likeCount || 1) - 1)
    } else {
      await diaryApi.like(diary.value.id)
      diary.value.isLiked = true
      diary.value.likeCount = (diary.value.likeCount || 0) + 1
    }
  } catch (e) {
    console.error('操作失败', e)
  }
}

// 发送评论
const sendComment = async () => {
  if (!commentText.value.trim() || !diary.value) return
  
  try {
    await diaryApi.comment(diary.value.id, commentText.value)
    uni.showToast({ title: '评论成功', icon: 'success' })
    commentText.value = ''
    // 重新加载详情
    loadDiaryDetail(diary.value.id)
  } catch (e) {
    console.error('评论失败', e)
  }
}

// 编辑日记
const editDiary = () => {
  if (diary.value) {
    uni.navigateTo({ url: `/pages/diary/edit?id=${diary.value.id}` })
  }
}
</script>

<style scoped>
.detail-page {
  min-height: 100vh;
  background: #F7F5F3;
  color: #1C1B2E;
  padding-bottom: 164rpx;
}

.detail-page :deep(.app-nav) {
  background: #FFFFFF;
  border-bottom: 1rpx solid #EBEBF0;
  box-shadow: none;
}

.detail-page :deep(.app-nav__title) {
  font-size: 34rpx;
  font-weight: 700;
}

.detail-page button {
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  line-height: 1;
}

.detail-page button::after {
  border: none;
}

.diary-detail {
  margin: 24rpx 32rpx;
  padding: 32rpx;
  box-sizing: border-box;
  background: #FFFFFF;
  border-radius: 28rpx;
  border: 1rpx solid #EBEBF0;
  box-shadow: 0 6rpx 22rpx rgba(28, 27, 46, 0.06);
}

.diary-header {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.author-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
  background: #F7F5F3;
  border: 2rpx solid #FFFFFF;
  box-shadow: 0 3rpx 10rpx rgba(28, 27, 46, 0.08);
}

.author-info {
  flex: 1;
  min-width: 0;
}

.author-name {
  display: block;
  font-size: 30rpx;
  line-height: 38rpx;
  font-weight: 700;
  color: #1C1B2E;
  margin-bottom: 4rpx;
}

.diary-time {
  font-size: 24rpx;
  line-height: 32rpx;
  color: #8A8A9A;
}

.mood-icon {
  flex-shrink: 0;
  font-size: 46rpx;
  line-height: 52rpx;
  filter: drop-shadow(0 4rpx 8rpx rgba(28, 27, 46, 0.10));
}

.edit-btn {
  margin-left: 16rpx;
  padding: 8rpx 18rpx;
  background: #FEF0F2;
  border-radius: 999rpx;
  font-size: 24rpx;
  line-height: 30rpx;
  font-weight: 600;
  color: #E8637A;
}

.diary-content {
  display: block;
  font-size: 30rpx;
  color: #1C1B2E;
  line-height: 50rpx;
  margin-bottom: 24rpx;
}

.diary-images {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-bottom: 24rpx;
}

.diary-image {
  width: calc((100% - 20rpx) / 3);
  aspect-ratio: 1;
  border-radius: 16rpx;
  background: #F7F5F3;
  box-shadow: none;
}

.diary-image.single {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 20rpx;
}

.diary-location,
.diary-weather {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  margin-right: 12rpx;
  margin-bottom: 18rpx;
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  background: #F7F5F3;
  color: #8A8A9A;
  font-size: 24rpx;
  line-height: 32rpx;
}

.diary-actions {
  display: flex;
  align-items: center;
  gap: 28rpx;
  border-top: 1rpx solid #F0F0F4;
  border-bottom: 1rpx solid #F0F0F4;
  padding: 20rpx 0;
  margin: 6rpx 0 32rpx;
}

.action-item {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 80rpx;
  height: 44rpx;
  padding: 0 12rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  line-height: 1;
  color: #8A8A9A;
  transition: all 0.2s;
}

.action-item.liked {
  color: #E8637A;
}

.action-item:active {
  background: #FEF0F2;
  transform: scale(0.95);
}

.action-icon {
  margin-right: 8rpx;
  font-size: 26rpx;
}

.comments-section {
  margin-top: 0;
}

.section-title {
  display: block;
  font-size: 28rpx;
  line-height: 36rpx;
  font-weight: 700;
  color: #1C1B2E;
  margin-bottom: 20rpx;
}

.comment-item {
  display: flex;
  margin-bottom: 18rpx;
}

.comment-avatar {
  width: 58rpx;
  height: 58rpx;
  flex-shrink: 0;
  border-radius: 50%;
  margin-right: 16rpx;
  background: #F7F5F3;
}

.comment-content {
  flex: 1;
  min-width: 0;
  background: #F7F5F3;
  padding: 18rpx 22rpx;
  border-radius: 20rpx;
  border-top-left-radius: 10rpx;
}

.comment-author {
  display: block;
  font-size: 24rpx;
  line-height: 32rpx;
  font-weight: 700;
  color: #1C1B2E;
  margin-bottom: 4rpx;
}

.comment-text {
  font-size: 26rpx;
  color: #5B5A6D;
  line-height: 40rpx;
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(12px);
  border-top: 1rpx solid #EBEBF0;
  box-shadow: 0 -6rpx 24rpx rgba(28, 27, 46, 0.05);
}

.comment-input {
  flex: 1;
  min-width: 0;
  height: 76rpx;
  padding: 0 28rpx;
  box-sizing: border-box;
  background: #F7F5F3;
  border: 1rpx solid #EBEBF0;
  border-radius: 999rpx;
  color: #1C1B2E;
  font-size: 26rpx;
  transition: all 0.2s;
}

.comment-input:focus {
  background: #FFFFFF;
  border-color: #E8637A;
  box-shadow: 0 0 0 5rpx rgba(232, 99, 122, 0.10);
}

.btn-send {
  width: 116rpx;
  height: 76rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999rpx;
  background: #E8637A !important;
  color: #FFFFFF !important;
  font-size: 26rpx;
  line-height: 1;
  font-weight: 700;
  box-shadow: 0 8rpx 24rpx rgba(232, 99, 122, 0.24);
  transition: all 0.2s;
}

.btn-send:active {
  transform: scale(0.95);
}

.btn-send[disabled] {
  opacity: 0.5;
  box-shadow: none;
}
</style>

