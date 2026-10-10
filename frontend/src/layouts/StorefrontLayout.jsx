import { RouteSurface } from "../components/forme/RouteSurface";
import { Navbar } from "../components/customer/Navbar";
import { useAuth } from "../context/AuthContext";
import { PageState } from "../components/forme/UI";
import { Footer } from "../components/customer/Footer";
import { useLocation } from "react-router-dom";
export const StorefrontLayout = () => {
  const { user, isLoading } = useAuth();
  const { pathname } = useLocation();
  const authPage = ["/login", "/register"].includes(pathname);
  if (isLoading) return <PageState loading />;
  return (
    <div
      className={`storefront ${user ? "signed-storefront" : "public-storefront"}${authPage ? " auth-storefront" : ""}`}
    >
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <RouteSurface />
      </main>
      <Footer />
    </div>
  );
};
