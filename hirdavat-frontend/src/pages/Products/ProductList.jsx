import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import CategoryTabs from '../../components/products/CategoryTabs';
import ProductCard from '../../components/products/ProductCard';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import TopBar from '../../components/common/TopBar';
import { fetchCategories, fetchProducts } from '../../api/products';

export default function ProductList() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const params = {};
    if (activeCategory) params.category = activeCategory;
    if (search.trim()) params.search = search.trim();

    const timeoutId = setTimeout(() => {
      fetchProducts(params)
        .then((data) => setProducts(data.results ?? data))
        .catch(() => setProducts([]))
        .finally(() => setIsLoading(false));
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [activeCategory, search]);

  const productList = useMemo(() => products ?? [], [products]);

  return (
    <div className="hirdavat-app-content">
      <TopBar title="Ürünler" />

      <div className="input-group mb-3">
        <span className="input-group-text bg-white">🔍</span>
        <input
          type="search"
          className="form-control"
          placeholder="Ürün adı veya barkod ara"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <CategoryTabs categories={categories} activeId={activeCategory} onChange={setActiveCategory} />

      {isLoading ? (
        <Loader />
      ) : productList.length === 0 ? (
        <EmptyState title="Ürün bulunamadı" description="Farklı bir arama deneyin veya yeni ürün ekleyin." />
      ) : (
        <div className="hirdavat-product-grid">
          {productList.map((product) => (
            <ProductCard key={product.id} product={product} onClick={(p) => navigate(`/products/${p.id}`)} />
          ))}
        </div>
      )}

      <button
        type="button"
        className="btn btn-success rounded-circle shadow"
        style={{ position: 'absolute', bottom: 88, right: 16, width: 56, height: 56, fontSize: 24 }}
        onClick={() => navigate('/products/new')}
        aria-label="Yeni ürün ekle"
      >
        +
      </button>
    </div>
  );
}
