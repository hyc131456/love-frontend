<template>
  <view class="calendar-page">
    <view class="calendar-tabbar-bg"></view>
    <view class="calendar-header" :style="{ paddingTop: `${statusBarHeight}px` }">
      <text class="calendar-title">共享日历</text>
      <view class="header-nav">
        <view class="header-arrow" @click="changeMonth(-1)">‹</view>
        <text class="header-month">{{ currentYear }}年{{ currentMonth }}月</text>
        <view class="header-arrow" @click="changeMonth(1)">›</view>
      </view>
    </view>

    <view class="calendar-card">
      <view class="week-header">
        <text v-for="day in weekDays" :key="day" class="week-day">{{ day }}</text>
      </view>

      <view class="calendar-grid">
        <view
          v-for="(day, index) in calendarDays"
          :key="index"
          class="day-cell"
          :class="{
            'other-month': !day.isCurrentMonth,
            today: day.isToday,
            selected: day.dateStr === selectedDate
          }"
          @click="selectDate(day)"
        >
          <text class="day-num">{{ day.day }}</text>
          <view v-if="day.events && day.events.length" class="day-pills">
            <text
              v-for="event in day.events.slice(0, 2)"
              :key="event.id"
              class="day-pill"
              :style="{
                color: getEventMeta(event).color,
                background: toRgba(getEventMeta(event).color, 0.12)
              }"
            >
              {{ event.title }}
            </text>
            <text v-if="day.events.length > 2" class="day-more">+{{ day.events.length - 2 }}</text>
          </view>
          <view v-else-if="day.hasEvent" class="event-dot"></view>
        </view>
      </view>
    </view>

    <view class="events-section">
      <view class="section-header">
        <view class="section-copy">
          <text class="section-title">{{ selectedDateLabel }}</text>
          <text class="section-subtitle">{{ dayEvents.length }} 个事件</text>
        </view>
      </view>

      <scroll-view scroll-y class="events-list">
        <view
          v-for="event in dayEvents"
          :key="event.id"
          class="event-item"
          :class="{ completed: event.status === 1 }"
          @longpress.stop="showStatusSheet(event)"
          @longtap.stop="showStatusSheet(event)"
        >
          <view class="event-bar" :style="{ background: getEventMeta(event).color }"></view>

          <view class="event-body">
            <view class="event-top">
              <text class="event-title" :class="{ done: event.status === 1 }">{{ event.title }}</text>
              <text class="event-status" :class="getStatusClass(getDisplayStatus(event))">
                {{ getStatusText(getDisplayStatus(event)) }}
              </text>
            </view>

            <view class="event-meta">
              <text class="event-time">{{ getEventTimeText(event) }}</text>
              <text v-if="event.repeatType && event.repeatType !== 'none'" class="event-repeat">
                {{ getRepeatLabel(event.repeatType) }}
              </text>
            </view>

            <text v-if="event.note" class="event-note">{{ event.note }}</text>
          </view>
        </view>

        <view v-if="dayEvents.length === 0" class="empty-tip">
          <text class="empty-title">这一天还没有事件</text>
          <text class="empty-desc">点右上角添加，把约会、生日、旅行计划记下来。</text>
        </view>
      </scroll-view>
    </view>

    <AppSheet :open="showEventModal" title="添加事件" @close="closeEventModal">
      <scroll-view scroll-y class="modal-scroll">
        <input v-model="newEvent.title" class="input" placeholder="事件标题" />

        <view class="type-selector">
          <view
            v-for="type in eventTypes"
            :key="type.value"
            class="type-item"
            :class="{ active: newEvent.type === type.value }"
            @click="newEvent.type = type.value"
          >
            <text class="type-item__icon">{{ type.icon }}</text>
            <text class="type-item__label">{{ type.label }}</text>
          </view>
        </view>

        <view class="form-card">
          <view class="form-row">
            <text class="form-label">全天事件</text>
            <switch :checked="newEvent.isAllDay === 1" color="#E8637A" @change="toggleAllDay" />
          </view>

          <picker v-if="newEvent.isAllDay === 0" mode="time" :value="newEvent.eventTime" @change="onEventTimeChange">
            <view class="form-row form-row--picker">
              <text class="form-label">事件时间</text>
              <text class="form-value" :class="{ 'form-value--placeholder': !newEvent.eventTime }">
                {{ newEvent.eventTime || '选择时间' }}
              </text>
            </view>
          </picker>

          <view class="form-block">
            <text class="form-label">备注</text>
            <textarea
              v-model="newEvent.note"
              class="textarea"
              placeholder="这件事想补充点什么（可选）"
              maxlength="200"
            />
          </view>
        </view>
      </scroll-view>

      <button class="btn-primary" @click="addEvent">保存事件</button>
    </AppSheet>

    <AppSheet :open="showStatusModal" title="修改事件状态" @close="closeStatusSheet">
      <view class="status-options">
        <view
          v-for="item in statusOptions"
          :key="item.value"
          class="status-option"
          :class="{
            selected: selectedEvent && getDisplayStatus(selectedEvent) === item.value,
            disabled: item.disabled
          }"
          @click="selectStatus(item.value)"
        >
          <text class="event-status" :class="getStatusClass(item.value)">{{ getStatusText(item.value) }}</text>
          <text v-if="selectedEvent && getDisplayStatus(selectedEvent) === item.value" class="status-current">当前状态</text>
          <text v-else-if="item.disabled" class="status-current">暂不支持</text>
        </view>
        <view class="status-option delete-option" @click="deleteSelectedEvent">
          <text class="delete-option-text">删除事件</text>
          <text class="status-current">需确认</text>
        </view>
      </view>
    </AppSheet>

    <view class="calendar-fab" @click="showAddEvent">+</view>
    <AppTabBar current="/pages/calendar/index" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { calendarApi } from '@/api'
