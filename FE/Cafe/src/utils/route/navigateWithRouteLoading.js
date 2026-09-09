import { startRouteLoading, stopRouteLoading } from '../../redux/slices/uiSlice'

export function navigateWithRouteLoading({
    dispatch,
    navigate,
    to,
    options,
    durationMs = 400,
}) {
    dispatch(startRouteLoading())
    const timerId = setTimeout(() => {
        dispatch(stopRouteLoading())
    }, durationMs)
    navigate(to, options)
    return timerId
}
