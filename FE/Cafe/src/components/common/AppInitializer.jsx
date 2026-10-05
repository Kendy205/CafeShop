import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { fetchStoreProfile } from '../../redux/slices/storeProfileSlice'

export default function AppInitializer() {
    const dispatch = useDispatch()

    useEffect(() => {
        // Tải cấu hình cửa hàng (Public API, dùng chung cho toàn bộ App)
        dispatch(fetchStoreProfile())
        
        // Nếu sau này có các API khởi tạo chung nào khác không phụ thuộc vào Auth
        // (ví dụ: getCategories public, v.v...) thì có thể thêm vào đây.
    }, [dispatch])

    return null
}
