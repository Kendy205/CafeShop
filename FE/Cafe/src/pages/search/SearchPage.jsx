import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { getProducts } from '../../redux/actions/user/productAction'
import ProductGrid from '../../components/product/ProductGrid'
import Pagination from '../../components/common/Pagination'

function SearchResults({ q, setParams }) {
    const dispatch = useDispatch()
    const { items, loading, error, totalPages } = useSelector((s) => s.product)
    const [pageNumber, setPageNumber] = useState(1)
    const [keyword, setKeyword] = useState(q)

    useEffect(() => {
        dispatch(
            getProducts({
                search: q || undefined,
                pageNumber,
                pageSize: 8,
            })
        )
    }, [dispatch, q, pageNumber])

    return (
        <div>
            <h1 className="mb-4 text-2xl font-semibold">Tìm món</h1>
            <form
                className="mb-6 flex gap-2"
                onSubmit={(e) => {
                    e.preventDefault()
                    setParams({ q: keyword })
                }}
            >
                <input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="flex-1 rounded-xl border border-stone-200 bg-white px-3 py-2"
                    placeholder="cafe, trà sữa..."
                />
                <button type="submit" className="rounded-xl bg-amber-800 px-4 py-2 text-white">
                    Tìm kiếm
                </button>
            </form>
            {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
            <ProductGrid items={items} loading={loading} />
            <Pagination pageNumber={pageNumber} totalPages={totalPages} onChange={setPageNumber} />
        </div>
    )
}

export default function SearchPage() {
    const [params, setParams] = useSearchParams()
    const q = params.get('q') || ''
    return <SearchResults key={q} q={q} setParams={setParams} />
}
