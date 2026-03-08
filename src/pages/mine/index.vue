<template>
  <view class="mine-page">
    <!-- 用户信息卡 -->
    <view class="user-card">
      <image class="avatar" :src="userInfo?.avatar || '/static/default-avatar.png'" />
      <view class="user-info">
        <text class="nickname">{{ userInfo?.nickname || '未登录' }}</text>
        <text class="role">{{ userInfo?.role === 'A' ? '空间创建者' : '空间成员' }}</text>
      </view>
      <view class="edit-btn" @click="editProfile">编辑</view>
    </view>
    
    <!-- 数据统计 -->
    <view class="stats-card">
      <view class="stat-item">
        <text class="stat-num">{{ coupleInfo?.daysTogether || 0 }}</text>
        <text class="stat-label">在一起(天)</text>
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
    
    <!-- 功能菜单 -->
    <view class="menu-list">
      <view class="menu-item" @click="goTo('/pages/gallery/index')">
        <text class="menu-icon">🖼️</text>
        <text class="menu-text">图片库</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goTo('/pages/achieve/index')">
        <text class="menu-icon">🏆</text>
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
        <text class="menu-icon">🌸</text>
        <text class="menu-text">姨妈期助手</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>
    
    <!-- 系统菜单 -->
    <view class="menu-list">
      <view v-if="showInvite" class="menu-item" @click="invitePartner">
        <text class="menu-icon">💌</text>
        <text class="menu-text">邀请TA</text>
        <text class="menu-arrow">›</text>
      </view>
      <view v-if="showUnbind" class="menu-item" @click="unbindCouple">
        <text class="menu-icon">💔</text>
        <text class="menu-text">解除配对</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item">
        <text class="menu-icon">🔔</text>
        <text class="menu-text">消息通知</text>
        <switch :checked="enableNotification" @change="toggleNotification" color="#FF6B9D" />
      </view>
      <view class="menu-item" @click="showAbout">
        <text class="menu-icon">ℹ️</text>
        <text class="menu-text">关于我们</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>
    
    <!-- 退出登录 -->
    <view class="logout-section">
      <button class="btn-logout" @click="logout">退出登录</button>
    </view>
    
    <!-- 编辑资料弹窗 -->
    <view v-if="showEditModal" class="modal-mask" @click="closeEditModal">
      <view class="modal-content" @click.stop>
        <text class="modal-title">编辑资料</text>
        
        <!-- 头像 -->
        <view class="edit-avatar-section" @click="chooseAvatar">
          <image class="edit-avatar" :src="editForm.avatar || '/static/default-avatar.png'" />
          <text class="edit-avatar-tip">点击更换头像</text>
        </view>
        
        <!-- 昵称 -->
        <input v-model="editForm.nickname" class="input" placeholder="请输入昵称" />
        
        <!-- 性别 -->
        <view class="gender-section">
          <text class="section-label">性别</text>
          <view class="gender-options">
            <view 
              class="gender-item" 
              :class="{ active: editForm.gender === 1 }"
              @click="editForm.gender = 1"
            >👨 男</view>
            <view 
              class="gender-item" 
              :class="{ active: editForm.gender === 2 }"
              @click="editForm.gender = 2"
            >👩 女</view>
          </view>
        </view>
        
        <!-- 生日 -->
        <view class="date-picker-wrapper">
          <picker mode="date" :value="editForm.birthday" :end="today" @change="onBirthdayChange">
            <view class="date-picker-display">
              <text class="date-label">生日</text>
              <text class="date-value">{{ editForm.birthday || '选择生日' }}</text>
            </view>
          </picker>
        </view>
        
        <button class="btn-primary" @click="saveProfile">保存</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { userApi, uploadApi, diaryApi, wishApi, coupleApi, achievementApi } from '@/api'

// 获取今天日期
const today = new Date().toISOString().split('T')[0]

// ... 保持原有不变的变量和基础函数 ...

