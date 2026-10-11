import { useState, useEffect } from 'react';

/**
 * Hook tùy chỉnh để tạo độ trễ (debounce) cho một giá trị.
 * Thường dùng cho các trường nhập liệu tìm kiếm để giảm số lượng API calls.
 * 
 * @param {any} value Giá trị cần debounce
 * @param {number} delay Thời gian trễ (ms)
 * @returns {any} Giá trị sau khi đã được debounce
 */
export function useDebounce(value, delay = 1000) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Cập nhật debouncedValue sau khoảng thời gian delay
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Hủy timeout nếu value thay đổi (người dùng vẫn đang gõ)
        // hoặc component bị unmount
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}
