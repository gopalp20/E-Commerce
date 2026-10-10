import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { savedApi } from "../api/saved";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";
const SavedContext = createContext(null);
export function SavedProvider({ children }) {
  const { user, isLoading: authLoading } = useAuth();
  const customerId = user?.role === "CUSTOMER" ? user.id : null;
  const navigate = useNavigate(),
    toast = useToast();
  const identity = useRef(customerId);
  useLayoutEffect(() => {
    identity.current = customerId;
  }, [customerId]);
  const sequence = useRef(0),
    locked = useRef(false);
  const [state, setState] = useState({
    owner: null,
    items: [],
    loading: true,
    error: "",
  });
  const [busy, setBusy] = useState(false);
  const refresh = useCallback(async () => {
    const run = ++sequence.current;
    if (!customerId) {
      setState({ owner: null, items: [], loading: false, error: "" });
      return;
    }
    try {
      const result = await savedApi.list();
      if (run === sequence.current && identity.current === customerId)
        setState({
          owner: customerId,
          items: result.items,
          loading: false,
          error: "",
        });
    } catch (error) {
      if (run === sequence.current && identity.current === customerId)
        setState((s) => ({
          ...s,
          owner: customerId,
          items: s.owner === customerId ? s.items : [],
          loading: false,
          error: error.message,
        }));
    }
  }, [customerId]);
  useEffect(() => {
    if (authLoading) return;
    let active = true;
    const requests = sequence;
    queueMicrotask(() => {
      if (active) refresh();
    });
    const changed = () => refresh();
    window.addEventListener("forme:saved-changed", changed);
    window.addEventListener("focus", changed);
    return () => {
      active = false;
      requests.current++;
      window.removeEventListener("forme:saved-changed", changed);
      window.removeEventListener("focus", changed);
    };
  }, [authLoading, refresh]);
  const mutate = async (action, message, affectsBag = false) => {
    if (locked.current) return false;
    locked.current = true;
    setBusy(true);
    try {
      await action();
      if (identity.current !== customerId) return false;
      if (affectsBag) window.dispatchEvent(new Event("forme:cart-changed"));
      await refresh();
      toast.success(message);
      return true;
    } catch (error) {
      if (identity.current === customerId) {
        toast.error(error.message);
        await refresh();
      }
      return false;
    } finally {
      locked.current = false;
      setBusy(false);
    }
  };
  const items = state.owner === customerId ? state.items : [];
  return (
    <SavedContext.Provider
      value={{
        items,
        busy,
        error: state.owner === customerId ? state.error : "",
        loading:
          authLoading ||
          (customerId && state.owner !== customerId) ||
          state.loading,
        refresh,
        isSaved: (id) => items.some((item) => item.productId === id),
        toggle: (product) => {
          if (authLoading) return;
          if (!user) {
            navigate("/login", {
              state: {
                pendingSave: { productId: product.id, name: product.name },
                reviewReturn: "/saved",
              },
            });
            return;
          }
          if (!customerId) {
            toast.info("Use a customer account to save products.");
            return;
          }
          const exists = items.some((item) => item.productId === product.id);
          return mutate(
            () =>
              exists ? savedApi.remove(product.id) : savedApi.save(product.id),
            exists ? "Removed from saved items" : "Saved for later",
          );
        },
        remove: (id) =>
          mutate(() => savedApi.remove(id), "Removed from saved items"),
        saveFromBag: (item) =>
          mutate(
            () => savedApi.save(item.productId, true),
            "Moved to saved items",
            true,
          ),
        moveToBag: (item, quantity) =>
          mutate(
            () =>
              savedApi.moveToBag(
                item.productId,
                quantity,
                Number(item.product.price),
              ),
            "Moved to your bag",
            true,
          ),
      }}
    >
      {children}
    </SavedContext.Provider>
  );
}
// eslint-disable-next-line react-refresh/only-export-components
export const useSaved = () => useContext(SavedContext);
