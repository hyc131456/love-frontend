<template>
  <view class="mine-page">
    <scroll-view scroll-y class="mine-scroll">
      <view class="mine-cover">
        <view class="mine-cover-nav" :style="{ paddingTop: `${statusBarHeight}px` }">
          <view class="mine-nav-spacer"></view>
          <text class="mine-nav-title">我的</text>
          <view class="mine-nav-action" @click="editProfile">⚙</view>
        </view>

        <text class="mine-heart">💕</text>
        <view class="mine-avatar-pair" @click="editProfile">
          <view class="mine-avatar-frame mine-avatar-a">
            <image class="mine-avatar-img" :src="userInfo?.avatar || '/static/default-avatar.svg'" mode="aspectFill" />
          </view>
          <view class="mine-avatar-frame mine-avatar-b">
            <image class="mine-avatar-img" :src="partnerAvatar" mode="aspectFill" />
          </view>
        </view>
      </view>

      <view class="mine-profile">
        <text class="mine-profile-name">{{ userInfo?.nickname || '未登录' }}</text>
        <view class="mine-profile-partner">
          <template v-if="userInfo?.coupleId">
            <text>与 </text>
            <text class="mine-accent">{{ partnerName }}</text>
            <text> 在一起</text>
          </template>
          <text v-else>还没有绑定另一半</text>
        </view>

        <view class="mine-stats">
          <view class="mine-stat">
            <text class="mine-stat-num">{{ coupleInfo?.daysTogether || 0 }}</text>
            <text class="mine-stat-label">在一起天数</text>
          </view>
          <view class="mine-stat" @click="goTo('/pages/diary/index')">
            <text class="mine-stat-num">{{ stats.diaryCount }}</text>
            <text class="mine-stat-label">日记篇数</text>
          </view>
          <view class="mine-stat" @click="goTo('/pages/wish/index')">
            <text class="mine-stat-num">{{ stats.wishCount }}</text>
            <text class="mine-stat-label">心愿数量</text>
          </view>
          <view class="mine-stat" @click="goTo('/pages/achieve/index')">
            <text class="mine-stat-num">{{ stats.achieveCount }}</text>
            <text class="mine-stat-label">成就徽章</text>
          </view>
        </view>
      </view>

      <view class="mine-section">
        <text class="mine-section-title">亲密等级</text>
        <view class="mine-level-row">
          <text class="mine-level-badge">Lv.{{ currentLevel.level }}</text>
          <text class="mine-level-name">{{ currentLevel.name }}</text>
          <text class="mine-level-next" v-if="nextLevelInfo">距{{ nextLevelInfo.name }} {{ nextLevelInfo.gap }} 分</text>
          <text class="mine-level-next" v-else>已达最高等级</text>
        </view>
        <view class="mine-progress">
          <view class="mine-progress-fill" :style="{ width: `${levelProgress}%` }"></view>
        </view>
        <view class="mine-progress-labels">
          <text>{{ currentLevel.name }} {{ currentLevel.min }}</text>
          <text>{{ intimacyScore }} / {{ currentLevel.maxLabel }}</text>
          <text>{{ nextLevelInfo ? `${nextLevelInfo.name} ${nextLevelInfo.min}+` : '满级' }}</text>
        </view>
      </view>

      <view class="mine-section" @click="goTo('/pages/achieve/index')">
        <text class="mine-section-title">成就徽章</text>
        <view class="mine-badges">
          <view v-for="badge in displayBadges" :key="badge.key" class="mine-badge">
            <view class="mine-badge-icon" :class="{ unlocked: badge.unlocked, locked: !badge.unlocked, secondary: badge.secondary }">
              <text>{{ badge.icon }}</text>
              <text v-if="badge.unlocked" class="mine-badge-check" :class="{ secondary: badge.secondary }">✓</text>
            </view>
            <text class="mine-badge-name" :class="{ locked: !badge.unlocked }">{{ badge.name }}</text>
          </view>
        </view>
      </view>

      <view class="mine-menu">
        <view class="mine-menu-item" @click="goTo('/pages/anniversary/index')">
          <text class="mine-menu-icon rose">📅</text>
          <text class="mine-menu-label">纪念日管理</text>
          <text class="mine-menu-value">{{ stats.anniversaryCount }} 个</text>
          <text class="mine-menu-arrow">›</text>
        </view>
        <view class="mine-menu-item" @click="goTo('/pages/gallery/index')">
          <text class="mine-menu-icon lavender">🖼</text>
          <text class="mine-menu-label">图片库</text>
          <text class="mine-menu-value">{{ stats.galleryCount }} 张</text>
          <text class="mine-menu-arrow">›</text>
        </view>
        <view class="mine-menu-item" @click="goTo('/pages/period/index')">
          <text class="mine-menu-icon cream">🌸</text>
          <text class="mine-menu-label">姨妈期追踪</text>
          <text class="mine-menu-value">{{ stats.periodEnabled ? '已开启' : '未开启' }}</text>
          <text class="mine-menu-arrow">›</text>
        </view>
      </view>

      <view class="mine-menu">
        <view class="mine-menu-item mine-notify-item">
          <text class="mine-menu-icon green">🔔</text>
          <view class="mine-menu-main">
            <text class="mine-menu-label">消息通知</text>
            <text class="mine-menu-subtext">控制首页纪念日提醒卡片显示</text>
          </view>
          <switch :checked="enableNotification" color="#E8637A" @change="toggleNotification" />
        </view>
        <view class="mine-menu-item" @click="showPrivacySettings">
          <text class="mine-menu-icon blue">🔒</text>
          <text class="mine-menu-label">隐私设置</text>
          <text class="mine-menu-arrow">›</text>
        </view>
        <view class="mine-menu-item" @click="showFeedback">
          <text class="mine-menu-icon neutral">💬</text>
          <text class="mine-menu-label">意见反馈</text>
          <text class="mine-menu-arrow">›</text>
        </view>
      </view>

      <view class="mine-menu mine-menu-secondary">
        <view class="mine-menu-item" @click="goTo('/pages/recipe/index')">
          <text class="mine-menu-icon cream">🍳</text>
          <text class="mine-menu-label">家庭菜谱</text>
          <text class="mine-menu-arrow">›</text>
        </view>
        <view class="mine-menu-item" @click="goTo('/pages/saving/index')">
          <text class="mine-menu-icon green">💰</text>
          <text class="mine-menu-label">共同储蓄</text>
          <text class="mine-menu-arrow">›</text>
        </view>
        <view class="mine-menu-item" @click="goTo('/pages/achieve/index')">
          <text class="mine-menu-icon lavender">🏅</text>
          <text class="mine-menu-label">成就墙</text>
          <text class="mine-menu-value">{{ stats.achieveCount }} 枚</text>
          <text class="mine-menu-arrow">›</text>
        </view>
        <view v-if="showInvite" class="mine-menu-item" @click="invitePartner">
          <text class="mine-menu-icon blue">🤝</text>
          <text class="mine-menu-label">邀请 TA</text>
          <text class="mine-menu-arrow">›</text>
        </view>
        <view v-if="showUnbind" class="mine-menu-item" @click="unbindCouple">
          <text class="mine-menu-icon rose">💔</text>
          <text class="mine-menu-label danger">解除配对</text>
          <text class="mine-menu-arrow">›</text>
        </view>
        <view class="mine-menu-item" @click="logout">
          <text class="mine-menu-icon neutral">↩</text>
          <text class="mine-menu-label danger">退出登录</text>
          <text class="mine-menu-arrow">›</text>
        </view>
      </view>

      <view class="mine-version">心迹 · 情侣时光 v1.0.0</view>
    </scroll-view>

    <AppSheet :open="showEditModal" title="编辑资料" @close="closeEditModal">
      <scroll-view scroll-y class="mine-sheet-scroll">
        <view class="mine-edit-avatar" @click="chooseAvatar">
          <view class="mine-edit-avatar-frame">
            <image class="mine-avatar-img" :src="editForm.avatar || '/static/default-avatar.svg'" mode="aspectFill" />
          </view>
          <text class="mine-edit-avatar-tip">点击更换头像</text>
        </view>

        <input v-model="editForm.nickname" class="mine-input" placeholder="请输入昵称" />

        <view class="mine-form-section">
          <text class="mine-form-label">性别</text>
          <view class="mine-gender-options">
            <view class="mine-gender-item" :class="{ active: editForm.gender === 1 }" @click="editForm.gender = 1">👦 男</view>
            <view class="mine-gender-item" :class="{ active: editForm.gender === 2 }" @click="editForm.gender = 2">👧 女</view>
          </view>
        </view>

        <view class="mine-date-wrapper">
          <picker mode="date" :value="editForm.birthday" :end="today" @change="onBirthdayChange">
            <view class="mine-date-display">
              <text class="mine-date-label">生日</text>
              <text class="mine-date-value">{{ editForm.birthday || '选择生日' }}</text>
            </view>
          </picker>
        </view>
      </scroll-view>
      <button class="mine-save-btn" @click="saveProfile">保存</button>
    </AppSheet>

    <AppTabBar current="/pages/mine/index" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import {
  achievementApi,
  calendarApi,
  coupleApi,
  diaryApi,
  galleryApi,
  periodApi,
  uploadApi,
  userApi,
  wishApi
} from '@/api'
import { useUserStore } from '@/stores/user'
import { achievementDefinitions } from '@/constants/achievements'
import AppSheet from '@/components/AppSheet.vue'
import AppTabBar from '@/components/AppTabBar.vue'

