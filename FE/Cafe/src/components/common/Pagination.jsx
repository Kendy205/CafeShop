import AppPagination from './AppPagination'

/**
 * @deprecated Dùng trực tiếp AppPagination từ components/common/AppPagination
 * File này được giữ lại để tương thích ngược.
 */
export default function Pagination(props) {
    return <AppPagination border={false} {...props} />
}
