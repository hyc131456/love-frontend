<template>
  <view class="calendar-page">
    <!-- 月份选择器 -->
    <view class="month-picker">
      <view class="arrow" @click="changeMonth(-1)">‹</view>
      <text class="month-text">{{ currentYear }}年{{ currentMonth }}月</text>
      <view class="arrow" @click="changeMonth(1)">›</view>
    </view>
    
    <!-- 星期标题 -->
    <view class="week-header">
      <text v-for="day in weekDays" :key="day" class="week-day">{{ day }}</text>
    </view>
    
    <!-- 日历网格 -->
    <view class="calendar-grid">
      <view 
        v-for="(day, index) in calendarDays" 
        :key="index"
        class="day-cell"
        :class="{ 
          'other-month': !day.isCurrentMonth,
          'today': day.isToday,
          'selected': day.dateStr === selectedDate
        }"
        @click="selectDate(day)"
      >
        <text class="day-num">{{ day.day }}</text>
        <view v-if="day.hasEvent" class="event-dot"></view>
      </view>
    </view>
    
    <!-- 当日事件列表 -->
    <view class="events-section">
      <view class="section-header">
        <text class="section-title">{{ selectedDate || '请选择日期' }}</text>
        <view class="add-btn" @click="showAddEvent">+ 添加</view>
      </view>
      
      <scroll-view scroll-y class="events-list">
        <view v-for="event in dayEvents" :key="event.id" class="event-item">
          <view class="event-icon" :style="{ background: event.color || '#FF6B9D' }">
            {{ event.icon || '📌' }}
          </view>
          <view class="event-info">
            <text class="event-title">{{ event.title }}</text>
            <text class="event-time">{{ event.eventTime || '全天' }}</text>
          </view>
          <view v-if="event.status === 0" class="event-actions">
            <text class="action-btn" @click="completeEvent(event.id)">✓</text>
          </view>
        </view>
        
        <view v-if="dayEvents.length === 0" class="empty-tip">
          <text>这一天还没有事件~</text>
        </view>
      </scroll-view>
    </view>
    
    <!-- 添加事件弹窗 -->
    <view v-if="showEventModal" class="modal-mask" @click="showEventModal = false">
      <view class="modal-content" @click.stop>
        <text class="modal-title">添加事件</text>
        
        <input v-model="newEvent.title" class="input" placeholder="事件标题" />
        
        <view class="type-selector">
          <view 
            v-for="type in eventTypes" 
            :key="type.value"
            class="type-item"
            :class="{ active: newEvent.type === type.value }"
            @click="newEvent.type = type.value"
          >
            <text>{{ type.icon }} {{ type.label }}</text>
          </view>
        </view>
        
        <button class="btn-primary" @click="addEvent">保存</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { calendarApi } from '@/api'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const eventTypes = [
  { value: 'anniversary', label: '纪念日', icon: '💖' },
  { value: 'todo', label: '待办', icon: '✅' },
  { value: 'recipe', label: '菜谱', icon: '🍳' }
]

// 当前年月
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth() + 1)
const selectedDate = ref('')
const calendarDays = ref<any[]>([])
const dayEvents = ref<any[]>([])
const monthEvents = ref<any[]>([])
const dateMarks = ref<Record<string, string[]>>({})

// 添加事件
const showEventModal = ref(false)
const newEvent = ref({
  title: '',
  type: 'todo'
})

// 生成日历
const generateCalendar = () => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const startDay = firstDay.getDay()
  const daysInMonth = lastDay.getDate()
  
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  
  const days: any[] = []
  
  // 上月填充
  const prevMonth = new Date(year, month - 1, 0)
  const prevDays = prevMonth.getDate()
  for (let i = startDay - 1; i >= 0; i--) {
    const day = prevDays - i
    days.push({
      day,
      isCurrentMonth: false,
      dateStr: ''
    })
  }
  
  // 本月
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    days.push({
      day: i,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      dateStr,
      hasEvent: dateMarks.value[dateStr]?.length > 0
    })
  }
  
  // 下月填充
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

// 切换月份
const changeMonth = (delta: number) => {
  let newMonth = currentMonth.value + delta
  let newYear = currentYear.value
  
  if (newMonth > 12) {
    newMonth = 1
    newYear++
  } else if (newMonth < 1) {
    newMonth = 12
    newYear--
  }
  
  currentYear.value = newYear
  currentMonth.value = newMonth
  loadMonthEvents()
}

