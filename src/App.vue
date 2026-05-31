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

/* Home page: global page-prefixed styles matching doc/UI/screens/00-home.html. */
.home-page,
.home-page * {
  box-sizing: border-box;
}

.home-page {
  min-height: 100vh;
  background: #F7F5F3;
  color: #1C1B2E;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", system-ui, sans-serif;
}

.home-page .home-scroll {
  height: 100vh;
  background: #F7F5F3;
  padding-bottom: 168rpx;
}

.home-page .home-top-spacer {
  width: 100%;
  flex-shrink: 0;
}

.home-page .couple-card {
  position: relative;
  overflow: hidden;
  margin: 0 32rpx;
  padding: 48rpx 40rpx 40rpx;
  border-radius: 48rpx;
  background: linear-gradient(135deg, #F48FA3 0%, #D987AA 50%, #B9A9DC 100%);
  box-shadow: 0 10rpx 26rpx rgba(155, 120, 160, 0.12);
}

.home-page .couple-card::before,
.home-page .couple-card::after {
  content: "";
  position: absolute;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.06);
}

.home-page .couple-card::before {
  top: -72rpx;
  right: -72rpx;
  width: 320rpx;
  height: 320rpx;
}

.home-page .couple-card::after {
  left: 40rpx;
  bottom: -50rpx;
  width: 200rpx;
  height: 200rpx;
  background: rgba(255, 255, 255, 0.035);
}

.home-page .couple-avatars {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32rpx;
}

.home-page .home-avatar {
  width: 128rpx;
  height: 128rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 50%;
  border: 6rpx solid rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.22);
  flex-shrink: 0;
}

.home-page .home-avatar-b {
  margin-left: -24rpx;
  background: rgba(185, 169, 220, 0.42);
}

.home-page .home-avatar.muted {
  opacity: 0.62;
  filter: grayscale(1);
}

.home-page .home-avatar-img {
  width: 100%;
  height: 100%;
  display: block;
  border-radius: 50%;
}

.home-page .heart-connector {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 2;
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: #FFFFFF;
  color: #D86C88;
  font-size: 30rpx;
  line-height: 1;
  box-shadow: 0 4rpx 16rpx rgba(28, 27, 46, 0.16);
}

.home-page .couple-names {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24rpx;
  color: #FFFFFF;
}

.home-page .names {
  color: #FFFFFF;
  font-size: 32rpx;
  line-height: 42rpx;
  font-weight: 700;
  text-align: center;
}

.home-page .since {
  margin-top: 4rpx;
  color: rgba(255, 255, 255, 0.78);
  font-size: 24rpx;
  line-height: 32rpx;
  text-align: center;
}

.home-page .couple-stats {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 16rpx;
}

.home-page .couple-stat {
  flex: 1;
  min-width: 0;
  padding: 20rpx 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(8px);
}

.home-page .couple-stat .val {
  color: #FFFFFF;
  font-size: 42rpx;
  line-height: 48rpx;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.home-page .couple-stat .lbl {
  margin-top: 4rpx;
  color: rgba(255, 255, 255, 0.76);
  font-size: 22rpx;
  line-height: 28rpx;
  text-align: center;
}

.home-page .intimacy-bar {
  margin: 28rpx 32rpx 0;
  padding: 28rpx 32rpx;
  border-radius: 32rpx;
  border: 1rpx solid #EBEBF0;
  background: #FFFFFF;
}

.home-page .intimacy-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.home-page .intimacy-title {
  color: #1C1B2E;
  font-size: 26rpx;
  line-height: 34rpx;
  font-weight: 700;
}

.home-page .intimacy-level {
  padding: 6rpx 20rpx;
  border-radius: 999rpx;
  background: #F3F0FA;
  color: #9B8EC4;
  font-size: 24rpx;
  line-height: 30rpx;
  font-weight: 700;
}

.home-page .bar-track {
  height: 16rpx;
  overflow: hidden;
  border-radius: 999rpx;
  background: #EBEBF0;
}

.home-page .bar-fill {
  height: 100%;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #9B8EC4 0%, #E8637A 100%);
  transition: width 0.35s ease;
}

.home-page .bar-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12rpx;
  color: #8A8A9A;
  font-size: 22rpx;
  line-height: 30rpx;
}

.home-page .section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 36rpx 32rpx 20rpx;
}

.home-page .section-title {
  color: #1C1B2E;
  font-size: 30rpx;
  line-height: 38rpx;
  font-weight: 800;
}

