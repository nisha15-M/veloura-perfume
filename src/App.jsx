import { useEffect, useState } from "react";
import { getPerfumes, getQuick } from "./api.js";
import { useStore } from "./store.jsx";
import { Quiz, Notes, Compare, Custom, Wishlist, Bag } from "./pages.jsx";
import { Home, Signature, Shop, Loved, Collection } from "./front.jsx";
import { Particles, setAmbience } from "./ambient.jsx";
import { Login, useAuth } from "./auth.jsx";
import { Product } from "./product.jsx";

const TABS = [
  ["home", "Home"], ["collection", "Collection"], ["quiz", "Find your scent"],
  ["notes", "Notes"], ["compare", "Compare"], ["custom", "Personalize"],
];

const PATHS = {
  home: "/", signature: "/signature", shop: "/shop", loved: "/loved", collection: "/collection",
  quiz: "/quiz", notes: "/notes", compare: "/compare", custom: "/personalize",
  wish: "/wishlist", cart: "/bag", login: "/login",
};

function toUrl(v, o) {
  if (v === "product") return `/product/${encodeURIComponent(o?.id)}`;
  let u = PATHS[v] || "/";
  if (v === "collection" && o && (o.min || o.max)) {
    const q = new URLSearchParams();
    if (o.min) q.set("min", o.min);
    if (o.max) q.set("max", o.max);
    u += "?" + q;
  }
  return u;
}

function fromUrl() {
  const path = location.pathname.replace(/\/$/, "") || "/";
  if (path.startsWith("/product/")) return ["product", { id: decodeURIComponent(path.slice(9)) }];
  const v = Object.keys(PATHS).find((k) => PATHS[k] === path) || "home";
  let o = null;
  if (v === "collection") {
    const q = new URLSearchParams(location.search);
    if (q.get("min") || q.get("max")) o = { min: +q.get("min") || undefined, max: +q.get("max") || undefined };
  }
  return [v, o];
}

export default function App() {
  const init = fromUrl();
  const [view, setView] = useState(init[0]);
  const [items, setItems] = useState(getQuick);
  const [state, setState] = useState("ok");
  const { wish, cart } = useStore();
  const { user } = useAuth();

  const [sync, setSync] = useState("loading");
  const load = () => {
    setSync("loading");
    getPerfumes()
      .then((d) => {
        if (d.length) setItems(d);
        setSync(d.some((p) => typeof p.id === "string") ? "done" : "fail");
      })
      .catch(() => setSync("fail"));
  };
  useEffect(load, []);
  useEffect(() => {
    const h = (e) => go("product", { id: e.detail });
    window.addEventListener("veloura:open", h);
    return () => window.removeEventListener("veloura:open", h);
  }, []);
  const [opt, setOpt] = useState(init[1]);
  const [sound, setSound] = useState(false);
  const go = (v, o = null) => {
    history.pushState(null, "", toUrl(v, o));
    setOpt(o); setView(v); window.scrollTo(0, 0);
  };
  useEffect(() => {
    const onPop = () => { const [v, o] = fromUrl(); setView(v); setOpt(o); };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const toggleSound = () => { setAmbience(!sound); setSound(!sound); };
  const bagCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const props = { items, go, opt, view };
  const homeFlow = ["home", "signature", "shop", "loved"];
  const P = { home: Home, signature: Signature, shop: Shop, loved: Loved, collection: Collection, login: Login, product: Product, quiz: Quiz, notes: Notes, compare: Compare, custom: Custom, wish: Wishlist, cart: Bag }[view];

  return (
    <>
      <Particles />
      <nav>
        <span className="logo" onClick={() => go("home")}>
          VELOURA <small>— Luxury Fragrances</small>
        </span>
        {TABS.map(([k, l]) => (
          <a key={k} href={PATHS[k]} className={view === k || (k === "home" && homeFlow.includes(view)) ? "on" : ""} onClick={(e) => { e.preventDefault(); go(k); }}>{l}</a>
        ))}
        <button className={`ico ${sound ? "on" : ""}`} onClick={toggleSound} aria-pressed={sound} title="Click to play soft background music">♪ Ambience {sound ? "on" : "off"}</button>
        <button className="ico" onClick={() => go("login")}>{user ? `Hi, ${user.name.split(" ")[0]}` : "Sign in"}</button>
        <button className="ico" onClick={() => go("wish")}>♡ {wish.length}</button>
        <button className="ico" onClick={() => go("cart")}>Bag {bagCount}</button>
      </nav>
      <main key={view + JSON.stringify(opt)}>
        {state === "loading" && <p className="meta">Loading fragrances…</p>}
        {state === "error" && (
          <div>
            <p className="meta">Couldn't load perfumes. Check your connection or the API URL in .env.</p>
            <button className="btn" onClick={load}>Try again</button>
          </div>
        )}
        {state === "ok" && <P {...props} />}
      </main>
      {sync !== "done" && (
        <div className="sync" role="status">
          {sync === "loading" ? "Loading real perfume photos…" : <>Couldn't load live photos. <button onClick={load}>Retry</button></>}
        </div>
      )}
      <footer>Veloura — Luxury Fragrances. Every scent tells a story.</footer>
    </>
  );
}