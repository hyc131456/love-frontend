<template>
  <view class="couple-page">
    <AppNavBar title="情侣配对" back />

    <view class="pairing-hero">
      <view class="avatar-pair">
        <view class="avatar-frame avatar-self">
          <image class="avatar-image" :src="currentAvatar" mode="aspectFill" />
        </view>
        <view class="heart-link">♡</view>
        <view class="avatar-frame avatar-waiting">TA</view>
      </view>
      <text class="hero-title">开启两个人的专属空间</text>
      <text class="hero-subtitle">和 TA 一起记录值得珍藏的每一天</text>
    </view>

    <SegmentTabs v-model="activeTab" :items="pairTabs" />
    
    <view v-if="activeTab === 'create'" class="panel">
      <view v-if="!inviteCode" class="create-section">
        <view class="panel-heading">
          <view class="panel-icon panel-icon--rose">＋</view>
          <view class="panel-copy">
            <text class="panel-title">创建新空间</text>
            <text class="panel-desc">生成专属邀请码，邀请 TA 加入</text>
          </view>
        </view>
        <button class="btn-primary" @click="handleCreate" :loading="creating">
          创建情侣空间
        </button>
      </view>
      
      <view v-else class="code-section">
        <view class="panel-heading">
          <view class="panel-icon panel-icon--rose">♡</view>
          <view class="panel-copy">
            <text class="panel-title">邀请 TA 加入</text>
            <text class="panel-desc">你们的专属空间已经创建</text>
          </view>
        </view>

        <view class="code-box">
          <text class="label">专属邀请码</text>
          <text class="code">{{ inviteCode }}</text>
          <text class="expire">有效期至 {{ expireTimeText }}</text>
        </view>
        
        <view class="actions">
          <button class="btn-copy" @click="handleCopy">复制邀请码</button>
          <button class="btn-share" open-type="share">分享给 TA</button>
        </view>
        
        <text class="tip">等待 TA 加入</text>
        
        <button class="btn-enter" @click="goHome">先去看看</button>
      </view>
    </view>
    
    <view v-else class="panel">
      <view class="join-section">
        <view class="panel-heading">
          <view class="panel-icon panel-icon--lavender">→</view>
          <view class="panel-copy">
            <text class="panel-title">加入 TA 的空间</text>
            <text class="panel-desc">输入 TA 分享给你的 6 位邀请码</text>
          </view>
        </view>
        
        <input 
          v-model="inputCode" 
          class="input-code" 
          :class="{ 'input-code--filled': inputCode }"
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
import AppNavBar from '@/components/AppNavBar.vue'
import SegmentTabs from '@/components/SegmentTabs.vue'

const userStore = useUserStore()

const activeTab = ref<'create' | 'join'>('create')
const inviteCode = ref('')
const inputCode = ref('')
const creating = ref(false)
const joining = ref(false)
const currentAvatar = computed(() => userStore.userInfo?.avatar || '/static/default-avatar.svg')
const pairTabs = [
  { label: '创建空间', value: 'create' },
  { label: '加入空间', value: 'join' }
]

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
.couple-page,
.couple-page * {
  box-sizing: border-box;
}

.couple-page {
  min-height: 100vh;
  background: #F7F5F3;
  padding-bottom: 48rpx;
  color: #1C1B2E;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", system-ui, sans-serif;
}

