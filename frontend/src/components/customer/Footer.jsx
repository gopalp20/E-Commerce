import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Brand } from "../forme/Brand";
import { useAuth } from "../../context/AuthContext";
export const Footer = () => {
  const { user } = useAuth(),
    { pathname } = useLocation();
  if (["/login", "/register"].includes(pathname))
    return (
      <footer className="auth-page-footer">
        <div className="wrap">
          <span>© {new Date().getFullYear()} FORME</span>
          <nav aria-label="Store support">
            <Link to="/delivery">Delivery & cancellations</Link>
            <Link to="/privacy">Privacy</Link>
          </nav>
        </div>
      </footer>
    );
  if (user)
    return (
      <footer className="shop-footer">
        <div className="wrap">
          <Brand />
          <nav aria-label="Store support">
            <Link to="/delivery">Delivery & cancellations</Link>
            <Link to="/privacy">Privacy</Link>
            {user?.role === "CUSTOMER" && (
              <Link to="/addresses">Saved addresses</Link>
            )}
          </nav>
          <span>© {new Date().getFullYear()} FORME · Demo store</span>
        </div>
      </footer>
    );
  return (
    <footer className="store-footer">
      <div className="wrap">
        <div className="footer-top">
          <div className="footer-note">
            <p className="eyebrow">FEWER THINGS. BETTER CHOSEN.</p>
            <h2>
              Make room for
              <br />
              the good things.
            </h2>
            <Link className="arrow-link" to="/about">
              The FORME point of view
              <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="footer-links">
            <div>
              <p>Discover FORME</p>
              <Link to="/products">All products</Link>
              <Link to="/about">Our point of view</Link>
              <Link to="/login">Sign in</Link>
              <Link to="/register">Create an account</Link>
            </div>
            <div>
              <p>The details</p>
              <Link to="/delivery">Delivery & cancellations</Link>
              <Link to="/privacy">Privacy</Link>
            </div>
          </div>
        </div>
        <div className="footer-brand">
          <Brand large />
          <p>
            Objects for living.
            <br />
            Chosen with intention.
          </p>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} FORME</span>
          <span>Independent makers. Everyday favourites.</span>
          <span>College demo store · INR</span>
        </div>
      </div>
    </footer>
  );
};
