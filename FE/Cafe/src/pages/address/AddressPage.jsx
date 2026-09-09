import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import {
    createAddress,
    deleteAddress,
    getAddresses,
    setDefaultAddress,
    updateAddress,
} from '../../redux/actions/user/addressAction'

const schema = Yup.object({
    recipientName: Yup.string().required('Vui lòng nhập tên người nhận'),
    phone: Yup.string()
        .matches(/^(0|\+84)\d{9,10}$/, 'Số điện thoại không hợp lệ')
        .required('Vui lòng nhập số điện thoại'),
    fullAddress: Yup.string().required('Vui lòng nhập địa chỉ'),
    isDefault: Yup.boolean(),
})

export default function AddressPage() {
    const dispatch = useDispatch()
    const { items, loading, error, submitting } = useSelector((s) => s.address)
    const [editing, setEditing] = useState(null)

    useEffect(() => {
        dispatch(getAddresses())
    }, [dispatch])

    const reload = () => dispatch(getAddresses())

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <div>
                <h1 className="mb-4 text-2xl font-semibold">Sổ địa chỉ</h1>
                {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
                {loading ? (
                    <p className="text-stone-500">Đang tải...</p>
                ) : (
                    <div className="space-y-3">
                        {items.map((a) => (
                            <div key={a.addressId} className="rounded-2xl border border-stone-100 bg-white p-4">
                                <p className="font-medium">
                                    {a.recipientName} · {a.phone}
                                    {a.isDefault && (
                                        <span className="ml-2 text-xs text-amber-800">Mặc định</span>
                                    )}
                                </p>
                                <p className="text-sm text-stone-500">{a.fullAddress}</p>
                                <div className="mt-3 flex gap-3 text-sm">
                                    <button type="button" onClick={() => setEditing(a)} className="text-amber-800">
                                        Sửa
                                    </button>
                                    {!a.isDefault && (
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                await dispatch(setDefaultAddress(a.addressId))
                                                reload()
                                            }}
                                        >
                                            Đặt mặc định
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        className="text-red-600"
                                        onClick={async () => {
                                            await dispatch(deleteAddress(a.addressId))
                                            reload()
                                        }}
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        ))}
                        {items.length === 0 && <p className="text-stone-500">Chưa có địa chỉ.</p>}
                    </div>
                )}
            </div>

            <div className="rounded-2xl bg-white p-5">
                <h2 className="mb-4 font-medium">{editing ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ'}</h2>
                <Formik
                    enableReinitialize
                    initialValues={{
                        recipientName: editing?.recipientName || '',
                        phone: editing?.phone || '',
                        fullAddress: editing?.fullAddress || '',
                        isDefault: editing?.isDefault || false,
                    }}
                    validationSchema={schema}
                    onSubmit={async (values, { resetForm }) => {
                        if (editing) {
                            await dispatch(updateAddress({ id: editing.addressId, body: values }))
                        } else {
                            await dispatch(createAddress(values))
                        }
                        resetForm()
                        setEditing(null)
                        reload()
                    }}
                >
                    {({ values, setFieldValue }) => (
                        <Form className="space-y-3">
                            <div>
                                <label className="mb-1 block text-sm">Người nhận</label>
                                <Field name="recipientName" className="w-full rounded-xl border px-3 py-2" />
                                <ErrorMessage name="recipientName" component="p" className="text-xs text-red-600" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm">Điện thoại</label>
                                <Field name="phone" className="w-full rounded-xl border px-3 py-2" />
                                <ErrorMessage name="phone" component="p" className="text-xs text-red-600" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm">Địa chỉ đầy đủ</label>
                                <Field
                                    as="textarea"
                                    name="fullAddress"
                                    className="w-full rounded-xl border px-3 py-2"
                                    rows={3}
                                />
                                <ErrorMessage name="fullAddress" component="p" className="text-xs text-red-600" />
                            </div>
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={values.isDefault}
                                    onChange={(e) => setFieldValue('isDefault', e.target.checked)}
                                />
                                Đặt làm mặc định
                            </label>
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="rounded-xl bg-amber-800 px-4 py-2 text-white"
                                >
                                    {editing ? 'Lưu' : 'Thêm'}
                                </button>
                                {editing && (
                                    <button type="button" onClick={() => setEditing(null)}>
                                        Hủy
                                    </button>
                                )}
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    )
}
