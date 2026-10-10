import { startTransition, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import * as MenuPrimitive from "@radix-ui/react-dropdown-menu";
import {
  ArrowUpRight,
  LayoutGrid,
  Package,
  ShoppingBag,
  Users,
  Store,
  Shapes,
  ChartNoAxesColumn,
  UserRound,
  Star,
  Menu,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { Brand } from "../forme/Brand";
import { Drawer } from "../forme/UI";
import { RouteSurface } from "../forme/RouteSurface";
import { useAuth } from "../../context/AuthContext";
import "./workspace.css";
const navigation = {
  admin: [
    { label: "Overview", to: "/admin", icon: LayoutGrid, end: true },
    { label: "Orders", to: "/admin/orders", icon: ShoppingBag },
    { label: "Products", to: "/admin/products", icon: Package },
    { label: "Reviews", to: "/admin/reviews", icon: Star },
    { label: "Categories", to: "/admin/categories", icon: Shapes },
    { label: "People", to: "/admin/users", icon: Users },
    { label: "Vendor requests", to: "/admin/vendors", icon: Store },
    { label: "Reports", to: "/admin/analytics", icon: ChartNoAxesColumn },
  ],
  vendor: [
    { label: "Overview", to: "/vendor", icon: LayoutGrid, end: true },
    { label: "Orders", to: "/vendor/orders", icon: ShoppingBag },
    { label: "Products", to: "/vendor/products", icon: Package },
    { label: "Reviews", to: "/vendor/reviews", icon: Star },
    { label: "Your studio", to: "/vendor/profile", icon: UserRound },
  ],
};
function WorkspaceLinks({ role, onNavigate }) {
  return (
    <nav
      className="work-nav"
      aria-label={`${role === "admin" ? "Admin" : "Vendor"} navigation`}
    >
      {navigation[role].map(({ label, to, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) => (isActive ? "selected" : "")}
        >
          <Icon size={18} strokeWidth={1.5} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
export function Workspace({ role }) {
  const { user, logout } = useAuth(),
    location = useLocation(),
    navigate = useNavigate();
  const [menuKey, setMenuKey] = useState(null);
  const title =
    navigation[role].find((item) =>
      item.end
        ? item.to === location.pathname
        : location.pathname.startsWith(item.to),
    )?.label || "Workspace";
  const name = role === "admin" ? "Marketplace" : "Seller studio";
  const signOut = () =>
    startTransition(() => {
      logout();
      navigate("/login", { replace: true });
    });
  return (
    <div className={`workspace workspace-${role}`}>
      <a className="skip-link" href="#workspace-main">
        Skip to content
      </a>
      <aside className="work-sidebar">
        <div className="work-brand">
          <Brand />
          <span>{name}</span>
        </div>
        <div className="work-nav-label">
          {role === "admin" ? "MANAGE YOUR STORE" : "YOUR WORKSPACE"}
        </div>
        <WorkspaceLinks role={role} />
        <div className="work-sidebar-bottom">
          <Link to="/products">
            Visit the store
            <ArrowUpRight size={17} />
          </Link>
          <small>FORME · {new Date().getFullYear()}</small>
        </div>
      </aside>
      <div className="work-body">
        <header className="work-header">
          <button
            className="icon-button work-mobile-trigger"
            aria-label="Open workspace menu"
            onClick={() => setMenuKey(location.key)}
          >
            <Menu size={20} />
          </button>
          <div className="work-breadcrumb">
            <span>{name}</span>
            <span>/</span>
            <strong>{title}</strong>
          </div>
          <div className="work-header-actions">
            <span className="work-environment">Demo store</span>
            <MenuPrimitive.Root>
              <MenuPrimitive.Trigger
                className="work-account"
                aria-label={`Account for ${user.name}`}
              >
                <span className="work-avatar">{user.name[0]}</span>
                <span>{user.name}</span>
                <ChevronDown size={13} />
              </MenuPrimitive.Trigger>
              <MenuPrimitive.Portal>
                <MenuPrimitive.Content
                  className="account-menu"
                  sideOffset={12}
                  align="end"
                  collisionPadding={12}
                >
                  <MenuPrimitive.Label className="account-menu-label">
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                    <small>
                      {role === "admin" ? "Administrator" : "Vendor"}
                    </small>
                  </MenuPrimitive.Label>
                  <MenuPrimitive.Separator className="menu-separator" />
                  <MenuPrimitive.Item asChild>
                    <Link to="/products">
                      <ArrowUpRight size={16} />
                      Visit the store
                    </Link>
                  </MenuPrimitive.Item>
                  {role === "vendor" && (
                    <MenuPrimitive.Item asChild>
                      <Link to="/vendor/profile">
                        <UserRound size={16} />
                        Your studio
                      </Link>
                    </MenuPrimitive.Item>
                  )}
                  <MenuPrimitive.Item onSelect={signOut}>
                    <LogOut size={16} />
                    Sign out
                  </MenuPrimitive.Item>
                </MenuPrimitive.Content>
              </MenuPrimitive.Portal>
            </MenuPrimitive.Root>
          </div>
        </header>
        <main id="workspace-main" className="work-main" key={user.id}>
          <RouteSurface />
        </main>
        <footer className="work-footer">
          <span>FORME workspace</span>
          <Link to="/products">
            Back to the store
            <ArrowUpRight size={13} />
          </Link>
        </footer>
      </div>
      <Drawer
        open={menuKey === location.key}
        onClose={() => setMenuKey(null)}
        title={name}
        className="work-mobile-menu"
      >
        <WorkspaceLinks role={role} onNavigate={() => setMenuKey(null)} />
        <Link className="work-text-link" to="/products">
          Visit the store
          <ArrowUpRight size={16} />
        </Link>
      </Drawer>
    </div>
  );
}
