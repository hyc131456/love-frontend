import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userApi, coupleApi } from '@/api'

export interface UserInfo {
    id: number
    nickname: string
    avatar: string
    gender: number
    birthday: string
    role: string
    coupleId: number | null
}

export interface CoupleInfo {
    id: number
    inviteCode: string | null
    status: number
    anniversary: string
    daysTogether: number
    intimacyLevel: string
    intimacyProgress: number
    partner: UserInfo | null
}

export const useUserStore = defineStore('user', () => {
    // 状态
    const token = ref<string>('')
    const userInfo = ref<UserInfo | null>(null)
    const coupleInfo = ref<CoupleInfo | null>(null)

    // 计算属性
    const isLoggedIn = computed(() => !!token.value)
    const hasCoupled = computed(() => !!userInfo.value?.coupleId)

    // 设置Token
    function setToken(t: string) {
        token.value = t
        uni.setStorageSync('token', t)
    }

    // 清除登录状态
    function clearAuth() {
        token.value = ''
        userInfo.value = null
        coupleInfo.value = null
        uni.removeStorageSync('token')
        uni.removeStorageSync('userInfo')
    }

    // 获取用户信息
    async function fetchUserInfo() {
        try {
            const data = await userApi.getProfile()
            userInfo.value = data
            uni.setStorageSync('userInfo', data)

            // 如果已配对，获取配对信息
            if (data.coupleId) {
                await fetchCoupleInfo()
            } else {
                coupleInfo.value = null
            }
        } catch (e) {
            console.error('获取用户信息失败', e)
        }
    }

    // 获取配对信息
    async function fetchCoupleInfo() {
        try {
            const data = await coupleApi.getInfo()
            coupleInfo.value = data
        } catch (e) {
            console.error('获取配对信息失败', e)
        }
    }

    // 登录
    async function login(code?: string) {
        try {
            let result
            if (code) {
                result = await userApi.wxLogin(code)
            } else {
                // 开发模式使用模拟登录
                result = await userApi.mockLogin()
            }

            setToken(result.token)
            userInfo.value = result.profile

            if (result.hasCoupled) {
                await fetchCoupleInfo()
            }

            return result
        } catch (e) {
            throw e
        }
    }

    // 退出登录
    function logout() {
        clearAuth()
        uni.reLaunch({ url: '/pages/login/index' })
    }

    return {
        token,
        userInfo,
        coupleInfo,
        isLoggedIn,
        hasCoupled,
        setToken,
        clearAuth,
        fetchUserInfo,
        fetchCoupleInfo,
        login,
        logout
    }
})
