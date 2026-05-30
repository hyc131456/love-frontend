<template>
  <view class="diary-page">
    <AppNavBar title="日记" />
    <view class="couple-strip">
      <view class="avatar-group">
        <image class="strip-avatar" :src="userStore.userInfo?.avatar || '/static/default-avatar.svg'" mode="aspectFill" />
        <image class="strip-avatar strip-avatar--second" :src="userStore.coupleInfo?.partner?.avatar || '/static/default-avatar.svg'" mode="aspectFill" />
      </view>
      <view class="strip-copy">
        <text class="strip-title">我们的日常</text>
        <text class="strip-subtitle">把今天也轻轻收藏起来</text>
      </view>
    </view>
    <SegmentTabs v-model="activeFilter" :items="filterTabs" />

    <scroll-view 
      scroll-y 
      class="diary-list"
      @scrolltolower="loadMore"
    >
      <view v-for="diary in filteredDiaries" :key="diary.id" class="diary-card" @click="viewDiary(diary)">
        <view class="diary-header">
          <image class="author-avatar" :src="diary.author?.avatar || '/static/default-avatar.png'" mode="aspectFill" />
          <view class="author-info">
            <text class="author-name">{{ diary.author?.nickname || '匿名' }}</text>
            <text class="diary-time">{{ formatTime(diary.createdAt) }}</text>
          </view>
          <text class="mood-icon">{{ getMoodIcon(diary.mood) }}</text>
          <text v-if="diary.isOwner" class="edit-btn" @click.stop="editDiary(diary)">编辑</text>
        </view>
        
        <text class="diary-content">{{ diary.content }}</text>
        
        <view v-if="diary.images?.length" class="diary-images">
          <image 
            v-for="(img, index) in diary.images.slice(0, 9)" 
            :key="index"
            class="diary-image"
            :class="{ 'single': diary.images.length === 1 }"
            :src="img.thumbUrl || img.url"
            mode="aspectFill"
            @click.stop="previewImage(diary.images, index)"
          />
        </view>
        
        <view v-if="diary.locationName" class="diary-location">
          <text>📍 {{ diary.locationName }}</text>
        </view>
        
        <view class="diary-actions">
          <view class="action-item" :class="{ liked: diary.isLiked }" @click.stop="toggleLike(diary)">
            <text class="action-icon">{{ diary.isLiked ? '❤️' : '🤍' }}</text>
            <text>{{ diary.likeCount || 0 }}</text>
          </view>
          <view class="action-item" @click.stop="showComment(diary)">
            <text class="action-icon">💬</text>
            <text>{{ diary.commentCount || 0 }}</text>
          </view>
        </view>
      </view>
      
      <EmptyState
        v-if="filteredDiaries.length === 0 && !loading"
        icon="▤"
        title="还没有日记"
        desc="写下第一段今天的心情。"
      />
      
      <view v-if="loading" class="loading-tip">
        <text>加载中...</text>
      </view>
    </scroll-view>
    
    <AppFab icon="+" @click="goEdit" />
    <AppTabBar current="/pages/diary/index" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { diaryApi } from '@/api'
import { useUserStore } from '@/stores/user'
import AppFab from '@/components/AppFab.vue'
import AppNavBar from '@/components/AppNavBar.vue'
import AppTabBar from '@/components/AppTabBar.vue'
import EmptyState from '@/components/EmptyState.vue'
import SegmentTabs from '@/components/SegmentTabs.vue'

const userStore = useUserStore()
const diaryList = ref<any[]>([])
const loading = ref(false)
const page = ref(1)
const hasMore = ref(true)
const activeFilter = ref('all')

const filterTabs = [
  { label: '全部', value: 'all' },
  { label: '我的', value: 'mine' },
  { label: '有图', value: 'image' }
]

const filteredDiaries = computed(() => {
  if (activeFilter.value === 'mine') return diaryList.value.filter(item => item.isOwner)
  if (activeFilter.value === 'image') return diaryList.value.filter(item => item.images?.length)
  return diaryList.value
})

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
  uni.hideTabBar()
  // 强制同步用户信息后再加载，解决解绑残留或加载失败问题
  await userStore.fetchUserInfo()
  loadDiaries(true)
})
</script>

<style scoped>
.diary-page {
  min-height: 100vh;
  background: #F7F5F3;
  color: #1C1B2E;
  padding-bottom: 180rpx;
}

