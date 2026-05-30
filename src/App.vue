<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useUserStore } from './stores/user'

onLaunch(() => {
  console.log('App Launch')
  
  // 检查登录状态
  const userStore = useUserStore()
  const token = uni.getStorageSync('token')
  
  if (token) {
    userStore.setToken(token)
    userStore.fetchUserInfo()
  }
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style>
/* 全局样式 */
page {
  background-color: #F7F5F3;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', system-ui, sans-serif;
  font-size: 28rpx;
  color: #1C1B2E;
  box-sizing: border-box;
}

@media screen and (min-width: 480px) {
  body {
    margin: 0;
    background: #ECE8E4;
  }

  uni-page-body,
  uni-page,
  #app {
    max-width: 390px;
    min-height: 100vh;
    margin: 0 auto;
    background: #F7F5F3;
    box-shadow: 0 0 40px rgba(28, 27, 46, 0.08);
  }
}

/* 主色调 */
:root {
  --primary-color: #E8637A;
  --primary-light: #FEF0F2;
  --secondary-color: #9B8EC4;
  --secondary-light: #F3F0FA;
  --success-color: #4CAF50;
  --success-light: #F0FFF4;
  --warning-color: #F5A623;
  --warning-light: #FFF7E6;
  --error-color: #E75B65;
  --text-primary: #1C1B2E;
  --text-secondary: #5B5A6D;
  --text-hint: #8A8A9A;
  --bg-color: #F7F5F3;
  --card-color: #FFFFFF;
  --border-color: #EBEBF0;
  --radius-md: 24rpx;
  --radius-lg: 32rpx;
  --shadow-card: 0 4rpx 16rpx rgba(28, 27, 46, 0.06);
  --shadow-float: 0 8rpx 32rpx rgba(232, 99, 122, 0.28);
}

/* 清除默认样式 */
view, text, image {
  box-sizing: border-box;
}

/* 安全区域 */
.safe-area-bottom {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

/* 通用卡片 */
.card {
  background: #FFFFFF;
  border-radius: 32rpx;
  padding: 32rpx;
  margin: 24rpx;
  border: 1rpx solid #EBEBF0;
  box-shadow: 0 4rpx 16rpx rgba(28, 27, 46, 0.06);
}

/* 主按钮 */
.btn-primary {
  background: #E8637A;
  color: #FFFFFF;
  border: none;
  border-radius: 48rpx;
  padding: 24rpx 48rpx;
  font-size: 32rpx;
  font-weight: 500;
  box-shadow: 0 8rpx 28rpx rgba(232, 99, 122, 0.25);
}

.btn-primary:active {
  opacity: 0.9;
}

/* 输入框 */
.input {
  background: #F7F5F3;
  border: 2rpx solid #EBEBF0;
  border-radius: 20rpx;
  padding: 24rpx 32rpx;
  font-size: 28rpx;
  width: 100%;
}

.input:focus {
  border-color: #E8637A;
}

/* 文本省略 */
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ellipsis-2 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
