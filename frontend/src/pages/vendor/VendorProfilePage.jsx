import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { PageHeading, Person } from "../../components/management/UI";
export const VendorProfilePage = () => {
  const { user } = useAuth();
  return (
    <>
      <PageHeading
        eyebrow="THE PERSON BEHIND THE PRODUCTS"
        title="Your studio"
        description="Your seller account, all in one place."
      />
      <div className="work-account-detail">
        <section>
          <Person name={user.name} email={user.email} />
          <dl>
            <div>
              <dt>Studio name</dt>
              <dd>{user.name}</dd>
            </div>
            <div>
              <dt>Email address</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt>Account type</dt>
              <dd>Approved vendor</dd>
            </div>
            <div>
              <dt>Seller ID</dt>
              <dd>{String(user.id).padStart(4, "0")}</dd>
            </div>
          </dl>
        </section>
        <aside className="work-aside">
          <p className="eyebrow">IN YOUR CORNER</p>
          <h2>Your product collection</h2>
          <p>
            Keep your product descriptions, photography and availability up to
            date. These are the details customers see in the store.
          </p>
          <Link to="/vendor/products" className="work-text-link">
            Manage your collection
            <ArrowUpRight size={15} />
          </Link>
        </aside>
      </div>
    </>
  );
};
