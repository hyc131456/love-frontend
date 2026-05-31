<template>
  <view class="home-page">
    <scroll-view scroll-y class="home-scroll">
      <view class="home-top-spacer" :style="{ height: `${statusBarHeight + 12}px` }"></view>

      <view class="couple-card" @click="goTo(coupleInfo?.partner ? '/pages/mine/index' : '/pages/couple/index')">
        <view class="couple-avatars">
          <view class="home-avatar home-avatar-a">
            <image class="home-avatar-img" :src="userAvatar" mode="aspectFill" />
          </view>
          <view class="heart-connector">♡</view>
          <view class="home-avatar home-avatar-b" :class="{ muted: !coupleInfo?.partner }">
            <image class="home-avatar-img" :src="partnerAvatar" mode="aspectFill" />
          </view>
        </view>

        <view class="couple-names">
          <text class="names">{{ coupleNames }}</text>
          <text class="since">{{ relationshipText }}</text>
        </view>

        <view class="couple-stats">
          <view class="couple-stat">
            <text class="val">{{ coupleInfo?.daysTogether || 0 }}</text>
            <text class="lbl">在一起天数</text>
          </view>
          <view class="couple-stat" @click.stop="goTo('/pages/diary/index')">
            <text class="val">{{ stats.diaryCount }}</text>
            <text class="lbl">共同日记</text>
          </view>
          <view class="couple-stat" @click.stop="goTo('/pages/wish/index')">
            <text class="val">{{ stats.completedWishCount }}</text>
            <text class="lbl">完成心愿</text>
          </view>
        </view>
      </view>

      <view class="intimacy-bar">
        <view class="intimacy-header">
          <text class="intimacy-title">亲密等级</text>
          <text class="intimacy-level">{{ currentLevel.name }}</text>
        </view>
        <view class="bar-track">
          <view class="bar-fill" :style="{ width: `${levelProgress}%` }"></view>
        </view>
        <view class="bar-meta">
          <text>{{ intimacyScore }} 分</text>
          <text>{{ nextLevelInfo ? `距 ${nextLevelInfo.name} ${nextLevelInfo.gap} 分` : '已达最高等级' }}</text>
        </view>
      </view>

      <view class="section-header">
        <text class="section-title">今天 · {{ todayText }}</text>
        <text class="section-more" @click="goTo('/pages/calendar/index')">查看日历 →</text>
      </view>

      <view class="today-events">
        <view
          v-for="event in todayEvents"
          :key="event.key"
          class="event-chip"
          @click="goTo('/pages/calendar/index')"
        >
          <view class="event-dot" :class="event.kind"></view>
          <view class="event-info">
            <text class="event-name">{{ event.icon }} {{ event.title }}</text>
            <text class="event-time">{{ event.timeText }}</text>
          </view>
          <text class="event-tag" :class="event.kind">{{ event.tag }}</text>
        </view>

        <view v-if="todayEvents.length === 0" class="event-chip empty-event" @click="goTo('/pages/calendar/index')">
          <view class="event-dot task"></view>
          <view class="event-info">
            <text class="event-name">今天还没有安排</text>
            <text class="event-time">去日历记录约会、生日和小计划</text>
          </view>
          <text class="event-tag task">添加</text>
        </view>
      </view>

      <view class="section-header">
        <text class="section-title">快捷入口</text>
      </view>

      <view class="quick-grid">
        <view
          v-for="item in quickActions"
          :key="item.label"
          class="quick-btn"
          @click="goTo(item.url)"
        >
          <view class="quick-icon" :class="item.tone">{{ item.icon }}</view>
          <text class="quick-label">{{ item.label }}</text>
          <text class="quick-sub">{{ item.sub }}</text>
        </view>
      </view>

      <view class="section-header">
        <text class="section-title">近期动态</text>
        <text class="section-more" @click="goTo('/pages/diary/index')">全部 →</text>
      </view>

      <view class="activity-list">
        <view
          v-for="item in activities"
          :key="item.id"
          class="activity-item"
          @click="item.id ? goTo(`/pages/diary/detail?id=${item.id}`) : goTo('/pages/diary/index')"
        >
          <view class="activity-avatar">{{ item.avatarText }}</view>
          <view class="activity-body">
            <view class="activity-meta">
              <text class="activity-name">{{ item.author }}</text>
              <text class="activity-time">{{ item.time }}</text>
            </view>
            <text class="activity-text">{{ item.content }}</text>
            <view v-if="item.images.length" class="activity-imgs">
              <image
                v-for="img in item.images"
                :key="img"
                class="activity-img"
                :src="img"
                mode="aspectFill"
                @click.stop="previewImages(item.images, img)"
              />
            </view>
          </view>
        </view>

        <view v-if="activities.length === 0" class="activity-item activity-empty" @click="goTo('/pages/diary/edit')">
          <view class="activity-avatar">＋</view>
          <view class="activity-body">
            <view class="activity-meta">
              <text class="activity-name">还没有动态</text>
              <text class="activity-time">现在</text>
            </view>
            <text class="activity-text">写一篇日记，把这里点亮。</text>
          </view>
        </view>
      </view>

      <view class="scroll-end"></view>
    </scroll-view>

    <AppTabBar current="/pages/index/index" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import {
  calendarApi,
  diaryApi,
  galleryApi,
  recipeApi,
  savingApi,
  wishApi
} from '@/api'
import { useUserStore } from '@/stores/user'
import AppTabBar from '@/components/AppTabBar.vue'

