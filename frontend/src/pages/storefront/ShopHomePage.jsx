import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Package, MapPin } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { productsApi } from "../../api/products";
import { CategoryCollection } from "../../components/forme/Categories";
import { ProductCard } from "../../components/customer/ProductCard";
import { ArrowLink } from "../../components/forme/UI";
export const ShopHomePage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState(null),
    [error, setError] = useState(""),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    productsApi
      .getProducts({ limit: 8 })
      .then((data) => {
        if (active) {
          setProducts(data.products);
          setError("");
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [retry]);
  return (
    <div className="wrap shop-home">
      <header className="shop-welcome">
        <div>
          <p className="eyebrow">YOUR FORME</p>
          <h1>Welcome back, {user.name.split(" ")[0]}.</h1>
          <p>Find your next everyday favourite.</p>
        </div>
        <div className="shop-shortcuts">
          <Link to="/orders">
            <Package size={18} />
            <span>Your orders</span>
            <ArrowRight size={15} />
          </Link>
          <Link to="/addresses">
            <MapPin size={18} />
            <span>Saved addresses</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </header>
      <section className="shop-categories">
        <div className="section-heading">
          <div>
            <p className="eyebrow">FIND YOUR WAY</p>
            <h2>Shop by category</h2>
          </div>
          <ArrowLink to="/products">All products</ArrowLink>
        </div>
        <CategoryCollection />
      </section>
      <section className="shop-products">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE LATEST IN STORE</p>
            <h2>A fresh look at the everyday.</h2>
          </div>
          <ArrowLink to="/products">View all</ArrowLink>
        </div>
        {error ? (
          <div className="inline-error" role="alert">
            <p>{error}</p>
            <button
              className="store-button secondary"
              onClick={() => setRetry((n) => n + 1)}
            >
              Try again
            </button>
          </div>
        ) : !products ? (
          <div className="product-grid">
            {[0, 1, 2, 3].map((i) => (
              <div className="product-skeleton" key={i} />
            ))}
          </div>
        ) : !products.length ? (
          <p className="empty-inline">The next collection is on its way.</p>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard product={product} key={product.id} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
