import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { vendorApi } from "../../api/vendor";
import { useToast } from "../../context/ToastContext";
import {
  PageHeading,
  WorkState,
  WorkSearch,
  DataTable,
  Person,
  Status,
  WorkDrawer,
  Empty,
  useResource,
} from "../../components/management/UI";
const load = () => vendorApi.getVendorRequests();
export const AdminVendorsPage = () => {
  const resource = useResource(load),
    toast = useToast(),
    [search, setSearch] = useState(""),
    [selected, setSelected] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const requests = resource.data?.requests || [],
    rows = requests.filter((r) =>
      `${r.name} ${r.email}`.toLowerCase().includes(search.toLowerCase()),
    );
  const approve = async () => {
    setBusy(true);
    setError("");
    try {
      await vendorApi.approveVendor(selected.id);
      toast.success(
        `${selected.name} can now add products to the store.`,
        "Vendor approved",
      );
      setSelected(null);
      resource.reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  if (resource.loading || resource.error)
    return <WorkState {...resource} retry={resource.reload} />;
  return (
    <>
      <PageHeading
        eyebrow="WELCOME THE NEXT MAKER"
        title="Vendor requests"
        description="Review the people who would like to sell with FORME."
      />
      <div className="work-split">
        <section>
          <div className="work-toolbar">
            <span className="work-secondary">
              {requests.length} awaiting review
            </span>
            <WorkSearch
              value={search}
              onChange={setSearch}
              placeholder="Find an applicant"
            />
          </div>
          <DataTable
            caption="Vendor requests"
            rows={rows}
            empty={
              <Empty
                title={
                  requests.length
                    ? "No matching requests."
                    : "You’re all caught up."
                }
                description={
                  requests.length
                    ? "Try a different name or email."
                    : "New vendor applications will appear here for your review."
                }
              />
            }
            columns={[
              {
                label: "Applicant",
                render: (row) => <Person name={row.name} email={row.email} />,
              },
              {
                label: "Status",
                className: "hide-small",
                render: () => <Status value="PENDING" />,
              },
              {
                label: "Review",
                className: "right",
                render: (row) => (
                  <button
                    className="icon-button"
                    aria-label={`Review ${row.name}`}
                    onClick={() => {
                      setSelected(row);
                      setError("");
                    }}
                  >
                    <ArrowRight size={17} />
                  </button>
                ),
              },
            ]}
          />
        </section>
        <aside className="work-aside">
          <p className="eyebrow">GROWING THE COLLECTION</p>
          <h2>Seller access</h2>
          <p>
            Approving an application gives that account access to its own seller
            studio, product listings and order management.
          </p>
          <dl>
            <div>
              <dt>Pending requests</dt>
              <dd>{requests.length}</dd>
            </div>
          </dl>
        </aside>
      </div>
      <WorkDrawer
        open={!!selected}
        onClose={() => !busy && setSelected(null)}
        title="Review application"
      >
        {selected && (
          <div className="work-form">
            <Person name={selected.name} email={selected.email} />
            <Status value="PENDING" />
            <p className="work-drawer-note">
              {selected.name} has requested a vendor account. Approval lets them
              create listings and manage orders for their products.
            </p>
            {error && (
              <p className="work-error" role="alert">
                {error}
              </p>
            )}
            <div className="work-form-actions">
              <button
                className="work-button secondary"
                disabled={busy}
                onClick={() => setSelected(null)}
              >
                Review later
              </button>
              <button className="work-button" disabled={busy} onClick={approve}>
                <Check size={16} />
                {busy ? "Approving…" : "Approve vendor"}
              </button>
            </div>
          </div>
        )}
      </WorkDrawer>
    </>
  );
};