type HomeEvent = {
  key: string
  kind: string
  icon: string
  title: string
  timeText: string
  tag: string
}

type HomeActivity = {
  id: number | string
  author: string
  avatarText: string
  time: string
  content: string
  images: string[]
}

const userStore = useUserStore()
const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 0)

const userInfo = computed(() => userStore.userInfo)
const coupleInfo = computed(() => userStore.coupleInfo)

const stats = ref({
  diaryCount: 0,
  wishCount: 0,
  doingWishCount: 0,
  completedWishCount: 0,
  savingAmount: 0,
  recipeTriedCount: 0,
  galleryCount: 0,
  todayEventCount: 0
})

const todayEvents = ref<HomeEvent[]>([])
const activities = ref<HomeActivity[]>([])
const upcomingEvent = ref<any>(null)

const levels = [
  { level: 1, name: '热恋期', min: 0, max: 100, maxLabel: 100 },
  { level: 2, name: '稳定期', min: 101, max: 300, maxLabel: 300 },
  { level: 3, name: '老夫老妻', min: 301, max: 500, maxLabel: 500 },
  { level: 4, name: '灵魂伴侣', min: 501, max: 9999, maxLabel: '∞' }
]

const tabBarPages = [
  '/pages/index/index',
  '/pages/calendar/index',
  '/pages/diary/index',
  '/pages/wish/index',
  '/pages/mine/index'
]

const userAvatar = computed(() => userInfo.value?.avatar || '/static/default-avatar.svg')
const partnerAvatar = computed(() => coupleInfo.value?.partner?.avatar || '/static/default-avatar.svg')
const userName = computed(() => userInfo.value?.nickname || '我')
const partnerName = computed(() => coupleInfo.value?.partner?.nickname || '等待 TA')
const coupleNames = computed(() => `${userName.value} & ${partnerName.value}`)

const todayText = computed(() => {
  const now = new Date()
  return `${now.getMonth() + 1}月${now.getDate()}日`
})

const relationshipText = computed(() => {
  if (!coupleInfo.value?.partner) return '开启一段专属旅程'
  const rawDate =
    coupleInfo.value?.startDate ||
    coupleInfo.value?.coupledAt ||
    coupleInfo.value?.createdAt ||
    ''
  const formatted = formatDate(rawDate)
  return formatted ? `${formatted} · 在一起` : '在一起的每一天都值得记录'
})

const intimacyScore = computed(() => {
  const info: any = coupleInfo.value || {}
  return Number(info.intimacyScore ?? info.intimacyProgress ?? 0)
})

const currentLevel = computed(() => {
  for (let i = levels.length - 1; i >= 0; i -= 1) {
    if (intimacyScore.value >= levels[i].min) return levels[i]
  }
  return levels[0]
})

const levelProgress = computed(() => {
  const level = currentLevel.value
  const current = Math.max(0, intimacyScore.value - level.min)
  const span = Math.max(1, level.max - level.min)
  return Math.min(100, Math.round((current / span) * 100))
})

const nextLevelInfo = computed(() => {
  const next = levels.find(item => item.min > intimacyScore.value)
  return next ? { ...next, gap: Math.max(0, next.min - intimacyScore.value) } : null
})