const today = new Date().toISOString().split('T')[0]
const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 0)
const userStore = useUserStore()

const userInfo = computed(() => userStore.userInfo)
const coupleInfo = computed(() => userStore.coupleInfo)
const partnerName = computed(() => coupleInfo.value?.partner?.nickname || 'TA')
const partnerAvatar = computed(() => coupleInfo.value?.partner?.avatar || '/static/default-avatar.svg')

const levels = [
  { level: 1, name: '热恋期', min: 0, max: 100, maxLabel: 100 },
  { level: 2, name: '稳定期', min: 101, max: 300, maxLabel: 300 },
  { level: 3, name: '老夫老妻', min: 301, max: 500, maxLabel: 500 },
  { level: 4, name: '灵魂伴侣', min: 501, max: 9999, maxLabel: '∞' }
]

const fallbackBadges = achievementDefinitions.slice(0, 6).map((badge, index) => ({
  key: badge.badgeId,
  icon: badge.icon,
  name: badge.badgeName,
  unlocked: false,
  secondary: index % 2 === 1
}))

const showInvite = computed(() => {
  if (!userInfo.value) return false
  if (!userInfo.value.coupleId) return true
  return !coupleInfo.value?.partner
})

const showUnbind = computed(() => !!userInfo.value?.coupleId && !!coupleInfo.value?.partner)
const enableNotification = ref(true)
const allBadges = ref<any[]>([])

