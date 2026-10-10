import { useState } from "react";
import { inr } from "./api.js";
import { Card } from "./pages.jsx";
import { HeroBottle } from "./bottle.jsx";

const TIERS = [
  ["Everyday luxury", "Under ₹500", { max: 500 }, "from ₹300"],
  ["Signature blends", "₹500 – ₹2,000", { min: 500, max: 2000 }, "from ₹500"],
  ["Reserve collection", "Above ₹2,000", { min: 2000 }, "₹2,000+"],
];
const inTier = (p, t) => p.price >= (t.min || 0) && p.price <= (t.max ?? Infinity);

const NOTES = ["Oud", "Rose", "Amber", "Saffron", "Jasmine", "Sandalwood", "Vetiver", "Bergamot", "Musk", "Vanilla", "Patchouli", "Neroli"];
const PYRAMID = [["Top", "Saffron · Bergamot · Pink pepper"], ["Heart", "Damask rose · Oud · Jasmine"], ["Base", "Amber · Sandalwood · Vanilla musk"]];

const FLOW = ["home", "signature", "shop", "loved", "collection"];
function Pager({ view, go }) {
  const i = FLOW.indexOf(view);
  return (
    <div className="pager">
      {i > 0 ? <button className="btn ghost" onClick={() => go(FLOW[i - 1])}>← Previous</button> : <span />}
      <span className="dots">{FLOW.slice(0, 4).map((v) => <i key={v} className={v === view ? "on" : ""} />)}</span>
      <button className="btn" onClick={() => go(FLOW[i + 1])}>{i === 3 ? "Open the collection →" : "Next →"}</button>
    </div>
  );
}

/* Page 1: front page only */
export function Home({ items, go, view }) {
  const min = Math.min(...items.map((p) => p.price));
  return (
    <>
      <section className="lux full">
        <div className="luxtext">
          <h1 className="shimmer">VELOURA</h1>
          <p className="serif tag">Luxury Fragrances</p>
          <p className="meta big">Slow-aged blends and rare oils, from everyday signatures to reserve oud.</p>
          <div className="badge">Starting at <b>{inr(min)}</b></div>
          <div className="ctas">
            <button className="btn" onClick={() => go("collection")}>Explore the collection</button>
            <button className="btn ghost" onClick={() => go("quiz")}>Find your scent</button>
          </div>
        </div>
        <div className="stage">
          <div className="glow" /><div className="ring" /><div className="ring r2" />
          <HeroBottle />
          {["Oud", "Rose", "Amber"].map((n, k) => <span key={n} className={`fl fl${k}`}>{n}</span>)}
        </div>
      </section>
      <div className="marquee" aria-hidden="true">
        <div className="track notes">{[...NOTES, ...NOTES].map((n, k) => <span key={k}>{n}<i>✦</i></span>)}</div>
      </div>
      <Pager view={view} go={go} />
    </>
  );
}

/* Page 2 */
export function Signature({ go, view }) {
  return (
    <>
      <section className="showcase">
        <div className="sbottle"><HeroBottle /></div>
        <div>
          <h2 style={{ fontSize: 44 }}>Signature No. 1</h2>
          <p className="meta big">Our house scent. It opens bright, warms into rose and oud, and settles into amber for ten hours or more.</p>
          {PYRAMID.map(([l, t], k) => (
            <div className="pyr" key={l} style={{ width: `${70 + k * 15}%` }}>
              <b className="serif">{l}</b><span>{t}</span>
            </div>
          ))}
          <button className="btn" style={{ marginTop: 22 }} onClick={() => go("collection", { min: 2000 })}>See the reserve collection</button>
        </div>
      </section>
      <div className="trust">
        <div><b>Luxury fragrances</b>Premium and authentic</div>
        <div><b>Free shipping</b>On orders above ₹999</div>
        <div><b>Secure payments</b>Safe and encrypted</div>
        <div><b>Gift packaging</b>Included on request</div>
      </div>
      <Pager view={view} go={go} />
    </>
  );
}

/* Page 3 */
export function Shop({ items, go, view }) {
  return (
    <>
      <h2 className="title">Shop by price</h2>
      <p className="meta">Choose a range and see only those fragrances.</p>
      <div className="tiers" style={{ marginTop: 24 }}>
        {TIERS.map(([n, r, t, big]) => {
          const m = items.filter((p) => inTier(p, t));
          return (
            <button className="tier" key={n} onClick={() => go("collection", t)}>
              <span className="bignum">{big}</span>
              <h3>{n}</h3>
              <span className="meta">{r} · {m.length} fragrances</span>
            </button>
          );
        })}
      </div>
      <Pager view={view} go={go} />
    </>
  );
}

/* Page 4 */
export function Loved({ items, go, view }) {
  const loved = [...items].sort((a, b) => (b.clean ? 1 : 0) - (a.clean ? 1 : 0) || b.rating - a.rating);
  return (
    <>
      <h2 className="title">Most loved</h2>
      <p className="meta">Our highest-rated fragrances.</p>
      <div className="grid" style={{ marginTop: 20 }}>{loved.slice(0, 8).map((p) => <Card key={p.id} p={p} />)}</div>
      <Pager view={view} go={go} />
    </>
  );
}

export function Collection({ items, opt }) {
  const [price, setPrice] = useState(opt || {});
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("rating");
  const list = items
    .filter((p) => inTier(p, price) && (cat === "All" || p.category === cat) && p.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (sort === "price" ? a.price - b.price : sort === "high" ? b.price - a.price : (typeof b.id === "string") - (typeof a.id === "string") || b.rating - a.rating));
  const same = (t) => JSON.stringify(t) === JSON.stringify(price);
  return (
    <>
      <header className="banner">
        <h2 className="title">The Collection</h2>
        <p className="meta">{items.length} fragrances, crafted to last. Showing {list.length}.</p>
      </header>
      <div className="chips">
        <button className={`chip ${same({}) ? "on" : ""}`} onClick={() => setPrice({})}>Any price</button>
        {TIERS.map(([, r, t]) => <button key={r} className={`chip ${same(t) ? "on" : ""}`} onClick={() => setPrice(t)}>{r}</button>)}
        <span style={{ width: 16 }} />
        {["All", "Men", "Women", "Unisex"].map((c) => <button key={c} className={`chip ${cat === c ? "on" : ""}`} onClick={() => setCat(c)}>{c}</button>)}
      </div>
      <div className="toolbar">
        <input placeholder="Search perfumes" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="rating">Sort by rating</option>
          <option value="price">Price: low to high</option>
          <option value="high">Price: high to low</option>
        </select>
      </div>
      <div className="grid" style={{ marginTop: 20 }}>
        {list.map((p) => <Card key={p.id} p={p} />)}
        {!list.length && <p className="meta">No perfumes match. Clear the search or change the filter.</p>}
      </div>
    </>
  );
}