const quickActions = computed(() => [
  {
    label: '共享日历',
    icon: '📅',
    tone: 'cal',
    url: '/pages/calendar/index',
    sub: `${stats.value.todayEventCount} 个今日事件`
  },
  {
    label: '情侣日记',
    icon: '📖',
    tone: 'diary',
    url: '/pages/diary/index',
    sub: `${stats.value.diaryCount} 篇回忆`
  },
  {
    label: '心愿清单',
    icon: '⭐',
    tone: 'wish',
    url: '/pages/wish/index',
    sub: `${stats.value.doingWishCount} 个进行中`
  },
  {
    label: '共同储蓄',
    icon: '💰',
    tone: 'save',
    url: '/pages/saving/index',
    sub: `${formatMoney(stats.value.savingAmount)} 已存`
  },
  {
    label: '家庭菜谱',
    icon: '🍳',
    tone: 'recipe',
    url: '/pages/recipe/index',
    sub: `${stats.value.recipeTriedCount} 道尝试过`
  },
  {
    label: '图片库',
    icon: '🖼',
    tone: 'gallery',
    url: '/pages/gallery/index',
    sub: `${stats.value.galleryCount} 张照片`
  }
])

const goTo = (url: string) => {
  if (tabBarPages.some(page => url.startsWith(page))) {
    uni.switchTab({ url })
    return
  }
  uni.navigateTo({ url })
}

const normalizeList = (res: any) => {
  if (Array.isArray(res)) return res
  return res?.list || res?.records || res?.data || []
}

const getTotal = (res: any, list: any[]) => {
  const total = Number(res?.total ?? res?.count ?? res?.totalCount)
  return Number.isFinite(total) ? total : list.length
}

const formatDate = (value?: string) => {
  if (!value) return ''
  const date = value.slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return value
  return `${date.slice(0, 4)}年${date.slice(5, 7)}月${date.slice(8, 10)}日`
}

const formatTime = (value?: string) => {
  if (!value) return ''
  const normalized = value.replace('T', ' ')
  if (normalized.length >= 16) return normalized.slice(5, 16)
  return normalized
}

const formatMoney = (value: number) => `¥${Math.round(value).toLocaleString('zh-CN')}`

const getInitial = (name?: string) => {
  const text = (name || '我').trim()
  return text ? text.slice(0, 1) : '我'
}

const normalizeImageUrl = (value: any): string => {
  if (!value) return ''

  const rawUrl =
    typeof value === 'string'
      ? value
      : value.thumbUrl || value.url || value.src || value.path || ''

  if (!rawUrl || typeof rawUrl !== 'string') return ''
  const url = rawUrl.trim()
  if (!url) return ''
  if (url.startsWith('/uploads/')) return `/api${url}`
  return url
}

const parseImages = (value: any): string[] => {
  if (!value) return []
  if (Array.isArray(value)) {
    return value
      .map(item => normalizeImageUrl(item))
      .filter(Boolean)
      .slice(0, 3)
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) {
        return parsed
          .map(item => normalizeImageUrl(item))
          .filter(Boolean)
          .slice(0, 3)
      }
    } catch (error) {
      // Some old records store images as comma separated URLs.
    }
    return value
      .split(',')
      .map(item => normalizeImageUrl(item))
      .filter(Boolean)
      .slice(0, 3)
  }

  return []
}

const getEventKind = (type?: string) => {
  if (type === 'anniversary' || type === 'birthday') return 'anniversary'
  if (type === 'diary') return 'diary'
  return 'task'
}

const getEventIcon = (type?: string, fallback?: string) => {
  if (fallback) return fallback
  const map: Record<string, string> = {
    anniversary: '♡',
    birthday: '🎂',
    date: '🎬',
    travel: '✈',
    recipe: '🍳',
    diary: '📖',
    period: '🌸',
    todo: '✓'
  }
  return map[type || 'todo'] || '✓'
}

const getEventTag = (type?: string) => {
  const map: Record<string, string> = {
    anniversary: '纪念日',
    birthday: '生日',
    date: '约会',
    travel: '旅行',
    recipe: '菜谱',
    diary: '日记',
    period: '经期',
    todo: '共同事项'
  }
  return map[type || 'todo'] || '共同事项'
}

const getEventTimeText = (event: any) => {
  if (event?.isAllDay !== 0) return '今天 · 全天'
  return event?.eventTime ? `今天 ${event.eventTime}` : '今天'
}

const buildReminderDateText = (item: any) => {
  const daysUntil = Number(item?.daysUntil ?? -1)
  const nextOccurrence = item?.nextOccurrence || ''
  if (daysUntil === 0) return '今天 · 全天'
  if (daysUntil === 1) return `明天 · ${nextOccurrence}`
  if (daysUntil > 1) return `还有 ${daysUntil} 天 · ${nextOccurrence}`
  return nextOccurrence || '即将到来'
}

