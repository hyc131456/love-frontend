<template>
  <view class="calendar-page">
    <view class="month-picker">
      <view class="arrow" @click="changeMonth(-1)">&lt;</view>
      <text class="month-text">{{ currentYear }}年{{ currentMonth }}月</text>
      <view class="arrow" @click="changeMonth(1)">&gt;</view>
    </view>

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
        <view v-if="day.hasEvent" class="event-dot"></view>
      </view>
    </view>

    <view class="events-section">
      <view class="section-header">
        <view class="section-copy">
          <text class="section-title">{{ selectedDate || '请选择日期' }}</text>
          <text class="section-subtitle">{{ dayEvents.length }} 个事件</text>
        </view>
        <view class="add-btn" @click="showAddEvent">添加</view>
      </view>

      <scroll-view scroll-y class="events-list">
        <view v-for="event in dayEvents" :key="event.id" class="event-item">
          <view class="event-icon" :style="{ background: getEventMeta(event).color }">
            {{ event.icon || getEventMeta(event).icon }}
          </view>

          <view class="event-body">
            <view class="event-head">
              <text class="event-title" :class="{ done: event.status === 1 }">{{ event.title }}</text>
            </view>

            <view class="event-meta">
              <text
                class="event-badge"
                :class="{ 'event-badge--done': event.status === 1 }"
                :style="{
                  color: getEventBadge(event).color,
                  background: getEventBadge(event).background,
                  borderColor: getEventBadge(event).borderColor
                }"
              >
                {{ getEventBadge(event).label }}
              </text>
              <text class="event-time">{{ getEventTimeText(event) }}</text>
              <text v-if="event.repeatType && event.repeatType !== 'none'" class="event-repeat">
                {{ getRepeatLabel(event.repeatType) }}
              </text>
            </view>

            <text v-if="event.note" class="event-note">{{ event.note }}</text>
          </view>

          <view class="event-actions">
            <view
              v-if="event.status === 0"
              class="action-btn action-btn--complete"
              @click.stop="completeEvent(event.id)"
            >
              完成
            </view>
            <view class="action-btn action-btn--delete" @click.stop="deleteEvent(event.id)">
              删除
            </view>
          </view>
        </view>

        <view v-if="dayEvents.length === 0" class="empty-tip">
          <text class="empty-title">这一天还没有事件</text>
          <text class="empty-desc">点右上角添加，把约会、生日、旅行计划记下来。</text>
        </view>
      </scroll-view>
    </view>

    <view v-if="showEventModal" class="modal-mask" @click="closeEventModal">
      <view class="modal-content" @click.stop>
        <text class="modal-title">添加事件</text>

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
              <switch :checked="newEvent.isAllDay === 1" color="#FF6B9D" @change="toggleAllDay" />
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
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { calendarApi } from '@/api'
import { useUserStore } from '@/stores/user'

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

const weekDays = ['日', '一', '二', '三', '四', '五', '六']
const eventTypes: EventTypeMeta[] = [
  { value: 'anniversary', label: '纪念日', icon: '💖', color: '#FF6B9D' },
  { value: 'todo', label: '待办', icon: '✅', color: '#4A90D9' },
  { value: 'date', label: '约会', icon: '🥂', color: '#FF8A65' },
  { value: 'birthday', label: '生日', icon: '🎂', color: '#F4B740' },
  { value: 'travel', label: '旅行', icon: '✈️', color: '#2EC4B6' },
  { value: 'recipe', label: '菜谱', icon: '🍳', color: '#F39C12' },
  { value: 'diary', label: '日记', icon: '📝', color: '#9B59B6' },
  { value: 'period', label: '姨妈期', icon: '🌙', color: '#FF8FA3' }
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

const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth() + 1)
const selectedDate = ref('')
const calendarDays = ref<CalendarDay[]>([])
const dayEvents = ref<CalendarEvent[]>([])
const dateMarks = ref<Record<string, string[]>>({})

const showEventModal = ref(false)
const newEvent = ref<EventForm>(createDefaultEvent())

const getEventMeta = (event: Pick<CalendarEvent, 'type' | 'icon' | 'color'>): EventTypeMeta => {
  const meta = eventTypeMap[event.type] || eventTypeMap.todo
  return {
    ...meta,
    icon: event.icon || meta.icon,
    color: event.color || meta.color
  }
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
    return `rgba(255, 107, 157, ${alpha})`
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
      color: '#27AE60',
      background: '#EEF9F1',
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

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
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
    days.push({
      day: i,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      dateStr,
      hasEvent: (dateMarks.value[dateStr] || []).length > 0
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
    generateCalendar()
    return
  }

  try {
    const data = await calendarApi.getMonthEvents(currentYear.value, currentMonth.value)
    dateMarks.value = data.dateMarks || {}
  } catch (error) {
    console.error('加载月事件失败', error)
    dateMarks.value = {}
  }

  generateCalendar()
}

const loadDayEvents = async () => {
  if (!selectedDate.value) return

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
    await Promise.all([loadMonthEvents(), loadDayEvents()])
  } catch (error) {
    console.error('完成事件失败', error)
  }
}

const deleteEvent = (id: number) => {
  uni.showModal({
    title: '确认删除',
    content: '删除后将无法恢复，确定继续吗？',
    confirmColor: '#FF5D73',
    success: async res => {
      if (!res.confirm) return

      try {
        await calendarApi.deleteEvent(id)
        await Promise.all([loadMonthEvents(), loadDayEvents()])
        uni.showToast({ title: '删除成功', icon: 'success' })
      } catch (error) {
        console.error('删除事件失败', error)
      }
    }
  })
}

onMounted(() => {
  const today = new Date()
  selectedDate.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
})

