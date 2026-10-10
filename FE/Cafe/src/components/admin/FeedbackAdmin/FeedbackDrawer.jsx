import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Modal, Rate, Image, Tag, Button, Form, Input, Space } from 'antd'
import dayjs from 'dayjs'
import { fetchAllFeedbacks, replyToFeedback } from '../../../redux/actions/admin/adminFeedbackAction'
import { CheckCircleOutlined, MessageOutlined, EditOutlined } from '@ant-design/icons'
import AdminTable from '../common/AdminTable'

export default function FeedbackDrawer({ productId, open, onClose }) {
    const dispatch = useDispatch()
    const { feedbacks, total, page, pageSize, loading, actionLoading } = useSelector(s => s.admin.feedback)

    const [isReplyModalVisible, setIsReplyModalVisible] = useState(false)
    const [currentFeedback, setCurrentFeedback] = useState(null)
    const [form] = Form.useForm()

    useEffect(() => {
        if (open && productId) {
            loadData(1, 10)
        }
    }, [open, productId, dispatch])

    const loadData = (p = 1, pSize = 10) => {
        dispatch(fetchAllFeedbacks({ productId, pageNumber: p, pageSize: pSize }))
    }

    const handleTableChange = (pagination) => {
        loadData(pagination, pageSize)
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
        loadData(page, pageSize) // Reload current page
    }

    const columns = [
        {
            title: 'Khách hàng',
            dataIndex: 'userName',
            key: 'userName',
            width: 120,
        },
        {
            title: 'Size',
            dataIndex: 'sizeName',
            key: 'sizeName',
            width: 80,
            render: (text) => <span className="font-semibold text-slate-700">{text || 'N/A'}</span>
        },
        {
            title: 'Đánh giá',
            dataIndex: 'rating',
            key: 'rating',
            width: 130,
            render: (rating) => <Rate disabled defaultValue={rating} className="text-xs text-amber-400" />
        },
        {
            title: 'Nội dung',
            dataIndex: 'comment',
            key: 'comment',
            width: 250,
            render: (text, record) => (
                <div>
                    <p className="mb-1 text-sm text-slate-600">{text || <span className="text-slate-400 italic">Không có bình luận</span>}</p>
                    {record.images && record.images.length > 0 && (
                        <div className="flex gap-1 flex-wrap mt-1">
                            <Image.PreviewGroup>
                                {record.images.map((img, i) => (
                                    <Image key={i} src={img} width={40} height={40} className="object-cover rounded-lg shadow-sm border border-slate-200" />
                                ))}
                            </Image.PreviewGroup>
                        </div>
                    )}
                </div>
            )
        },
        {
            title: 'Ngày ĐG',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 120,
            render: (date) => <span className="text-xs text-slate-500 font-medium">{dayjs(date).format('DD/MM/YYYY HH:mm')}</span>
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: 130,
            render: (_, record) => (
                record.isReplied ? 
                <Tag color="success" icon={<CheckCircleOutlined />} className="rounded-full px-2 font-medium">Đã trả lời</Tag> : 
                <Tag color="warning" icon={<MessageOutlined />} className="rounded-full px-2 font-medium">Chờ phản hồi</Tag>
            )
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 100,
            align: 'center',
            render: (_, record) => (
                <Button 
                    type="primary" 
                    ghost={!record.isReplied}
                    icon={record.isReplied ? <EditOutlined /> : <MessageOutlined />}
                    size="small"
                    className={record.isReplied ? 'bg-sky-50 text-sky-600 border-sky-200 hover:bg-sky-100 hover:text-sky-700 font-medium rounded-lg' : 'font-medium rounded-lg'}
                    onClick={() => handleOpenReplyModal(record)}
                >
                    {record.isReplied ? 'Sửa' : 'Reply'}
                </Button>
            )
        }
    ]

    return (
        <Modal
            title={
                <div className="flex items-center gap-2 px-2 pt-2">
                    <MessageOutlined className="text-sky-600 text-2xl" />
                    <span className="font-black text-slate-800 text-xl">Đánh giá Sản Phẩm</span>
                </div>
            }
            width={1000}
            onCancel={onClose}
            open={open}
            footer={null}
            destroyOnClose
            centered
            className="feedback-popup-modal"
            closeIcon={
                <div className="flex h-9 w-9 mt-2 mr-2 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-rose-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </div>
            }
            styles={{
                content: { padding: '24px 16px', borderRadius: '24px' }
            }}
        >
            <div className="bg-white p-2 h-full flex flex-col">
                <div className="flex-1 overflow-auto rounded-2xl border border-slate-100 shadow-sm">
                    <AdminTable
                        columns={columns}
                        dataSource={feedbacks}
                        rowKey="feedbackId"
                        loading={loading}
                        currentPage={page}
                        pageSize={pageSize}
                        totalItems={total}
                        onPageChange={handleTableChange}
                    />
                </div>
            </div>

            {/* Modal Trả lời Đánh giá */}
            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <MessageOutlined className="text-sky-600" />
                        <span className="font-bold">{currentFeedback?.isReplied ? 'Chỉnh sửa phản hồi' : 'Phản hồi đánh giá'}</span>
                    </div>
                }
                open={isReplyModalVisible}
                onCancel={() => setIsReplyModalVisible(false)}
                footer={null}
                destroyOnClose
                centered
            >
                {currentFeedback && (
                    <div className="mb-5 p-4 bg-sky-50/50 rounded-2xl border border-sky-100">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-slate-800">{currentFeedback.userName}</span>
                            <Rate disabled defaultValue={currentFeedback.rating} className="text-[10px] text-amber-400" />
                        </div>
                        <p className="text-slate-600 text-sm mb-0 italic">"{currentFeedback.comment || 'Không có bình luận'}"</p>
                    </div>
                )}
                
                <Form form={form} layout="vertical" onFinish={handleReplySubmit}>
                    <Form.Item 
                        name="replyContent" 
                        label={<span className="font-semibold text-slate-700">Nội dung phản hồi của Quán</span>}
                        rules={[{ required: true, message: 'Vui lòng nhập nội dung phản hồi!' }]}
                    >
                        <Input.TextArea 
                            rows={4} 
                            placeholder="Cảm ơn bạn đã ủng hộ quán..." 
                            className="rounded-xl border-slate-300 focus:border-sky-500 focus:ring-sky-500"
                        />
                    </Form.Item>
                    
                    <Form.Item className="mb-0 text-right mt-6">
                        <Space>
                            <Button 
                                onClick={() => setIsReplyModalVisible(false)}
                                className="rounded-full px-5 font-semibold text-slate-500 hover:text-slate-700"
                            >
                                Hủy
                            </Button>
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                loading={actionLoading}
                                className="rounded-full px-6 bg-sky-600 hover:bg-sky-700 font-semibold shadow-md shadow-sky-200"
                            >
                                Gửi phản hồi
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </Modal>
    )
}
