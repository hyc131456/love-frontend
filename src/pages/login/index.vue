<template>
  <view class="login-page">
    <view v-if="screen === 'welcome'" class="screen welcome-screen">
      <view class="logo-wrap">
        <view class="logo-icon">
          <text class="logo-heart">💕</text>
        </view>
        <text class="app-name">心迹</text>
        <text class="app-sub">情侣时光</text>
      </view>

      <view class="tagline">
        <text>属于两个人的</text>
        <text>数字记忆空间</text>
      </view>

      <view class="welcome-bottom">
        <button class="btn-primary" @click="openForm('login')">登录</button>
        <button class="btn-secondary" @click="openForm('register')">注册</button>
        <button class="btn-wechat" @click="handleWxLogin" :loading="loading">
          <text class="wechat-icon">💬</text>
          <text>微信一键登录</text>
        </button>
        <view class="privacy">
          <text>登录即同意 </text>
          <text class="link">《用户协议》</text>
          <text> 和 </text>
          <text class="link">《隐私政策》</text>
        </view>
      </view>
    </view>

    <view v-else class="screen form-screen">
      <view class="nav-bar">
        <view class="nav-back" @click="screen = 'welcome'">‹</view>
        <text class="nav-title">{{ mode === 'login' ? '账号登录' : '账号注册' }}</text>
        <view class="nav-right"></view>
      </view>

      <view class="form-body">
        <view class="form-heading">
          <text class="form-title">{{ mode === 'login' ? '欢迎回来' : '创建账号' }}</text>
          <text class="form-subtitle">{{ mode === 'login' ? '继续记录你们的专属时光' : '先拥有一个属于自己的入口' }}</text>
        </view>

        <view class="form-card">
        <view class="tabs">
          <view 
            class="tab" 
            :class="{ active: mode === 'login' }"
            @click="mode = 'login'"
          >登录</view>
          <view 
            class="tab" 
            :class="{ active: mode === 'register' }"
            @click="mode = 'register'"
          >注册</view>
        </view>

        <view class="form">
          <view class="input-group">
            <text class="input-icon">👤</text>
            <input 
              v-model="form.username" 
              class="input" 
              placeholder="请输入用户名"
              maxlength="20"
            />
          </view>
          <view class="input-group">
            <text class="input-icon">🔒</text>
            <input 
              v-model="form.password" 
              class="input" 
              type="password" 
              placeholder="请输入密码"
              maxlength="20"
            />
          </view>
          <view v-if="mode === 'register'" class="input-group">
            <text class="input-icon">✨</text>
            <input 
              v-model="form.nickname" 
              class="input" 
              placeholder="昵称（可选）"
              maxlength="20"
            />
          </view>

          <button 
            class="btn-submit" 
            @click="handleSubmit" 
            :loading="loading"
          >
            {{ mode === 'login' ? '登录' : '注册' }}
          </button>
        </view>

        <view class="divider">
          <view class="line"></view>
          <text>其他方式</text>
          <view class="line"></view>
        </view>

        <view class="other-login">
          <button class="btn-wechat compact" @click="handleWxLogin" :loading="loading">
            <text class="wechat-icon">💬</text>
            <text>微信一键登录</text>
          </button>
        </view>
      </view>

        <view class="agreement">
        <text>登录即表示同意</text>
        <text class="link">《用户协议》</text>
        <text>和</text>
        <text class="link">《隐私政策》</text>
      </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { userApi } from '@/api'

const userStore = useUserStore()
const loading = ref(false)
const mode = ref<'login' | 'register'>('login')
const screen = ref<'welcome' | 'form'>('welcome')

const form = ref({
  username: '',
  password: '',
  nickname: ''
})

const openForm = (nextMode: 'login' | 'register') => {
  mode.value = nextMode
  screen.value = 'form'
}