import { useUserStore } from '@/stores/user'
import AppSheet from '@/components/AppSheet.vue'
import AppTabBar from '@/components/AppTabBar.vue'

type EventTypeMeta = {
  value: string
  label: string
  icon: string
  color: string
}

type CalendarDay = {
  day: number
  isCurrentMonth: boolean
  isToday?: boolean
  dateStr: string
  hasEvent?: boolean
  events?: CalendarEvent[]
}

type CalendarEvent = {
  id: number
  type: string
  title: string
  eventDate: string
  isAllDay?: number
  eventTime?: string
  repeatType?: string
  note?: string
  color?: string
  icon?: string
  status?: number
}

type EventForm = {
  title: string
  type: string
  isAllDay: number
  eventTime: string
  note: string
}

const userStore = useUserStore()
const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 0)

const getDateStr = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

const today = new Date()
const todayStr = getDateStr(today)
const syncTodaySelection = () => {
  const now = new Date()
  currentYear.value = now.getFullYear()
  currentMonth.value = now.getMonth() + 1
  selectedDate.value = getDateStr(now)
}

const weekDays = ['日', '一', '二', '三', '四', '五', '六']
const eventTypes: EventTypeMeta[] = [
  { value: 'anniversary', label: '纪念日', icon: '♡', color: '#E8637A' },
  { value: 'todo', label: '待办', icon: '✓', color: '#4A90D9' },
  { value: 'date', label: '约会', icon: '🎬', color: '#FF8A65' },
  { value: 'birthday', label: '生日', icon: '🎂', color: '#F4B740' },
  { value: 'travel', label: '旅行', icon: '✈', color: '#2EC4B6' },
  { value: 'recipe', label: '菜谱', icon: '🍳', color: '#F5A623' },
  { value: 'diary', label: '日记', icon: '▤', color: '#9B8EC4' },
  { value: 'period', label: '经期', icon: '☾', color: '#C97C8E' }
]

const eventTypeMap = eventTypes.reduce<Record<string, EventTypeMeta>>((map, item) => {
  map[item.value] = item
  return map
}, {})

const createDefaultEvent = (): EventForm => ({
  title: '',
  type: 'todo',
  isAllDay: 1,
  eventTime: '',
  note: ''
})

const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth() + 1)
const selectedDate = ref(todayStr)
const calendarDays = ref<CalendarDay[]>([])
const dayEvents = ref<CalendarEvent[]>([])
const dateMarks = ref<Record<string, string[]>>({})
const monthEventsByDate = ref<Record<string, CalendarEvent[]>>({})

const showEventModal = ref(false)
const showStatusModal = ref(false)
const selectedEvent = ref<CalendarEvent | null>(null)
const newEvent = ref<EventForm>(createDefaultEvent())

const statusOptions = [
  { value: 0 },
  { value: 1, disabled: true },
  { value: 2 }
]

const selectedDateLabel = computed(() => {
  if (!selectedDate.value) return '请选择日期'
  const parts = selectedDate.value.split('-')
  if (parts.length !== 3) return selectedDate.value
  const label = `${Number(parts[1])}月${Number(parts[2])}日`
  return selectedDate.value === getDateStr() ? `${label} · 今天` : label
})

