import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useLocation } from "react-router-dom";
import { categoriesApi } from "../api/categories";
const CategoryContext = createContext(null);
export const CategoryProvider = ({ children }) => {
  const { pathname } = useLocation();
  const [categories, setCategories] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const request = useRef(0);
  const refresh = useCallback(async () => {
    const id = ++request.current;
    try {
      const data = await categoriesApi.getCategories();
      if (id === request.current) {
        setCategories(data.categories);
        setError("");
      }
    } catch (e) {
      if (id === request.current) setError(e.message);
    } finally {
      if (id === request.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    refresh();
  }, [pathname, refresh]);
  useEffect(() => {
    window.addEventListener("focus", refresh);
    window.addEventListener("forme:categories-changed", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("forme:categories-changed", refresh);
    };
  }, [refresh]);
  return (
    <CategoryContext.Provider value={{ categories, loading, error, refresh }}>
      {children}
    </CategoryContext.Provider>
  );
};
export const useCategories = () => useContext(CategoryContext);