.pairing-hero {
  margin: 24rpx 32rpx;
  padding: 40rpx 32rpx 36rpx;
  overflow: hidden;
  border-radius: 40rpx;
  background: linear-gradient(135deg, #F08DA5 0%, #DCA9C5 48%, #BDAFE2 100%);
  box-shadow: 0 8rpx 22rpx rgba(155, 120, 160, 0.1);
  text-align: center;
}

.avatar-pair {
  position: relative;
  width: 232rpx;
  height: 112rpx;
  margin: 0 auto 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-frame {
  width: 112rpx;
  height: 112rpx;
  flex: 0 0 112rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 6rpx solid rgba(255, 255, 255, 0.92);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.28);
  color: #FFFFFF;
  font-size: 28rpx;
  line-height: 1;
  font-weight: 700;
}

.avatar-self {
  position: relative;
  z-index: 2;
  margin-right: -16rpx;
}

.avatar-waiting {
  position: relative;
  z-index: 1;
  margin-left: -16rpx;
}

.avatar-image {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.heart-link {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 3;
  width: 52rpx;
  height: 52rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: #FFFFFF;
  color: #E8637A;
  font-size: 28rpx;
  line-height: 1;
  box-shadow: 0 4rpx 14rpx rgba(28, 27, 46, 0.14);
}

.hero-title,
.hero-subtitle {
  display: block;
  color: #FFFFFF;
  text-align: center;
}

.hero-title {
  font-size: 32rpx;
  line-height: 42rpx;
  font-weight: 700;
}

.hero-subtitle {
  margin-top: 6rpx;
  color: rgba(255, 255, 255, 0.82);
  font-size: 24rpx;
  line-height: 32rpx;
}

.panel {
  margin: 24rpx 32rpx 0;
  padding: 32rpx;
  border-radius: 32rpx;
  background: #FFFFFF;
  border: 1rpx solid #EBEBF0;
  box-shadow: 0 4rpx 16rpx rgba(28, 27, 46, 0.06);
}

.panel-heading {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 32rpx;
}

.panel-icon {
  width: 72rpx;
  height: 72rpx;
  flex: 0 0 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 22rpx;
  font-size: 34rpx;
  line-height: 1;
  font-weight: 600;
}

.panel-icon--rose {
  background: #FEF0F2;
  color: #E8637A;
}

.panel-icon--lavender {
  background: #F3F0FA;
  color: #9B8EC4;
}

.panel-copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.panel-title {
  display: block;
  color: #1C1B2E;
  font-size: 30rpx;
  line-height: 38rpx;
  font-weight: 700;
}

.panel-desc {
  display: block;
  margin-top: 4rpx;
  color: #8A8A9A;
  font-size: 26rpx;
  line-height: 34rpx;
}

.btn-primary {
  width: 100%;
  height: 88rpx;
  background: #E8637A;
  border-radius: 44rpx;
  color: #FFFFFF;
  font-size: 30rpx;
  font-weight: 700;
  border: none;
  box-shadow: 0 8rpx 24rpx rgba(232, 99, 122, 0.22);
}

.btn-primary,
.btn-copy,
.btn-share,
.btn-enter {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  line-height: 1;
  box-sizing: border-box;
}

.btn-primary::after,
.btn-copy::after,
.btn-share::after,
.btn-enter::after {
  border: none;
}

.btn-primary[disabled] {
  background: #E9A9B5;
  color: rgba(255, 255, 255, 0.9);
  box-shadow: none;
}

.code-section {
  text-align: center;
}

.label {
  display: block;
  font-size: 24rpx;
  line-height: 32rpx;
  color: #8A8A9A;
}

.code-box {
  padding: 28rpx 24rpx;
  background: #FEF0F2;
  border-radius: 24rpx;
  border: 1rpx solid rgba(232, 99, 122, 0.14);
}

.code {
  display: block;
  margin: 12rpx 0 8rpx;
  padding-left: 12rpx;
  font-size: 56rpx;
  line-height: 68rpx;
  font-weight: 700;
  letter-spacing: 12rpx;
  color: #E8637A;
}

.expire {
  display: block;
  font-size: 24rpx;
  line-height: 32rpx;
  color: #8A8A9A;
}

.actions {
  display: flex;
  gap: 24rpx;
  margin-top: 24rpx;
}

.btn-copy, .btn-share {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 26rpx;
  font-weight: 600;
  border: none;
}

.btn-copy {
  background: #F7F5F3;
  color: #5B5A6D;
  border: 1rpx solid #EBEBF0;
}

.btn-share {
  background: #E8637A;
  color: #FFFFFF;
}

.tip {
  display: block;
  text-align: center;
  margin-top: 28rpx;
  font-size: 24rpx;
  line-height: 32rpx;
  color: #8A8A9A;
}

.btn-enter {
  width: 100%;
  height: 80rpx;
  background: #FFFFFF;
  border: 2rpx solid rgba(232, 99, 122, 0.36);
  border-radius: 40rpx;
  color: #E8637A;
  font-size: 26rpx;
  font-weight: 600;
  margin-top: 20rpx;
}

.input-code {
  width: 100%;
  height: 96rpx;
  background: #F7F5F3;
  border: 2rpx solid #EBEBF0;
  border-radius: 20rpx;
  padding: 0 24rpx;
  text-align: center;
  color: #1C1B2E;
  font-size: 36rpx;
  line-height: 1;
  letter-spacing: 0;
  margin-bottom: 24rpx;
}

.input-code--filled {
  padding-left: 42rpx;
  letter-spacing: 18rpx;
}

.input-code:focus {
  border-color: rgba(232, 99, 122, 0.5);
  background: #FFFFFF;
}

.input-code::placeholder {
  color: #8A8A9A;
  letter-spacing: 0;
}
</style>

