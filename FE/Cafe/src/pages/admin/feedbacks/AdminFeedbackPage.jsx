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
    Space
} from 'antd'
import { EyeOutlined, MessageOutlined, CheckCircleOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { 
    fetchAllFeedbacks, 
    toggleFeedbackVisibility, 
    replyToFeedback 
} from '../../../redux/actions/admin/adminFeedbackAction'

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
            title: 'Sản phẩm',
            dataIndex: 'productName',
            key: 'productName',
            width: 200,
            render: (text, record) => (
                <div>
                    <div className="font-medium text-slate-700">{text}</div>
                    <div className="text-xs text-slate-400">Size: {record.sizeName}</div>
                </div>
            )
        },
        {
            title: 'Khách hàng',
            dataIndex: 'userName',
            key: 'userName',
            width: 150,
        },
        {
            title: 'Đánh giá',
            dataIndex: 'rating',
            key: 'rating',
            width: 150,
            render: (rating) => <Rate disabled defaultValue={rating} className="text-sm" />
        },
        {
            title: 'Nội dung',
            dataIndex: 'comment',
            key: 'comment',
            width: 250,
            render: (text, record) => (
                <div>
                    <p className="mb-1 text-sm">{text || <span className="text-slate-400 italic">Không có bình luận</span>}</p>
                    {record.images && record.images.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                            <Image.PreviewGroup>
                                {record.images.map((img, i) => (
                                    <Image key={i} src={img} width={40} height={40} className="object-cover rounded" />
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
            render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm')
        },
        {
            title: 'Hiển thị',
            key: 'isVisible',
            width: 100,
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
            title: 'Trạng thái',
            key: 'status',
            width: 150,
            render: (_, record) => (
                record.isReplied ? 
                <Tag color="success" icon={<CheckCircleOutlined />}>Đã phản hồi</Tag> : 
                <Tag color="warning" icon={<MessageOutlined />}>Chưa phản hồi</Tag>
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
                    ghost 
                    size="small"
                    onClick={() => handleOpenReplyModal(record)}
                >
                    {record.isReplied ? 'Sửa Reply' : 'Reply'}
                </Button>
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
                    <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-slate-700">{currentFeedback.userName}</span>
                            <Rate disabled defaultValue={currentFeedback.rating} className="text-xs" />
                        </div>
                        <p className="text-slate-600 text-sm mb-0">{currentFeedback.comment}</p>
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