const getEventMeta = (event: Pick<CalendarEvent, 'type' | 'icon' | 'color'>): EventTypeMeta => {
  const meta = eventTypeMap[event.type] || eventTypeMap.todo
  return {
    ...meta,
    icon: event.icon || meta.icon,
    color: event.color || meta.color
  }
}

const getDisplayStatus = (event: CalendarEvent) => (event.status === 1 ? 2 : 0)

const getStatusText = (status?: number) => {
  if (status === 2) return '已完成 ✓'
  if (status === 1) return '进行中'
  return '未开始'
}

const getStatusClass = (status?: number) => {
  if (status === 2) return 'done'
  if (status === 1) return 'doing'
  return 'todo'
}

const toRgba = (hex: string, alpha: number) => {
  const normalized = hex.replace('#', '')
  const fullHex =
    normalized.length === 3
      ? normalized
          .split('')
          .map(char => char + char)
          .join('')
      : normalized

  if (!/^[0-9a-fA-F]{6}$/.test(fullHex)) {
    return `rgba(232, 99, 122, ${alpha})`
  }

  const red = Number.parseInt(fullHex.slice(0, 2), 16)
  const green = Number.parseInt(fullHex.slice(2, 4), 16)
  const blue = Number.parseInt(fullHex.slice(4, 6), 16)
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

const getEventBadge = (event: CalendarEvent) => {
  if (event.status === 1) {
    return {
      label: '已完成',
      color: '#4CAF50',
      background: '#F0FFF4',
      borderColor: '#D7EFDF'
    }
  }

  const meta = getEventMeta(event)
  return {
    label: meta.label,
    color: meta.color,
    background: toRgba(meta.color, 0.12),
    borderColor: toRgba(meta.color, 0.2)
  }
}

const getEventTimeText = (event: CalendarEvent) => {
  if (event.isAllDay !== 0) {
    return '全天'
  }
  return event.eventTime || '未设置时间'
}

const getRepeatLabel = (repeatType?: string) => {
  const labelMap: Record<string, string> = {
    daily: '每天重复',
    weekly: '每周重复',
    monthly: '每月重复',
    yearly: '每年重复'
  }
  return repeatType ? labelMap[repeatType] || '重复' : ''
}

const generateCalendar = () => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const startDay = firstDay.getDay()
  const daysInMonth = lastDay.getDate()

  const currentTodayStr = getDateStr()
  const days: CalendarDay[] = []

  const prevMonth = new Date(year, month - 1, 0)
  const prevDays = prevMonth.getDate()
  for (let i = startDay - 1; i >= 0; i--) {
    days.push({
      day: prevDays - i,
      isCurrentMonth: false,
      dateStr: ''
    })
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    const events = monthEventsByDate.value[dateStr] || []
    days.push({
      day: i,
      isCurrentMonth: true,
      isToday: dateStr === currentTodayStr,
      dateStr,
      hasEvent: events.length > 0 || (dateMarks.value[dateStr] || []).length > 0,
      events
    })
  }

  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    days.push({
      day: i,
      isCurrentMonth: false,
      dateStr: ''
    })
  }

  calendarDays.value = days
}

const changeMonth = (delta: number) => {
  let month = currentMonth.value + delta
  let year = currentYear.value

  if (month > 12) {
    month = 1
    year += 1
  } else if (month < 1) {
    month = 12
    year -= 1
  }

  currentYear.value = year
  currentMonth.value = month
  loadMonthEvents()
}

const selectDate = (day: CalendarDay) => {
  if (!day.isCurrentMonth) return
  selectedDate.value = day.dateStr
  loadDayEvents()
}

const loadMonthEvents = async () => {
  if (!userStore.userInfo?.coupleId) {
    dateMarks.value = {}
    monthEventsByDate.value = {}
    generateCalendar()
    return
  }

  try {
    const data = await calendarApi.getMonthEvents(currentYear.value, currentMonth.value)
    dateMarks.value = data.dateMarks || {}
    monthEventsByDate.value = (data.events || []).reduce(
      (map: Record<string, CalendarEvent[]>, event: CalendarEvent) => {
        const date = String(event.eventDate || '').slice(0, 10)
        if (!date) return map
        if (!map[date]) map[date] = []
        map[date].push(event)
        return map
      },
      {}
    )
  } catch (error) {
    console.error('加载月事件失败', error)
    dateMarks.value = {}
    monthEventsByDate.value = {}
  }

  generateCalendar()
}