.diary-page :deep(.app-nav) {
  background: #FFFFFF;
  border-bottom: 1rpx solid #EBEBF0;
  box-shadow: none;
}

.diary-page :deep(.app-nav__title) {
  font-size: 34rpx;
  font-weight: 700;
}

.diary-page :deep(.segment-tabs) {
  margin: 0 32rpx;
  padding: 8rpx;
  border-radius: 999rpx;
  background: #FFFFFF;
  border: 1rpx solid #EBEBF0;
  box-shadow: 0 6rpx 20rpx rgba(28, 27, 46, 0.05);
}

.diary-page :deep(.segment-tabs__item) {
  height: 64rpx;
  padding: 0 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999rpx;
  font-size: 26rpx;
  line-height: 1;
}

.diary-page :deep(.segment-tabs__item--active) {
  background: #FEF0F2;
  color: #E8637A;
  font-weight: 700;
}

.diary-page :deep(.app-fab) {
  right: 32rpx;
  bottom: 178rpx;
  width: 104rpx;
  height: 104rpx;
  box-shadow: 0 10rpx 32rpx rgba(232, 99, 122, 0.34);
}

.couple-strip {
  display: flex;
  align-items: center;
  margin: 24rpx 32rpx 22rpx;
  padding: 28rpx 30rpx;
  border-radius: 28rpx;
  background: #FFFFFF;
  border: 1rpx solid #EBEBF0;
  box-shadow: 0 8rpx 24rpx rgba(28, 27, 46, 0.06);
}

.avatar-group {
  width: 112rpx;
  display: flex;
  align-items: center;
}

.strip-avatar {
  width: 68rpx;
  height: 68rpx;
  border-radius: 50%;
  border: 4rpx solid #FFFFFF;
  background: #F7F5F3;
  box-shadow: 0 4rpx 12rpx rgba(28, 27, 46, 0.10);
}

.strip-avatar--second {
  margin-left: -20rpx;
}

.strip-copy {
  flex: 1;
  min-width: 0;
}

.strip-title {
  display: block;
  font-size: 32rpx;
  line-height: 40rpx;
  font-weight: 700;
  color: #1C1B2E;
}

.strip-subtitle {
  display: block;
  margin-top: 6rpx;
  font-size: 24rpx;
  color: #8A8A9A;
}

.diary-list {
  height: calc(100vh - 330rpx);
  margin-top: 22rpx;
  box-sizing: border-box;
}

.diary-card {
  background: #FFFFFF;
  margin: 0 32rpx 28rpx;
  border-radius: 26rpx;
  padding: 30rpx 32rpx 26rpx;
  border: 1rpx solid #EBEBF0;
  box-shadow: 0 6rpx 22rpx rgba(28, 27, 46, 0.06);
  transition: all 0.2s ease;
}

.diary-card:active {
  transform: scale(0.98);
  box-shadow: 0 8rpx 24rpx rgba(28, 27, 46, 0.08);
}

.diary-header {
  display: flex;
  align-items: center;
  margin-bottom: 22rpx;
}

.author-avatar {
  width: 76rpx;
  height: 76rpx;
  border-radius: 50%;
  margin-right: 18rpx;
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

.diary-content {
  display: block;
  font-size: 28rpx;
  color: #1C1B2E;
  line-height: 44rpx;
  margin-bottom: 20rpx;
}

.diary-images {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-bottom: 20rpx;
}

.diary-image {
  width: calc((100% - 20rpx) / 3);
  aspect-ratio: 1;
  border-radius: 16rpx;
  background: #F7F5F3;
  box-shadow: none;
}

.diary-image.single {
  width: 72%;
  max-width: 430rpx;
  aspect-ratio: 1;
  border-radius: 18rpx;
}

.diary-location {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  background: #F7F5F3;
  font-size: 24rpx;
  line-height: 32rpx;
  color: #8A8A9A;
  margin-bottom: 20rpx;
}

.diary-actions {
  display: flex;
  align-items: center;
  gap: 28rpx;
  border-top: 1rpx solid #F0F0F4;
  padding-top: 20rpx;
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
  transition: background-color 0.2s;
}

.action-item.liked {
  color: #E8637A;
}

.action-item:active {
  background: #FEF0F2;
}

.action-icon {
  margin-right: 8rpx;
  font-size: 26rpx;
}

.loading-tip {
  text-align: center;
  padding: 24rpx 32rpx 44rpx;
  color: #8A8A9A;
  font-size: 26rpx;
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
</style>