.home-page .section-more {
  color: #E8637A;
  font-size: 26rpx;
  line-height: 34rpx;
  font-weight: 600;
}

.home-page .today-events {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding: 0 32rpx;
}

.home-page .event-chip {
  min-height: 104rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 22rpx 28rpx;
  border-radius: 28rpx;
  border: 1rpx solid #EBEBF0;
  background: #FFFFFF;
}

.home-page .event-dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.home-page .event-dot.anniversary { background: #E8637A; }
.home-page .event-dot.task { background: #4A90D9; }
.home-page .event-dot.diary { background: #9B8EC4; }

.home-page .event-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.home-page .event-name {
  color: #1C1B2E;
  font-size: 26rpx;
  line-height: 34rpx;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.home-page .event-time {
  margin-top: 2rpx;
  color: #8A8A9A;
  font-size: 22rpx;
  line-height: 30rpx;
}

.home-page .event-tag {
  flex-shrink: 0;
  padding: 6rpx 16rpx;
  border-radius: 16rpx;
  font-size: 22rpx;
  line-height: 28rpx;
  font-weight: 700;
}

.home-page .event-tag.anniversary {
  background: #FEF0F2;
  color: #E8637A;
}

.home-page .event-tag.task {
  background: #EBF3FD;
  color: #4A90D9;
}

.home-page .event-tag.diary {
  background: #F3F0FA;
  color: #9B8EC4;
}

.home-page .empty-event .event-name {
  color: #5B5A6D;
}

.home-page .quick-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
  padding: 0 32rpx;
}

.home-page .quick-btn {
  min-height: 174rpx;
  padding: 24rpx 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 32rpx;
  border: 1rpx solid #EBEBF0;
  background: #FFFFFF;
}

.home-page .quick-btn:active {
  transform: scale(0.97);
}

.home-page .quick-icon {
  width: 88rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 28rpx;
  font-size: 42rpx;
  line-height: 1;
}

.home-page .quick-icon.cal { background: #EBF3FD; }
.home-page .quick-icon.diary { background: #F3F0FA; }
.home-page .quick-icon.wish { background: #FEF0F2; }
.home-page .quick-icon.save { background: #EDFAF3; }
.home-page .quick-icon.recipe { background: #FFF4E6; }
.home-page .quick-icon.gallery { background: #F0EDFF; }

.home-page .quick-label {
  margin-top: 14rpx;
  color: #1C1B2E;
  font-size: 24rpx;
  line-height: 30rpx;
  font-weight: 700;
  text-align: center;
}

.home-page .quick-sub {
  margin-top: 4rpx;
  color: #8A8A9A;
  font-size: 20rpx;
  line-height: 26rpx;
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.home-page .activity-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding: 0 32rpx;
}

.home-page .activity-item {
  display: flex;
  align-items: flex-start;
  gap: 24rpx;
  padding: 28rpx;
  border-radius: 32rpx;
  border: 1rpx solid #EBEBF0;
  background: #FFFFFF;
}

.home-page .activity-avatar {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
  background: linear-gradient(135deg, #E8637A 0%, #9B8EC4 100%);
  color: #FFFFFF;
  font-size: 28rpx;
  line-height: 1;
  font-weight: 800;
}

.home-page .activity-body {
  flex: 1;
  min-width: 0;
}

.home-page .activity-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  margin-bottom: 8rpx;
}

.home-page .activity-name {
  min-width: 0;
  color: #1C1B2E;
  font-size: 26rpx;
  line-height: 34rpx;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.home-page .activity-time {
  flex-shrink: 0;
  color: #8A8A9A;
  font-size: 22rpx;
  line-height: 30rpx;
}

.home-page .activity-text {
  display: block;
  color: #5B5A6D;
  font-size: 26rpx;
  line-height: 38rpx;
}

.home-page .activity-imgs {
  display: flex;
  gap: 12rpx;
  margin-top: 16rpx;
}

.home-page .activity-img {
  width: 120rpx;
  height: 120rpx;
  display: block;
  border-radius: 20rpx;
  background: #EBEBF0;
  flex-shrink: 0;
}

.home-page .activity-img div,
.home-page .activity-img img {
  width: 100%;
  height: 100%;
  border-radius: 20rpx;
}

.home-page .activity-empty .activity-avatar {
  background: #FEF0F2;
  color: #E8637A;
}

.home-page .scroll-end {
  height: 32rpx;
}
</style>
