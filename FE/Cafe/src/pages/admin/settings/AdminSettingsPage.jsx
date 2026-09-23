import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import {
    SettingOutlined,
    CheckCircleOutlined,
    BellOutlined,
    ShopOutlined,
    CarOutlined
} from '@ant-design/icons'
import { Switch, message, Spin } from 'antd'
import AdminPageBanner from '../../../components/admin/common/AdminPageBanner'
import { fetchShippingConfig, updateShippingConfig } from '../../../redux/actions/admin/adminShippingConfigAction'

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

export default function AdminSettingsPage() {
    const dispatch = useDispatch()
    const { config, loading, submitting } = useSelector((s) => s.adminShippingConfig)

    useEffect(() => {
        dispatch(fetchShippingConfig())
    }, [dispatch])

    const handleSaveDummy = () => {
        message.success('Đã lưu cấu hình hệ thống (Dummy)!')
    }

    const handleSubmitShipping = async (values) => {
        const res = await dispatch(updateShippingConfig(values))
        if (updateShippingConfig.fulfilled.match(res)) {
            message.success('Cập nhật cấu hình phí ship thành công!')
        } else {
            message.error(res.payload || 'Cập nhật thất bại!')
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

    if (loading && !config) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Spin size="large" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <AdminPageBanner
                badge="Hệ Thống & Cấu Hình"
                title="Cài Đặt Cửa Hàng"
                description="Tùy chỉnh thông tin thương hiệu, trạng thái mở/đóng cửa hàng, và cấu hình phí vận chuyển."
                icon={<SettingOutlined className="text-slate-300 text-xl" />}
            />

            <div className="grid gap-6 md:grid-cols-2">
                {/* Thông tin cửa hàng */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <ShopOutlined className="text-sky-600 text-lg" />
                        <h3 className="text-base font-black text-slate-800">Thông tin thương hiệu</h3>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Tên quán</label>
                        <input
                            type="text"
                            defaultValue="CafeShop Premium & Bakery"
                            className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-800 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Hotline hỗ trợ</label>
                        <input
                            type="text"
                            defaultValue="1900 6868"
                            className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-800 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Địa chỉ trụ sở chính</label>
                        <input
                            type="text"
                            defaultValue="189 Đường Cầu Diễn, Bắc Từ Liêm, Hà Nội"
                            className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-800 outline-none"
                        />
                    </div>
                    <div className="flex justify-end pt-2">
                        <button onClick={handleSaveDummy} className="rounded-2xl bg-slate-100 px-4 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 transition">Lưu (Dummy)</button>
                    </div>
                </div>

                {/* Vận hành & Realtime */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <BellOutlined className="text-amber-500 text-lg" />
                        <h3 className="text-base font-black text-slate-800">Vận hành & Thông báo</h3>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
                        <div>
                            <p className="text-xs font-bold text-slate-800">Mở cửa nhận đơn hàng</p>
                            <p className="text-[11px] text-slate-500">Khách có thể đặt món trực tuyến</p>
                        </div>
                        <Switch defaultChecked className="bg-emerald-500" />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
                        <div>
                            <p className="text-xs font-bold text-slate-800">Âm thanh báo Realtime</p>
                            <p className="text-[11px] text-slate-500">Phát âm thanh chuông khi có đơn mới</p>
                        </div>
                        <Switch defaultChecked className="bg-sky-500" />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
                        <div>
                            <p className="text-xs font-bold text-slate-800">Chế độ bảo trì hệ thống</p>
                            <p className="text-[11px] text-slate-500">Tạm khóa giao diện đặt hàng</p>
                        </div>
                        <Switch className="bg-slate-300" />
                    </div>
                </div>
            </div>

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
                                        className="bg-emerald-500"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-3">
                                {/* Cột 1: Phí cơ bản & Ngưỡng */}
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

                                {/* Cột 2: Phụ phí giờ cao điểm & cuối tuần */}
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

                                {/* Cột 3: Phụ phí giờ đêm */}
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
                                    disabled={submitting}
                                    className="flex items-center gap-2 rounded-2xl bg-sky-600 hover:bg-sky-700 px-6 py-2.5 text-xs font-black text-white shadow-md shadow-sky-600/30 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                                >
                                    {submitting ? <Spin size="small" /> : <CheckCircleOutlined />}
                                    <span>Lưu Cấu Hình Giao Hàng</span>
                                </button>
                            </div>
                        </Form>
                    )}
            </Formik>
        </div>
    )
}
