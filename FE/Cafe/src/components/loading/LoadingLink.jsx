import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { navigateWithRouteLoading } from '../../utils/route/navigateWithRouteLoading'

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
