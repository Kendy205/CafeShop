import { message } from 'antd'

export const buildProductFormData = (form, selectedSizes, toppingIds = []) => {
    if (!form.name || !form.categoryId || form.basePrice === '' || form.basePrice === null) {
        message.warning('Vui lòng nhập tên món, giá cơ bản và chọn danh mục!')
        return null
    }

    if (Number(form.basePrice) < 0) {
        message.warning('Giá cơ bản không được âm!')
        return null
    }

    const sizeListToSubmit = []
    for (const sizeId in selectedSizes) {
        if (selectedSizes[sizeId].isSelected) {
            if (selectedSizes[sizeId].price < 0 || selectedSizes[sizeId].stockQuantity < 0) {
                message.warning('Giá và số lượng không được âm!')
                return null
            }
            sizeListToSubmit.push({
                sizeId: parseInt(sizeId, 10),
                price: selectedSizes[sizeId].price,
                stockQuantity: selectedSizes[sizeId].stockQuantity,
            })
        }
    }

    if (sizeListToSubmit.length === 0) {
        message.warning('Vui lòng chọn ít nhất 1 kích cỡ cho sản phẩm!')
        return null
    }

    const formData = new FormData()
    formData.append('name', form.name.trim())
    formData.append('basePrice', Number(form.basePrice))
    formData.append('description', form.description || '')
    formData.append('categoryId', form.categoryId)
    
    if (form.imageFile) {
        formData.append('imageFile', form.imageFile)
    }
    
    formData.append('productSizesJson', JSON.stringify(sizeListToSubmit))
    
    // Add toppings payload
    if (toppingIds.length > 0) {
        formData.append('ProductToppingsJson', JSON.stringify(toppingIds))
    } else {
        formData.append('ProductToppingsJson', JSON.stringify([]))
    }

    return formData
}
