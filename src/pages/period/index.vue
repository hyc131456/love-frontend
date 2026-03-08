<template>
  <view class="period-page">
    <!-- 状态卡片 -->
    <view class="status-card">
      <view v-if="prediction.nextPredictedDate" class="prediction">
        <text class="prediction-label">预计下次经期</text>
        <text class="prediction-date">{{ prediction.nextPredictedDate }}</text>
        <text class="prediction-cycle">平均周期 {{ prediction.avgCycleLength || 28 }} 天</text>
      </view>
      <view v-else class="prediction">
        <text class="prediction-label">🌸 姨妈期助手</text>
        <text class="prediction-cycle">记录经期，智能预测下次日期</text>
      </view>
      
      <button class="btn-record" @click="showRecordModal = true">📝 记录经期</button>
    </view>
    
    <!-- 历史记录 -->
    <view class="history-section">
      <text class="section-title">历史记录</text>
      
      <view v-for="record in records" :key="record.id" class="record-card">
        <view class="record-header">
          <text class="record-dates">
            {{ record.startDate }} ~ {{ record.endDate || '进行中' }}
          </text>
          <text class="record-flow">{{ getFlowText(record.flow) }}</text>
        </view>
        
        <view v-if="record.symptoms" class="record-symptoms">
          <text v-for="s in parseSymptoms(record.symptoms)" :key="s" class="symptom-tag">{{ s }}</text>
        </view>
        
        <view v-if="record.note" class="record-note">
          <text>{{ record.note }}</text>
        </view>
        
        <view class="record-actions">
          <text class="action-link" @click="editRecord(record)">编辑</text>
          <text class="action-link danger" @click="deleteRecord(record.id)">删除</text>
        </view>
      </view>
      
      <view v-if="records.length === 0" class="empty-state">
        <text class="empty-icon">🌸</text>
        <text class="empty-text">暂无记录</text>
      </view>
    </view>
    
    <!-- 记录弹窗 -->
    <view v-if="showRecordModal" class="modal-mask" @click="closeModal">
      <view class="modal-content" @click.stop>
        <text class="modal-title">{{ isEdit ? '编辑记录' : '记录经期' }}</text>
        
        <!-- 开始日期 -->
        <view class="date-field">
          <text class="field-label">开始日期 *</text>
          <picker mode="date" :end="today" @change="(e: any) => form.startDate = e.detail.value">
            <view class="date-picker-display">
              <text>{{ form.startDate || '选择开始日期' }}</text>
            </view>
          </picker>
        </view>
        
        <!-- 结束日期 -->
        <view class="date-field">
          <text class="field-label">结束日期</text>
          <picker mode="date" :start="form.startDate" :end="today" @change="(e: any) => form.endDate = e.detail.value">
            <view class="date-picker-display">
              <text>{{ form.endDate || '选择结束日期（可选）' }}</text>
            </view>
          </picker>
        </view>
        
        <!-- 流量 -->
        <view class="field-group">
          <text class="field-label">流量</text>
          <view class="type-selector">
            <view 
              v-for="f in flowOptions" 
              :key="f.value"
              class="type-item"
              :class="{ active: form.flow === f.value }"
              @click="form.flow = f.value"
            >
              {{ f.label }}
            </view>
          </view>
        </view>
        
        <!-- 症状 -->
        <view class="field-group">
          <text class="field-label">症状</text>
          <view class="type-selector">
            <view 
              v-for="s in symptomOptions" 
              :key="s.value"
              class="type-item"
              :class="{ active: selectedSymptoms.includes(s.value) }"
              @click="toggleSymptom(s.value)"
            >
              {{ s.label }}
            </view>
          </view>
        </view>
        
        <!-- 备注 -->
        <textarea v-model="form.note" class="textarea" placeholder="备注（可选）" />
        
        <button class="btn-primary" @click="saveRecord">保存</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { get, post, put, del } from '@/utils/request'

const flowOptions = [
  { value: 'light', label: '少量' },
  { value: 'normal', label: '正常' },
  { value: 'heavy', label: '较多' }
]

const symptomOptions = [
  { value: '腹痛', label: '😣 腹痛' },
  { value: '头痛', label: '🤕 头痛' },
  { value: '情绪波动', label: '😤 情绪波动' },
  { value: '疲劳', label: '😴 疲劳' },
  { value: '恶心', label: '🤢 恶心' }
]

const records = ref<any[]>([])
const prediction = ref<any>({})
const showRecordModal = ref(false)
const isEdit = ref(false)
const editingId = ref<number | null>(null)
const selectedSymptoms = ref<string[]>([])

const today = new Date().toISOString().split('T')[0]

const form = ref({
  startDate: '',
  endDate: '',
  flow: 'normal',
  note: ''
})

const toggleSymptom = (s: string) => {
  const idx = selectedSymptoms.value.indexOf(s)
  if (idx >= 0) {
    selectedSymptoms.value.splice(idx, 1)
  } else {
    selectedSymptoms.value.push(s)
  }
}

const getFlowText = (flow: string) => {
  const map: Record<string, string> = { light: '少量', normal: '正常', heavy: '较多' }
  return map[flow] || '正常'
}