// 表单提交
const handleSubmit = async () => {
  if (!form.value.username.trim()) {
    uni.showToast({ title: '请输入用户名', icon: 'none' })
    return
  }
  if (!form.value.password.trim()) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }
  if (form.value.password.length < 6) {
    uni.showToast({ title: '密码至少6位', icon: 'none' })
    return
  }
  
  loading.value = true
  
  try {
    let result
    if (mode.value === 'register') {
      result = await userApi.register(
        form.value.username, 
        form.value.password, 
        form.value.nickname || undefined
      )
      uni.showToast({ title: '注册成功', icon: 'success' })
    } else {
      result = await userApi.login(form.value.username, form.value.password)
    }
    
    // 保存登录状态
    userStore.setToken(result.token)
    userStore.userInfo = result.profile
    
    // 跳转
    setTimeout(() => {
      if (result.hasCoupled) {
        uni.switchTab({ url: '/pages/index/index' })
      } else {
        uni.redirectTo({ url: '/pages/couple/index' })
      }
    }, 500)
  } catch (e: any) {
    console.error('操作失败', e)
  } finally {
    loading.value = false
  }
}

// 微信登录
const handleWxLogin = async () => {
  loading.value = true
  
  try {
    // 获取微信登录code
    const loginRes = await new Promise<UniApp.LoginRes>((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success: resolve,
        fail: reject
      })
    })
    
    // 调用后端登录
    const result = await userStore.login(loginRes.code)
    
    // 跳转
    if (result.hasCoupled) {
      uni.switchTab({ url: '/pages/index/index' })
    } else {
      uni.redirectTo({ url: '/pages/couple/index' })
    }
  } catch (e) {
    console.error('登录失败', e)
    uni.showToast({ title: '微信登录失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(160deg, #FDE8EC 0%, #F3EEFF 56%, #E8F4FF 100%);
  position: relative;
  overflow: hidden;
  color: #1C1B2E;
}

.login-page button {
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  line-height: 1;
  overflow: visible;
}

.login-page button::after {
  border: none;
}

.screen {
  min-height: 100vh;
  box-sizing: border-box;
}

.welcome-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 156rpx 64rpx 88rpx;
}

.logo-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-icon {
  width: 160rpx;
  height: 160rpx;
  border-radius: 48rpx;
  background: linear-gradient(135deg, #E8637A 0%, #9B8EC4 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
  box-shadow: 0 16rpx 48rpx rgba(232, 99, 122, 0.35);
}

.logo-heart {
  font-size: 72rpx;
  line-height: 1;
}

.app-name {
  font-size: 64rpx;
  line-height: 76rpx;
  font-weight: 700;
  color: #1C1B2E;
  letter-spacing: 8rpx;
}

.app-sub {
  margin-top: 10rpx;
  font-size: 28rpx;
  line-height: 36rpx;
  color: #8A8A9A;
  letter-spacing: 7rpx;
}

.tagline {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #4A4860;
  font-size: 36rpx;
  line-height: 62rpx;
  font-weight: 400;
  text-align: center;
}

.welcome-bottom {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.btn-primary,
.btn-secondary,
.btn-wechat,
.btn-submit {
  width: 100%;
  height: 104rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999rpx;
  font-size: 32rpx;
  font-weight: 700;
  box-sizing: border-box;
}

.btn-primary {
  background: #E8637A !important;
  color: #FFFFFF !important;
  box-shadow: 0 8rpx 32rpx rgba(232, 99, 122, 0.28);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.76) !important;
  color: #E8637A !important;
  border: 2rpx solid rgba(232, 99, 122, 0.28) !important;
}

.btn-wechat {
  background: #07C160 !important;
  color: #FFFFFF !important;
  box-shadow: 0 8rpx 32rpx rgba(7, 193, 96, 0.24);
}

.btn-wechat.compact {
  height: 96rpx;
  font-size: 28rpx;
}

.wechat-icon {
  margin-right: 12rpx;
  font-size: 30rpx;
}

.privacy,
.agreement {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  color: #8A8A9A;
  font-size: 22rpx;
  line-height: 34rpx;
  text-align: center;
}

.privacy {
  margin-top: 4rpx;
}

.link {
  color: #E8637A;
}

.form-screen {
  display: flex;
  flex-direction: column;
  background: linear-gradient(160deg, #FDE8EC 0%, #F3EEFF 56%, #E8F4FF 100%);
}

.nav-bar {
  height: 118rpx;
  padding: 0 40rpx 24rpx;
  box-sizing: border-box;
  display: flex;
  align-items: flex-end;
  background: rgba(255, 255, 255, 0.08);
  border-bottom: none;
}

.nav-back,
.nav-right {
  width: 64rpx;
  height: 44rpx;
  flex-shrink: 0;
}

.nav-back {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  color: #1C1B2E;
  font-size: 56rpx;
  line-height: 1;
}

.nav-title {
  flex: 1;
  color: #1C1B2E;
  font-size: 34rpx;
  line-height: 44rpx;
  font-weight: 700;
  text-align: center;
}

.form-body {
  flex: 1;
  padding: 64rpx 32rpx 56rpx;
  box-sizing: border-box;
}

.form-heading {
  margin-bottom: 28rpx;
  padding: 0 8rpx;
  display: flex;
  flex-direction: column;
}

.form-title {
  color: #1C1B2E;
  font-size: 44rpx;
  line-height: 56rpx;
  font-weight: 700;
}

.form-subtitle {
  margin-top: 8rpx;
  color: #8A8A9A;
  font-size: 26rpx;
  line-height: 36rpx;
}

.form-card {
  width: 100%;
  background: #FFFFFF;
  border-radius: 32rpx;
  padding: 36rpx;
  border: 1rpx solid #EBEBF0;
  box-shadow: 0 14rpx 44rpx rgba(28, 27, 46, 0.08);
  box-sizing: border-box;
}

.tabs {
  display: flex;
  margin-bottom: 40rpx;
  background: #F7F5F3;
  border-radius: 48rpx;
  padding: 8rpx;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 18rpx 16rpx;
  font-size: 28rpx;
  line-height: 34rpx;
  color: #8A8A9A;
  border-radius: 44rpx;
  transition: all 0.3s ease;
}

.tab.active {
  color: #fff;
  font-weight: 600;
  background: #E8637A;
  box-shadow: 0 6rpx 18rpx rgba(232, 99, 122, 0.25);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 96rpx;
  background: #F7F5F3;
  border: 1rpx solid #EBEBF0;
  border-radius: 20rpx;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.input-group:focus-within {
  border-color: #E8637A;
  background: #FFFFFF;
  box-shadow: 0 4rpx 12rpx rgba(232, 99, 122, 0.1);
}

.input-icon {
  font-size: 32rpx;
  margin-left: 32rpx;
  margin-right: 16rpx;
  opacity: 0.6;
}

.input-group:focus-within .input-icon {
  opacity: 1;
}

.input {
  flex: 1;
  height: 100%;
  background: transparent;
  border: none;
  box-sizing: border-box;
  font-size: 28rpx;
  color: #1C1B2E;
  padding-right: 32rpx;
  outline: none;
  caret-color: #E8637A;
  -webkit-tap-highlight-color: transparent;
}

.input:focus {
  outline: none;
}

input:-internal-autofill-selected {
  background-color: #F7F5F3 !important;
  background-image: none !important;
  color: #1C1B2E !important;
}

.input:-webkit-autofill,
.input:-webkit-autofill:hover, 
.input:-webkit-autofill:focus, 
.input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 1000px #F7F5F3 inset !important;
  -webkit-text-fill-color: #1C1B2E !important;
  transition: background-color 9999s ease-in-out 0s;
}

.btn-submit {
  height: 96rpx;
  background: #E8637A !important;
  color: #FFFFFF !important;
  font-size: 32rpx;
  margin-top: 16rpx;
  box-shadow: 0 8rpx 28rpx rgba(232, 99, 122, 0.28);
  letter-spacing: 2rpx;
  transition: all 0.2s ease;
}

.btn-submit:active {
  transform: scale(0.97);
  box-shadow: 0 4rpx 12rpx rgba(232, 99, 122, 0.2);
}

.divider {
  display: flex;
  align-items: center;
  margin: 40rpx 0;
  color: #8A8A9A;
  font-size: 24rpx;
}

.divider .line {
  flex: 1;
  height: 2rpx;
  background: #EBEBF0;
}

.divider text {
  margin: 0 24rpx;
}

.other-login {
  display: flex;
  justify-content: center;
}

.agreement {
  margin-top: 28rpx;
}
</style>
