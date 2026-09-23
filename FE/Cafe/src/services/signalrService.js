import * as signalR from '@microsoft/signalr'
import { DOMAIN, TOKEN } from '../utils/constants/System'

// ── Web Audio API: Shared AudioContext để phát chuông ding-dong nhẹ nhàng ───
let sharedAudioContext = null

function getAudioContext() {
    if (!sharedAudioContext) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext
        if (AudioCtx) {
            sharedAudioContext = new AudioCtx()
        }
    }
    return sharedAudioContext
}

export function playNotificationSound() {
    try {
        const ctx = getAudioContext()
        if (!ctx) return

        if (ctx.state === 'suspended') {
            ctx.resume().catch(() => {})
        }

        const now = ctx.currentTime

        // Note 1 (E5 - 659.25Hz)
        const osc1 = ctx.createOscillator()
        const gain1 = ctx.createGain()
        osc1.type = 'sine'
        osc1.frequency.setValueAtTime(659.25, now)
        gain1.gain.setValueAtTime(0.12, now)
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25)
        osc1.connect(gain1)
        gain1.connect(ctx.destination)
        osc1.start(now)
        osc1.stop(now + 0.25)

        // Note 2 (A5 - 880Hz)
        const osc2 = ctx.createOscillator()
        const gain2 = ctx.createGain()
        osc2.type = 'sine'
        osc2.frequency.setValueAtTime(880, now + 0.12)
        gain2.gain.setValueAtTime(0.15, now + 0.12)
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45)
        osc2.connect(gain2)
        gain2.connect(ctx.destination)
        osc2.start(now + 0.12)
        osc2.stop(now + 0.45)
    } catch {
        // Trình duyệt chặn âm thanh nếu chưa có tương tác người dùng
    }
}

// ── SignalR Singleton Service ───────────────────────────────────────────────
class SignalRService {
    constructor() {
        this.connection = null
        this.startPromise = null
        this.adminCallbacks = new Set()
        this.userCallbacks = new Set()
        this.reconnectedCallbacks = new Set()

        this.initConnection()
    }

    initConnection() {
        const baseUrl = (DOMAIN || window.location.origin).replace(/\/+$/, '')
        const hubUrl = `${baseUrl}/hubs/notification`

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl, {
                // Đọc token bên trong factory để auto-reconnect luôn lấy token mới nhất
                accessTokenFactory: () => {
                    const token =
                        localStorage.getItem(TOKEN) ||
                        localStorage.getItem('token') ||
                        localStorage.getItem('accessToken') ||
                        ''
                    return token.replace(/^Bearer\s+/i, '').trim()
                },
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build()

        // Đăng ký lắng nghe sự kiện dành cho Admin
        const adminEvents = ['ReceiveAdminNotification', 'NewOrder', 'ReceiveOrderNotification']
        adminEvents.forEach((evt) => {
            this.connection.on(evt, (data) => {
                console.log(`[SignalR Hub] Admin event (${evt}) received:`, data)
                this.adminCallbacks.forEach((cb) => {
                    try {
                        cb(data)
                    } catch (err) {
                        console.error('Error in admin notification callback:', err)
                    }
                })
            })
        })

        // Đăng ký lắng nghe sự kiện dành cho User
        const userEvents = ['ReceiveUserNotification', 'ReceiveNotification', 'OrderStatusChanged', 'ReceiveOrderNotification', 'OrderUpdated']
        userEvents.forEach((evt) => {
            this.connection.on(evt, (data) => {
                console.log(`[SignalR Hub] User event (${evt}) received:`, data)
                this.userCallbacks.forEach((cb) => {
                    try {
                        cb(data)
                    } catch (err) {
                        console.error('Error in user notification callback:', err)
                    }
                })
            })
        })

        this.connection.onreconnected((connectionId) => {
            console.log('SignalR reconnected successfully. ConnectionId:', connectionId)
            this.reconnectedCallbacks.forEach((cb) => {
                try {
                    cb(connectionId)
                } catch (err) {
                    console.error('Error in reconnected callback:', err)
                }
            })
        })
    }

    async startConnection() {
        const token =
            localStorage.getItem(TOKEN) ||
            localStorage.getItem('token') ||
            localStorage.getItem('accessToken')
        if (!token) {
            return
        }

        // Tránh start trùng lặp hoặc xung đột do React StrictMode
        if (this.startPromise) {
            return this.startPromise
        }

        if (this.connection.state !== signalR.HubConnectionState.Disconnected) {
            return
        }

        this.startPromise = this.connection
            .start()
            .then(() => {
                console.log('Connected to SignalR Hub!')
            })
            .catch((err) => {
                console.error('Error while starting SignalR connection:', err)
            })
            .finally(() => {
                this.startPromise = null
            })

        return this.startPromise
    }

    async stopConnection() {
        if (this.startPromise) {
            try {
                await this.startPromise
            } catch {
                // Im lặng bắt lỗi nếu startPromise thất bại
            }
        }

        if (this.connection && this.connection.state !== signalR.HubConnectionState.Disconnected) {
            try {
                await this.connection.stop()
                console.log('SignalR connection stopped.')
            } catch (err) {
                console.error('Error while stopping SignalR connection:', err)
            } finally {
                this.startPromise = null
            }
        }
    }

    onAdminNotification(callback) {
        this.adminCallbacks.add(callback)
        return () => {
            this.adminCallbacks.delete(callback)
        }
    }

    onUserNotification(callback) {
        this.userCallbacks.add(callback)
        return () => {
            this.userCallbacks.delete(callback)
        }
    }

    onReconnected(callback) {
        this.reconnectedCallbacks.add(callback)
        return () => {
            this.reconnectedCallbacks.delete(callback)
        }
    }
}

const signalRService = new SignalRService()
export default signalRService
