/**
 * Entry Point (main.jsx)
 * Điểm khởi chạy của ứng dụng React. 
 * Khởi tạo Redux Store injection cho Axios interceptors, bọc ErrorBoundary để bắt lỗi giao diện, 
 * và gắn kết React tree vào DOM.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { store } from './redux/store'
import { injectStore } from './services/BaseService'
import ErrorBoundary from './components/error/ErrorBoundary'

// Inject store vào Axios service layer để chạy đồng bộ và tránh circular dynamic imports
injectStore(store)

createRoot(document.getElementById('root')).render(
    <ErrorBoundary>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </ErrorBoundary>
)
