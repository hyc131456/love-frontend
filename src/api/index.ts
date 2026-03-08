import { get, post, put, del } from '@/utils/request'

/**
 * 用户相关接口
 */
export const userApi = {
    // 微信登录
    wxLogin: (code: string) => post('/user/wxLogin', null, {
        url: `/user/wxLogin?code=${code}`
    }),

    // 模拟登录
    mockLogin: (openid: string = 'test_openid') => post(`/user/mockLogin?openid=${openid}`),

    // 用户注册
    register: (username: string, password: string, nickname?: string) =>
        post(`/user/register?username=${username}&password=${password}${nickname ? '&nickname=' + nickname : ''}`),

    // 用户名密码登录
    login: (username: string, password: string) =>
        post(`/user/login?username=${username}&password=${password}`),

    // 获取用户信息
    getProfile: () => get('/user/profile'),

    // 更新用户信息
    updateProfile: (data: any) => put('/user/profile', data)
}

/**
 * 配对相关接口
 */
export const coupleApi = {
    // 创建空间
    create: () => post('/couple/create'),

    // 加入空间
    join: (inviteCode: string) => post('/couple/join', { inviteCode }),

    // 获取空间信息
    getInfo: () => get('/couple/info'),

    // 获取伴侣信息
    getPartner: () => get('/couple/partner'),

    // 刷新邀请码
    refreshCode: () => post('/couple/refreshCode'),

    // 解绑
    unbind: () => post('/couple/unbind')
}

/**
 * 日历事件接口
 */
export const calendarApi = {
    // 获取月事件
    getMonthEvents: (year: number, month: number) =>
        get('/calendar/events', { year, month }),

    // 获取日事件
    getDayEvents: (date: string) =>
        get('/calendar/events/day', { date }),

    // 添加事件
    addEvent: (data: any) => post('/calendar/event', data),

    // 更新事件
    updateEvent: (data: any) => put('/calendar/event', data),

    // 删除事件
    deleteEvent: (id: number) => del(`/calendar/event/${id}`),

    // 完成事项
    completeEvent: (id: number) => post(`/calendar/event/${id}/complete`)
}

/**
 * 日记接口
 */
export const diaryApi = {
    // 获取列表
    getList: (page: number = 1, pageSize: number = 10) =>
        get('/diary/list', { page, pageSize }),

    // 获取详情
    getDetail: (id: number) => get(`/diary/${id}`),

    // 创建日记
    create: (data: any) => post('/diary', data),

    // 更新日记
    update: (data: any) => put('/diary', data),

    // 删除日记
    delete: (id: number) => del(`/diary/${id}`),

    // 点赞
    like: (id: number) => post(`/diary/${id}/like`),

    // 取消点赞
    unlike: (id: number) => del(`/diary/${id}/like`),

    // 评论
    comment: (id: number, content: string) =>
        post(`/diary/${id}/comment?content=${encodeURIComponent(content)}`)
}

/**
 * 心愿接口
 */
export const wishApi = {
    getList: (status?: number) => get('/wish/list', { status }),
    getDetail: (id: number) => get(`/wish/${id}`),
    create: (data: any) => post('/wish', data),
    update: (data: any) => put('/wish', data),
    delete: (id: number) => del(`/wish/${id}`),
    updateStatus: (id: number, status: number) => post(`/wish/${id}/status?status=${status}`)
}

/**
 * 储蓄接口
 */
export const savingApi = {
    getList: () => get('/saving/list'),
    getDetail: (id: number) => get(`/saving/${id}`),
    create: (data: any) => post('/saving', data),
    deposit: (id: number, amount: number, note?: string) =>
        post(`/saving/${id}/deposit?amount=${amount}${note ? '&note=' + note : ''}`),
    complete: (id: number) => post(`/saving/${id}/complete`)
}

/**
 * 成就接口
 */
export const achievementApi = {
    getUnlocked: () => get('/achievement/unlocked'),
    getAll: () => get('/achievement/all'),
    markAsRead: (id: number) => post(`/achievement/${id}/read`)
}

/**
 * 菜谱接口
 */
export const recipeApi = {
    getList: (category?: string, favorite?: boolean) =>
        get('/recipe/list', { category, favorite }),
    getDetail: (id: number) => get(`/recipe/${id}`),
    create: (data: any) => post('/recipe', data),
    update: (data: any) => put('/recipe', data),
    delete: (id: number) => del(`/recipe/${id}`),
    toggleFavorite: (id: number) => post(`/recipe/${id}/favorite`),
    recordTry: (id: number) => post(`/recipe/${id}/try`)
}

/**
 * 上传接口
 */
export const uploadApi = {
    uploadImage: (filePath: string): Promise<{ url: string, name: string }> => {
        return new Promise((resolve, reject) => {
            uni.uploadFile({
                url: '/api/upload/image',
                filePath,
                name: 'file',
                header: {
                    'Authorization': `Bearer ${uni.getStorageSync('token')}`
                },
                success: (res) => {
                    const data = JSON.parse(res.data)
                    if (data.code === 0) {
                        if (data.data.url && data.data.url.startsWith('/uploads/')) {
                            data.data.url = '/api' + data.data.url
                        }
                        resolve(data.data)
                    } else {
                        reject(new Error(data.message))
                    }
                },
                fail: reject
            })
        })
    }
}

/**
 * 姨妈期接口
 */
export const periodApi = {
    getList: () => get('/period/list'),
    predict: () => get('/period/predict')
}

/**
 * 图片库接口
 */
export const galleryApi = {
    getList: (page: number = 1, pageSize: number = 20, year?: number, month?: number) =>
        get('/gallery/list', { page, pageSize, year, month })
}
