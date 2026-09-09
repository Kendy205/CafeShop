import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { getProducts } from '../../redux/actions/user/productAction'
import ProductGrid from '../../components/product/ProductGrid'
import Pagination from '../../components/common/Pagination'
import hero from '../../assets/hero.png'

export default function HomePage() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { items, loading, error, totalPages } = useSelector((s) => s.product)
    const [pageNumber, setPageNumber] = useState(1)
    const [search, setSearch] = useState('')
    const [categoryId, setCategoryId] = useState('')

    useEffect(() => {
        dispatch(
            getProducts({
                pageNumber,
                pageSize: 8,
                search: search || undefined,
                categoryId: categoryId || undefined,
            })
        )
    }, [dispatch, pageNumber, search, categoryId])

    return (
        <div>
            <section className="mb-8 overflow-hidden rounded-3xl bg-amber-950 text-amber-50 md:flex">
                <div className="flex flex-1 flex-col justify-center p-8">
                    <p className="text-sm uppercase tracking-[0.2em] text-amber-200">Cafe Ordering</p>
                    <h1 className="mt-2 text-3xl font-semibold md:text-4xl">Đặt cà phê theo size & topping</h1>
                    <p className="mt-3 max-w-md text-amber-100/80">
                        Chọn món, tùy chỉnh size, topping rồi mua ngay hoặc thêm vào giỏ.
                    </p>
                    <form
                        className="mt-6 flex gap-2"
                        onSubmit={(e) => {
                            e.preventDefault()
                            const q = new FormData(e.currentTarget).get('q')
                            navigate(`/search?q=${encodeURIComponent(q || '')}`)
                        }}
                    >
                        <input
                            name="q"
                            placeholder="Tìm cà phê, trà..."
                            className="flex-1 rounded-xl border-0 bg-white px-3 py-2 text-stone-800"
                        />
                        <button type="submit" className="rounded-xl bg-amber-600 px-4 py-2 font-medium">
                            Tìm
                        </button>
                    </form>
                </div>
                <div className="h-48 md:h-auto md:w-1/2">
                    <img src={hero} alt="Cafe" className="h-full w-full object-cover" />
                </div>
            </section>

            <div className="mb-4 flex flex-wrap gap-3">
                <input
                    value={search}
                    onChange={(e) => {
                        setPageNumber(1)
                        setSearch(e.target.value)
                    }}
                    placeholder="Lọc theo tên món"
                    className="rounded-xl border border-stone-200 bg-white px-3 py-2"
                />
                <input
                    value={categoryId}
                    onChange={(e) => {
                        setPageNumber(1)
                        setCategoryId(e.target.value)
                    }}
                    placeholder="Mã danh mục (categoryId)"
                    className="rounded-xl border border-stone-200 bg-white px-3 py-2"
                />
            </div>

            {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
            <ProductGrid items={items} loading={loading} />
            <Pagination pageNumber={pageNumber} totalPages={totalPages} onChange={setPageNumber} />
        </div>
    )
}
