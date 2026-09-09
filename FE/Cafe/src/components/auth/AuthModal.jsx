import { useState } from 'react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

export default function AuthModal({ open, onClose, initialTab = 'login' }) {
    const [tab, setTab] = useState(initialTab)

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex gap-2">
                        <button
                            type="button"
                            className={`rounded-lg px-3 py-1 text-sm ${tab === 'login' ? 'bg-amber-800 text-white' : 'bg-stone-100'}`}
                            onClick={() => setTab('login')}
                        >
                            Đăng nhập
                        </button>
                        <button
                            type="button"
                            className={`rounded-lg px-3 py-1 text-sm ${tab === 'register' ? 'bg-amber-800 text-white' : 'bg-stone-100'}`}
                            onClick={() => setTab('register')}
                        >
                            Đăng ký
                        </button>
                    </div>
                    <button type="button" onClick={onClose} className="text-stone-500">
                        Đóng
                    </button>
                </div>
                {tab === 'login' ? <LoginForm /> : <RegisterForm />}
            </div>
        </div>
    )
}