const loadDayEvents = async () => {
  ensureSelectedDate()

  if (!userStore.userInfo?.coupleId) {
    dayEvents.value = []
    return
  }

  try {
    const data = await calendarApi.getDayEvents(selectedDate.value)
    dayEvents.value = data || []
  } catch (error) {
    console.error('加载日事件失败', error)
    dayEvents.value = []
  }
}

const ensureSelectedDate = () => {
  if (selectedDate.value) return
  selectedDate.value = getDateStr()
}

const toggleAllDay = (e: any) => {
  const checked = !!e.detail.value
  newEvent.value.isAllDay = checked ? 1 : 0
  if (checked) {
    newEvent.value.eventTime = ''
  }
}

const onEventTimeChange = (e: any) => {
  newEvent.value.eventTime = e.detail.value
}

const closeEventModal = () => {
  showEventModal.value = false
}

const showStatusSheet = (event: CalendarEvent) => {
  selectedEvent.value = event
  showStatusModal.value = true
}

const closeStatusSheet = () => {
  showStatusModal.value = false
  selectedEvent.value = null
}

const showAddEvent = () => {
  if (!selectedDate.value) {
    uni.showToast({ title: '请先选择日期', icon: 'none' })
    return
  }

  newEvent.value = createDefaultEvent()
  showEventModal.value = true
}

const addEvent = async () => {
  if (!newEvent.value.title.trim()) {
    uni.showToast({ title: '请输入标题', icon: 'none' })
    return
  }

  if (newEvent.value.isAllDay === 0 && !newEvent.value.eventTime) {
    uni.showToast({ title: '请选择事件时间', icon: 'none' })
    return
  }

  const meta = eventTypeMap[newEvent.value.type] || eventTypeMap.todo

  try {
    await calendarApi.addEvent({
      title: newEvent.value.title.trim(),
      type: newEvent.value.type,
      eventDate: selectedDate.value,
      isAllDay: newEvent.value.isAllDay,
      eventTime: newEvent.value.isAllDay === 1 ? null : newEvent.value.eventTime,
      note: newEvent.value.note.trim() || null,
      color: meta.color,
      icon: meta.icon
    })
    closeEventModal()
    newEvent.value = createDefaultEvent()
    await Promise.all([loadMonthEvents(), loadDayEvents()])
    uni.showToast({ title: '添加成功', icon: 'success' })
  } catch (error) {
    console.error('添加事件失败', error)
  }
}

const completeEvent = async (id: number) => {
  try {
    await calendarApi.completeEvent(id)
    const event = dayEvents.value.find(item => item.id === id)
    if (event) event.status = 1
    closeStatusSheet()
    await Promise.all([loadMonthEvents(), loadDayEvents()])
  } catch (error) {
    console.error('完成事件失败', error)
  }
}

const reopenEvent = (event: CalendarEvent) => {
  uni.showModal({
    title: '确认修改状态',
    content: '要将这个事件改为「未开始」吗？',
    confirmColor: '#E8637A',
    success: async res => {
      if (!res.confirm) return

      try {
        await calendarApi.updateEvent({ ...event, status: 0 })
        event.status = 0
        closeStatusSheet()
        await Promise.all([loadMonthEvents(), loadDayEvents()])
      } catch (error) {
        console.error('修改事件状态失败', error)
      }
    }
  })
}

const selectStatus = (status: number) => {
  const event = selectedEvent.value
  if (!event) return

  if (status === 1) {
    uni.showToast({ title: '日历事件暂不支持进行中', icon: 'none' })
    return
  }

  const currentStatus = event.status === 1 ? 2 : 0
  if (currentStatus === status) {
    closeStatusSheet()
    return
  }

  if (status === 2) {
    completeEvent(event.id)
    return
  }

  if (status === 0 && event.status === 1) {
    reopenEvent(event)
  }
}

const deleteEvent = async (id: number) => {
  uni.showModal({
    title: '确认删除',
    content: '删除后将无法恢复，确定继续吗？',
    confirmColor: '#E75B65',
    success: async res => {
      if (!res.confirm) return

      try {
        await calendarApi.deleteEvent(id)
        await Promise.all([loadMonthEvents(), loadDayEvents()])
        closeStatusSheet()
        uni.showToast({ title: '删除成功', icon: 'success' })
      } catch (error) {
        console.error('删除事件失败', error)
      }
    }
  })
}

const deleteSelectedEvent = () => {
  const event = selectedEvent.value
  if (!event) return
  deleteEvent(event.id)
}

