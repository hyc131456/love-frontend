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

/* Mine page: global page-prefixed styles so H5/mp-weixin preview cannot miss the profile layout. */
.mine-page,
.mine-page * {
  box-sizing: border-box;
}

.mine-page {
  min-height: 100vh;
  background: #F7F5F3;
  color: #1C1B2E;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", system-ui, sans-serif;
}

.mine-page button {
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  line-height: 1;
}

.mine-page button::after {
  border: 0;
}

.mine-page .mine-scroll {
  height: 100vh;
  background: #F7F5F3;
  padding-bottom: 178rpx;
}

.mine-page .mine-cover {
  position: relative;
  width: 100%;
  height: 400rpx;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  overflow: visible;
  background: linear-gradient(160deg, #FDE8EC 0%, #F3EEFF 60%, #E8F4FF 100%);
}

.mine-page .mine-cover-nav {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  min-height: 118rpx;
  padding-left: 40rpx;
  padding-right: 40rpx;
  padding-bottom: 22rpx;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.mine-page .mine-nav-spacer,
.mine-page .mine-nav-action {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.mine-page .mine-nav-title {
  color: #1C1B2E;
  font-size: 34rpx;
  line-height: 44rpx;
  font-weight: 700;
}

.mine-page .mine-nav-action {
  color: #8A8A9A;
  font-size: 34rpx;
  line-height: 1;
}

.mine-page .mine-heart {
  position: absolute;
  left: 50%;
  bottom: 72rpx;
  z-index: 1;
  transform: translateX(-50%);
  color: #E8637A;
  font-size: 34rpx;
  line-height: 1;
  animation: mineHeartFloat 2s ease-in-out infinite;
}

@keyframes mineHeartFloat {
  0%, 100% { transform: translate(-50%, 0); }
  50% { transform: translate(-50%, -12rpx); }
}

.mine-page .mine-avatar-pair {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: -56rpx;
  width: 236rpx;
  height: 128rpx;
}

.mine-page .mine-avatar-frame {
  width: 128rpx;
  height: 128rpx;
  flex: 0 0 128rpx;
  overflow: hidden;
  border-radius: 50%;
  border: 6rpx solid #FFFFFF;
  background: #FFFFFF;
  box-shadow: 0 8rpx 24rpx rgba(28, 27, 46, 0.14);
}

.mine-page .mine-avatar-a {
  position: relative;
  z-index: 2;
  margin-right: -20rpx;
}

.mine-page .mine-avatar-b {
  position: relative;
  z-index: 1;
}

.mine-page .mine-avatar-img {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.mine-page .mine-profile {
  padding: 80rpx 40rpx 36rpx;
  background: #FFFFFF;
  text-align: center;
  border-bottom: 1rpx solid #EBEBF0;
}

.mine-page .mine-profile-name {
  display: block;
  color: #1C1B2E;
  font-size: 40rpx;
  line-height: 50rpx;
  font-weight: 700;
}

.mine-page .mine-profile-partner {
  min-height: 34rpx;
  margin: 8rpx 0 30rpx;
  color: #8A8A9A;
  font-size: 26rpx;
  line-height: 34rpx;
}

.mine-page .mine-accent {
  color: #E8637A;
  font-weight: 700;
}

.mine-page .mine-stats {
  display: flex;
  align-items: stretch;
  width: 100%;
}

.mine-page .mine-stat {
  flex: 1;
  min-width: 0;
  text-align: center;
}

.mine-page .mine-stat + .mine-stat {
  border-left: 1rpx solid #EBEBF0;
}

.mine-page .mine-stat-num {
  display: block;
  color: #1C1B2E;
  font-size: 44rpx;
  line-height: 52rpx;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.mine-page .mine-stat-label {
  display: block;
  margin-top: 4rpx;
  color: #8A8A9A;
  font-size: 22rpx;
  line-height: 28rpx;
}

.mine-page .mine-section,
.mine-page .mine-menu {
  margin: 24rpx 32rpx;
  overflow: hidden;
  border-radius: 32rpx;
  background: #FFFFFF;
  box-shadow: 0 4rpx 18rpx rgba(28, 27, 46, 0.05);
}

.mine-page .mine-section {
  padding: 32rpx;
}

.mine-page .mine-section-title {
  display: block;
  margin-bottom: 24rpx;
  color: #8A8A9A;
  font-size: 26rpx;
  line-height: 34rpx;
  font-weight: 700;
}

.mine-page .mine-level-row {
  display: flex;
  align-items: center;
  gap: 18rpx;
  margin-bottom: 20rpx;
}

.mine-page .mine-level-badge {
  flex-shrink: 0;
  padding: 8rpx 24rpx;
  border-radius: 999rpx;
  color: #FFFFFF;
  background: linear-gradient(135deg, #E8637A, #9B8EC4);
  font-size: 24rpx;
  line-height: 30rpx;
  font-weight: 700;
}

.mine-page .mine-level-name {
  flex-shrink: 0;
  color: #1C1B2E;
  font-size: 30rpx;
  line-height: 38rpx;
  font-weight: 700;
}

.mine-page .mine-level-next {
  flex: 1;
  min-width: 0;
  color: #8A8A9A;
  font-size: 24rpx;
  line-height: 32rpx;
  text-align: right;
}

.mine-page .mine-progress {
  width: 100%;
  height: 16rpx;
  overflow: hidden;
  border-radius: 999rpx;
  background: #EBEBF0;
}

.mine-page .mine-progress-fill {
  height: 100%;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #E8637A, #9B8EC4);
}

.mine-page .mine-progress-labels {
  margin-top: 12rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  color: #8A8A9A;
  font-size: 22rpx;
  line-height: 28rpx;
}

.mine-page .mine-badges {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  row-gap: 28rpx;
  column-gap: 18rpx;
}

.mine-page .mine-badge {
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.mine-page .mine-badge-icon {
  position: relative;
  width: 104rpx;
  height: 104rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 28rpx;
  color: #1C1B2E;
  font-size: 46rpx;
  line-height: 1;
}

.mine-page .mine-badge-icon.unlocked {
  background: #FEF0F2;
  box-shadow: 0 4rpx 18rpx rgba(232, 99, 122, 0.16);
}

.mine-page .mine-badge-icon.secondary {
  background: #F3F0FA;
  box-shadow: 0 4rpx 18rpx rgba(155, 142, 196, 0.16);
}

.mine-page .mine-badge-icon.locked {
  background: #F7F5F3;
  filter: grayscale(1);
  opacity: 0.5;
}

.mine-page .mine-badge-check {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  width: 32rpx;
  height: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 4rpx solid #FFFFFF;
  background: #E8637A;
  color: #FFFFFF;
  font-size: 16rpx;
  line-height: 1;
  font-weight: 700;
}

.mine-page .mine-badge-check.secondary {
  background: #9B8EC4;
}

.mine-page .mine-badge-name {
  max-width: 100%;
  color: #1C1B2E;
  font-size: 22rpx;
  line-height: 30rpx;
  font-weight: 600;
  text-align: center;
}

.mine-page .mine-badge-name.locked {
  color: #8A8A9A;
}

.mine-page .mine-menu-secondary {
  opacity: 0.98;
}

.mine-page .mine-menu-item {
  min-height: 116rpx;
  padding: 0 32rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
  border-bottom: 1rpx solid #EBEBF0;
}

.mine-page .mine-menu-item:last-child {
  border-bottom: 0;
}

.mine-page .mine-menu-item:active {
  background: #F7F5F3;
}

.mine-page .mine-menu-icon {
  width: 64rpx;
  height: 64rpx;
  flex: 0 0 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18rpx;
  font-size: 30rpx;
  line-height: 1;
}

.mine-page .mine-menu-icon.rose { background: #FEF0F2; }
.mine-page .mine-menu-icon.lavender { background: #F3F0FA; }
.mine-page .mine-menu-icon.cream { background: #FFF7E6; }
.mine-page .mine-menu-icon.green { background: #F0FFF4; }
.mine-page .mine-menu-icon.blue { background: #F0F4FF; }
.mine-page .mine-menu-icon.neutral { background: #F7F5F3; }

.mine-page .mine-menu-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.mine-page .mine-menu-label {
  flex: 1;
  min-width: 0;
  color: #1C1B2E;
  font-size: 30rpx;
  line-height: 38rpx;
}

.mine-page .mine-menu-label.danger {
  color: #E8637A;
}

.mine-page .mine-menu-subtext {
  margin-top: 4rpx;
  color: #8A8A9A;
  font-size: 22rpx;
  line-height: 30rpx;
}

.mine-page .mine-menu-value {
  flex-shrink: 0;
  color: #8A8A9A;
  font-size: 26rpx;
  line-height: 34rpx;
}

.mine-page .mine-menu-arrow {
  flex-shrink: 0;
  color: #8A8A9A;
  font-size: 32rpx;
  line-height: 1;
}

.mine-page .mine-notify-item {
  min-height: 132rpx;
}

.mine-page .mine-version {
  padding: 24rpx 32rpx 40rpx;
  color: #8A8A9A;
  font-size: 24rpx;
  line-height: 32rpx;
  text-align: center;
}

.mine-page .mine-sheet-scroll {
  max-height: 58vh;
}

.mine-page .mine-edit-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32rpx;
}

.mine-page .mine-edit-avatar-frame {
  width: 160rpx;
  height: 160rpx;
  overflow: hidden;
  border-radius: 50%;
  margin-bottom: 16rpx;
  background: #F7F5F3;
}

.mine-page .mine-edit-avatar-tip {
  color: #8A8A9A;
  font-size: 24rpx;
  line-height: 32rpx;
}

.mine-page .mine-input {
  width: 100%;
  height: 88rpx;
  margin-bottom: 24rpx;
  padding: 0 24rpx;
  border: 2rpx solid #EBEBF0;
  border-radius: 20rpx;
  background: #F7F5F3;
  color: #1C1B2E;
  font-size: 28rpx;
}

.mine-page .mine-form-section {
  margin-bottom: 24rpx;
}

.mine-page .mine-form-label {
  display: block;
  margin-bottom: 16rpx;
  color: #1C1B2E;
  font-size: 28rpx;
  line-height: 36rpx;
}

.mine-page .mine-gender-options {
  display: flex;
  gap: 24rpx;
}

.mine-page .mine-gender-item {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
  background: #F7F5F3;
  color: #5B5A6D;
  font-size: 28rpx;
  line-height: 1;
}

.mine-page .mine-gender-item.active {
  background: #FEF0F2;
  color: #E8637A;
}

.mine-page .mine-date-wrapper {
  margin-bottom: 24rpx;
  padding: 0 24rpx;
  border: 2rpx solid #EBEBF0;
  border-radius: 20rpx;
  background: #F7F5F3;
}

.mine-page .mine-date-display {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mine-page .mine-date-label,
.mine-page .mine-date-value {
  font-size: 28rpx;
  line-height: 36rpx;
}

.mine-page .mine-date-label {
  color: #1C1B2E;
}

.mine-page .mine-date-value {
  color: #8A8A9A;
}

.mine-page .mine-save-btn {
  width: 100%;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 44rpx;
  background: #E8637A !important;
  color: #FFFFFF !important;
  font-size: 32rpx;
  line-height: 1;
}
</style>
