import { BaseServices } from '../BaseService'

export class NewsService extends BaseServices {
    // GET /api/News?keyword=...&page=1&pageSize=10
    getPublicNews = (params) => this.get('/api/News', { params })

    // GET /api/News/latest?take=5
    getLatestNews = (take = 5) => this.get('/api/News/latest', { params: { take } })

    // GET /api/News/{slug}
    getPublicNewsBySlug = (slug) => this.get(`/api/News/${slug}`)

    // POST /api/News/{id}/view — No body, returns 204
    incrementView = (id) => this.post(`/api/News/${id}/view`)
}

export const newsService = new NewsService()
