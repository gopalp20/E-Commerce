import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { authApi } from "../api/auth";
import { useToast } from "./ToastContext";
const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [isLoading, setLoading] = useState(
    () => !!localStorage.getItem("token"),
  );
  const [sessionError, setSessionError] = useState("");
  const clear = useCallback(() => {
    toast.clear();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, [toast]);
  useEffect(() => {
    let active = true;
    if (!localStorage.getItem("token")) return;
    authApi
      .getMe()
      .then((result) => {
        if (active) {
          setUser(result.user);
          localStorage.setItem("user", JSON.stringify(result.user));
        }
      })
      .catch((error) => {
        if (active) {
          if (error.response?.status === 401) clear();
          else
            setSessionError(
              "We could not verify your session. Please try signing in again.",
            );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [clear]);
  useEffect(() => {
    const expired = () => clear();
    window.addEventListener("forme:session-expired", expired);
    return () => window.removeEventListener("forme:session-expired", expired);
  }, [clear]);
  const authenticate = async (promise) => {
    const result = await promise;
    localStorage.setItem("token", result.token);
    localStorage.setItem("user", JSON.stringify(result.user));
    setSessionError("");
    setUser(result.user);
    return result.user;
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        sessionError,
        isAuthenticated: !!user,
        login: (email, password) =>
          authenticate(authApi.login(email, password)),
        register: (data) => authenticate(authApi.register(data)),
        logout: clear,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);
