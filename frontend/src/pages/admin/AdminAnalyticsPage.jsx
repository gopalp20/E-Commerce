import { useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { adminApi } from "../../api/admin";
import { money } from "../../lib/format";
import {
  PageHeading,
  MetricStrip,
  Panel,
  WorkState,
  Status,
  useResource,
} from "../../components/management/UI";
import { VendorFilter } from "../../components/management/VendorFilter";
import { vendorItemTotal } from "../../lib/vendorScope.mjs";
export const AdminAnalyticsPage = () => {
  const [params, setParams] = useSearchParams();
  const vendorId = params.get("vendor") || "";
  const load = useCallback(async () => {
    const [o, v] = await Promise.all([
      adminApi.getAdminOrders(vendorId ? { vendorId } : {}),
      adminApi.getVendors(),
    ]);
    return { ...o, vendors: v.vendors };
  }, [vendorId]);
  const resource = useResource(load);
  const valueOf = (order) =>
    vendorId ? vendorItemTotal(order, vendorId) : Number(order.totalAmount);
  if (resource.loading || resource.error)
    return <WorkState {...resource} retry={resource.reload} />;
  const orders = resource.data.orders,
    kept = orders.filter((o) => o.status !== "CANCELLED"),
    total = kept.reduce((n, o) => n + valueOf(o), 0),
    now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const selected = kept.filter((o) => {
      const d = new Date(o.createdAt);
      return (
        d.getFullYear() === date.getFullYear() &&
        d.getMonth() === date.getMonth()
      );
    });
    return {
      label: date.toLocaleDateString("en-IN", { month: "short" }),
      value: selected.reduce((n, o) => n + valueOf(o), 0),
    };
  });
  const max = Math.max(1, ...months.map((m) => m.value));
  return (
    <>
      <PageHeading
        eyebrow="A CLOSER LOOK"
        title="Store reports"
        description="Order totals, monthly activity and fulfilment progress."
      >
        <Link
          className="work-button secondary"
          to={`/admin/orders${vendorId ? `?vendor=${vendorId}` : ""}`}
        >
          View orders
          <ArrowRight size={16} />
        </Link>
      </PageHeading>
      <div className="work-vendor-scope">
        <VendorFilter
          value={vendorId}
          vendors={resource.data.vendors}
          onChange={(value) => {
            const next = new URLSearchParams(params);
            if (value) next.set("vendor", value);
            else next.delete("vendor");
            setParams(next);
          }}
        />
        {vendorId && (
          <p>
            Reporting this vendor’s items at their purchased prices. Delivery
            charges and other vendors’ items are excluded.
          </p>
        )}
      </div>
      <MetricStrip
        items={[
          {
            label: vendorId ? "Vendor item value" : "Order value",
            value: money(total),
            note: "All time · excludes cancellations",
          },
          {
            label: "Orders received",
            value: orders.length,
            note: "All statuses",
          },
          {
            label: vendorId ? "Average item value / order" : "Average order",
            value: money(kept.length ? total / kept.length : 0),
            note: "Excludes cancellations",
          },
          {
            label: "Delivered",
            value: orders.filter((o) => o.status === "DELIVERED").length,
            note: "Completed orders",
          },
        ]}
      />
      <div className="work-report-grid">
        <Panel
          title={
            vendorId ? "Vendor item value over time" : "Order value over time"
          }
          description="The last six calendar months."
        >
          <figure aria-label="Monthly order value">
            <div className="work-chart">
              {months.map((month, i) => (
                <div className="work-chart-column" key={i}>
                  <strong>{money(month.value)}</strong>
                  <div
                    style={{ height: `${(month.value / max) * 75}%` }}
                    title={`${month.label}: ${money(month.value)}`}
                  />
                  <small>{month.label}</small>
                </div>
              ))}
            </div>
            <figcaption className="work-chart-caption">
              {vendorId
                ? "Only the selected vendor’s items. Delivery is excluded."
                : "Includes delivery charges."}{" "}
              Cancelled orders are excluded.
            </figcaption>
          </figure>
        </Panel>
        <Panel
          title="Order progress"
          description="Every order, by its current status."
        >
          {["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"].map(
            (status) => {
              const count = orders.filter((o) => o.status === status).length;
              return (
                <div key={status} className="work-breakdown">
                  <div>
                    <Status value={status} />
                    <span>{count}</span>
                  </div>
                  <div className="work-breakdown-track">
                    <i
                      style={{
                        width: `${orders.length ? (count / orders.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              );
            },
          )}
        </Panel>
      </div>
      <p className="work-report-note">
        Order value records placed orders. It does not represent payments
        collected.
      </p>
    </>
  );
};
