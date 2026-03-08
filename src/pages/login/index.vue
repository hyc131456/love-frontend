<template>
  <view class="login-page">
    <!-- 背景装饰 -->
    <view class="bg-decoration">
      <view class="circle circle-1"></view>
      <view class="circle circle-2"></view>
    </view>
    
    <!-- 内容区 -->
    <view class="content">
      <!-- Logo -->
      <view class="logo-section">
        <view class="logo">💕</view>
        <text class="title">心迹·情侣时光</text>
        <text class="subtitle">记录爱情 共享时光</text>
      </view>
      
      <!-- 登录/注册表单 -->
      <view class="form-section">
        <!-- Tab切换 -->
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
        
        <!-- 表单 -->
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
        
        <!-- 其他登录方式 -->
        <view class="divider">
          <view class="line"></view>
          <text>其他方式</text>
          <view class="line"></view>
        </view>
        
        <view class="other-login">
          <button class="btn-wx" @click="handleWxLogin">
            <text class="icon">💬</text>
            <text>微信登录</text>
          </button>
        </view>
      </view>
      
      <!-- 协议 -->
      <view class="agreement">
        <text>登录即表示同意</text>
        <text class="link">《用户协议》</text>
        <text>和</text>
        <text class="link">《隐私政策》</text>
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

const form = ref({
  username: '',
  password: '',
  nickname: ''
})

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
  background: linear-gradient(180deg, #FFF9FA 0%, #FFE4EC 100%);
  position: relative;
  overflow: hidden;
}

.bg-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 107, 157, 0.1);
}

.circle-1 {
  width: 400rpx;
  height: 400rpx;
  top: -100rpx;
  right: -100rpx;
}

.circle-2 {
  width: 300rpx;
  height: 300rpx;
  bottom: 200rpx;
  left: -100rpx;
}

.content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 48rpx 100rpx;
  min-height: 100vh;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 60rpx;
}

.logo {
  font-size: 100rpx;
  margin-bottom: 24rpx;
}

.title {
  font-size: 44rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 12rpx;
}

.subtitle {
  font-size: 26rpx;
  color: #999;
}

.form-section {
  width: 100%;
  background: #fff;
  border-radius: 32rpx;
  padding: 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
  box-sizing: border-box;
}

.tabs {
  display: flex;
  margin-bottom: 40rpx;
  background: #F5F5F5;
  border-radius: 48rpx;
  padding: 6rpx;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  font-size: 30rpx;
  color: #999;
  border-radius: 44rpx;
  transition: all 0.3s ease;
}

.tab.active {
  color: #fff;
  font-weight: 600;
  background: linear-gradient(135deg, #FF6B9D 0%, #FF8E9E 100%);
  box-shadow: 0 4rpx 16rpx rgba(255, 107, 157, 0.35);
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
  background: #F8F8F8;
  border: 2rpx solid #EEE;
  border-radius: 16rpx;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.input-group:focus-within {
  border-color: #FF6B9D;
  background: #FFF5F7;
  box-shadow: 0 4rpx 12rpx rgba(255, 107, 157, 0.1);
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
  font-size: 28rpx;
  color: #333;
  padding-right: 32rpx;
  outline: none;
  caret-color: #FF6B9D; /* 修改闪烁光标颜色为粉色 */
  -webkit-tap-highlight-color: transparent; /* 去除移动端点击灰色/蓝色高亮 */
}

/* 确保无论在什么环境下都不会出现原生外边框 */
.input:focus {
  outline: none;
}

/* 去除浏览器自带的密码/账户名的自动填充带来的蓝色背景 */
input:-internal-autofill-selected {
  background-color: transparent !important;
  background-image: none !important;
  color: #333 !important;
}

.input:-webkit-autofill,
.input:-webkit-autofill:hover, 
.input:-webkit-autofill:focus, 
.input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0px 1000px transparent inset !important;
  -webkit-text-fill-color: #333 !important;
  transition: background-color 9999s ease-in-out 0s;
}

.btn-submit {
  height: 96rpx;
  background: linear-gradient(135deg, #FF6B9D 0%, #FF8E9E 100%);
  border-radius: 48rpx;
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  border: none;
  margin-top: 16rpx;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 157, 0.4);
  letter-spacing: 4rpx;
  transition: all 0.2s ease;
}

.btn-submit:active {
  transform: scale(0.97);
  box-shadow: 0 4rpx 12rpx rgba(255, 107, 157, 0.3);
}

.divider {
  display: flex;
  align-items: center;
  margin: 40rpx 0;
  color: #999;
  font-size: 24rpx;
}

.divider .line {
  flex: 1;
  height: 2rpx;
  background: #EEE;
}

.divider text {
  margin: 0 24rpx;
}

.other-login {
  display: flex;
  justify-content: center;
}

.btn-wx {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx 48rpx;
  background: #07C160;
  border-radius: 48rpx;
  color: #fff;
  font-size: 28rpx;
  border: none;
}

.btn-wx .icon {
  margin-right: 12rpx;
}

.agreement {
  position: absolute;
  bottom: 60rpx;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  font-size: 24rpx;
  color: #999;
}

.agreement .link {
  color: #FF6B9D;
}
</style>
