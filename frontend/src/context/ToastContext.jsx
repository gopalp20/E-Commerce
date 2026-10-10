import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import { Check, AlertCircle, Info, X } from "lucide-react";
const ToastContext = createContext(null);
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());
  const remove = useCallback((id) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((items) => items.filter((item) => item.id !== id));
  }, []);
  const show = useCallback(
    (type, message, title = "") => {
      const id = crypto.randomUUID();
      setToasts((items) => [...items.slice(-2), { id, type, message, title }]);
      timers.current.set(
        id,
        setTimeout(() => remove(id), type === "error" ? 7000 : 5000),
      );
    },
    [remove],
  );
  useEffect(() => {
    const active = timers.current;
    return () => {
      for (const timer of active.values()) clearTimeout(timer);
      active.clear();
    };
  }, []);
  const clear = useCallback(() => {
    for (const timer of timers.current.values()) clearTimeout(timer);
    timers.current.clear();
    setToasts([]);
  }, []);
  const pause = (id) => clearTimeout(timers.current.get(id));
  const resume = (id) => {
    pause(id);
    timers.current.set(
      id,
      setTimeout(() => remove(id), 4000),
    );
  };
  const toast = useMemo(
    () => ({
      clear,
      success: (message, title = "Done") => show("success", message, title),
      error: (message, title = "Something needs attention") =>
        show("error", message, title),
      warning: (message, title = "Please check") =>
        show("warning", message, title),
      info: (message, title = "A quick note") => show("info", message, title),
    }),
    [show, clear],
  );
  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="forme-toasts" aria-label="Notifications">
        {toasts.map((item) => (
          <div
            className={`forme-toast toast-${item.type}`}
            key={item.id}
            role={item.type === "error" ? "alert" : "status"}
            onMouseEnter={() => pause(item.id)}
            onMouseLeave={(event) => {
              if (!event.currentTarget.contains(document.activeElement))
                resume(item.id);
            }}
            onFocusCapture={() => pause(item.id)}
            onBlurCapture={(event) => {
              if (
                !event.currentTarget.contains(event.relatedTarget) &&
                !event.currentTarget.matches(":hover")
              )
                resume(item.id);
            }}
          >
            <span className="toast-symbol">
              {item.type === "success" ? (
                <Check size={18} />
              ) : item.type === "error" || item.type === "warning" ? (
                <AlertCircle size={18} />
              ) : (
                <Info size={18} />
              )}
            </span>
            <div>
              <strong>{item.title}</strong>
              <p>{item.message}</p>
            </div>
            <button
              aria-label="Dismiss notification"
              onClick={() => remove(item.id)}
            >
              <X size={17} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
export const useToast = () => useContext(ToastContext);
