<template>
  <view class="couple-page">
    <!-- 自定义返回 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
    </view>
    
    <!-- 顶部 -->
    <view class="header">
      <text class="title">情侣配对</text>
      <text class="subtitle">和 TA 一起开启专属空间</text>
    </view>
    
    <!-- Tab切换 -->
    <view class="tabs">
      <view 
        class="tab" 
        :class="{ active: activeTab === 'create' }"
        @click="activeTab = 'create'"
      >
        创建空间
      </view>
      <view 
        class="tab" 
        :class="{ active: activeTab === 'join' }"
        @click="activeTab = 'join'"
      >
        加入空间
      </view>
    </view>
    
    <!-- 创建空间 -->
    <view v-if="activeTab === 'create'" class="panel">
      <view v-if="!inviteCode" class="create-section">
        <view class="icon-box">💑</view>
        <text class="desc">创建属于你们的专属空间</text>
        <button class="btn-primary" @click="handleCreate" :loading="creating">
          创建情侣空间
        </button>
      </view>
      
      <view v-else class="code-section">
        <text class="label">邀请码</text>
        <view class="code-box">
          <text class="code">{{ inviteCode }}</text>
        </view>
        <text class="expire">有效期至 {{ expireTimeText }}</text>
        
        <view class="actions">
          <button class="btn-copy" @click="handleCopy">复制邀请码</button>
          <button class="btn-share" open-type="share">分享给 TA</button>
        </view>
        
        <text class="tip">等待对方输入邀请码加入...</text>
        
        <!-- 进入首页按钮 -->
        <button class="btn-enter" @click="goHome">先去看看</button>
      </view>
    </view>
    
    <!-- 加入空间 -->
    <view v-else class="panel">
      <view class="join-section">
        <view class="icon-box">💌</view>
        <text class="desc">输入伴侣的邀请码加入</text>
        
        <input 
          v-model="inputCode" 
          class="input-code" 
          placeholder="请输入 6 位邀请码"
          maxlength="6"
        />
        
        <button 
          class="btn-primary" 
          @click="handleJoin" 
          :loading="joining"
          :disabled="inputCode.length !== 6"
        >
          加入空间
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { coupleApi } from '@/api'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 0)

const goBack = () => {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack({ delta: 1 })
  } else {
    uni.switchTab({ url: '/pages/index/index' })
  }
}

const activeTab = ref<'create' | 'join'>('create')
const inviteCode = ref('')
const inputCode = ref('')
const creating = ref(false)
const joining = ref(false)

// 格式化过期时间展示
const expireTimeText = computed(() => {
  const expire = userStore.coupleInfo?.inviteCodeExpire
  if (!expire) return '24小时内'
  
  try {
    // 简单格式化 ISO 时间字符串 (2026-03-05T02:45:01 -> 03-05 02:45)
    const date = new Date(expire)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${month}-${day} ${hours}:${minutes}`
  } catch (e) {
    return '24小时内'
  }
})

// 创建空间
const handleCreate = async () => {
  creating.value = true
  try {
    const result = await coupleApi.create()
    inviteCode.value = result.inviteCode
  } catch (e) {
    console.error('创建失败', e)
  } finally {
    creating.value = false
  }
}

// 复制邀请码
const handleCopy = () => {
  uni.setClipboardData({
    data: inviteCode.value,
    success: () => {
      uni.showToast({ title: '已复制', icon: 'success' })
    }
  })
}

// 加入空间
const handleJoin = async () => {
  if (inputCode.value.length !== 6) return
  
  joining.value = true
  try {
    await coupleApi.join(inputCode.value)
    await userStore.fetchUserInfo()
    
    uni.showToast({ title: '配对成功', icon: 'success' })
    
    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' })
    }, 1500)
  } catch (e) {
    console.error('加入失败', e)
  } finally {
    joining.value = false
  }
}

// 进入首页
const goHome = () => {
  uni.switchTab({ url: '/pages/index/index' })
}
</script>

<style scoped>
.couple-page {
  min-height: 100vh;
  background: #F7F5F3;
  padding: 0 40rpx 40rpx;
}

.nav-bar {
  display: flex;
  align-items: center;
  height: 88rpx;
  background: transparent;
  margin-left: -20rpx; /* 补偿page的padding带来的影响 */
}

.back-btn {
  padding: 20rpx;
  display: flex;
  align-items: center;
}

.back-icon {
  font-size: 60rpx;
  color: #1C1B2E;
  line-height: 1;
  font-weight: 300;
  margin-top: -8rpx;
}

.header {
  text-align: center;
  padding: 60rpx 0;
}

.header .title {
  display: block;
  font-size: 44rpx;
  font-weight: 600;
  color: #1C1B2E;
  margin-bottom: 16rpx;
}

.header .subtitle {
  font-size: 28rpx;
  color: #8A8A9A;
}

.tabs {
  display: flex;
  background: #FFFFFF;
  border-radius: 40rpx;
  padding: 8rpx;
  margin-bottom: 48rpx;
  border: 1rpx solid #EBEBF0;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 24rpx;
  font-size: 28rpx;
  color: #5B5A6D;
  border-radius: 32rpx;
}

.tab.active {
  background: #E8637A;
  color: #fff;
  font-weight: 500;
}

.panel {
  background: #fff;
  border-radius: 32rpx;
  padding: 60rpx 40rpx;
  border: 1rpx solid #EBEBF0;
  box-shadow: 0 4rpx 16rpx rgba(28, 27, 46, 0.06);
}

.icon-box {
  font-size: 100rpx;
  text-align: center;
  margin-bottom: 32rpx;
}

.desc {
  display: block;
  text-align: center;
  font-size: 28rpx;
  color: #5B5A6D;
  margin-bottom: 48rpx;
}

.btn-primary {
  width: 100%;
  height: 88rpx;
  background: #E8637A;
  border-radius: 44rpx;
  color: #fff;
  font-size: 32rpx;
  font-weight: 500;
  border: none;
  box-shadow: 0 8rpx 28rpx rgba(232, 99, 122, 0.25);
}

.code-section {
  text-align: center;
}

.label {
  font-size: 28rpx;
  color: #8A8A9A;
}

.code-box {
  margin: 32rpx 0;
  padding: 40rpx;
  background: #FEF0F2;
  border-radius: 24rpx;
  border: 1rpx solid rgba(232, 99, 122, 0.14);
}

.code {
  font-size: 64rpx;
  font-weight: 600;
  letter-spacing: 16rpx;
  color: #E8637A;
}

.expire {
  font-size: 24rpx;
  color: #8A8A9A;
}

.actions {
  display: flex;
  gap: 24rpx;
  margin-top: 48rpx;
}

.btn-copy, .btn-share {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  border: none;
}

.btn-copy {
  background: #F7F5F3;
  color: #5B5A6D;
}

.btn-share {
  background: #E8637A;
  color: #fff;
}

.tip {
  display: block;
  text-align: center;
  margin-top: 48rpx;
  font-size: 26rpx;
  color: #8A8A9A;
}

.btn-enter {
  width: 100%;
  height: 80rpx;
  background: transparent;
  border: 2rpx solid #E8637A;
  border-radius: 40rpx;
  color: #E8637A;
  font-size: 28rpx;
  margin-top: 32rpx;
}

.input-code {
  width: 100%;
  height: 96rpx;
  background: #F7F5F3;
  border: 2rpx solid #EBEBF0;
  border-radius: 20rpx;
  text-align: center;
  font-size: 40rpx;
  letter-spacing: 24rpx;
  margin-bottom: 48rpx;
}
</style>

