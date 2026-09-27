import { BaseServices } from '../BaseService'

export class NewsService extends BaseServices {
    getPublicNews = (params) => this.get('/api/News', { params })

    getPublicNewsById = (id) => this.get(`/api/News/${id}`)

    getPublicNewsBySlug = (slug) => this.get(`/api/News/slug/${slug}`)
}

export const newsService = new NewsService()
