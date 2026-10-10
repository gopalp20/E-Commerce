import { useCallback, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { VendorFilter } from "./VendorFilter";
import { vendorItemTotal } from "../../lib/vendorScope.mjs";
import { ArrowRight } from "lucide-react";
import { adminApi } from "../../api/admin";
import { ordersApi } from "../../api/orders";
import { useToast } from "../../context/ToastContext";
import { FormeSelect } from "../forme/Select";
import { money, orderNumber, titleCase } from "../../lib/format";
import {
  PageHeading,
  WorkState,
  DataTable,
  WorkSearch,
  FilterTabs,
  Status,
  Person,
  Thumbnail,
  WorkDrawer,
  useResource,
  usePage,
  Pagination,
} from "./UI";
const loaders = {
  admin: async (vendorId) => {
    const [o, v] = await Promise.all([
      adminApi.getAdminOrders(vendorId ? { vendorId } : {}),
      adminApi.getVendors(),
    ]);
    return { ...o, vendors: v.vendors };
  },
  vendor: () => ordersApi.getVendorOrders(),
};
const transitions = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};
export const shortDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
export const itemTotal = (order) =>
  order.items.reduce((n, item) => n + Number(item.price) * item.quantity, 0);
export function OrderEditor({ order, onClose, onSaved, role }) {
  const toast = useToast(),
    [status, setStatus] = useState(order.status),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const save = async () => {
    setBusy(true);
    setError("");
    try {
      await ordersApi.updateOrderStatus(order.id, status);
      toast.success(
        `${orderNumber(order.id)} is now ${titleCase(status).toLowerCase()}.`,
        "Order updated",
      );
      onSaved();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const address = order.shippingAddress,
    options = [order.status, ...(transitions[order.status] || [])];
  return (
    <WorkDrawer
      open
      onClose={() => !busy && onClose()}
      title={orderNumber(order.id)}
    >
      <div className="work-toolbar">
        <Status value={order.status} />
        <span className="work-secondary">{shortDate(order.createdAt)}</span>
      </div>
      <div className="work-detail-section">
        <h3>Customer</h3>
        <Person name={order.user?.name} email={order.user?.email} />
      </div>
      <div className="work-detail-lines">
        {order.items.map((item) => (
          <div key={item.id} className="work-detail-line">
            <Thumbnail
              src={
                item.productImage ||
                item.product?.imageUrl ||
                item.product?.images?.[0]?.url
              }
            />
            <div>
              <strong>{item.productName || item.product?.name}</strong>
              <small>
                {item.quantity} × {money(item.price)}
              </small>
            </div>
            <span>{money(Number(item.price) * item.quantity)}</span>
          </div>
        ))}
      </div>
      <div className="work-detail-totals">
        <div>
          <span>{role === "vendor" ? "Your items" : "Subtotal"}</span>
          <span>{money(itemTotal(order))}</span>
        </div>
        {role === "admin" && (
          <>
            <div>
              <span>Delivery</span>
              <span>{money(order.shippingAmount || 0)}</span>
            </div>
            <div>
              <span>Order total</span>
              <span>{money(order.totalAmount)}</span>
            </div>
          </>
        )}
      </div>
      {address && (
        <div className="work-detail-section">
          <h3>Deliver to</h3>
          <p>
            {address.name}
            <br />
            {address.line1}
            {address.line2 && <>, {address.line2}</>}
            <br />
            {address.city}, {address.state} {address.postalCode}
            <br />
            {address.phone}
          </p>
          <p className="work-form-help">
            {titleCase(order.deliveryMethod)} delivery · Pay on delivery
          </p>
        </div>
      )}
      {role === "vendor" && order.canManageStatus === false ? (
        <p className="work-drawer-note">
          This order includes another vendor’s products. The store administrator
          manages its fulfilment. Only your items are shown here.
        </p>
      ) : options.length > 1 ? (
        <div className="work-form">
          <FormeSelect
            label="Order status"
            value={status}
            onValueChange={setStatus}
            options={options.map((value) => ({
              value,
              label: titleCase(value),
            }))}
          />
          {status === "CANCELLED" && (
            <p className="work-drawer-note">
              Cancelling restores the reserved stock. This order cannot be
              reopened.
            </p>
          )}
          {error && (
            <p role="alert" className="work-error">
              {error}
            </p>
          )}
          <button
            className="work-button"
            disabled={busy || status === order.status}
            onClick={save}
          >
            {busy ? "Saving…" : "Save status"}
            <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <p className="work-drawer-note">
          This order is {titleCase(order.status).toLowerCase()}. No further
          status changes are available.
        </p>
      )}
    </WorkDrawer>
  );
}
export function Orders({ role }) {
  const [params, setParams] = useSearchParams();
  const vendorId = role === "admin" ? params.get("vendor") || "" : "";
  const loader = useCallback(() => loaders[role](vendorId), [role, vendorId]);
  const resource = useResource(loader),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState("all");
  const orders = resource.data?.orders || [];
  const selected = orders.find(
    (order) => String(order.id) === params.get("order"),
  );
  const setSelected = (order) => {
    const next = new URLSearchParams(params);
    if (order) next.set("order", order.id);
    else next.delete("order");
    setParams(next, { replace: !order });
  };
  const matches = (order) =>
    filter === "all" ||
    (filter === "open"
      ? ["PENDING", "CONFIRMED"].includes(order.status)
      : order.status === filter);
  const filtered = orders.filter(
    (order) =>
      matches(order) &&
      `${orderNumber(order.id)} ${order.user?.name} ${order.user?.email} ${order.items.map((i) => i.productName || i.product?.name).join(" ")}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const page = usePage(filtered);
  if (resource.loading || resource.error)
    return <WorkState {...resource} retry={resource.reload} />;
  return (
    <>
      <PageHeading
        eyebrow={role === "admin" ? "CUSTOMER ORDERS" : "FROM YOUR STUDIO"}
        title="Orders"
        description={
          role === "admin"
            ? "From the first order to the final delivery."
            : "Review your orders and update fulfilment."
        }
      />
      {role === "admin" && (
        <div className="work-vendor-scope">
          <VendorFilter
            value={vendorId}
            vendors={resource.data?.vendors || []}
            onChange={(value) => {
              const next = new URLSearchParams(params);
              if (value) next.set("vendor", value);
              else next.delete("vendor");
              next.delete("order");
              setParams(next);
              page.setPage(1);
            }}
          />
          {vendorId && (
            <p>
              Orders containing this vendor. Amounts show their items only; open
              an order for its complete details.
            </p>
          )}
        </div>
      )}
      <FilterTabs
        value={filter}
        onChange={(value) => {
          setFilter(value);
          page.setPage(1);
        }}
        options={[
          { value: "all", label: "All orders", count: orders.length },
          {
            value: "open",
            label: "To fulfil",
            count: orders.filter((o) =>
              ["PENDING", "CONFIRMED"].includes(o.status),
            ).length,
          },
          { value: "SHIPPED", label: "Shipped" },
          { value: "DELIVERED", label: "Delivered" },
          { value: "CANCELLED", label: "Cancelled" },
        ]}
      />
      <div className="work-toolbar">
        <span className="work-secondary">
          {filtered.length} {filtered.length === 1 ? "order" : "orders"}
          {role === "vendor" ? " containing your products" : ""}
        </span>
        <WorkSearch
          value={search}
          onChange={(value) => {
            setSearch(value);
            page.setPage(1);
          }}
          placeholder="Find an order or customer"
        />
      </div>
      <DataTable
        caption="Orders"
        rows={page.rows}
        columns={[
          {
            label: "Order",
            render: (order) => (
              <>
                <button
                  className="work-row-button"
                  onClick={() => setSelected(order)}
                >
                  {orderNumber(order.id)}
                </button>
                <small>{shortDate(order.createdAt)}</small>
              </>
            ),
          },
          {
            label: "Customer",
            className: "hide-small",
            render: (order) => (
              <Person name={order.user?.name} email={order.user?.email} />
            ),
          },
          {
            label: vendorId ? "Vendor qty" : "Items",
            className: "hide-medium",
            render: (order) =>
              order.items
                .filter(
                  (i) => !vendorId || String(i.product?.vendorId) === vendorId,
                )
                .reduce((n, i) => n + i.quantity, 0),
          },
          {
            label:
              role === "admin"
                ? vendorId
                  ? "Vendor items"
                  : "Total"
                : "Your items",
            className: "nowrap",
            render: (order) =>
              money(
                role === "admin"
                  ? vendorId
                    ? vendorItemTotal(order, vendorId)
                    : order.totalAmount
                  : itemTotal(order),
              ),
          },
          {
            label: "Status",
            render: (order) => <Status value={order.status} />,
          },
          {
            label: "Details",
            className: "right",
            render: (order) => (
              <button
                className="icon-button"
                aria-label={`Open ${orderNumber(order.id)}`}
                onClick={() => setSelected(order)}
              >
                <ArrowRight size={17} />
              </button>
            ),
          },
        ]}
      />
      <Pagination {...page} />
      {selected && (
        <OrderEditor
          key={selected.id}
          order={selected}
          role={role}
          onClose={() => setSelected(null)}
          onSaved={resource.reload}
        />
      )}
    </>
  );
}
