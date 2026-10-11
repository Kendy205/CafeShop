import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { navigateWithRouteLoading } from '../../utils/route/navigateWithRouteLoading'

/**
 * LoadingLink Component
 * Thẻ Link (bọc ngoài React Router Link) dùng để hiển thị màn hình Loading (Loading Component)
 * ngay khi bắt đầu chuyển trang thay vì đợi trang mới load xong. Giúp UX mượt mà hơn.
 */
export default function LoadingLink({ to, children, className, onClick, replace }) {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handleClick = (e) => {
        onClick?.(e)
        if (e.defaultPrevented) return
        e.preventDefault()
        navigateWithRouteLoading({ dispatch, navigate, to, options: { replace } })
    }

    return (
        <Link to={to} className={className} onClick={handleClick}>
            {children}
        </Link>
    )
}
