import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import {
    ShopOutlined,
    BellOutlined,
    CarOutlined,
    CheckCircleOutlined
} from '@ant-design/icons'
import { Switch, Spin } from 'antd'
import { fetchShippingConfig, updateShippingConfig } from '../../../redux/actions/admin/adminShippingConfigAction'
import { AppToast } from '../../../components/common/AppNotification'
import MapboxLocationPicker from '../../../components/map/MapboxLocationPicker'
import { Modal } from 'antd'
import { updateStoreProfileAsync } from '../../../redux/slices/storeProfileSlice'


const shippingSchema = Yup.object().shape({
    baseFee: Yup.number().min(0, 'Phí gốc không được âm').required('Vui lòng nhập phí gốc'),
    baseDistanceKm: Yup.number().min(0, 'Khoảng cách không được âm').required('Vui lòng nhập khoảng cách gốc'),
    extraFeePerKm: Yup.number().min(0, 'Phí thêm không được âm').required('Vui lòng nhập phụ phí mỗi Km'),
    maxDistanceKm: Yup.number().min(0, 'Khoảng cách tối đa không được âm').required('Vui lòng nhập khoảng cách tối đa'),
    freeShippingThreshold: Yup.number().min(0, 'Ngưỡng miễn phí không được âm').required('Vui lòng nhập ngưỡng freeship'),
    nightSurcharge: Yup.number().min(0, 'Phụ phí không được âm'),
    nightHourStart: Yup.number().min(0, 'Giờ không hợp lệ').max(23, 'Giờ không hợp lệ'),
    nightHourEnd: Yup.number().min(0, 'Giờ không hợp lệ').max(23, 'Giờ không hợp lệ'),
    peakHourSurcharge: Yup.number().min(0, 'Phụ phí không được âm'),
    peakHourStart: Yup.number().min(0, 'Giờ không hợp lệ').max(23, 'Giờ không hợp lệ'),
    peakHourEnd: Yup.number().min(0, 'Giờ không hợp lệ').max(23, 'Giờ không hợp lệ'),
    weekendSurcharge: Yup.number().min(0, 'Phụ phí không được âm'),
})

const storeProfileSchema = Yup.object().shape({
    storeName: Yup.string().max(255, 'Tên quán tối đa 255 ký tự').required('Tên quán không được để trống'),
    hotline: Yup.string().max(50, 'Hotline tối đa 50 ký tự'),
    fullAddress: Yup.string().max(500, 'Địa chỉ tối đa 500 ký tự'),
    latitude: Yup.number().typeError('Vĩ độ (Latitude) phải là số').required('Bắt buộc nhập Vĩ độ'),
    longitude: Yup.number().typeError('Kinh độ (Longitude) phải là số').required('Bắt buộc nhập Kinh độ'),
})

