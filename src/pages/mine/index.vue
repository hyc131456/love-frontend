<template>
  <view class="mine-page">
    <view class="user-card">
      <view class="profile-title">我的</view>
      <image class="avatar" :src="userInfo?.avatar || '/static/default-avatar.svg'" />
      <view class="user-info">
        <text class="nickname">{{ userInfo?.nickname || '未登录' }}</text>
        <text class="role">{{ userInfo?.role === 'A' ? '空间创建者' : '空间成员' }}</text>
      </view>
      <view class="edit-btn" @click="editProfile">编辑</view>
    </view>

    <view class="stats-card">
      <view class="stat-item">
        <text class="stat-num">{{ coupleInfo?.daysTogether || 0 }}</text>
        <text class="stat-label">在一起天数</text>
      </view>
      <view class="stat-item" @click="goTo('/pages/diary/index')">
        <text class="stat-num">{{ stats.diaryCount }}</text>
        <text class="stat-label">日记</text>
      </view>
      <view class="stat-item" @click="goTo('/pages/wish/index')">
        <text class="stat-num">{{ stats.wishCount }}</text>
        <text class="stat-label">心愿</text>
      </view>
      <view class="stat-item" @click="goTo('/pages/achieve/index')">
        <text class="stat-num">{{ stats.achieveCount }}</text>
        <text class="stat-label">成就</text>
      </view>
    </view>

    <view class="menu-list">
      <view class="menu-item" @click="goTo('/pages/anniversary/index')">
        <text class="menu-icon">💖</text>
        <text class="menu-text">纪念日</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goTo('/pages/gallery/index')">
        <text class="menu-icon">🖼️</text>
        <text class="menu-text">图片库</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goTo('/pages/achieve/index')">
        <text class="menu-icon">🏅</text>
        <text class="menu-text">成就墙</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goTo('/pages/recipe/index')">
        <text class="menu-icon">🍳</text>
        <text class="menu-text">家庭菜谱</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goTo('/pages/saving/index')">
        <text class="menu-icon">💰</text>
        <text class="menu-text">共同储蓄</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goTo('/pages/period/index')">
        <text class="menu-icon">🌙</text>
        <text class="menu-text">姨妈期助手</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <view class="menu-list">
      <view v-if="showInvite" class="menu-item" @click="invitePartner">
        <text class="menu-icon">🤝</text>
        <text class="menu-text">邀请 TA</text>
        <text class="menu-arrow">›</text>
      </view>
      <view v-if="showUnbind" class="menu-item" @click="unbindCouple">
        <text class="menu-icon">💔</text>
        <text class="menu-text">解除配对</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item">
        <text class="menu-icon">🔔</text>
        <view class="menu-content">
          <text class="menu-text">消息通知</text>
          <text class="menu-subtext">控制首页纪念日提醒卡片显示</text>
        </view>
        <switch :checked="enableNotification" color="#E8637A" @change="toggleNotification" />
      </view>
      <view class="menu-item" @click="showAbout">
        <text class="menu-icon">ℹ️</text>
        <text class="menu-text">关于我们</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <view class="logout-section">
      <button class="btn-logout" @click="logout">退出登录</button>
    </view>

    <AppSheet :open="showEditModal" title="编辑资料" @close="closeEditModal">
      <scroll-view scroll-y class="sheet-scroll">

        <view class="edit-avatar-section" @click="chooseAvatar">
          <image class="edit-avatar" :src="editForm.avatar || '/static/default-avatar.svg'" />
          <text class="edit-avatar-tip">点击更换头像</text>
        </view>

        <input v-model="editForm.nickname" class="input" placeholder="请输入昵称" />

        <view class="gender-section">
          <text class="section-label">性别</text>
          <view class="gender-options">
            <view class="gender-item" :class="{ active: editForm.gender === 1 }" @click="editForm.gender = 1">
              👦 男
            </view>
            <view class="gender-item" :class="{ active: editForm.gender === 2 }" @click="editForm.gender = 2">
              👧 女
            </view>
          </view>
        </view>

        <view class="date-picker-wrapper">
          <picker mode="date" :value="editForm.birthday" :end="today" @change="onBirthdayChange">
            <view class="date-picker-display">
              <text class="date-label">生日</text>
              <text class="date-value">{{ editForm.birthday || '选择生日' }}</text>
            </view>
          </picker>
        </view>

      </scroll-view>
      <button class="btn-primary" @click="saveProfile">保存</button>
    </AppSheet>

    <AppTabBar current="/pages/mine/index" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { achievementApi, coupleApi, diaryApi, uploadApi, userApi, wishApi } from '@/api'
import { useUserStore } from '@/stores/user'
import AppSheet from '@/components/AppSheet.vue'
import AppTabBar from '@/components/AppTabBar.vue'

const today = new Date().toISOString().split('T')[0]
const userStore = useUserStore()

const userInfo = computed(() => userStore.userInfo)
const coupleInfo = computed(() => userStore.coupleInfo)