// 选择日期
const selectDate = (day: any) => {
  if (!day.isCurrentMonth) return
  selectedDate.value = day.dateStr
  loadDayEvents()
}

// 加载月事件
const loadMonthEvents = async () => {
  // 基础校验：如果没有空间ID，清理旧数据并停止加载
  if (!userStore.userInfo?.coupleId) {
    monthEvents.value = []
    dateMarks.value = {}
    generateCalendar()
    return
  }
  
  try {
    const data = await calendarApi.getMonthEvents(currentYear.value, currentMonth.value)
    monthEvents.value = data.events || []
    dateMarks.value = data.dateMarks || {}
    generateCalendar()
  } catch (e) {
    console.error('加载事件失败', e)
    generateCalendar()
  }
}

// 加载日事件
const loadDayEvents = async () => {
  if (!selectedDate.value) return
  
  // 基础校验
  if (!userStore.userInfo?.coupleId) {
    dayEvents.value = []
    return
  }
  
  try {
    const data = await calendarApi.getDayEvents(selectedDate.value)
    dayEvents.value = data || []
  } catch (e) {
    console.error('加载日事件失败', e)
  }
}

// 显示添加事件
const showAddEvent = () => {
  if (!selectedDate.value) {
    uni.showToast({ title: '请先选择日期', icon: 'none' })
    return
  }
  newEvent.value = { title: '', type: 'todo' }
  showEventModal.value = true
}

// 添加事件
const addEvent = async () => {
  if (!newEvent.value.title.trim()) {
    uni.showToast({ title: '请输入标题', icon: 'none' })
    return
  }
  
  try {
    await calendarApi.addEvent({
      ...newEvent.value,
      eventDate: selectedDate.value
    })
    showEventModal.value = false
    loadMonthEvents()
    loadDayEvents()
    uni.showToast({ title: '添加成功', icon: 'success' })
  } catch (e) {
    console.error('添加失败', e)
  }
}

// 完成事件
const completeEvent = async (id: number) => {
  try {
    await calendarApi.completeEvent(id)
    loadDayEvents()
  } catch (e) {
    console.error('操作失败', e)
  }
}

onMounted(() => {
  // 基础初始化
  const today = new Date()
  selectedDate.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
})

onShow(async () => {
  // 强制同步状态，解决跨页解绑导致的数据不一致问题
  await userStore.fetchUserInfo()
  loadMonthEvents()
  loadDayEvents()
})
</script>

<style scoped>
.calendar-page {
  min-height: 100vh;
  background: #FFF9FA;
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
  font-size: 40rpx;
  color: #666;
}

.month-text {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
  margin: 0 32rpx;
}

.week-header {
  display: flex;
  padding: 0 16rpx;
}

.week-day {
  flex: 1;
  text-align: center;
  font-size: 26rpx;
  color: #999;
  padding: 16rpx 0;
}

.calendar-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 0 16rpx;
}

.day-cell {
  width: calc(100% / 7);
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.day-num {
  font-size: 28rpx;
  color: #333;
}

.day-cell.other-month .day-num {
  color: #CCC;
}

.day-cell.today {
  background: #FFE4EC;
  border-radius: 50%;
}

.day-cell.selected {
  background: #FF6B9D;
  border-radius: 50%;
}

.day-cell.selected .day-num {
  color: #fff;
}

.event-dot {
  width: 8rpx;
  height: 8rpx;
  background: #FF6B9D;
  border-radius: 50%;
  position: absolute;
  bottom: 8rpx;
}

.events-section {
  margin: 32rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.add-btn {
  font-size: 28rpx;
  color: #FF6B9D;
}

.events-list {
  max-height: 400rpx;
}

.event-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #F5F5F5;
}

.event-item:last-child {
  border-bottom: none;
}

.event-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  margin-right: 20rpx;
}

.event-info {
  flex: 1;
}

.event-title {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 8rpx;
}

.event-time {
  font-size: 24rpx;
  color: #999;
}

.action-btn {
  font-size: 32rpx;
  color: #27AE60;
  padding: 16rpx;
}

.empty-tip {
  text-align: center;
  padding: 48rpx;
  color: #999;
  font-size: 26rpx;
}

/* 弹窗 */
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
  overflow: hidden;
}

.modal-title {
  display: block;
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin-bottom: 32rpx;
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

.type-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.type-item {
  padding: 16rpx 24rpx;
  background: #F5F5F5;
  border-radius: 32rpx;
  font-size: 26rpx;
  color: #666;
}

.type-item.active {
  background: #FFE4EC;
  color: #FF6B9D;
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
