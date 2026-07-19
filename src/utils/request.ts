/**
 * API配置
 */

// H5 通过同源反向代理访问；原生 App 必须使用完整 HTTPS 地址。
export let API_ORIGIN = ''
export let API_BASE_URL = '/api'
// #ifndef H5
API_ORIGIN = 'https://rachel.4inlove.top'
API_BASE_URL = `${API_ORIGIN}/api`
// #endif

export const resolveAssetUrl = (value: string): string => {
    if (!value || /^https?:\/\//i.test(value) || value.startsWith('data:')) return value
    if (value.startsWith('/api/uploads/')) return `${API_ORIGIN}${value}`
    if (value.startsWith('/uploads/')) return `${API_BASE_URL}${value}`
    return value
}

const normalizeAssetUrls = <T>(value: T): T => {
    if (typeof value === 'string') return resolveAssetUrl(value) as T
    if (Array.isArray(value)) return value.map(item => normalizeAssetUrls(item)) as T
    if (value && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value).map(([key, item]) => [key, normalizeAssetUrls(item)])
        ) as T
    }
    return value
}

// 请求超时时间
const TIMEOUT = 10000

export interface RequestOptions {
    url: string
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    data?: any
    header?: Record<string, string>
    showLoading?: boolean
    showError?: boolean
}

export interface ApiResponse<T = any> {
    code: number
    message: string
    data: T
    timestamp: number
}

/**
 * 封装请求
 */
export const request = <T = any>(options: RequestOptions): Promise<T> => {
    let { url, method = 'GET', data, header = {}, showLoading = true, showError = true } = options

    // 清理 data 中的 undefined（防止 uni.request 把 undefined 序列化成字符串发给后端）
    if (data && typeof data === 'object' && !Array.isArray(data)) {
        const cleanData: any = {}
        Object.keys(data).forEach(key => {
            if (data[key] !== undefined && data[key] !== '') {
                cleanData[key] = data[key]
            }
        })
        data = cleanData
    }

    // 获取token
    const token = uni.getStorageSync('token')
    if (token) {
        header['Authorization'] = `Bearer ${token}`
    }

    header['Content-Type'] = header['Content-Type'] || 'application/json'

    if (showLoading) {
        uni.showLoading({ title: '加载中...', mask: true })
    }

    return new Promise((resolve, reject) => {
        uni.request({
            url: API_BASE_URL + url,
            method,
            data,
            header,
            timeout: TIMEOUT,
            success: (res) => {
                if (showLoading) {
                    uni.hideLoading()
                }

                const response = res.data as ApiResponse<T>

                if (response.code === 0) {
                    resolve(normalizeAssetUrls(response.data))
                } else if (response.code === 1002) {
                    // 未登录
                    uni.removeStorageSync('token')
                    uni.removeStorageSync('userInfo')
                    uni.reLaunch({ url: '/pages/login/index' })
                    reject(new Error(response.message))
                } else if (response.code === 3004) {
                    // 未配对：静默处理，不弹窗（由页面逻辑自行决定如何展示占位 UI）
                    console.warn('API NOT_COUPLED (3004):', url)
                    reject(new Error(response.message))
                } else {
                    if (showError) {
                        uni.showToast({ title: response.message, icon: 'none' })
                    }
                    reject(new Error(response.message))
                }
            },
            fail: (err) => {
                if (showLoading) {
                    uni.hideLoading()
                }
                if (showError) {
                    uni.showToast({ title: '网络错误', icon: 'none' })
                }
                reject(err)
            }
        })
    })
}

// 快捷方法
export const get = <T = any>(url: string, data?: any, options?: Partial<RequestOptions>) => {
    return request<T>({ url, method: 'GET', data, ...options })
}

export const post = <T = any>(url: string, data?: any, options?: Partial<RequestOptions>) => {
    return request<T>({ url, method: 'POST', data, ...options })
}

export const put = <T = any>(url: string, data?: any, options?: Partial<RequestOptions>) => {
    return request<T>({ url, method: 'PUT', data, ...options })
}

export const del = <T = any>(url: string, data?: any, options?: Partial<RequestOptions>) => {
    return request<T>({ url, method: 'DELETE', data, ...options })
}