onShow(async () => {
  await userStore.fetchUserInfo()
  await Promise.all([loadMonthEvents(), loadDayEvents()])
})
</script>

<style scoped>
.calendar-page {
  min-height: 100vh;
  background: #fff7fa;
  padding-bottom: 120rpx;
}

.month-picker {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
}

.arrow {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  color: #666;
}

.month-text {
  margin: 0 32rpx;
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
}

.week-header {
  display: flex;
  padding: 0 16rpx;
}

.week-day {
  flex: 1;
  padding: 16rpx 0;
  text-align: center;
  font-size: 26rpx;
  color: #999;
}

.calendar-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 0 16rpx;
}

.day-cell {
  width: calc(100% / 7);
  aspect-ratio: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.day-num {
  font-size: 28rpx;
  color: #333;
}

.day-cell.other-month .day-num {
  color: #d0d0d0;
}

.day-cell.today {
  background: #ffe7ef;
  border-radius: 24rpx;
}

.day-cell.selected {
  background: #ff6b9d;
  border-radius: 24rpx;
}

.day-cell.selected .day-num {
  color: #fff;
}

.event-dot {
  position: absolute;
  bottom: 10rpx;
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: #ff6b9d;
}

.events-section {
  margin: 32rpx;
  padding: 32rpx;
  border-radius: 24rpx;
  background: #fff;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.section-copy {
  flex: 1;
  min-width: 0;
  padding-right: 16rpx;
}

.section-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.section-subtitle {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #999;
}

.add-btn {
  flex-shrink: 0;
  min-width: 104rpx;
  height: 56rpx;
  line-height: 56rpx;
  text-align: center;
  font-size: 24rpx;
  color: #ff6b9d;
  background: #fff1f5;
  border-radius: 999rpx;
}

.events-list {
  max-height: 520rpx;
}

.event-item {
  display: flex;
  align-items: stretch;
  padding: 22rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.event-item:last-child {
  border-bottom: none;
}

.event-icon {
  width: 68rpx;
  height: 68rpx;
  margin-right: 18rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18rpx;
  font-size: 30rpx;
  color: #fff;
}

.event-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-top: 4rpx;
}

.event-head {
  display: flex;
  align-items: flex-start;
}

.event-title {
  flex: 1;
  min-width: 0;
  font-size: 28rpx;
  line-height: 1.4;
  font-weight: 500;
  color: #333;
}

.event-title.done {
  color: #999;
  text-decoration: line-through;
}

.event-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 10rpx;
}

.event-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  border: 1rpx solid transparent;
  font-size: 22rpx;
  line-height: 1;
}

.event-badge--done {
  font-weight: 500;
}

.event-time,
.event-repeat {
  font-size: 24rpx;
  color: #999;
}

.event-note {
  margin-top: 10rpx;
  font-size: 22rpx;
  line-height: 1.6;
  color: #a0a0a0;
}

.event-actions {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10rpx;
  margin-left: 18rpx;
  flex-shrink: 0;
  padding-bottom: 2rpx;
  align-self: flex-end;
}

.action-btn {
  min-width: 84rpx;
  height: 46rpx;
  padding: 0 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999rpx;
  font-size: 22rpx;
}

.action-btn--complete {
  color: #27ae60;
  background: #eefaf3;
}

.action-btn--delete {
  color: #ff5d73;
  background: #fff1f3;
}

.empty-tip {
  padding: 56rpx 24rpx;
  text-align: center;
}

.empty-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.empty-desc {
  display: block;
  margin-top: 14rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: #999;
}

.modal-mask {
  position: fixed;
  inset: 0;
  z-index: 99;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.42);
}

.modal-content {
  width: 86%;
  max-width: 86%;
  padding: 40rpx 32rpx 32rpx;
  box-sizing: border-box;
  border-radius: 28rpx;
  background: #fff;
}

.modal-title {
  display: block;
  margin-bottom: 28rpx;
  text-align: center;
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
}

.modal-scroll {
  max-height: 58vh;
}

.input {
  width: 100%;
  height: 88rpx;
  margin-bottom: 24rpx;
  padding: 0 24rpx;
  box-sizing: border-box;
  border-radius: 16rpx;
  background: #f8f8f8;
  font-size: 28rpx;
}

.type-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
}

.type-item {
  width: calc((100% - 42rpx) / 4);
  min-width: 0;
  height: 76rpx;
  padding: 0 8rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18rpx;
  background: #f7f7f7;
}

.type-item.active {
  background: #ffe4ec;
}

.type-item__icon {
  margin-right: 8rpx;
  font-size: 24rpx;
}

.type-item__label {
  white-space: nowrap;
  font-size: 22rpx;
  color: #555;
}

.form-card {
  margin-top: 24rpx;
  padding: 8rpx 24rpx 24rpx;
  border-radius: 20rpx;
  background: #faf7f8;
}

.form-row {
  min-height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.form-row--picker {
  border-top: 1rpx solid #f0e6ea;
}

.form-label {
  font-size: 26rpx;
  color: #333;
}

.form-value {
  font-size: 26rpx;
  color: #555;
}

.form-value--placeholder {
  color: #bbb;
}

.form-block {
  margin-top: 8rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0e6ea;
}

.textarea {
  width: 100%;
  min-height: 140rpx;
  margin-top: 16rpx;
  padding: 20rpx;
  box-sizing: border-box;
  border-radius: 16rpx;
  background: #fff;
  font-size: 26rpx;
  line-height: 1.6;
}

.btn-primary {
  width: 100%;
  height: 88rpx;
  margin-top: 24rpx;
  padding: 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 1;
  background: #fff;
  border: 2rpx solid #ff6b9d;
  border-radius: 44rpx;
  color: #ff6b9d;
  font-size: 30rpx;
  font-weight: 500;
}
</style>
