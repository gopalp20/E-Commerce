import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, PackageCheck, MoveUpRight, Truck } from "lucide-react";
import { productsApi } from "../../api/products";
import { ProductCard } from "../../components/customer/ProductCard";
import { ArrowLink } from "../../components/forme/UI";
import { CategoryCollection } from "../../components/forme/Categories";
export const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = () => {
    setLoading(true);
    setError("");
    productsApi
      .getProducts({ limit: 4 })
      .then((r) => setProducts(r.products))
      .catch(() =>
        setError("The collection is taking a little longer to arrive."),
      )
      .finally(() => setLoading(false));
  };
  useEffect(load, []);
  return (
    <>
      <section className="hero wrap">
        <div className="hero-copy">
          <div className="eyebrow hero-kicker">
            <span className="tiny-square" /> THE EVERYDAY, RECONSIDERED
          </div>
          <h1>
            Good things.
            <br />
            For your
            <br />
            <span>everyday.</span>
          </h1>
          <p>
            Thoughtfully chosen objects for living,
            <br className="desktop-break" /> working, and everything in between.
          </p>
          <Link to="/products" className="store-button">
            Explore the collection
            <ArrowUpRight size={18} />
          </Link>
          <div className="hero-footnote">
            <span className="hero-line" /> A little less. A little better.
          </div>
        </div>
        <div className="hero-visual">
          <img
            src="/images/forme-living.jpg"
            alt="A rust-coloured lounge chair beside a sunlit window, with a coffee cup and a book on a wooden side table."
            fetchPriority="high"
            width="900"
            height="1100"
          />
          <span className="hero-image-label">ROOM FOR A SLOWER MORNING</span>
          <Link to="/products" className="hero-image-caption">
            <div>
              <span>THE FORME COLLECTION</span>
              <strong>
                Your favourite corner,
                <br />
                made a little better.
              </strong>
            </div>
            <span className="round-arrow">
              <ArrowUpRight size={22} />
            </span>
          </Link>
        </div>
      </section>
      <section className="value-strip wrap" aria-label="Store details">
        <span>
          <PackageCheck size={18} />
          Thoughtfully selected
        </span>
        <span>
          <Truck size={18} />
          Free delivery over ₹2,500
        </span>
        <span>
          <MoveUpRight size={18} />
          Independent perspectives
        </span>
      </section>
      <section className="collection-section wrap">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE FORME EDIT / 01</p>
            <h2>Good company for your day.</h2>
          </div>
          <ArrowLink to="/products">Shop the collection</ArrowLink>
        </div>
        {error ? (
          <div className="collection-error" role="alert">
            <p>{error}</p>
            <button className="text-button" onClick={load}>
              Try again
            </button>
          </div>
        ) : (
          <div className="product-grid">
            {loading
              ? Array.from({ length: 4 }, (_, i) => (
                  <div
                    key={i}
                    className="product-skeleton"
                    aria-label="Loading product"
                  />
                ))
              : products.map((product) => (
                  <ProductCard product={product} key={product.id} />
                ))}
          </div>
        )}
        {!loading && !error && !products.length && (
          <p className="empty-inline">
            Our next collection is on its way. Come back soon.
          </p>
        )}
      </section>
      <section className="category-section wrap">
        <div className="section-heading">
          <div>
            <p className="eyebrow">FIND YOUR EVERYDAY</p>
            <h2>Where good things belong.</h2>
          </div>
          <p className="section-aside">
            For the spaces you make.
            <br />
            And the days you make your own.
          </p>
        </div>
        <CategoryCollection editorial />
      </section>
      <section className="manifesto-section">
        <div className="wrap manifesto-inner">
          <p className="eyebrow">THE FORME POINT OF VIEW</p>
          <div>
            <h2>
              Not more things.
              <br />
              <span>More meaning.</span>
            </h2>
            <p>
              A well-made cup. A light in the right corner. The bag you reach
              for every morning. We bring together objects that earn their place
              in your everyday.
            </p>
            <ArrowLink to="/about">Get to know FORME</ArrowLink>
          </div>
          <span className="manifesto-monogram" aria-hidden="true">
            F.
          </span>
        </div>
      </section>
    </>
  );
};
