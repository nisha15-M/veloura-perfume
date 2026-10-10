import { createContext, useContext, useEffect, useState } from "react";

const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);

function usePersisted(key, initial) {
  const [v, setV] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) ?? initial; } catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }, [key, v]);
  return [v, setV];
}

export function StoreProvider({ children }) {
  const [wish, setWish] = usePersisted("veloura:wish", []);
  const [cart, setCart] = usePersisted("veloura:cart", {});
  const [toast, setToast] = useState("");

  const say = (t) => { setToast(t); setTimeout(() => setToast(""), 1600); };
  const toggleWish = (id) => {
    setWish((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]));
    say(wish.includes(id) ? "Removed from wishlist" : "Added to wishlist");
  };
  const addToCart = (id, n = 1) => {
    setCart((c) => {
      const q = (c[id] || 0) + n;
      const next = { ...c };
      if (q <= 0) delete next[id]; else next[id] = q;
      return next;
    });
    if (n > 0) say("Added to bag");
  };
  const clearCart = () => setCart({});

  return (
    <Ctx.Provider value={{ wish, cart, toggleWish, addToCart, clearCart, say }}>
      {children}
      <div className={`toast ${toast ? "show" : ""}`} role="status">{toast}</div>
    </Ctx.Provider>
  );
}