// 选择头像部分不变 ... 略过无关但需要保持原样
// 由于使用 ReplaceFileContent，需根据原范围完整提供

const userStore = useUserStore()

const userInfo = computed(() => userStore.userInfo)
const coupleInfo = computed(() => userStore.coupleInfo)

// 根据状态判断是否展示邀请按钮
const showInvite = computed(() => {
  if (!userInfo.value) return false
  // 1. 完全没有空间时，需要显示邀请
  if (!userInfo.value.coupleId) return true
  // 2. 有空间，但如果还没有伴侣信息，则仍然允许显示邀请（去查看邀请码）
  // 如果有了 partner，则绝对不显示邀请
  return !coupleInfo.value?.partner
})

// 根据状态判断是否展示解除配对按钮
const showUnbind = computed(() => {
  // 仅当身处空间 且 确认已有伴侣加入时，才展示解绑按钮
  return !!userInfo.value?.coupleId && !!coupleInfo.value?.partner
})

const enableNotification = ref(true)

const stats = ref({
  diaryCount: 0,
  wishCount: 0,
  achieveCount: 0
})

// 编辑弹窗
const showEditModal = ref(false)
const editForm = ref({
  nickname: '',
  avatar: '',
  gender: 0,
  birthday: ''
})

// tabBar 页面列表
const tabBarPages = [
  '/pages/index/index',
  '/pages/calendar/index',
  '/pages/diary/index',
  '/pages/wish/index',
  '/pages/mine/index'
]

// 页面跳转
const goTo = (url: string) => {
  if (!url) return
  const isTabBarPage = tabBarPages.some(page => url.startsWith(page))
  if (isTabBarPage) {
    uni.switchTab({ url })
  } else {
    uni.navigateTo({ url })
  }
}

// 编辑资料
const editProfile = () => {
  editForm.value = {
    nickname: userInfo.value?.nickname || '',
    avatar: userInfo.value?.avatar || '',
    gender: userInfo.value?.gender || 0,
    birthday: userInfo.value?.birthday || ''
  }
  showEditModal.value = true
}

// 关闭编辑弹窗
const closeEditModal = () => {
  showEditModal.value = false
}

// 选择头像
const chooseAvatar = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
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

// 生日选择变更
const onBirthdayChange = (e: any) => {
  editForm.value.birthday = e.detail.value
}

// 保存资料
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
    
    uni.showToast({ title: '保存成功', icon: 'success' })
    closeEditModal()
    // 刷新用户信息
    userStore.fetchUserInfo()
  } catch (e) {
    // 错误已在 request 封装中处理
  }
}

// 邀请伴侣
const invitePartner = () => {
  if (coupleInfo.value?.partner) {
    uni.showToast({ title: '已有伴侣', icon: 'none' })
    return
  }
  uni.navigateTo({ url: '/pages/couple/index' })
}

// 解除配对
const unbindCouple = () => {
  uni.showModal({
    title: '残酷确认',
    content: '解除配对后，对方信息将从您的空间中抹除，且不再共享新的记录。您确定要这么做吗？',
    confirmColor: '#FF4757',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '解绑中...' })
          await coupleApi.unbind()
          uni.hideLoading()
          uni.showToast({ title: '已成功解除配对', icon: 'success' })
          userStore.fetchUserInfo()
        } catch (e) {
          uni.hideLoading()
        }
      }
    }
  })
}

// 切换通知
const toggleNotification = () => {
  enableNotification.value = !enableNotification.value
}

// 关于我们
const showAbout = () => {
  uni.showModal({
    title: '心迹·情侣时光',
    content: '版本 1.0.0\n\n专为情侣设计的私密协作小程序\n记录爱情，共享时光',
    showCancel: false
  })
}

// 退出登录
const logout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
      }
    }
  })
}