const showInvite = computed(() => {
  if (!userInfo.value) return false
  if (!userInfo.value.coupleId) return true
  return !coupleInfo.value?.partner
})

const showUnbind = computed(() => !!userInfo.value?.coupleId && !!coupleInfo.value?.partner)
const enableNotification = ref(true)

const stats = ref({
  diaryCount: 0,
  wishCount: 0,
  achieveCount: 0
})

const showEditModal = ref(false)
const editForm = ref({
  nickname: '',
  avatar: '',
  gender: 0,
  birthday: ''
})

watch(
  () => userInfo.value?.enableNotification,
  value => {
    enableNotification.value = value !== 0
  },
  { immediate: true }
)

const tabBarPages = [
  '/pages/index/index',
  '/pages/calendar/index',
  '/pages/diary/index',
  '/pages/wish/index',
  '/pages/mine/index'
]

const goTo = (url: string) => {
  if (!url) return
  const isTabBarPage = tabBarPages.some(page => url.startsWith(page))
  if (isTabBarPage) {
    uni.switchTab({ url })
  } else {
    uni.navigateTo({ url })
  }
}

const editProfile = () => {
  editForm.value = {
    nickname: userInfo.value?.nickname || '',
    avatar: userInfo.value?.avatar || '',
    gender: userInfo.value?.gender || 0,
    birthday: userInfo.value?.birthday || ''
  }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
}

const chooseAvatar = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async res => {
      const tempFilePath = res.tempFilePaths[0]
      try {
        uni.showLoading({ title: '上传中...' })
        const result = await uploadApi.uploadImage(tempFilePath)
        editForm.value.avatar = result.url
        uni.hideLoading()
        uni.showToast({ title: '上传成功', icon: 'success' })
      } catch (e) {
        uni.hideLoading()
        uni.showToast({ title: '上传失败', icon: 'none' })
      }
    }
  })
}

const onBirthdayChange = (e: any) => {
  editForm.value.birthday = e.detail.value
}

const saveProfile = async () => {
  if (!editForm.value.nickname.trim()) {
    uni.showToast({ title: '请输入昵称', icon: 'none' })
    return
  }

  try {
    await userApi.updateProfile({
      nickname: editForm.value.nickname,
      avatar: editForm.value.avatar || null,
      gender: editForm.value.gender || null,
      birthday: editForm.value.birthday || null
    })
    await userStore.fetchUserInfo()
    uni.showToast({ title: '保存成功', icon: 'success' })
    closeEditModal()
  } catch (e) {
    console.error('保存资料失败', e)
  }
}

const invitePartner = () => {
  if (coupleInfo.value?.partner) {
    uni.showToast({ title: '已经有伴侣啦', icon: 'none' })
    return
  }
  uni.navigateTo({ url: '/pages/couple/index' })
}

const unbindCouple = () => {
  uni.showModal({
    title: '确认解除配对',
    content: '解除后将停止共享新的记录，确认继续吗？',
    confirmColor: '#FF4757',
    success: async res => {
      if (!res.confirm) return
      try {
        uni.showLoading({ title: '解绑中...' })
        await coupleApi.unbind()
        uni.hideLoading()
        await userStore.fetchUserInfo()
        await loadStats()
        uni.showToast({ title: '已解除配对', icon: 'success' })
      } catch (e) {
        uni.hideLoading()
        console.error('解除配对失败', e)
      }
    }
  })
}

const toggleNotification = async (e: any) => {
  const nextValue = !!e.detail.value
  try {
    await userApi.updateProfile({ enableNotification: nextValue ? 1 : 0 })
    enableNotification.value = nextValue
    await userStore.fetchUserInfo()
    uni.showToast({ title: nextValue ? '已开启提醒' : '已关闭提醒', icon: 'none' })
  } catch (error) {
    enableNotification.value = !nextValue
    console.error('更新通知开关失败', error)
  }
}

const showAbout = () => {
  uni.showModal({
    title: '心迹·情侣时光',
    content: '版本 1.0.0\n\n专为情侣设计的私密协作小程序，记录爱情，分享时光。',
    showCancel: false
  })
}

const logout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: res => {
      if (res.confirm) {
        userStore.logout()
      }
    }
  })
}

const resetStats = () => {
  stats.value = {
    diaryCount: 0,
    wishCount: 0,
    achieveCount: 0
  }
}

const loadStats = async () => {
  if (!userStore.userInfo?.coupleId) {
    resetStats()
    return
  }

  try {
    const diaryData = await diaryApi.getList(1, 1000)
    stats.value.diaryCount = diaryData?.total || diaryData?.list?.length || 0

    const wishData = await wishApi.getList()
    stats.value.wishCount = wishData?.length || 0

    const achieveData = await achievementApi.getUnlocked()
    stats.value.achieveCount = achieveData?.length || 0
  } catch (e) {
    console.error('加载统计数据失败', e)
  }
}

const refreshPage = async () => {
  uni.hideTabBar()
  await userStore.fetchUserInfo()
  await loadStats()
}

