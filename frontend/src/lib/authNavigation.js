import { savedApi } from "../api/saved";
import { cartApi } from "../api/cart";
export const roleHome = (user) =>
  user?.role === "ADMIN"
    ? "/admin"
    : user?.role === "VENDOR"
      ? "/vendor"
      : "/shop";
export async function finishSignIn(
  user,
  pendingAdd,
  toast,
  reviewReturn,
  pendingSave,
) {
  if (user.role === "CUSTOMER" && pendingAdd) {
    try {
      await cartApi.addToCart(pendingAdd.productId, pendingAdd.quantity);
      window.dispatchEvent(new Event("forme:cart-changed"));
      toast.success(pendingAdd.name, "Added to your bag");
    } catch (error) {
      toast.warning(error.message, "Signed in · item not added");
    }
  }
  if (user.role !== "CUSTOMER" && pendingAdd) {
    toast.info(
      "Use a customer account to shop. Your seller or admin dashboard is ready.",
      "Signed in to your workspace",
    );
  }
  if (user.role === "CUSTOMER" && pendingSave) {
    try {
      await savedApi.save(pendingSave.productId);
      window.dispatchEvent(new Event("forme:saved-changed"));
      toast.success(pendingSave.name, "Saved for later");
    } catch (error) {
      toast.warning(error.message, "Signed in · item not saved");
    }
  }
  return signInDestination(user, reviewReturn);
}

export function signInDestination(user, reviewReturn) {
  return user.role === "CUSTOMER" &&
    (reviewReturn === "/saved" ||
      /^\/products\/[1-9]\d*#reviews$/.test(reviewReturn || ""))
    ? reviewReturn
    : roleHome(user);
}
