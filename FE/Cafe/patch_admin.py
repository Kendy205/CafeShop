import sys
import re

path = 'd:\\hoc tap\\PTPMMNM\\FE\\Cafe\\src\\pages\\admin\\products\\AdminProductPage.jsx'
with open(path, 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Imports
code = re.sub(r"import \{ Modal, Table, Button, Input, Card, Tag, Space, Switch, Select, message \} from 'antd'",
              "import { Modal, Table, Button, Input, Card, Tag, Space, Switch, Select, Checkbox, message } from 'antd'", code)
              
# 2. States
old_states = '''    // filter states
    const [keyword, setKeyword] = useState('')
    const [categoryId, setCategoryId] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)'''

new_states = '''    // filter states
    const [keyword, setKeyword] = useState('')
    const [categoryId, setCategoryId] = useState(null)
    const [minPrice, setMinPrice] = useState('')
    const [maxPrice, setMaxPrice] = useState('')
    const [isAvailable, setIsAvailable] = useState('ALL')
    const [outOfStock, setOutOfStock] = useState(false)
    const [sortBy, setSortBy] = useState('')
    const [currentPage, setCurrentPage] = useState(1)'''
    
code = code.replace(old_states, new_states)

# 3. loadData function
old_loaddata = '''    const loadData = useCallback(
        (p) => {
            dispatch(
                fetchAdminProducts({
                    pageNumber: p,
                    pageSize: 10,
                    keyword: keyword.trim() || undefined,
                    categoryId: categoryId || undefined,
                })
            )
        },
        [dispatch, keyword, categoryId]
    )'''

new_loaddata = '''    const loadData = useCallback(
        (p) => {
            dispatch(
                fetchAdminProducts({
                    pageNumber: p,
                    pageSize: 10,
                    keyword: keyword.trim() || undefined,
                    categoryId: categoryId || undefined,
                    minPrice: minPrice !== '' ? Number(minPrice) : undefined,
                    maxPrice: maxPrice !== '' ? Number(maxPrice) : undefined,
                    isAvailable: isAvailable !== 'ALL' ? isAvailable === 'true' : undefined,
                    outOfStock: outOfStock ? true : undefined,
                    sortBy: sortBy || undefined,
                })
            )
        },
        [dispatch, keyword, categoryId, minPrice, maxPrice, isAvailable, outOfStock, sortBy]
    )'''

code = code.replace(old_loaddata, new_loaddata)

# 4. Filter Toolbar UI
old_ui_regex = r'\{\/\* Filter Toolbar \*\/\}.*?<AdminTable'
new_ui = '''{/* Filter Toolbar */}
            <div className="flex flex-col gap-4 bg-white/70 backdrop-blur-md p-4 rounded-3xl border border-slate-200/80 shadow-xs mb-6">
                {/* Hàng 1: Tìm kiếm & Phân loại cơ bản */}
                <div className="flex flex-wrap items-center gap-3">
                    <AppSearchBox
                        initialValue={keyword}
                        placeholder="Tìm kiếm theo tên..."
                        onSearch={(val) => { setKeyword(val); setCurrentPage(1); }}
                        className="flex-1 min-w-[200px] max-w-sm"
                    />

                    <Select
                        placeholder="Tất cả danh mục"
                        allowClear
                        value={categoryId}
                        onChange={(val) => { setCategoryId(val); }}
                        className="min-w-[160px]"
                        options={categories.map((c) => ({ value: c.categoryId, label: c.name }))}
                    />

                    <Select
                        value={sortBy}
                        onChange={(val) => setSortBy(val)}
                        className="min-w-[160px]"
                        options={[
                            { value: '', label: 'Mới nhất (Mặc định)' },
                            { value: 'name_asc', label: 'Tên A-Z' },
                            { value: 'price_asc', label: 'Giá tăng dần' },
                            { value: 'price_desc', label: 'Giá giảm dần' },
                            { value: 'stock_asc', label: 'Tồn kho ít nhất' },
                            { value: 'stock_desc', label: 'Tồn kho nhiều nhất' }
                        ]}
                    />
                </div>

                {/* Hàng 2: Bộ lọc nâng cao */}
                <div className="flex flex-wrap items-center gap-4 py-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500">Giá:</span>
                        <Input
                            type="number"
                            placeholder="Từ (VNĐ)"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="w-24 text-xs"
                        />
                        <span className="text-slate-400">-</span>
                        <Input
                            type="number"
                            placeholder="Đến (VNĐ)"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="w-24 text-xs"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500">Trạng thái:</span>
                        <Select
                            value={isAvailable}
                            onChange={setIsAvailable}
                            className="w-[120px]"
                            options={[
                                { value: 'ALL', label: 'Tất cả' },
                                { value: 'true', label: 'Đang bán' },
                                { value: 'false', label: 'Đã ẩn' }
                            ]}
                        />
                    </div>

                    <div className="flex items-center gap-2 ml-2">
                        <Checkbox checked={outOfStock} onChange={(e) => setOutOfStock(e.target.checked)}>
                            <span className="text-xs font-semibold text-rose-600">Hết hàng</span>
                        </Checkbox>
                    </div>

                    <div className="ml-auto">
                        <button
                            onClick={handleSearch}
                            className="rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 px-6 py-2 text-xs font-bold transition-all cursor-pointer"
                        >
                            Lọc dữ liệu
                        </button>
                    </div>
                </div>
            </div>

            <AdminTable'''
code = re.sub(old_ui_regex, new_ui, code, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(code)
print('Done!')