onShow(refreshPage)
</script>

<style scoped>
.mine-page {
  min-height: 100vh;
  background: #F7F5F3;
  padding-bottom: 164rpx;
}

.user-card {
  position: relative;
  display: flex;
  align-items: center;
  background: linear-gradient(160deg, #FDE8EC 0%, #F3EEFF 58%, #E8F4FF 100%);
  padding: 60rpx 40rpx 80rpx;
  padding-top: 120rpx;
  border-bottom-left-radius: 40rpx;
  border-bottom-right-radius: 40rpx;
}

.profile-title {
  position: absolute;
  left: 0;
  right: 0;
  top: 54rpx;
  text-align: center;
  font-size: 34rpx;
  line-height: 44rpx;
  font-weight: 600;
  color: #1C1B2E;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 6rpx solid #FFFFFF;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 8rpx 24rpx rgba(28, 27, 46, 0.12);
}

.user-info {
  flex: 1;
  margin-left: 24rpx;
}

.nickname {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: #1C1B2E;
  margin-bottom: 8rpx;
}

.role {
  font-size: 24rpx;
  color: #5B5A6D;
}

.edit-btn {
  padding: 12rpx 24rpx;
  background: rgba(255, 255, 255, 0.82);
  border: 1rpx solid rgba(232, 99, 122, 0.14);
  border-radius: 24rpx;
  font-size: 24rpx;
  color: #E8637A;
}

.stats-card {
  display: flex;
  background: #FFFFFF;
  margin: -60rpx 32rpx 32rpx;
  border-radius: 32rpx;
  padding: 36rpx 24rpx;
  border: 1rpx solid #EBEBF0;
  box-shadow: 0 8rpx 28rpx rgba(28, 27, 46, 0.08);
  position: relative;
  z-index: 10;
}

.stat-item {
  flex: 1;
  text-align: center;
  position: relative;
}

.stat-item:not(:last-child)::after {
  content: '';
  position: absolute;
  right: 0;
  top: 20%;
  height: 60%;
  width: 2rpx;
  background: #f0f0f0;
}

.stat-num {
  display: block;
  font-size: 44rpx;
  font-weight: 700;
  color: #1C1B2E;
  margin-bottom: 12rpx;
  font-family: monospace;
}

.stat-label {
  font-size: 24rpx;
  color: #8A8A9A;
  font-weight: 500;
}

.menu-list {
  background: #fff;
  margin: 0 32rpx 32rpx;
  border-radius: 32rpx;
  overflow: hidden;
  border: 1rpx solid #EBEBF0;
  box-shadow: 0 4rpx 16rpx rgba(28, 27, 46, 0.05);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 34rpx 32rpx;
  border-bottom: 1rpx dashed #f0f0f0;
}

.menu-item:active {
  background-color: #FEF0F2;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  font-size: 36rpx;
  margin-right: 20rpx;
}

.menu-content {
  flex: 1;
}

.menu-text {
  flex: 1;
  font-size: 28rpx;
  color: #1C1B2E;
}

.menu-subtext {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #8A8A9A;
}

.menu-arrow {
  font-size: 32rpx;
  color: #ccc;
}

.logout-section {
  padding: 48rpx 24rpx;
}

.btn-logout {
  width: 100%;
  height: 88rpx;
  background: #fff;
  border: 2rpx solid #E8637A;
  border-radius: 44rpx;
  color: #E8637A;
  font-size: 30rpx;
}

.sheet-scroll {
  max-height: 58vh;
}

.edit-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32rpx;
}

.edit-avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  margin-bottom: 16rpx;
}

.edit-avatar-tip {
  font-size: 24rpx;
  color: #8A8A9A;
}

.input {
  width: 100%;
  height: 88rpx;
  background: #F7F5F3;
  border: 2rpx solid #EBEBF0;
  border-radius: 20rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  margin-bottom: 24rpx;
  box-sizing: border-box;
}

.gender-section {
  margin-bottom: 24rpx;
}

.section-label {
  display: block;
  font-size: 28rpx;
  color: #1C1B2E;
  margin-bottom: 16rpx;
}

.gender-options {
  display: flex;
  gap: 24rpx;
}

.gender-item {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F7F5F3;
  border-radius: 16rpx;
  font-size: 28rpx;
  color: #5B5A6D;
}

.gender-item.active {
  background: #FEF0F2;
  color: #E8637A;
}

.date-picker-wrapper {
  background: #F7F5F3;
  border: 2rpx solid #EBEBF0;
  border-radius: 20rpx;
  padding: 0 24rpx;
  margin-bottom: 24rpx;
}

.date-picker-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
}

.date-label {
  font-size: 28rpx;
  color: #1C1B2E;
}

.date-value {
  font-size: 28rpx;
  color: #8A8A9A;
}

.btn-primary {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: #E8637A;
  border-radius: 44rpx;
  color: #fff;
  font-size: 32rpx;
  border: none;
}
</style>
