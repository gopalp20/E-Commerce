import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { adminApi } from "../../api/admin";
import { productsApi } from "../../api/products";
import { ordersApi } from "../../api/orders";
import { vendorApi } from "../../api/vendor";
import { useAuth } from "../../context/AuthContext";
import { money, orderNumber } from "../../lib/format";
import {
  PageHeading,
  MetricStrip,
  WorkState,
  Panel,
  DataTable,
  Status,
  Thumbnail,
  Empty,
  useResource,
  AddLink,
} from "./UI";
import { shortDate, itemTotal } from "./Orders";
const loaders = {
  admin: async () => {
    const [stats, orders, products, requests] = await Promise.all([
      adminApi.getAdminStats(),
      adminApi.getAdminOrders(),
      adminApi.getAdminProducts(),
      vendorApi.getVendorRequests(),
    ]);
    return {
      stats: stats.stats,
      orders: orders.orders,
      products: products.products,
      requests: requests.requests,
    };
  },
  vendor: async () => {
    const [products, orders] = await Promise.all([
      productsApi.getMyProducts(),
      ordersApi.getVendorOrders(),
    ]);
    return { products: products.products, orders: orders.orders };
  },
};
export function Overview({ role }) {
  const resource = useResource(loaders[role]),
    { user } = useAuth();
  if (resource.loading || resource.error)
    return <WorkState {...resource} retry={resource.reload} />;
  const { orders, products, stats, requests } = resource.data,
    live = products.filter((p) => !p.deleted),
    open = orders.filter((o) => ["PENDING", "CONFIRMED"].includes(o.status)),
    low = live.filter(
      (p) => p.stock <= 5 && ["ACTIVE", "OUT_OF_STOCK"].includes(p.status),
    ),
    value = orders
      .filter((o) => o.status !== "CANCELLED")
      .reduce(
        (n, o) => n + (role === "admin" ? Number(o.totalAmount) : itemTotal(o)),
        0,
      );
  const metrics = [
    {
      label: "Order value",
      value: money(value),
      note: "Excludes cancelled orders",
    },
    {
      label: "To fulfil",
      value: open.length,
      note: "Pending or confirmed",
      to: `/${role}/orders`,
    },
    {
      label: "Live products",
      value: live.filter((p) => p.status === "ACTIVE").length,
      note: "In the collection",
      to: `/${role}/products`,
    },
    role === "admin"
      ? {
          label: "People",
          value: stats.totalUsers,
          note: "Customers, vendors & team",
          to: "/admin/users",
        }
      : {
          label: "Orders received",
          value: orders.length,
          note: "Across your collection",
        },
  ];
  return (
    <>
      <PageHeading
        eyebrow={
          role === "admin" ? "YOUR STORE, AT A GLANCE" : "YOUR SELLER STUDIO"
        }
        title={role === "admin" ? "Store overview" : `Hello, ${user.name}.`}
        description={
          role === "admin"
            ? "A clear view of the collection and what needs your attention."
            : "Your collection, your customers, and the next things to do."
        }
      >
        {role === "vendor" ? (
          <AddLink to="/vendor/products/new">Add product</AddLink>
        ) : (
          <Link className="work-button secondary" to="/admin/orders">
            View orders
            <ArrowRight size={16} />
          </Link>
        )}
      </PageHeading>
      <MetricStrip items={metrics} />
      {((role === "admin" && requests.length > 0) ||
        (role === "vendor" && low.length > 0)) && (
        <div className="work-callouts">
          {role === "admin" ? (
            <div className="work-callout">
              <div>
                <strong>
                  {requests.length}{" "}
                  {requests.length === 1 ? "maker is" : "makers are"} waiting to
                  join.
                </strong>
                <p>
                  Review new vendor applications before they begin listing
                  products.
                </p>
              </div>
              <Link to="/admin/vendors" className="work-text-link">
                Review requests
                <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            <div className="work-callout">
              <div>
                <strong>
                  {low.length}{" "}
                  {low.length === 1 ? "product needs" : "products need"} a stock
                  check.
                </strong>
                <p>Some favourites are running low or have sold out.</p>
              </div>
              <Link to="/vendor/products" className="work-text-link">
                Review stock
                <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </div>
      )}
      <div className="work-overview-grid">
        <Panel
          title="Recent orders"
          description="The latest from your customers."
          action={
            <Link className="work-text-link" to={`/${role}/orders`}>
              View all
              <ArrowRight size={15} />
            </Link>
          }
        >
          <DataTable
            caption="Recent orders"
            rows={orders.slice(0, 5)}
            empty={
              <Empty
                title="The first order starts here."
                description="New orders will appear here as customers shop your collection."
              />
            }
            columns={[
              {
                label: "Order",
                render: (o) => (
                  <>
                    <Link
                      className="work-row-button"
                      to={`/${role}/orders?order=${o.id}`}
                    >
                      {orderNumber(o.id)}
                    </Link>
                    <small>{shortDate(o.createdAt)}</small>
                  </>
                ),
              },
              {
                label: "Customer",
                className: "hide-small",
                render: (o) => <strong>{o.user?.name || "Customer"}</strong>,
              },
              {
                label: role === "admin" ? "Total" : "Your items",
                className: "nowrap",
                render: (o) =>
                  money(role === "admin" ? o.totalAmount : itemTotal(o)),
              },
              { label: "Status", render: (o) => <Status value={o.status} /> },
            ]}
          />
        </Panel>
        <Panel
          title={role === "admin" ? "Around the store" : "Your collection"}
          description={
            role === "admin"
              ? "The people and products behind it."
              : "Your most recent product listings."
          }
        >
          {role === "admin" ? (
            <div className="work-list">
              <Link to="/admin/products">
                <div>
                  <strong>{live.length} products</strong>
                  <small>Across the marketplace</small>
                </div>
                <ArrowUpRight size={16} />
              </Link>
              <Link to="/admin/users">
                <div>
                  <strong>{stats.totalVendors} independent vendors</strong>
                  <small>Selling on FORME</small>
                </div>
                <ArrowUpRight size={16} />
              </Link>
              <Link to="/admin/categories">
                <div>
                  <strong>{stats.totalCategories} categories</strong>
                  <small>Help customers find their way</small>
                </div>
                <ArrowUpRight size={16} />
              </Link>
              <Link to="/admin/vendors">
                <div>
                  <strong>
                    {requests.length} vendor{" "}
                    {requests.length === 1 ? "request" : "requests"}
                  </strong>
                  <small>
                    {requests.length
                      ? "Waiting for your review"
                      : "All caught up"}
                  </small>
                </div>
                <ArrowUpRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="work-list">
              {live.slice(0, 3).map((p) => (
                <Link key={p.id} to={`/vendor/products/${p.id}/edit`}>
                  <Thumbnail src={p.imageUrl || p.images?.[0]?.url} />
                  <div>
                    <strong>{p.name}</strong>
                    <small>
                      {money(p.price)} · {p.stock} in stock
                    </small>
                  </div>
                  <ArrowUpRight size={15} />
                </Link>
              ))}
              {!live.length && (
                <Empty
                  title="Make your first listing."
                  description="Add a product to start your collection."
                />
              )}
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}
