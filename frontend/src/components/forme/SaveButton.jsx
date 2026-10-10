import { Heart } from "lucide-react";
import { useSaved } from "../../context/SavedContext";
import { useAuth } from "../../context/AuthContext";
export function SaveButton({ product, compact = false }) {
  const { user } = useAuth();
  const { isSaved, toggle, busy, loading } = useSaved();
  if (user && user.role !== "CUSTOMER") return null;
  const saved = isSaved(product.id);
  return (
    <button
      type="button"
      className={`save-product ${compact ? "compact" : ""}`}
      aria-pressed={saved}
      aria-label={
        saved
          ? `Remove ${product.name} from saved items`
          : `Save ${product.name} for later`
      }
      disabled={busy || loading}
      onClick={() => toggle(product)}
    >
      <Heart
        size={18}
        fill={saved ? "currentColor" : "none"}
        aria-hidden="true"
      />
      {!compact && (
        <span>{saved ? "Saved to your list" : "Save for later"}</span>
      )}
    </button>
  );
}
