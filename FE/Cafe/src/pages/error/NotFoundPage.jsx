import { Link } from 'react-router-dom'
import { CoffeeOutlined } from '@ant-design/icons'

/**
 * NotFoundPage Component
 * Trang hiển thị lỗi 404 khi người dùng truy cập vào một đường dẫn (route) không tồn tại.
 * Thiết kế độc lập không có Header điều hướng, cung cấp nút để quay lại trang chủ.
 */
const NotFoundPage = () => {
    return (
        <div className="flex min-h-screen flex-col justify-between bg-slate-50 font-sans">
            {/* Top spacer */}
            <div className="h-6" />

            {/* Nội dung 404 căn giữa */}
            <div className="flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-lg w-full text-center">
                    <div className="relative mb-8 flex justify-center">
                        <h1 className="text-[120px] sm:text-[150px] font-extrabold text-slate-200 tracking-tighter leading-none select-none">
                            404
                        </h1>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="bg-sky-500 text-white px-5 py-2 text-sm rounded-full shadow-apple uppercase tracking-widest font-semibold">
                                Không tìm thấy trang
                            </span>
                        </div>
                    </div>
                    
                    <h2 className="text-3xl font-bold text-slate-800 mb-4 tracking-tight">
                        Trang không tồn tại
                    </h2>
                    <p className="text-slate-500 text-base sm:text-lg mb-10 leading-relaxed max-w-md mx-auto">
                        Có vẻ như bạn đã truy cập vào một đường dẫn sai hoặc trang này đã bị xóa. 
                        Vui lòng quay lại để tiếp tục.
                    </p>
                    
                    <Link 
                        to="/" 
                        className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-bold rounded-[20px] text-white bg-sky-500 hover:bg-sky-600 transition-all duration-300 shadow-apple hover:shadow-apple-hover hover:-translate-y-0.5 cursor-pointer"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Về Trang Chủ
                    </Link>
                </div>
            </div>

            {/* Footer chân trang */}
            <footer className="border-t border-slate-200 bg-white/80 backdrop-blur-sm py-6 text-center text-sm font-medium text-slate-500">
                <div className="flex items-center justify-center gap-2">
                    <CoffeeOutlined className="text-sky-500 text-lg" />
                    <span>Cafe Shop System © {new Date().getFullYear()} - Designed with <span className="text-sky-500">Apple Style</span> By <span className="text-sky-500">ThanhTùng</span></span>
                </div>
            </footer>
        </div>
    )
}

export default NotFoundPage
