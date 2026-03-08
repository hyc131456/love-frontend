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
  background-color: #FFF9FA;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 28rpx;
  color: #333333;
  box-sizing: border-box;
}

/* 主色调 */
:root {
  --primary-color: #FF6B9D;
  --primary-light: #FFE4EC;
  --secondary-color: #9B59B6;
  --success-color: #27AE60;
  --warning-color: #F39C12;
  --error-color: #E74C3C;
  --text-primary: #333333;
  --text-secondary: #666666;
  --text-hint: #999999;
  --bg-color: #FFF9FA;
  --card-color: #FFFFFF;
  --border-color: #EEEEEE;
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
  border-radius: 24rpx;
  padding: 32rpx;
  margin: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

/* 主按钮 */
.btn-primary {
  background: linear-gradient(135deg, #FF6B9D 0%, #FF8E9E 100%);
  color: #FFFFFF;
  border: none;
  border-radius: 48rpx;
  padding: 24rpx 48rpx;
  font-size: 32rpx;
  font-weight: 500;
}

.btn-primary:active {
  opacity: 0.9;
}

/* 输入框 */
.input {
  background: #F8F8F8;
  border: 2rpx solid #EEEEEE;
  border-radius: 16rpx;
  padding: 24rpx 32rpx;
  font-size: 28rpx;
  width: 100%;
}

.input:focus {
  border-color: #FF6B9D;
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
