import React from 'react'

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        console.error('Uncaught error:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 p-6 text-center">
                    <h1 className="mb-4 text-3xl font-black text-slate-800">Đã xảy ra lỗi</h1>
                    <p className="mb-8 text-slate-500">Rất xin lỗi vì sự bất tiện này. Vui lòng tải lại trang hoặc liên hệ hỗ trợ.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="rounded-full bg-cyan-600 px-6 py-2.5 font-bold text-white transition-all hover:bg-cyan-700"
                    >
                        Tải lại trang
                    </button>
                </div>
            )
        }

        return this.props.children
    }
}
