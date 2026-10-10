import { startTransition, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import * as MenuPrimitive from "@radix-ui/react-dropdown-menu";
import {
  Search,
  ShoppingBag,
  Menu,
  ArrowRight,
  ChevronDown,
  UserRound,
  MapPin,
  Package,
  Star,
  Heart,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { Brand } from "../forme/Brand";
import { Drawer } from "../forme/UI";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { roleHome } from "../../lib/authNavigation";
function StoreSearch({ mobile = false, onSearch }) {
  const location = useLocation(),
    navigate = useNavigate();
  const [value, setValue] = useState(
    new URLSearchParams(location.search).get("search") || "",
  );
  return (
    <form
      className={`store-search ${mobile ? "search-in-dialog" : ""}`}
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        navigate(
          value.trim()
            ? `/products?search=${encodeURIComponent(value.trim())}`
            : "/products",
        );
        onSearch?.();
      }}
    >
      <Search size={18} aria-hidden="true" />
      <input
        aria-label="Search products"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search the collection"
        maxLength={200}
      />
      <button aria-label="Search collection" type="submit">
        <ArrowRight size={18} />
      </button>
    </form>
  );
}
export const Navbar = () => {
  const { user, logout, isLoading } = useAuth(),
    { itemCount } = useCart(),
    location = useLocation(),
    navigate = useNavigate();
  const [panel, setPanel] = useState(null);
  const shownPanel = panel?.key === location.key ? panel.name : null;
  const open = (name) => setPanel({ name, key: location.key });
  const close = () => setPanel(null);
  const home = user ? roleHome(user) : "/products";
  const customer = user?.role === "CUSTOMER";
  const links = user
    ? [
        ["Shop", customer ? "/shop" : "/products"],
        [
          customer ? "Orders" : "Dashboard",
          customer ? "/orders" : roleHome(user),
        ],
      ]
    : [
        ["Shop", "/products"],
        ["About FORME", "/about"],
      ];
  const signOut = () => {
    startTransition(() => {
      logout();
      close();
      navigate("/", { replace: true });
    });
  };
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      {!user && !isLoading && location.pathname === "/" && (
        <div className="store-announcement">
          <span>Good design. Everyday living.</span>
          <Link to="/delivery">
            Free standard delivery on orders ₹2,500+
            <ArrowRight size={12} />
          </Link>
        </div>
      )}
      <header
        className={`store-header ${user ? "signed-header" : "public-header"}`}
      >
        <div className="store-nav wrap">
          <div className="brand-group">
            <button
              className="icon-button mobile-menu"
              aria-label="Open menu"
              onClick={() => open("menu")}
            >
              <Menu size={21} />
            </button>
            <Brand />
          </div>
          <nav className="store-primary-nav" aria-label="Main navigation">
            {links.map(([label, to]) => (
              <NavLink key={label} to={to} end>
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="header-search">
            <StoreSearch key={location.search} />
          </div>
          <div className="nav-actions">
            <button
              className="icon-button mobile-search-trigger"
              aria-label="Open product search"
              onClick={() => open("search")}
            >
              <Search size={20} />
            </button>
            {user ? (
              <MenuPrimitive.Root>
                <MenuPrimitive.Trigger
                  className="account-trigger"
                  aria-label={`Account for ${user.name}`}
                >
                  <span className="account-avatar" aria-hidden="true">
                    {user.name[0]}
                  </span>
                  <span>{user.name.split(" ")[0]}</span>
                  <ChevronDown size={13} />
                </MenuPrimitive.Trigger>
                <MenuPrimitive.Portal>
                  <MenuPrimitive.Content
                    className="account-menu"
                    align="end"
                    sideOffset={12}
                    collisionPadding={12}
                  >
                    <MenuPrimitive.Label className="account-menu-label">
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                      <small>
                        {customer
                          ? "Customer"
                          : user.role === "VENDOR"
                            ? "Vendor"
                            : "Administrator"}
                      </small>
                    </MenuPrimitive.Label>
                    <MenuPrimitive.Separator className="menu-separator" />
                    {customer ? (
                      <>
                        <MenuPrimitive.Item asChild>
                          <Link to="/profile">
                            <UserRound size={16} />
                            My account
                          </Link>
                        </MenuPrimitive.Item>
                        <MenuPrimitive.Item asChild>
                          <Link to="/orders">
                            <Package size={16} />
                            My orders
                          </Link>
                        </MenuPrimitive.Item>
                        <MenuPrimitive.Item asChild>
                          <Link to="/saved">
                            <Heart size={16} />
                            Saved items
                          </Link>
                        </MenuPrimitive.Item>
                        <MenuPrimitive.Item asChild>
                          <Link to="/reviews">
                            <Star size={16} />
                            My reviews
                          </Link>
                        </MenuPrimitive.Item>
                        <MenuPrimitive.Item asChild>
                          <Link to="/addresses">
                            <MapPin size={16} />
                            Saved addresses
                          </Link>
                        </MenuPrimitive.Item>
                      </>
                    ) : (
                      <MenuPrimitive.Item asChild>
                        <Link to={roleHome(user)}>
                          <LayoutDashboard size={16} />
                          Open dashboard
                        </Link>
                      </MenuPrimitive.Item>
                    )}
                    <MenuPrimitive.Separator className="menu-separator" />
                    <MenuPrimitive.Item onSelect={signOut}>
                      <LogOut size={16} />
                      Sign out
                    </MenuPrimitive.Item>
                  </MenuPrimitive.Content>
                </MenuPrimitive.Portal>
              </MenuPrimitive.Root>
            ) : (
              <Link className="header-sign-in" to="/login">
                Sign in
                <ArrowRight size={15} />
              </Link>
            )}
            {(!user || customer) && (
              <Link
                className="bag-link"
                to="/cart"
                aria-label={`Shopping bag, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
              >
                <span className="bag-icon" aria-hidden="true">
                  <ShoppingBag size={20} />
                  {itemCount > 0 && (
                    <span className="bag-count">
                      {itemCount > 99 ? "99+" : itemCount}
                    </span>
                  )}
                </span>
              </Link>
            )}
          </div>
        </div>
      </header>
      <Drawer
        title="Explore FORME"
        open={shownPanel === "menu"}
        onClose={close}
      >
        <nav
          className="mobile-links"
          onClick={close}
          aria-label="Mobile navigation"
        >
          <Link to={home}>
            Shop all products
            <ArrowRight size={19} />
          </Link>
          {customer && (
            <>
              <Link to="/orders">
                Your orders
                <Package size={19} />
              </Link>
              <Link to="/saved">
                Saved items
                <Heart size={19} />
              </Link>
              <Link to="/addresses">
                Saved addresses
                <MapPin size={19} />
              </Link>
              <Link to="/profile">
                Your account
                <UserRound size={19} />
              </Link>
            </>
          )}
          {user && !customer && (
            <Link to={roleHome(user)}>
              Your dashboard
              <LayoutDashboard size={19} />
            </Link>
          )}
          {!user && (
            <>
              <Link to="/about">
                About FORME
                <ArrowRight size={19} />
              </Link>
              <Link to="/login">
                Sign in
                <UserRound size={19} />
              </Link>
            </>
          )}
          <Link to="/delivery">
            Delivery & cancellations
            <ArrowRight size={19} />
          </Link>
        </nav>
      </Drawer>
      <Drawer
        title="Search the collection"
        open={shownPanel === "search"}
        onClose={close}
      >
        <StoreSearch mobile onSearch={close} />
      </Drawer>
    </>
  );
};