const buildTodayEvents = (events: any[], reminder: any) => {
  const mapped = events.slice(0, 3).map((event, index) => {
    const kind = getEventKind(event.type)
    return {
      key: `event-${event.id || index}`,
      kind,
      icon: getEventIcon(event.type, event.icon),
      title: event.title || '未命名事件',
      timeText: getEventTimeText(event),
      tag: getEventTag(event.type)
    }
  })

  const daysUntil = Number(reminder?.daysUntil ?? -1)
  if (mapped.length === 0 && reminder && daysUntil === 0) {
    mapped.push({
      key: `reminder-${reminder.id || reminder.title}`,
      kind: 'anniversary',
      icon: '♡',
      title: reminder.title || '纪念日提醒',
      timeText: buildReminderDateText(reminder),
      tag: '纪念日'
    })
  }

  todayEvents.value = mapped
  stats.value.todayEventCount = mapped.length
}

const buildActivities = (list: any[]) => {
  activities.value = list.slice(0, 5).map((item, index) => {
    const author =
      item.userNickname ||
      item.nickname ||
      item.authorName ||
      item.user?.nickname ||
      userName.value
    const content = item.content || item.text || '记录了一段新的日常'
    return {
      id: item.id || `activity-${index}`,
      author,
      avatarText: getInitial(author),
      time: formatTime(item.createdAt || item.createTime || item.updatedAt),
      content: `发布了日记「${content.length > 24 ? `${content.slice(0, 24)}…` : content}」`,
      images: parseImages(item.images || item.imageUrls || item.photos)
    }
  })
}

const loadHomeData = async () => {
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const [
    diaryResult,
    wishResult,
    savingResult,
    recipeResult,
    galleryResult,
    dayEventsResult,
    reminderResult
  ] = await Promise.allSettled([
    diaryApi.getList(1, 5),
    wishApi.getList(),
    savingApi.getList(),
    recipeApi.getList(),
    galleryApi.getList(1, 1),
    calendarApi.getDayEvents(todayStr),
    calendarApi.getUpcomingReminder()
  ])

  const diaryRes = diaryResult.status === 'fulfilled' ? diaryResult.value : null
  const diaryList = normalizeList(diaryRes)
  stats.value.diaryCount = getTotal(diaryRes, diaryList)
  buildActivities(diaryList)

  const wishes = normalizeList(wishResult.status === 'fulfilled' ? wishResult.value : null)
  stats.value.wishCount = wishes.length
  stats.value.doingWishCount = wishes.filter((item: any) => item.status === 1).length
  stats.value.completedWishCount = wishes.filter((item: any) => item.status === 2).length

  const savings = normalizeList(savingResult.status === 'fulfilled' ? savingResult.value : null)
  stats.value.savingAmount = savings.reduce(
    (sum: number, item: any) => sum + Number(item.currentAmount || 0),
    0
  )

  const recipes = normalizeList(recipeResult.status === 'fulfilled' ? recipeResult.value : null)
  stats.value.recipeTriedCount = recipes.filter((item: any) => Number(item.tryCount || 0) > 0).length

  const galleryRes = galleryResult.status === 'fulfilled' ? galleryResult.value : null
  const galleryList = normalizeList(galleryRes)
  stats.value.galleryCount = getTotal(galleryRes, galleryList)

  const dayEvents = normalizeList(dayEventsResult.status === 'fulfilled' ? dayEventsResult.value : null)
  upcomingEvent.value = reminderResult.status === 'fulfilled' ? reminderResult.value : null
  buildTodayEvents(dayEvents, upcomingEvent.value)
}

const resetHomeData = () => {
  stats.value = {
    diaryCount: 0,
    wishCount: 0,
    doingWishCount: 0,
    completedWishCount: 0,
    savingAmount: 0,
    recipeTriedCount: 0,
    galleryCount: 0,
    todayEventCount: 0
  }
  todayEvents.value = []
  activities.value = []
  upcomingEvent.value = null
}

const previewImages = (images: string[], current: string) => {
  uni.previewImage({
    urls: images,
    current
  })
}

onShow(async () => {
  uni.hideTabBar()
  await userStore.fetchUserInfo()

  if (!userStore.userInfo?.coupleId) {
    resetHomeData()
    return
  }

  try {
    await loadHomeData()
  } catch (error) {
    console.error('加载首页数据失败', error)
  }
})
</script>
