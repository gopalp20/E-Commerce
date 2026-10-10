import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { adminApi } from "../../api/admin";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { FormeSelect } from "../../components/forme/Select";
import {
  PageHeading,
  WorkSearch,
  WorkState,
  FilterTabs,
  DataTable,
  Status,
  Person,
  WorkDrawer,
  useResource,
  usePage,
  Pagination,
} from "../../components/management/UI";
import { shortDate } from "../../components/management/Orders";
const load = () => adminApi.getUsers();
export const AdminUsersPage = () => {
  const resource = useResource(load),
    { user } = useAuth(),
    toast = useToast();
  const [search, setSearch] = useState(""),
    [filter, setFilter] = useState("all"),
    [selected, setSelected] = useState(null),
    [role, setRole] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const users = resource.data?.users || [],
    filtered = users.filter(
      (u) =>
        (filter === "all" || u.role === filter) &&
        `${u.name} ${u.email}`.toLowerCase().includes(search.toLowerCase()),
    ),
    page = usePage(filtered);
  const open = (person) => {
    setSelected(person);
    setRole(person.role);
    setError("");
  };
  const save = async () => {
    setBusy(true);
    setError("");
    try {
      await adminApi.updateUserRole(selected.id, role);
      toast.success(
        `${selected.name} is now a ${role.toLowerCase()}.`,
        "Account updated",
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
        eyebrow="THE PEOPLE BEHIND FORME"
        title="People"
        description="Customers, independent makers and your store team."
      />
      <FilterTabs
        value={filter}
        onChange={(value) => {
          setFilter(value);
          page.setPage(1);
        }}
        options={[
          { value: "all", label: "Everyone", count: users.length },
          { value: "CUSTOMER", label: "Customers" },
          { value: "VENDOR", label: "Vendors" },
          { value: "ADMIN", label: "Administrators" },
        ]}
      />
      <div className="work-toolbar">
        <span className="work-secondary">
          {filtered.length} {filtered.length === 1 ? "account" : "accounts"}
        </span>
        <WorkSearch
          value={search}
          onChange={(value) => {
            setSearch(value);
            page.setPage(1);
          }}
          placeholder="Find a name or email"
        />
      </div>
      <DataTable
        caption="People"
        rows={page.rows}
        columns={[
          {
            label: "Person",
            render: (row) => <Person name={row.name} email={row.email} />,
          },
          { label: "Role", render: (row) => <Status value={row.role} /> },
          {
            label: "Joined",
            className: "hide-small",
            render: (row) => (
              <span className="work-secondary">{shortDate(row.createdAt)}</span>
            ),
          },
          {
            label: "Account",
            className: "right",
            render: (row) => (
              <button
                className="icon-button"
                aria-label={`Manage ${row.name}`}
                onClick={() => open(row)}
              >
                <ArrowRight size={17} />
              </button>
            ),
          },
        ]}
      />
      <Pagination {...page} />
      <WorkDrawer
        open={!!selected}
        onClose={() => !busy && setSelected(null)}
        title="Account details"
      >
        {selected && (
          <div className="work-form">
            <Person name={selected.name} email={selected.email} />
            <dl className="work-product-facts">
              <div>
                <dt>Joined</dt>
                <dd>{shortDate(selected.createdAt)}</dd>
              </div>
              <div>
                <dt>Account ID</dt>
                <dd>{selected.id}</dd>
              </div>
            </dl>
            <FormeSelect
              label="Account role"
              disabled={selected.id === user.id}
              value={role}
              onValueChange={setRole}
              options={[
                { value: "CUSTOMER", label: "Customer" },
                { value: "VENDOR", label: "Vendor" },
                { value: "ADMIN", label: "Administrator" },
              ]}
            />
            <p className="work-drawer-note">
              {selected.id === user.id
                ? "You’re signed in with this account. Your administrator role is protected."
                : role === "ADMIN"
                  ? "Administrators can manage all users, products, orders and store settings."
                  : role === "VENDOR"
                    ? "Vendors can manage their own products and fulfil eligible orders."
                    : "Customers can shop, save addresses and manage their own orders."}
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
                Close
              </button>
              <button
                className="work-button"
                disabled={
                  busy || selected.id === user.id || role === selected.role
                }
                onClick={save}
              >
                {busy ? "Saving…" : "Save role"}
              </button>
            </div>
          </div>
        )}
      </WorkDrawer>
    </>
  );
};
