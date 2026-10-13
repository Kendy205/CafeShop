import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
    Table, 
    Card, 
    Rate, 
    Switch, 
    Button, 
    Modal, 
    Input, 
    Form, 
    Image, 
    Select,
    Tag,
    Space,
    Avatar
} from 'antd'
import { EyeOutlined, MessageOutlined, CheckCircleOutlined, UserOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { 
    fetchAllFeedbacks, 
    toggleFeedbackVisibility, 
    replyToFeedback 
} from '../../../redux/actions/admin/adminFeedbackAction'

/**
 * AdminFeedbackPage Component
 * Trang quản lý đánh giá (Feedback) của khách hàng.
 * Cho phép Admin xem, ẩn/hiện và trả lời đánh giá của người dùng.
 */
export default function AdminFeedbackPage() {
    const dispatch = useDispatch()
    const { feedbacks, total, page, pageSize, loading, actionLoading } = useSelector(s => s.admin.feedback)

    const [filterRating, setFilterRating] = useState(null)
    const [filterHasImages, setFilterHasImages] = useState(null)
    
    const [isReplyModalVisible, setIsReplyModalVisible] = useState(false)
    const [currentFeedback, setCurrentFeedback] = useState(null)
    const [form] = Form.useForm()

    useEffect(() => {
        loadData(page, pageSize)
    }, [filterRating, filterHasImages])

    const loadData = (p = 1, pSize = 10) => {
        dispatch(fetchAllFeedbacks({
            pageNumber: p,
            pageSize: pSize,
            rating: filterRating,
            hasImages: filterHasImages
        }))
    }

    const handleTableChange = (pagination) => {
        loadData(pagination.current, pagination.pageSize)
    }

    const handleToggleVisibility = (id) => {
        dispatch(toggleFeedbackVisibility(id))
    }

    const handleOpenReplyModal = (record) => {
        setCurrentFeedback(record)
        form.setFieldsValue({
            replyContent: record.adminReply?.replyContent || ''
        })
        setIsReplyModalVisible(true)
    }

    const handleReplySubmit = async (values) => {
        if (!currentFeedback) return
        
        await dispatch(replyToFeedback({ 
            id: currentFeedback.feedbackId, 
            replyContent: values.replyContent 
        })).unwrap()
        
        setIsReplyModalVisible(false)
        form.resetFields()
        loadData(page, pageSize) // Reload to see the new reply
    }

    const columns = [
        {
            title: 'Mã / Đơn',
            key: 'feedbackId',
            width: 110,
            render: (_, record) => (
                <div className="flex flex-col gap-1">
                    <span className="font-black text-slate-800 text-xs">#{record.feedbackId}</span>
                    {record.orderId && (
                        <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100 whitespace-nowrap inline-block w-fit">
                            Đơn #{record.orderId}
                        </span>
                    )}
                </div>
            )
        },
        {
            title: 'Sản phẩm',
            key: 'product',
            width: 240,
            render: (_, record) => (
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-xs flex items-center justify-center">
                        {record.productImage ? (
                            <img src={record.productImage} alt={record.productName} className="h-full w-full object-cover" />
                        ) : (
                            <span className="text-slate-400 text-base">☕</span>
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-sm truncate" title={record.productName}>
                            {record.productName || 'Sản phẩm'}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                            {record.sizeName && (
                                <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/60">
                                    Size {record.sizeName}
                                </span>
                            )}
                            {record.productId && (
                                <span className="text-[10px] text-slate-400 font-medium">
                                    SP #{record.productId}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: 'Khách hàng',
            key: 'customer',
            width: 180,
            render: (_, record) => (
                <div className="flex items-center gap-2.5">
                    <Avatar 
                        src={record.userAvatar} 
                        icon={<UserOutlined />} 
                        className="shrink-0 bg-slate-100 text-slate-400 border border-slate-200 shadow-2xs"
                        size={38}
                    />
                    <div className="min-w-0">
                        <p className="font-semibold text-slate-800 text-xs truncate" title={record.userName}>
                            {record.userName || 'Khách hàng'}
                        </p>
                        {record.userId && (
                            <p className="text-[10px] font-medium text-slate-400">ID: #{record.userId}</p>
                        )}
                    </div>
                </div>
            )
        },
        {
            title: 'Nội dung đánh giá',
            dataIndex: 'comment',
            key: 'comment',
            width: 260,
            render: (text, record) => (
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Rate disabled defaultValue={record.rating} className="text-xs text-amber-400" />
                        <span className="text-xs font-bold text-slate-600">({record.rating}/5)</span>
                    </div>
                    <p className="mb-1 text-sm text-slate-700">
                        {text || <span className="text-slate-400 italic text-xs">(Không có nhận xét bằng chữ)</span>}
                    </p>
                    {record.images && record.images.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap mt-1.5">
                            <Image.PreviewGroup>
                                {record.images.map((img, i) => (
                                    <Image key={i} src={img} width={42} height={42} className="object-cover rounded-lg border border-slate-200 shadow-2xs" />
                                ))}
                            </Image.PreviewGroup>
                        </div>
                    )}
                </div>
            )
        },
        {
            title: 'Thời gian',
            key: 'createdAt',
            width: 140,
            render: (_, record) => (
                <div className="text-xs text-slate-600">
                    <p className="font-medium text-slate-700">{dayjs(record.createdAt).format('DD/MM/YYYY')}</p>
                    <p className="text-slate-400 text-[11px]">{dayjs(record.createdAt).format('HH:mm:ss')}</p>
                    {record.updatedAt && (
                        <span className="text-[10px] text-amber-600 italic block mt-0.5">
                            (Đã sửa: {dayjs(record.updatedAt).format('DD/MM HH:mm')})
                        </span>
                    )}
                </div>
            )
        },
        {
            title: 'Hiển thị',
            key: 'isVisible',
            width: 90,
            align: 'center',
            render: (_, record) => (
                <Switch 
                    checked={record.isVisible} 
                    onChange={() => handleToggleVisibility(record.feedbackId)}
                    loading={actionLoading}
                />
            )
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 130,
            align: 'center',
            render: (_, record) => (
                <div className="flex flex-col items-center gap-1.5">
                    {record.isReplied ? (
                        <Tag color="success" icon={<CheckCircleOutlined />} className="!mr-0">Đã phản hồi</Tag>
                    ) : (
                        <Tag color="warning" icon={<MessageOutlined />} className="!mr-0">Chưa phản hồi</Tag>
                    )}
                    <Button 
                        type="link" 
                        size="small"
                        className="!text-xs !p-0 font-semibold text-sky-600 hover:text-sky-700"
                        onClick={() => handleOpenReplyModal(record)}
                    >
                        {record.isReplied ? 'Sửa phản hồi' : 'Gửi phản hồi'}
                    </Button>
                </div>
            )
        }
    ]

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-800">Quản lý Đánh giá Khách hàng</h2>
            
            <Card bordered={false} className="shadow-sm rounded-xl">
                <div className="flex gap-4 mb-4">
                    <Select 
                        placeholder="Lọc theo sao"
                        allowClear
                        style={{ width: 150 }}
                        onChange={setFilterRating}
                        options={[
                            { value: 5, label: '5 Sao' },
                            { value: 4, label: '4 Sao' },
                            { value: 3, label: '3 Sao' },
                            { value: 2, label: '2 Sao' },
                            { value: 1, label: '1 Sao' },
                        ]}
                    />
                    <Select 
                        placeholder="Có hình ảnh?"
                        allowClear
                        style={{ width: 150 }}
                        onChange={setFilterHasImages}
                        options={[
                            { value: true, label: 'Có ảnh đính kèm' },
                            { value: false, label: 'Không có ảnh' },
                        ]}
                    />
                </div>

                <Table 
                    columns={columns}
                    dataSource={feedbacks}
                    rowKey="feedbackId"
                    loading={loading}
                    pagination={{
                        current: page,
                        pageSize: pageSize,
                        total: total,
                        showSizeChanger: true
                    }}
                    onChange={handleTableChange}
                    scroll={{ x: 'max-content' }}
                />
            </Card>

            <Modal
                title={currentFeedback?.adminReply ? 'Chỉnh sửa phản hồi' : 'Phản hồi đánh giá'}
                open={isReplyModalVisible}
                onCancel={() => setIsReplyModalVisible(false)}
                footer={null}
                destroyOnClose
            >
                {currentFeedback && (
                    <div className="mb-4 p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-2.5">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-white border border-slate-200 flex items-center justify-center">
                                {currentFeedback.productImage ? (
                                    <img src={currentFeedback.productImage} alt={currentFeedback.productName} className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-slate-400 text-sm">☕</span>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="font-bold text-slate-800 text-xs truncate">
                                        {currentFeedback.productName} {currentFeedback.sizeName ? `(Size ${currentFeedback.sizeName})` : ''}
                                    </p>
                                    {currentFeedback.orderId && (
                                        <span className="text-[10px] text-sky-700 font-semibold bg-sky-50 px-1.5 py-0.2 rounded border border-sky-100 shrink-0">
                                            Đơn #{currentFeedback.orderId}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs text-slate-600 font-medium">{currentFeedback.userName}</span>
                                    <Rate disabled defaultValue={currentFeedback.rating} className="text-[10px] text-amber-400" />
                                </div>
                            </div>
                        </div>
                        <div className="pt-2 border-t border-slate-200/60">
                            <p className="text-slate-700 text-xs mb-0">
                                {currentFeedback.comment || <span className="text-slate-400 italic">(Khách hàng không để lại nhận xét bằng chữ)</span>}
                            </p>
                        </div>
                    </div>
                )}
                
                <Form form={form} layout="vertical" onFinish={handleReplySubmit}>
                    <Form.Item 
                        name="replyContent" 
                        label="Nội dung phản hồi của Quán"
                        rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}
                    >
                        <Input.TextArea rows={4} placeholder="Cảm ơn bạn đã ủng hộ quán..." />
                    </Form.Item>
                    
                    <Form.Item className="mb-0 text-right">
                        <Space>
                            <Button onClick={() => setIsReplyModalVisible(false)}>Hủy</Button>
                            <Button type="primary" htmlType="submit" loading={actionLoading}>Gửi phản hồi</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}
