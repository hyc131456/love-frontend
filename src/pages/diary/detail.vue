<template>
  <view class="detail-page">
    <view v-if="diary" class="diary-detail">
      <!-- 作者信息 -->
      <view class="diary-header">
        <image class="author-avatar" :src="diary.author?.avatar || '/static/default-avatar.png'" />
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
          :src="img.url"
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
        <view class="action-item" @click="toggleLike">
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
          <image class="comment-avatar" :src="comment.author?.avatar || '/static/default-avatar.png'" />
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
  background: #fff;
  padding-bottom: 140rpx;
}

.diary-detail {
  padding: 40rpx 32rpx;
  background: #fff;
  border-radius: 32rpx;
  margin: 24rpx;
  box-shadow: 0 16rpx 48rpx rgba(255, 107, 157, 0.05);
}

.diary-header {
  display: flex;
  align-items: center;
  margin-bottom: 32rpx;
}

.author-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  margin-right: 24rpx;
}

.author-info {
  flex: 1;
}

.author-name {
  display: block;
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 8rpx;
}

.diary-time {
  font-size: 26rpx;
  color: #999;
}

.mood-icon {
  font-size: 48rpx;
}

.edit-btn {
  margin-left: 16rpx;
  padding: 8rpx 20rpx;
  background: #FFE4EC;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #FF6B9D;
}

.diary-content {
  display: block;
  font-size: 32rpx;
  color: #333;
  line-height: 1.8;
  margin-bottom: 32rpx;
}

.diary-images {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.diary-image {
  width: calc(33.33% - 12rpx);
  aspect-ratio: 1;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.diary-image.single {
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: 24rpx;
}

.diary-location,
.diary-weather {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.diary-actions {
  display: flex;
  border-top: 1rpx dashed #F0F0F0;
  border-bottom: 1rpx dashed #F0F0F0;
  padding: 24rpx 0;
  margin-bottom: 40rpx;
}

.action-item {
  display: flex;
  align-items: center;
  margin-right: 48rpx;
  font-size: 28rpx;
  color: #666;
  padding: 8rpx 20rpx;
  border-radius: 32rpx;
  transition: all 0.2s;
}

.action-item:active {
  background: #FFF5F7;
  transform: scale(0.95);
}

.action-icon {
  margin-right: 12rpx;
  font-size: 32rpx;
}

.comments-section {
  margin-top: 32rpx;
}

.section-title {
  display: block;
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 24rpx;
}

.comment-item {
  display: flex;
  margin-bottom: 24rpx;
}

.comment-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.comment-content {
  flex: 1;
  background: rgba(255, 245, 247, 0.6);
  padding: 24rpx;
  border-radius: 24rpx;
  border-top-left-radius: 8rpx;
}

.comment-author {
  display: block;
  font-size: 26rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 8rpx;
}

.comment-text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.5;
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 -8rpx 32rpx rgba(255, 107, 157, 0.08);
}

.comment-input {
  flex: 1;
  height: 80rpx;
  background: #F8F8F8;
  border-radius: 40rpx;
  padding: 0 40rpx;
  font-size: 28rpx;
  border: 2rpx solid transparent;
  transition: all 0.2s;
}

.comment-input:focus {
  background: #fff;
  border-color: #FFB3C6;
  box-shadow: 0 0 0 6rpx rgba(255, 179, 198, 0.2);
}

.btn-send {
  margin-left: 24rpx;
  padding: 0 40rpx;
  height: 80rpx;
  line-height: 80rpx;
  background: linear-gradient(135deg, #FF6B9D 0%, #FF8E9E 100%);
  border-radius: 40rpx;
  color: #fff;
  font-size: 30rpx;
  font-weight: 500;
  border: none;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 157, 0.3);
  transition: all 0.2s;
}

.btn-send:active {
  transform: scale(0.95);
}

.btn-send[disabled] {
  opacity: 0.5;
}
</style>