export default function GeneralSettingsTab() {
    const dispatch = useDispatch()
    const { config, loading: shippingLoading, submitting: shippingSubmitting } = useSelector((s) => s.admin.shippingConfig)
    const { profile: storeProfile, loading: profileLoading, submitting: profileSubmitting } = useSelector((s) => s.app.storeProfile || s.storeProfile || {})
    const [showMapModal, setShowMapModal] = useState(false)

    useEffect(() => {
        dispatch(fetchShippingConfig())
    }, [dispatch])

    const handleSubmitStoreProfile = async (values) => {
        const res = await dispatch(updateStoreProfileAsync(values))
        if (updateStoreProfileAsync.fulfilled.match(res)) {
            AppToast.success('Cập nhật cấu hình cửa hàng thành công!')
        }
    }

    const handleSubmitShipping = async (values) => {
        const res = await dispatch(updateShippingConfig(values))
        if (updateShippingConfig.fulfilled.match(res)) {
            AppToast.success('Cập nhật cấu hình phí ship thành công!')
        }
    }

    const defaultConfig = {
        baseFee: 0,
        baseDistanceKm: 0,
        extraFeePerKm: 0,
        maxDistanceKm: 0,
        isFreeShippingEnabled: false,
        freeShippingThreshold: 0,
        nightSurcharge: 0,
        nightHourStart: 0,
        nightHourEnd: 0,
        peakHourSurcharge: 0,
        peakHourStart: 0,
        peakHourEnd: 0,
        weekendSurcharge: 0
    }

    const currentConfig = config || defaultConfig

    const defaultProfile = {
        storeName: '', hotline: '', fullAddress: '', latitude: 0, longitude: 0,
        isAcceptingOrders: true, isRealtimeNotificationEnabled: true, isMaintenanceMode: false
    }
    const currentProfile = storeProfile || defaultProfile

    if ((shippingLoading && !config) || (profileLoading && !storeProfile)) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Spin size="large" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Formik
                initialValues={currentProfile}
                validationSchema={storeProfileSchema}
                onSubmit={handleSubmitStoreProfile}
                enableReinitialize
            >
                {({ values, setFieldValue, errors, touched }) => (
                    <Form className="grid gap-6 md:grid-cols-2">
                        {/* Thông tin cửa hàng */}
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                                <ShopOutlined className="text-sky-600 text-lg" />
                                <h3 className="text-base font-black text-slate-800">Thông tin thương hiệu</h3>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Tên quán *</label>
                                <Field name="storeName" className={`mt-1 w-full rounded-2xl border bg-slate-50 px-4 py-2 text-xs font-bold text-slate-800 outline-none ${errors.storeName && touched.storeName ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-sky-500'}`} />
                                {errors.storeName && touched.storeName && <p className="mt-1 text-[10px] text-red-500">{errors.storeName}</p>}
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Hotline hỗ trợ</label>
                                <Field name="hotline" className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-800 outline-none focus:border-sky-500" />
                            </div>
                            <div className="flex gap-2 items-end">
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Địa chỉ trụ sở chính</label>
                                    <Field name="fullAddress" className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-800 outline-none focus:border-sky-500" />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowMapModal(true)}
                                    className="h-9 px-4 rounded-xl bg-sky-50 text-sky-600 border border-sky-200 hover:bg-sky-100 font-bold text-xs transition-colors flex items-center gap-2"
                                >
                                    📍 Tìm trên Map
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Vĩ độ (Latitude)</label>
                                    <Field name="latitude" type="number" step="any" className={`mt-1 w-full rounded-2xl border bg-slate-50 px-4 py-2 text-xs font-mono font-bold text-slate-800 outline-none focus:border-sky-500`} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Kinh độ (Longitude)</label>
                                    <Field name="longitude" type="number" step="any" className={`mt-1 w-full rounded-2xl border bg-slate-50 px-4 py-2 text-xs font-mono font-bold text-slate-800 outline-none focus:border-sky-500`} />
                                </div>
                            </div>

                            <Modal
                                title={<span className="font-black text-slate-800 text-lg">📍 Chọn vị trí cửa hàng</span>}
                                open={showMapModal}
                                onCancel={() => setShowMapModal(false)}
                                footer={null}
                                width={600}
                                centered
                                destroyOnClose
                                closeIcon={<div className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500">✕</div>}
                            >
                                <div className="pt-4">
                                    <MapboxLocationPicker
                                        initialAddress={values.fullAddress}
                                        initialLat={values.latitude || 21.0285}
                                        initialLng={values.longitude || 105.8542}
                                        onLocationSelected={({ address, lat, lng }) => {
                                            setFieldValue('fullAddress', address)
                                            setFieldValue('latitude', lat)
                                            setFieldValue('longitude', lng)
                                            setShowMapModal(false)
                                            AppToast.success('Đã cập nhật tọa độ từ bản đồ!')
                                        }}
                                    />
                                </div>
                            </Modal>
                        </div>

                        {/* Vận hành & Realtime */}
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col h-full">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                                <BellOutlined className="text-amber-500 text-lg" />
                                <h3 className="text-base font-black text-slate-800">Vận hành & Thông báo</h3>
                            </div>
                            <div className="space-y-4 flex-1">
                                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
                                    <div>
                                        <p className="text-xs font-bold text-slate-800">Mở cửa nhận đơn hàng</p>
                                        <p className="text-[11px] text-slate-500">Khách có thể đặt món trực tuyến</p>
                                    </div>
                                    <Switch checked={values.isAcceptingOrders} onChange={v => setFieldValue('isAcceptingOrders', v)} className="custom-admin-switch bg-emerald-500" />
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
                                    <div>
                                        <p className="text-xs font-bold text-slate-800">Âm thanh báo Realtime</p>
                                        <p className="text-[11px] text-slate-500">Phát âm thanh chuông khi có đơn mới</p>
                                    </div>
                                    <Switch checked={values.isRealtimeNotificationEnabled} onChange={v => setFieldValue('isRealtimeNotificationEnabled', v)} className="custom-admin-switch bg-sky-500" />
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border-l-4 border-red-400">
                                    <div>
                                        <p className="text-xs font-bold text-red-600">Chế độ bảo trì hệ thống</p>
                                        <p className="text-[11px] text-slate-500">Tạm khóa toàn bộ chức năng khách</p>
                                    </div>
                                    <Switch checked={values.isMaintenanceMode} onChange={v => setFieldValue('isMaintenanceMode', v)} className="custom-admin-switch bg-slate-300" />
                                </div>
                            </div>
                            <div className="flex justify-end pt-4 mt-auto border-t border-slate-100">
                                <button type="submit" disabled={profileSubmitting} className="flex items-center gap-2 rounded-2xl bg-sky-600 hover:bg-sky-700 px-6 py-2 text-xs font-black text-white shadow-md shadow-sky-600/30 transition-all cursor-pointer active:scale-95 disabled:opacity-50">
                                    {profileSubmitting ? <Spin size="small" /> : <CheckCircleOutlined />}
                                    <span>Lưu Cấu Hình Cửa Hàng</span>
                                </button>
                            </div>
                        </div>
                    </Form>
                )}
            </Formik>

            {/* Khối Cấu hình phí vận chuyển (Shipping Config) */}
            <Formik
                initialValues={currentConfig}
                validationSchema={shippingSchema}
                onSubmit={handleSubmitShipping}
                enableReinitialize
            >
                {({ values, setFieldValue, errors, touched }) => (
                    <Form className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-2">
                                <CarOutlined className="text-emerald-500 text-xl" />
                                <h3 className="text-base font-black text-slate-800">Cấu hình phí vận chuyển</h3>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-slate-600">Trạng thái Freeship</span>
                                <Switch
                                    checked={values.isFreeShippingEnabled}
                                    onChange={(val) => setFieldValue('isFreeShippingEnabled', val)}
                                    className="custom-admin-switch bg-emerald-500"
                                />
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            <div className="space-y-4">
                                <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider mb-2">Thông số cơ bản</h4>
                                <div>
                                    <label className="text-[11px] font-bold text-slate-500 uppercase">Phí ship gốc (đ)</label>
                                    <Field type="number" name="baseFee" className="custom-admin-input font-mono mt-1" />
                                    {touched.baseFee && errors.baseFee && <p className="mt-1 text-[10px] font-medium text-red-500">{errors.baseFee}</p>}
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-slate-500 uppercase">Bán kính gốc (Km)</label>
                                    <Field type="number" name="baseDistanceKm" step="0.1" className="custom-admin-input font-mono mt-1" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-slate-500 uppercase">Phụ phí / Km tiếp theo (đ)</label>
                                    <Field type="number" name="extraFeePerKm" className="custom-admin-input font-mono mt-1" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-slate-500 uppercase">Bán kính giao tối đa (Km)</label>
                                    <Field type="number" name="maxDistanceKm" step="0.1" className="custom-admin-input font-mono mt-1" />
                                </div>
                                {values.isFreeShippingEnabled && (
                                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                                        <label className="text-[11px] font-bold text-emerald-700 uppercase">Ngưỡng Freeship (đ)</label>
                                        <Field type="number" name="freeShippingThreshold" className="w-full rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-mono outline-none mt-1" />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider mb-2">Phụ phí Khác</h4>
                                <div>
                                    <label className="text-[11px] font-bold text-slate-500 uppercase">Cuối tuần (T7, CN) (đ)</label>
                                    <Field type="number" name="weekendSurcharge" className="custom-admin-input font-mono mt-1" />
                                </div>
                                <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-3 space-y-3">
                                    <label className="text-[11px] font-bold text-orange-700 uppercase">Giờ cao điểm</label>
                                    <div>
                                        <label className="text-[10px] text-slate-500">Phụ phí (đ)</label>
                                        <Field type="number" name="peakHourSurcharge" className="w-full rounded-lg border border-orange-200 px-3 py-1.5 text-xs font-mono outline-none" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] text-slate-500">Giờ BĐ (0-23)</label>
                                            <Field type="number" name="peakHourStart" className="w-full rounded-lg border border-orange-200 px-3 py-1.5 text-xs font-mono outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-slate-500">Giờ KT (0-23)</label>
                                            <Field type="number" name="peakHourEnd" className="w-full rounded-lg border border-orange-200 px-3 py-1.5 text-xs font-mono outline-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider mb-2">&nbsp;</h4>
                                <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-3 space-y-3">
                                    <label className="text-[11px] font-bold text-indigo-700 uppercase">Giờ đêm</label>
                                    <div>
                                        <label className="text-[10px] text-slate-500">Phụ phí (đ)</label>
                                        <Field type="number" name="nightSurcharge" className="w-full rounded-lg border border-indigo-200 px-3 py-1.5 text-xs font-mono outline-none" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] text-slate-500">Giờ BĐ (0-23)</label>
                                            <Field type="number" name="nightHourStart" className="w-full rounded-lg border border-indigo-200 px-3 py-1.5 text-xs font-mono outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-slate-500">Giờ KT (0-23)</label>
                                            <Field type="number" name="nightHourEnd" className="w-full rounded-lg border border-indigo-200 px-3 py-1.5 text-xs font-mono outline-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-slate-100">
                            <button
                                type="submit"
                                disabled={shippingSubmitting}
                                className="flex items-center gap-2 rounded-2xl bg-sky-600 hover:bg-sky-700 px-6 py-2.5 text-xs font-black text-white shadow-md shadow-sky-600/30 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                            >
                                {shippingSubmitting ? <Spin size="small" /> : <CheckCircleOutlined />}
                                <span>Lưu Cấu Hình Giao Hàng</span>
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    )
}
