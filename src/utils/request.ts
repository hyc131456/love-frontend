/**
 * API配置
 */

// 后端接口地址
const BASE_URL = '/api'

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
            url: BASE_URL + url,
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
                    resolve(response.data)
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