const parseSymptoms = (symptoms: string) => {
  if (!symptoms) return []
  try {
    return JSON.parse(symptoms)
  } catch {
    return symptoms.split(',').filter(Boolean)
  }
}

const loadData = async () => {
  try {
    const [list, pred] = await Promise.all([
      get('/period/list'),
      get('/period/predict')
    ])
    records.value = list || []
    prediction.value = pred || {}
  } catch (e) {
    console.error('加载数据失败', e)
  }
}

const editRecord = (record: any) => {
  isEdit.value = true
  editingId.value = record.id
  form.value = {
    startDate: record.startDate,
    endDate: record.endDate || '',
    flow: record.flow || 'normal',
    note: record.note || ''
  }
  selectedSymptoms.value = parseSymptoms(record.symptoms)
  showRecordModal.value = true
}

const closeModal = () => {
  showRecordModal.value = false
  isEdit.value = false
  editingId.value = null
  form.value = { startDate: '', endDate: '', flow: 'normal', note: '' }
  selectedSymptoms.value = []
}

const saveRecord = async () => {
  if (!form.value.startDate) {
    uni.showToast({ title: '请选择开始日期', icon: 'none' })
    return
  }
  
  const data = {
    ...form.value,
    symptoms: JSON.stringify(selectedSymptoms.value)
  }
  
  try {
    if (isEdit.value && editingId.value) {
      await put('/period', { ...data, id: editingId.value })
    } else {
      await post('/period', data)
    }
    closeModal()
    loadData()
    uni.showToast({ title: '保存成功', icon: 'success' })
  } catch (e) {
    console.error('保存失败', e)
  }
}

const deleteRecord = (id: number) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这条记录吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await del(`/period/${id}`)
          loadData()
          uni.showToast({ title: '已删除', icon: 'success' })
        } catch (e) {
          console.error('删除失败', e)
        }
      }
    }
  })
}

onShow(() => {
  loadData()
})
</script>

<style scoped>
.period-page {
  min-height: 100vh;
  background: #F5F5F5;
  padding-bottom: 40rpx;
}

.status-card {
  background: linear-gradient(135deg, #FFCDD2, #F48FB1);
  margin: 24rpx;
  border-radius: 24rpx;
  padding: 48rpx 32rpx;
  text-align: center;
  color: #fff;
}

.prediction-label {
  display: block;
  font-size: 28rpx;
  opacity: 0.9;
  margin-bottom: 12rpx;
}

.prediction-date {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  margin-bottom: 8rpx;
}

.prediction-cycle {
  display: block;
  font-size: 24rpx;
  opacity: 0.8;
  margin-bottom: 32rpx;
}

.btn-record {
  background: rgba(255, 255, 255, 0.3);
  border: none;
  color: #fff;
  font-size: 28rpx;
  padding: 16rpx 48rpx;
  border-radius: 32rpx;
}

.history-section {
  margin: 0 24rpx;
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.record-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx;
  margin-bottom: 16rpx;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.record-dates {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.record-flow {
  font-size: 24rpx;
  color: #F48FB1;
  background: #FFF5F7;
  padding: 4rpx 16rpx;
  border-radius: 16rpx;
}

.record-symptoms {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.symptom-tag {
  font-size: 22rpx;
  background: #F5F5F5;
  padding: 6rpx 16rpx;
  border-radius: 16rpx;
  color: #666;
}

.record-note {
  font-size: 26rpx;
  color: #999;
  margin-bottom: 12rpx;
}

.record-actions {
  display: flex;
  gap: 32rpx;
  justify-content: flex-end;
}

.action-link {
  font-size: 26rpx;
  color: #FF6B9D;
}

.action-link.danger {
  color: #FF4757;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 0;
}

.empty-icon { font-size: 80rpx; margin-bottom: 16rpx; }
.empty-text { font-size: 28rpx; color: #999; }

/* 弹窗 */
.modal-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99;
}

.modal-content {
  width: 85%;
  max-height: 80vh;
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
  box-sizing: border-box;
  overflow-y: auto;
}

.modal-title {
  display: block;
  font-size: 34rpx;
  font-weight: 600;
  text-align: center;
  margin-bottom: 32rpx;
  color: #333;
}

.date-field {
  margin-bottom: 24rpx;
}

.field-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 12rpx;
  font-weight: 500;
}

.date-picker-display {
  padding: 24rpx;
  background: #F8F8F8;
  border-radius: 16rpx;
  font-size: 28rpx;
  color: #666;
}

.field-group {
  margin-bottom: 24rpx;
}

.type-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.type-item {
  padding: 12rpx 24rpx;
  background: #F5F5F5;
  border-radius: 28rpx;
  font-size: 24rpx;
  color: #666;
}

.type-item.active {
  background: #FFE4EC;
  color: #FF6B9D;
}

.textarea {
  width: 100%;
  min-height: 100rpx;
  background: #F8F8F8;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  font-size: 28rpx;
  margin-bottom: 32rpx;
  box-sizing: border-box;
}

.btn-primary {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(135deg, #F48FB1, #FF6B9D);
  border-radius: 44rpx;
  color: #fff;
  font-size: 32rpx;
  border: none;
}
</style>
