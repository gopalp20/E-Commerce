import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { cartApi } from "../api/cart";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";
const CartContext = createContext(null);
export const CartProvider = ({ children }) => {
  const { user, isLoading: authLoading } = useAuth(),
    toast = useToast(),
    navigate = useNavigate(),
    location = useLocation();
  const [cart, setCart] = useState({ items: [] }),
    [isLoading, setLoading] = useState(true),
    [error, setError] = useState("");
  const version = useRef(0);
  const customerId = user?.role === "CUSTOMER" ? user.id : null;
  const refreshCart = useCallback(async () => {
    const request = ++version.current;
    if (!customerId) {
      setCart({ items: [] });
      return;
    }
    const result = await cartApi.getCart();
    if (request === version.current) {
      setCart({ ...result.cart, ownerId: customerId });
      setError("");
    }
  }, [customerId]);
  useEffect(() => {
    if (authLoading) return;
    let active = true;
    setCart({ items: [] });
    setError("");
    setLoading(true);
    refreshCart()
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      version.current++;
    };
  }, [refreshCart, authLoading]);
  useEffect(() => {
    const changed = () => refreshCart().catch((e) => setError(e.message));
    window.addEventListener("forme:cart-changed", changed);
    return () => window.removeEventListener("forme:cart-changed", changed);
  }, [refreshCart]);
  const mutate = async (action, message) => {
    const request = ++version.current;
    try {
      const result = await action();
      if (request !== version.current) return false;
      setCart({ ...result.cart, ownerId: customerId });
      setError("");
      if (message) toast.success(message, "Added to your bag");
      return true;
    } catch (e) {
      if (request === version.current) toast.error(e.message);
      return false;
    }
  };
  // Never render one customer's count while the next customer's request loads.
  const visibleCart =
    customerId && cart.ownerId === customerId ? cart : { items: [] };
  const items = visibleCart.items || [];
  const subtotal =
    items.reduce(
      (sum, item) =>
        sum +
        Math.round(Number(item.product?.price || 0) * 100) * item.quantity,
      0,
    ) / 100;
  return (
    <CartContext.Provider
      value={{
        cart: visibleCart,
        items,
        subtotal,
        total: subtotal,
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
        isLoading,
        error,
        refreshCart,
        addToCart: (product, quantity = 1) => {
          if (authLoading) return Promise.resolve(false);
          if (!user) {
            navigate("/login", {
              state: {
                reason: "add-to-bag",
                pendingAdd: {
                  productId: product.id,
                  quantity,
                  name: product.name,
                  imageUrl: product.imageUrl,
                },
                from: { pathname: location.pathname, search: location.search },
              },
            });
            return Promise.resolve(false);
          }
          if (!customerId) {
            toast.info(
              "Switch to a customer account to shop. Your store account manages products and orders.",
            );
            return Promise.resolve(false);
          }
          return mutate(
            () => cartApi.addToCart(product.id, quantity),
            product.name,
          );
        },
        updateQuantity: (id, quantity) =>
          mutate(() => cartApi.updateCartItem(id, quantity)),
        removeFromCart: (id) => mutate(() => cartApi.removeCartItem(id)),
        clearCart: () => mutate(() => cartApi.clearCart()),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
export const useCart = () => useContext(CartContext);
