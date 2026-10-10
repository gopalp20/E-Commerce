import { useAuth } from "../../context/AuthContext";
import { roleHome } from "../../lib/authNavigation";
import { Link } from "react-router-dom";
export function Brand({ large = false }) {
  const { user } = useAuth();
  return (
    <Link
      to={user ? roleHome(user) : "/"}
      aria-label="FORME home"
      className={`forme-wordmark ${large ? "forme-wordmark-large" : ""}`}
    >
      FORME
      <span className="forme-mark" aria-hidden="true">
        •
      </span>
    </Link>
  );
}
