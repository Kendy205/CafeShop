import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { store } from './redux/store'
import { injectStore } from './services/BaseService'

// Inject store vào Axios service layer để chạy đồng bộ và tránh circular dynamic imports
injectStore(store)

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </StrictMode>
)
