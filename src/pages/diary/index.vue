<template>
  <view class="diary-page">
    <!-- 日记列表 -->
    <scroll-view 
      scroll-y 
      class="diary-list"
      @scrolltolower="loadMore"
    >
      <view v-for="diary in diaryList" :key="diary.id" class="diary-card" @click="viewDiary(diary)">
        <!-- 作者信息 -->
        <view class="diary-header">
          <image class="author-avatar" :src="diary.author?.avatar || '/static/default-avatar.png'" />
          <view class="author-info">
            <text class="author-name">{{ diary.author?.nickname || '匿名' }}</text>
            <text class="diary-time">{{ formatTime(diary.createdAt) }}</text>
          </view>
          <text class="mood-icon">{{ getMoodIcon(diary.mood) }}</text>
          <text v-if="diary.isOwner" class="edit-btn" @click.stop="editDiary(diary)">编辑</text>
        </view>
        
        <!-- 内容 -->
        <text class="diary-content">{{ diary.content }}</text>
        
        <!-- 图片 -->
        <view v-if="diary.images?.length" class="diary-images">
          <image 
            v-for="(img, index) in diary.images.slice(0, 9)" 
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
        
        <!-- 互动 -->
        <view class="diary-actions">
          <view class="action-item" @click="toggleLike(diary)">
            <text class="action-icon">{{ diary.isLiked ? '❤️' : '🤍' }}</text>
            <text>{{ diary.likeCount || 0 }}</text>
          </view>
          <view class="action-item" @click="showComment(diary)">
            <text class="action-icon">💬</text>
            <text>{{ diary.commentCount || 0 }}</text>
          </view>
        </view>
      </view>
      
      <view v-if="diaryList.length === 0" class="empty-state">
        <text class="empty-icon">📝</text>
        <text class="empty-text">还没有日记哦</text>
        <text class="empty-tip">快去记录第一篇回忆吧~</text>
      </view>
      
      <view v-if="loading" class="loading-tip">
        <text>加载中...</text>
      </view>
    </scroll-view>
    
    <!-- 发布按钮 -->
    <view class="fab-btn" @click="goEdit">
      <text>✏️</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { diaryApi } from '@/api'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const diaryList = ref<any[]>([])
const loading = ref(false)
const page = ref(1)
const hasMore = ref(true)

const moodMap: Record<string, string> = {
  happy: '😊',
  love: '🥰',
  sad: '😢',
  angry: '😠',
  miss: '🥺',
  tired: '😴'
}

// 获取心情图标
const getMoodIcon = (mood: string) => moodMap[mood] || '😊'

// 格式化时间
const formatTime = (time: string) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  if (diff < 604800000) return Math.floor(diff / 86400000) + '天前'
  
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

// 加载日记
const loadDiaries = async (isRefresh = false) => {
  if (loading.value) return
  if (!isRefresh && !hasMore.value) return
  
  // 基础校验：如果没有空间ID，直接置空不请求
  if (!userStore.userInfo?.coupleId) {
    diaryList.value = []
    loading.value = false
    hasMore.value = false
    return
  }
  
  loading.value = true
  try {
    const data = await diaryApi.getList(isRefresh ? 1 : page.value)
    
    if (isRefresh) {
      diaryList.value = data.list
      page.value = 1
    } else {
      diaryList.value.push(...data.list)
    }
    
    hasMore.value = data.hasMore
    page.value++
  } catch (e) {
    console.error('加载失败', e)
  } finally {
    loading.value = false
  }
}

// 加载更多
const loadMore = () => {
  if (hasMore.value) {
    loadDiaries()
  }
}

// 点赞
const toggleLike = async (diary: any) => {
  try {
    if (diary.isLiked) {
      await diaryApi.unlike(diary.id)
      diary.isLiked = false
      diary.likeCount = Math.max(0, (diary.likeCount || 1) - 1)
    } else {
      await diaryApi.like(diary.id)
      diary.isLiked = true
      diary.likeCount = (diary.likeCount || 0) + 1
    }
  } catch (e) {
    console.error('操作失败', e)
  }
}

// 评论
const showComment = (diary: any) => {
  uni.showToast({ title: '评论功能开发中', icon: 'none' })
}

// 预览图片
const previewImage = (images: any[], index: number) => {
  const urls = images.map(img => img.url)
  uni.previewImage({
    current: urls[index],
    urls
  })
}

// 去发布
const goEdit = () => {
  uni.navigateTo({ url: '/pages/diary/edit' })
}

// 编辑日记
const editDiary = (diary: any) => {
  uni.navigateTo({ url: `/pages/diary/edit?id=${diary.id}` })
}

// 查看日记详情
const viewDiary = (diary: any) => {
  uni.navigateTo({ url: `/pages/diary/detail?id=${diary.id}` })
}

// 已移除冗余的 onMounted，所有加载逻辑在 onShow 中异步顺序执行

onShow(async () => {
  // 强制同步用户信息后再加载，解决解绑残留或加载失败问题
  await userStore.fetchUserInfo()
  loadDiaries(true)
})
</script>

<style scoped>
.diary-page {
  min-height: 100vh;
  background: #F5F5F5;
  padding-bottom: 120rpx;
}

.diary-list {
  height: 100vh;
}

.diary-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  margin: 32rpx;
  border-radius: 32rpx;
  padding: 36rpx;
  box-shadow: 0 16rpx 48rpx rgba(255, 107, 157, 0.08);
  transition: all 0.2s ease;
}

.diary-card:active {
  transform: scale(0.98);
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 157, 0.04);
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
}

.author-info {
  flex: 1;
}

.author-name {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
}

.diary-time {
  font-size: 24rpx;
  color: #999;
}

.mood-icon {
  font-size: 48rpx;
  filter: drop-shadow(0 4rpx 8rpx rgba(0, 0, 0, 0.1));
}

.diary-content {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
  margin-bottom: 24rpx;
}

.diary-images {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.diary-image {
  width: calc(33.33% - 12rpx);
  aspect-ratio: 1;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.diary-image.single {
  width: 70%;
  aspect-ratio: 4/3;
  border-radius: 24rpx;
}

.diary-location {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 24rpx;
}

.diary-actions {
  display: flex;
  border-top: 1rpx dashed #F0F0F0;
  padding-top: 24rpx;
}

.action-item {
  display: flex;
  align-items: center;
  margin-right: 48rpx;
  font-size: 28rpx;
  color: #666;
  padding: 8rpx 16rpx;
  border-radius: 32rpx;
  transition: background-color 0.2s;
}

.action-item:active {
  background: #FFF5F7;
}

.action-icon {
  margin-right: 12rpx;
  font-size: 32rpx;
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

.loading-tip {
  text-align: center;
  padding: 32rpx;
  color: #999;
  font-size: 26rpx;
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
  font-size: 40rpx;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 157, 0.4);
}

.edit-btn {
  margin-left: 16rpx;
  padding: 8rpx 20rpx;
  background: #FFE4EC;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #FF6B9D;
}
</style>