const stats = ref({
  diaryCount: 0,
  wishCount: 0,
  achieveCount: 0,
  anniversaryCount: 0,
  galleryCount: 0,
  periodEnabled: false
})

const showEditModal = ref(false)
const editForm = ref({
  nickname: '',
  avatar: '',
  gender: 0,
  birthday: ''
})

const intimacyScore = computed(() => {
  const info: any = coupleInfo.value || {}
  return Number(info.intimacyScore ?? info.intimacyProgress ?? 0)
})

const currentLevel = computed(() => {
  for (let i = levels.length - 1; i >= 0; i--) {
    if (intimacyScore.value >= levels[i].min) return levels[i]
  }
  return levels[0]
})

const levelProgress = computed(() => {
  const level = currentLevel.value
  if (level.level === 4) return 100
  const range = level.max - level.min
  const current = Math.max(0, intimacyScore.value - level.min)
  return Math.min(100, Math.round((current / range) * 100))
})

const nextLevelInfo = computed(() => {
  const index = levels.findIndex(item => item.level === currentLevel.value.level)
  if (index < 0 || index >= levels.length - 1) return null
  const next = levels[index + 1]
  return {
    name: next.name,
    min: next.min,
    gap: Math.max(0, next.min - intimacyScore.value)
  }
})

const displayBadges = computed(() => {
  const mapped = allBadges.value.slice(0, 6).map((badge, index) => ({
    key: badge.badgeId || badge.id || `badge-${index}`,
    icon: badge.icon || fallbackBadges[index]?.icon || '🏅',
    name: badge.badgeName || badge.name || fallbackBadges[index]?.name || '成就徽章',
    unlocked: !!badge.unlocked,
    secondary: index % 2 === 1
  }))
  return [...mapped, ...fallbackBadges.slice(mapped.length)].slice(0, 6)
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

const showPrivacySettings = () => {
  if (!showUnbind.value) {
    uni.showToast({ title: '暂无可调整的隐私设置', icon: 'none' })
    return
  }
  uni.showActionSheet({
    itemList: ['解除配对'],
    success: res => {
      if (res.tapIndex === 0) unbindCouple()
    }
  })
}

const showFeedback = () => {
  uni.showModal({
    title: '意见反馈',
    content: '谢谢你愿意帮我们把心迹变得更好，反馈入口正在准备中。',
    showCancel: false
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
    achieveCount: 0,
    anniversaryCount: 0,
    galleryCount: 0,
    periodEnabled: false
  }
  allBadges.value = []
}

const loadStats = async () => {
  if (!userStore.userInfo?.coupleId) {
    resetStats()
    return
  }

  const safeLoad = async (task: () => Promise<void>, label: string) => {
    try {
      await task()
    } catch (e) {
      console.error(`${label}失败`, e)
    }
  }

  await Promise.all([
    safeLoad(async () => {
      const diaryData = await diaryApi.getList(1, 1000)
      stats.value.diaryCount = diaryData?.total || diaryData?.list?.length || 0
    }, '加载日记统计'),
    safeLoad(async () => {
      const wishData = await wishApi.getList()
      stats.value.wishCount = wishData?.length || 0
    }, '加载心愿统计'),
    safeLoad(async () => {
      const badges = await achievementApi.getAll()
      allBadges.value = badges || []
      stats.value.achieveCount = allBadges.value.filter(badge => badge.unlocked).length
    }, '加载成就统计'),
    safeLoad(async () => {
      const anniversaries = await calendarApi.getAnniversaries()
      stats.value.anniversaryCount = Array.isArray(anniversaries) ? anniversaries.length : 0
    }, '加载纪念日统计'),
    safeLoad(async () => {
      const galleryData = await galleryApi.getList(1, 1000)
      stats.value.galleryCount = galleryData?.total || galleryData?.list?.length || 0
    }, '加载图库统计'),
    safeLoad(async () => {
      const periods = await periodApi.getList()
      stats.value.periodEnabled = Array.isArray(periods) && periods.length > 0
    }, '加载经期状态')
  ])
}

const refreshPage = async () => {
  uni.hideTabBar()
  await userStore.fetchUserInfo()
  await loadStats()
}

onShow(refreshPage)
</script>