onShow(async () => {
  uni.hideTabBar()
  syncTodaySelection()
  await userStore.fetchUserInfo()
  await Promise.all([loadMonthEvents(), loadDayEvents()])
})
</script>

<style scoped>
.calendar-page {
  position: relative;
  min-height: 100vh;
  background: #F7F5F3;
  padding-bottom: calc(82px + env(safe-area-inset-bottom));
}

.calendar-tabbar-bg {
  position: fixed;
  left: 50%;
  bottom: 0;
  z-index: 79;
  width: 100%;
  max-width: 390px;
  height: calc(82px + env(safe-area-inset-bottom));
  transform: translateX(-50%);
  background: #FFFFFF;
  border-top: 1rpx solid #EBEBF0;
}

.calendar-header {
  position: sticky;
  top: 0;
  z-index: 50;
  padding-left: 40rpx;
  padding-right: 40rpx;
  padding-bottom: 28rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #FFFFFF;
  border: 1rpx solid #EBEBF0;
  border-left: none;
  border-right: none;
  border-top: none;
}

.calendar-title {
  font-size: 36rpx;
  line-height: 44rpx;
  font-weight: 700;
  color: #1C1B2E;
}

.header-nav {
  display: grid;
  grid-template-columns: 64rpx 168rpx 64rpx;
  align-items: center;
  justify-content: center;
  column-gap: 8rpx;
  height: 64rpx;
  flex-shrink: 0;
}

.header-arrow {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
  font-size: 44rpx;
  line-height: 1;
  color: #1C1B2E;
}

.header-month {
  width: 168rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateY(4rpx);
  text-align: center;
  font-size: 30rpx;
  line-height: 1;
  font-weight: 600;
  color: #1C1B2E;
  white-space: nowrap;
}

.calendar-card {
  overflow: hidden;
  background: #FFFFFF;
  padding: 0 16rpx 12rpx;
  border-bottom: 1rpx solid #EBEBF0;
}

.week-header {
  display: flex;
  padding: 12rpx 0 8rpx;
  background: #FFFFFF;
}

.week-day {
  flex: 1;
  padding: 8rpx 0;
  text-align: center;
  font-size: 22rpx;
  line-height: 28rpx;
  font-weight: 500;
  color: #8A8A9A;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 1px;
  padding: 0;
  background: #EBEBF0;
}

.day-cell {
  height: 144rpx;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  overflow: hidden;
  padding: 8rpx;
  box-sizing: border-box;
  background: #FFFFFF;
}

.day-cell.other-month {
  background: #FAFAFA;
}

.day-num {
  width: 44rpx;
  height: 44rpx;
  margin-bottom: 4rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 24rpx;
  line-height: 30rpx;
  font-weight: 500;
  color: #1C1B2E;
}

.day-cell.other-month .day-num {
  color: #D0D0D8;
}

.day-cell.today .day-num {
  background: #E8637A;
  color: #FFFFFF;
  font-weight: 700;
}

.day-cell.selected .day-num {
  background: #FEF0F2;
  color: #E8637A;
}

.day-cell.today.selected .day-num {
  background: #E8637A;
  color: #FFFFFF;
}

