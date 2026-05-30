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
  background: linear-gradient(160deg, #FDE8EC 0%, #F3EEFF 56%, #E8F4FF 100%);
  position: relative;
  overflow: hidden;
}

.bg-decoration {
  display: none;
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
  justify-content: space-between;
  padding: 150rpx 48rpx 72rpx;
  min-height: 100vh;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 44rpx;
}

.logo {
  width: 160rpx;
  height: 160rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 76rpx;
  margin-bottom: 24rpx;
  border-radius: 48rpx;
  background: linear-gradient(135deg, #E8637A 0%, #9B8EC4 100%);
  box-shadow: 0 16rpx 48rpx rgba(232, 99, 122, 0.35);
}

.title {
  font-size: 48rpx;
  font-weight: 700;
  color: #1C1B2E;
  margin-bottom: 12rpx;
  letter-spacing: 4rpx;
}

.subtitle {
  font-size: 26rpx;
  color: #8A8A9A;
  letter-spacing: 4rpx;
}

.form-section {
  width: 100%;
  background: #fff;
  border-radius: 32rpx;
  padding: 36rpx;
  border: 1rpx solid #EBEBF0;
  box-shadow: 0 6rpx 24rpx rgba(28, 27, 46, 0.08);
  box-sizing: border-box;
}

.tabs {
  display: flex;
  margin-bottom: 40rpx;
  background: #F7F5F3;
  border-radius: 48rpx;
  padding: 6rpx;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 18rpx;
  font-size: 28rpx;
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
  border: 2rpx solid #EBEBF0;
  border-radius: 20rpx;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.input-group:focus-within {
  border-color: #E8637A;
  background: #FEF0F2;
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
  font-size: 28rpx;
  color: #1C1B2E;
  padding-right: 32rpx;
  outline: none;
  caret-color: #E8637A; /* 修改闪烁光标颜色为品牌色 */
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
  color: #1C1B2E !important;
}

.input:-webkit-autofill,
.input:-webkit-autofill:hover, 
.input:-webkit-autofill:focus, 
.input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0px 1000px transparent inset !important;
  -webkit-text-fill-color: #1C1B2E !important;
  transition: background-color 9999s ease-in-out 0s;
}

.btn-submit {
  height: 96rpx;
  background: #E8637A;
  border-radius: 48rpx;
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  border: none;
  margin-top: 16rpx;
  box-shadow: 0 8rpx 28rpx rgba(232, 99, 122, 0.28);
  letter-spacing: 4rpx;
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

.btn-wx {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 96rpx;
  padding: 0 48rpx;
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
  margin-top: 28rpx;
  position: static;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  font-size: 24rpx;
  color: #8A8A9A;
}

.agreement .link {
  color: #E8637A;
}
</style>