// 加载统计数据
const loadStats = async () => {
  try {
    // 获取日记列表来统计数量
    const diaryData = await diaryApi.getList(1, 1000)
    console.log(diaryData)
    stats.value.diaryCount = diaryData?.total || diaryData?.list?.length || 0
    
    // 获取心愿列表来统计数量
    const wishData = await wishApi.getList()
    stats.value.wishCount = wishData?.length || 0
    
    // 获取已解锁成就数量
    const achieveData = await achievementApi.getUnlocked()
    stats.value.achieveCount = achieveData?.length || 0
  } catch (e) {
    console.error('加载统计数据失败', e)
  }
}

onMounted(() => {
  userStore.fetchUserInfo()
  loadStats()
})
</script>

<style scoped>
.mine-page {
  min-height: 100vh;
  background: #F5F5F5;
  padding-bottom: 120rpx;
}

.user-card {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #FF6B9D 0%, #FF8E9E 100%);
  padding: 60rpx 40rpx;
  padding-top: 120rpx;
  padding-bottom: 80rpx;
  border-bottom-left-radius: 48rpx;
  border-bottom-right-radius: 48rpx;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.5);
}

.user-info {
  flex: 1;
  margin-left: 24rpx;
}

.nickname {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: #fff;
  margin-bottom: 8rpx;
}

.role {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.edit-btn {
  padding: 12rpx 24rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 24rpx;
  font-size: 24rpx;
  color: #fff;
}

.stats-card {
  display: flex;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  margin: -60rpx 32rpx 32rpx;
  border-radius: 32rpx;
  padding: 36rpx 24rpx;
  box-shadow: 0 16rpx 48rpx rgba(255, 107, 157, 0.15);
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
  background: #F0F0F0;
}

.stat-num {
  display: block;
  font-size: 44rpx;
  font-weight: 700;
  color: #333;
  margin-bottom: 12rpx;
  font-family: monospace;
}

.stat-label {
  font-size: 24rpx;
  color: #888;
  font-weight: 500;
}

.menu-list {
  background: #fff;
  margin: 0 32rpx 32rpx;
  border-radius: 32rpx;
  overflow: hidden;
  box-shadow: 0 16rpx 48rpx rgba(255, 107, 157, 0.05);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 36rpx 32rpx;
  border-bottom: 1rpx dashed #F0F0F0;
  transition: background-color 0.2s ease;
}

.menu-item:active {
  background-color: #FFF5F7;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  font-size: 36rpx;
  margin-right: 20rpx;
}

.menu-text {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.menu-arrow {
  font-size: 32rpx;
  color: #CCC;
}

.logout-section {
  padding: 48rpx 24rpx;
}

.btn-logout {
  width: 100%;
  height: 88rpx;
  background: #fff;
  border: 2rpx solid #FF6B9D;
  border-radius: 44rpx;
  color: #FF6B9D;
  font-size: 30rpx;
}

/* 弹窗样式 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99;
}

.modal-content {
  width: 85%;
  max-width: 85%;
  background: #fff;
  border-radius: 24rpx;
  padding: 48rpx;
  box-sizing: border-box;
}

.modal-title {
  display: block;
  font-size: 34rpx;
  font-weight: 600;
  text-align: center;
  margin-bottom: 32rpx;
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
  color: #999;
}

.input {
  width: 100%;
  height: 88rpx;
  background: #F8F8F8;
  border-radius: 16rpx;
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
  color: #333;
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
  background: #F8F8F8;
  border-radius: 16rpx;
  font-size: 28rpx;
  color: #666;
}

.gender-item.active {
  background: #FFE4EC;
  color: #FF6B9D;
}

.date-picker-wrapper {
  background: #F8F8F8;
  border-radius: 16rpx;
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
  color: #333;
}

.date-value {
  font-size: 28rpx;
  color: #999;
}

.btn-primary {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(135deg, #FF6B9D 0%, #FF8E9E 100%);
  border-radius: 44rpx;
  color: #fff;
  font-size: 32rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
