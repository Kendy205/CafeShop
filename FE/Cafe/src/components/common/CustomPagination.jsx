import AppPagination from './AppPagination'

/**
 * @deprecated Dùng trực tiếp AppPagination từ components/common/AppPagination
 * File này được giữ lại để tương thích ngược.
 */
export default function CustomPagination(props) {
    return <AppPagination border={true} {...props} />
}
