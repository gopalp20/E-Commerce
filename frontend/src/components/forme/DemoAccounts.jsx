import { UserRound, Store, Shield } from "lucide-react";
const accounts = [
  {
    role: "Customer",
    email: "hello@forme.demo",
    description: "Browse, shop and save addresses",
    Icon: UserRound,
  },
  {
    role: "Vendor",
    email: "studio@forme.demo",
    description: "Manage your products and orders",
    Icon: Store,
  },
  {
    role: "Admin",
    email: "admin@forme.demo",
    description: "Manage the marketplace",
    Icon: Shield,
  },
];
export function DemoAccounts({ onSelect }) {
  if (!import.meta.env.DEV) return null;
  return (
    <details className="demo-accounts">
      <summary>
        Try a demo account<span>3 roles</span>
      </summary>
      <p>Choose a role to fill the form, then sign in.</p>
      <div>
        {accounts.map(({ role, email, description, Icon }) => (
          <button
            type="button"
            key={role}
            onClick={() => onSelect(email, "FormeDemo2026!")}
          >
            <Icon size={18} />
            <span>
              <strong>{role}</strong>
              <small>{description}</small>
            </span>
          </button>
        ))}
      </div>
      <p>
        Demo password: <code>FormeDemo2026!</code>
      </p>
    </details>
  );
}
