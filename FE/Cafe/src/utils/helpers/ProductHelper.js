import { message } from 'antd'
import { AppToast, AppConfirm } from '../../components/common/AppNotification'


export const buildProductFormData = (form, selectedSizes, toppingIds = []) => {
    if (!form.name || !form.categoryId || form.basePrice === '' || form.basePrice === null) {
        AppToast.warning('Vui lòng nhập tên món, giá cơ bản và chọn danh mục!')
        return null
    }

    if (Number(form.basePrice) < 0) {
        AppToast.warning('Giá cơ bản không được âm!')
        return null
    }

    let totalSizeStock = 0
    const sizeListToSubmit = []
    for (const sizeId in selectedSizes) {
        if (selectedSizes[sizeId].isSelected) {
            const price = Number(selectedSizes[sizeId].price)
            const stock = Number(selectedSizes[sizeId].stockQuantity)
            
            if (isNaN(price) || isNaN(stock) || price < 0 || stock < 0) {
                AppToast.warning('Giá và số lượng phải là số hợp lệ và không được âm!')
                return null
            }
            sizeListToSubmit.push({
                sizeId: parseInt(sizeId, 10),
                price: price,
                stockQuantity: stock,
            })
            totalSizeStock += stock
        }
    }

    let finalStockQuantity = 0
    if (sizeListToSubmit.length > 0) {
        finalStockQuantity = totalSizeStock
        if (form.stockQuantity !== '' && form.stockQuantity !== null && form.stockQuantity !== undefined) {
            const inputStock = Number(form.stockQuantity)
            if (inputStock !== totalSizeStock) {
                AppToast.warning(`Tổng số lượng các size (${totalSizeStock}) không khớp với tổng tồn kho bạn nhập (${inputStock})! Vui lòng sửa lại hoặc để trống.`)
                return null
            }
            finalStockQuantity = inputStock
        }
    } else {
        // Sản phẩm không có size: lấy tồn kho trực tiếp từ ô nhập
        if (form.stockQuantity !== '' && form.stockQuantity !== null && form.stockQuantity !== undefined) {
            finalStockQuantity = Number(form.stockQuantity) || 0
        }
    }

    const formData = new FormData()
    formData.append('Name', form.name.trim())
    formData.append('BasePrice', Number(form.basePrice))
    formData.append('Description', form.description || '')
    formData.append('CategoryId', form.categoryId)
    formData.append('StockQuantity', finalStockQuantity)
    formData.append('IsAvailable', form.isAvailable === true || form.isAvailable === 'true' ? 'true' : 'false')
    
    if (form.imageFile) {
        formData.append('ImageFile', form.imageFile)
    }
    
    formData.append('ProductSizesJson', JSON.stringify(sizeListToSubmit))
    
    // Add toppings payload
    if (toppingIds.length > 0) {
        formData.append('ProductToppingsJson', JSON.stringify(toppingIds))
    } else {
        formData.append('ProductToppingsJson', JSON.stringify([]))
    }

    return formData
}