.day-pills {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.day-pill {
  width: 100%;
  min-width: 0;
  padding: 2rpx 6rpx;
  box-sizing: border-box;
  border-radius: 6rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 18rpx;
  line-height: 24rpx;
  font-weight: 500;
}

.day-more {
  padding-left: 4rpx;
  font-size: 18rpx;
  line-height: 22rpx;
  color: #8A8A9A;
}

.event-dot {
  position: absolute;
  bottom: 8rpx;
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: #E8637A;
}

.events-section {
  margin: 20rpx 32rpx 32rpx;
  padding: 0;
  border-radius: 0;
  background: transparent;
  border: none;
  box-shadow: none;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.section-copy {
  flex: 1;
  min-width: 0;
}

.section-title {
  display: block;
  font-size: 24rpx;
  line-height: 30rpx;
  font-weight: 600;
  color: #8A8A9A;
  letter-spacing: 1rpx;
}

.section-subtitle {
  display: none;
  margin-top: 0;
  font-size: 22rpx;
  line-height: 28rpx;
  color: #8A8A9A;
}

.events-list {
  max-height: calc(100vh - 680rpx);
}

.event-item {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
  padding: 20rpx 24rpx;
  border-radius: 24rpx;
  background: #FFFFFF;
  border: none;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.event-item.completed {
  opacity: 0.78;
}

.event-item:last-child {
  margin-bottom: 0;
}

.event-bar {
  width: 6rpx;
  height: 64rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
  border-radius: 4rpx;
}

.event-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.event-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.event-title {
  flex: 1;
  min-width: 0;
  font-size: 28rpx;
  line-height: 36rpx;
  font-weight: 600;
  color: #1C1B2E;
}

.event-title.done {
  color: #8A8A9A;
  text-decoration: line-through;
}

.event-status {
  flex-shrink: 0;
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  line-height: 26rpx;
  font-weight: 600;
}

.event-status.todo {
  background: #F7F5F3;
  color: #8A8A9A;
}

.event-status.doing {
  background: #FFF7E6;
  color: #F5A623;
}

.event-status.done {
  background: #F0FFF4;
  color: #4CAF50;
}

.event-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 2rpx;
}

.event-time,
.event-repeat {
  font-size: 22rpx;
  line-height: 28rpx;
  color: #8A8A9A;
}

.event-note {
  margin-top: 6rpx;
  font-size: 22rpx;
  line-height: 30rpx;
  color: #8A8A9A;
}

.empty-tip {
  padding: 32rpx 24rpx;
  border-radius: 24rpx;
  text-align: center;
  background: #FFFFFF;
  border: 1rpx solid #EBEBF0;
}

.empty-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #1C1B2E;
}

.empty-desc {
  display: block;
  margin-top: 14rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: #8A8A9A;
}

.modal-scroll {
  max-height: 58vh;
}

.input {
  width: 100%;
  height: 80rpx;
  margin-bottom: 24rpx;
  padding: 0 24rpx;
  box-sizing: border-box;
  border-radius: 20rpx;
  background: #F7F5F3;
  border: 1rpx solid #EBEBF0;
  font-size: 28rpx;
}

.type-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.type-item {
  width: auto;
  min-width: 0;
  height: 60rpx;
  padding: 0 24rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999rpx;
  background: #F7F5F3;
  border: 1rpx solid #EBEBF0;
}

.type-item.active {
  background: #FEF0F2;
  border-color: #E8637A;
  color: #E8637A;
}

.type-item__icon {
  margin-right: 8rpx;
  font-size: 24rpx;
}

.type-item__label {
  white-space: nowrap;
  font-size: 22rpx;
}

.form-card {
  margin-top: 24rpx;
  padding: 4rpx 24rpx 24rpx;
  border-radius: 20rpx;
  background: #F7F5F3;
}

.form-row {
  min-height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.form-row--picker {
  border-top: 1rpx solid #EBEBF0;
}

.form-label {
  font-size: 26rpx;
  color: #1C1B2E;
}

.form-value {
  font-size: 26rpx;
  color: #5B5A6D;
}

.form-value--placeholder {
  color: #8A8A9A;
}

.form-block {
  margin-top: 8rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #EBEBF0;
}

.textarea {
  width: 100%;
  min-height: 132rpx;
  margin-top: 16rpx;
  padding: 20rpx;
  box-sizing: border-box;
  border-radius: 16rpx;
  background: #FFFFFF;
  font-size: 26rpx;
  line-height: 1.6;
}

.btn-primary {
  width: 100%;
  height: 88rpx;
  margin-top: 24rpx;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #E8637A;
  border: none;
  border-radius: 24rpx;
  color: #FFFFFF;
  font-size: 30rpx;
  font-weight: 500;
}

.status-options {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.status-option {
  min-height: 88rpx;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 22rpx;
  background: #F7F5F3;
  border: 2rpx solid transparent;
}

.status-option.selected {
  background: #FFFFFF;
  border-color: #E8637A;
}

.status-option.disabled {
  opacity: 0.52;
}

.delete-option {
  background: #FEF0F2;
  border-color: rgba(231, 91, 101, 0.14);
}

.delete-option-text {
  color: #E75B65;
  font-size: 28rpx;
  line-height: 36rpx;
  font-weight: 600;
}

.status-current {
  font-size: 24rpx;
  color: #8A8A9A;
}

.calendar-fab {
  position: fixed;
  right: calc(50% - 195px + 40rpx);
  bottom: 180rpx;
  z-index: 70;
  width: 100rpx;
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #E8637A;
  box-shadow: 0 8rpx 28rpx rgba(232, 99, 122, 0.32);
  color: #FFFFFF;
  font-size: 48rpx;
  line-height: 1;
  font-weight: 500;
}

@media (max-width: 390px) {
  .calendar-fab {
    right: 40rpx;
  }
}
</style>
