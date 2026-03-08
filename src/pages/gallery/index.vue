<template>
  <view class="gallery-page">
    <!-- 月份筛选 -->
    <view class="filter-bar">
      <picker mode="date" fields="month" @change="onMonthChange">
        <view class="filter-btn">
          <text>{{ filterLabel }}</text>
          <text class="arrow-down">▾</text>
        </view>
      </picker>
      <view v-if="filterYear" class="clear-filter" @click="clearFilter">清除筛选</view>
    </view>
    
    <!-- 图片网格 -->
    <view class="image-grid">
      <view 
        v-for="(img, index) in imageList" 
        :key="img.id" 
        class="image-item"
        @click="previewImage(index)"
      >
        <image 
          :src="img.thumbUrl || img.url" 
          class="grid-image" 
          mode="aspectFill"
          lazy-load
        />
        <view class="source-tag">
          {{ img.source === 'diary' ? '📝' : '🍳' }}
        </view>
      </view>
    </view>
    
    <!-- 空状态 -->
    <view v-if="imageList.length === 0 && !loading" class="empty-state">
      <text class="empty-icon">📷</text>
      <text class="empty-text">还没有照片</text>
      <text class="empty-tip">写日记时添加的图片会自动归集到这里~</text>
    </view>
    
    <!-- 加载更多 -->
    <view v-if="hasMore" class="load-more" @click="loadMore">
      <text>加载更多</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'

// 手动导入工具函数
import { get } from '@/utils/request'

const imageList = ref<any[]>([])
const page = ref(1)
const hasMore = ref(false)
const loading = ref(false)
const filterYear = ref<number | null>(null)
const filterMonth = ref<number | null>(null)

const filterLabel = computed(() => {
  if (filterYear.value && filterMonth.value) {
    return `${filterYear.value}年${filterMonth.value}月`
  }
  return '按月筛选'
})

const onMonthChange = (e: any) => {
  const [y, m] = e.detail.value.split('-')
  filterYear.value = parseInt(y)
  filterMonth.value = parseInt(m)
  page.value = 1
  imageList.value = []
  loadImages()
}

const clearFilter = () => {
  filterYear.value = null
  filterMonth.value = null
  page.value = 1
  imageList.value = []
  loadImages()
}

const loadImages = async () => {
  loading.value = true
  try {
    const params: any = { page: page.value, pageSize: 20 }
    if (filterYear.value && filterMonth.value) {
      params.year = filterYear.value
      params.month = filterMonth.value
    }
    const data = await get('/gallery/list', params)
    if (page.value === 1) {
      imageList.value = data.list || []
    } else {
      imageList.value.push(...(data.list || []))
    }
    hasMore.value = data.hasMore || false
  } catch (e) {
    console.error('加载图片失败', e)
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  page.value++
  loadImages()
}

const previewImage = (index: number) => {
  const urls = imageList.value.map(img => img.url)
  uni.previewImage({
    urls,
    current: urls[index]
  })
}

onShow(() => {
  page.value = 1
  loadImages()
})
</script>

<style scoped>
.gallery-page {
  min-height: 100vh;
  background: #F5F5F5;
}

.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  background: #fff;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
  background: #F5F5F5;
  border-radius: 24rpx;
  font-size: 26rpx;
  color: #666;
}

.arrow-down {
  font-size: 20rpx;
}

.clear-filter {
  font-size: 26rpx;
  color: #FF6B9D;
}

.image-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 4rpx;
}

.image-item {
  width: calc(33.333% - 4rpx);
  aspect-ratio: 1;
  margin: 2rpx;
  position: relative;
}

.grid-image {
  width: 100%;
  height: 100%;
}

.source-tag {
  position: absolute;
  bottom: 6rpx;
  right: 6rpx;
  font-size: 20rpx;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 8rpx;
  padding: 2rpx 8rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 160rpx 0;
}

.empty-icon { font-size: 100rpx; margin-bottom: 24rpx; }
.empty-text { font-size: 32rpx; color: #333; margin-bottom: 16rpx; }
.empty-tip { font-size: 26rpx; color: #999; text-align: center; padding: 0 48rpx; }

.load-more {
  text-align: center;
  padding: 32rpx;
  color: #FF6B9D;
  font-size: 28rpx;
}
</style>
