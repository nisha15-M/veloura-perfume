import { useState } from "react";
import { inr } from "./api.js";
import { useStore } from "./store.jsx";
import { Img } from "./img.jsx";

export function Card({ p }) {
  const { wish, toggleWish, addToCart } = useStore();
  return (
    <div className="card">
      <button className="heart" aria-label="Wishlist" onClick={() => toggleWish(p.id)}>
        {wish.includes(p.id) ? "♥" : "♡"}
      </button>
      <div className={`bot ${p.fit === "contain" ? "light" : ""}`}><Img p={p} /></div>
      <h3>{p.name}</h3>
      <div className="meta">{p.brand} · {p.family}</div>
      <div className="meta">★ {p.rating}</div>
      <div className="row">
        <span className="price">{inr(p.price)}</span>
        <button className="btn sm" onClick={() => addToCart(p.id)}>Add</button>
      </div>
    </div>
  );
}

const QUESTIONS = [
  ["What kind of fragrance do you prefer?", ["Floral", "Woody", "Fresh"]],
  ["When will you wear it?", ["Daily", "Evenings", "Occasions"]],
  ["Pick a mood", ["Bold", "Calm", "Romantic"]],
];

export function Quiz({ items }) {
  const [i, setI] = useState(0);
  const [ans, setAns] = useState([]);
  if (i >= QUESTIONS.length) {
    const match = items.find((p) => p.family === ans[0]) || items[0];
    return (
      <>
        <h2 className="title">Your match</h2>
        <div className="grid" style={{ maxWidth: 260, margin: "20px 0" }}><Card p={match} /></div>
        <button className="btn ghost" onClick={() => { setI(0); setAns([]); }}>Retake quiz</button>
      </>
    );
  }
  const [text, opts] = QUESTIONS[i];
  return (
    <>
      <h2 className="title">Scent finder quiz</h2>
      <div className="bar"><i style={{ width: `${((i + 1) / QUESTIONS.length) * 100}%` }} /></div>
      <p className="meta">Question {i + 1} of {QUESTIONS.length}</p>
      <h3 style={{ fontSize: 26 }}>{text}</h3>
      <div className="opts">
        {opts.map((o) => (
          <button key={o} className="opt" onClick={() => { const a = [...ans]; a[i] = o; setAns(a); setI(i + 1); }}>
            <span className="serif">{o}</span>
          </button>
        ))}
      </div>
      {i > 0 && <button className="btn ghost" onClick={() => setI(i - 1)}>Back</button>}
    </>
  );
}

export function Notes({ items }) {
  const [f, setF] = useState("All");
  const list = items.filter((p) => f === "All" || p.family === f);
  return (
    <>
      <h2 className="title">Fragrance notes explorer</h2>
      <p className="meta">Understand the story behind every scent.</p>
      <div className="chips">
        {["All", "Floral", "Woody", "Fresh"].map((n) => (
          <button key={n} className={`chip ${f === n ? "on" : ""}`} onClick={() => setF(n)}>{n}</button>
        ))}
      </div>
      <div className="grid">
        {list.map((p) => (
          <div className="card" key={p.id}>
            <div className="bot small"><Img p={p} /></div>
            <h3>{p.name}</h3>
            <p className="meta">Top: {p.top}</p>
            <p className="meta">Heart: {p.mid}</p>
            <p className="meta">Base: {p.base}</p>
            <div className="chips">{p.notes.map((n) => <span className="chip" key={n}>{n}</span>)}</div>
          </div>
        ))}
      </div>
    </>
  );
}

export function Compare({ items }) {
  const { addToCart } = useStore();
  const [ids, setIds] = useState([items[0].id, items[1]?.id ?? items[0].id]);
  const [a, b] = ids.map((id) => items.find((p) => String(p.id) === String(id)) || items[0]);
  const pick = (k) => (
    <select value={ids[k]} onChange={(e) => { const p = items.find((x) => String(x.id) === e.target.value); if (p) setIds(ids.map((v, j) => (j === k ? p.id : v))); }}>
      {items.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
    </select>
  );
  const rows = [
    ["Price", (p) => inr(p.price)], ["Family", (p) => p.family], ["Top notes", (p) => p.top],
    ["Heart notes", (p) => p.mid], ["Base notes", (p) => p.base], ["Longevity", (p) => p.longevity],
  ];
  return (
    <>
      <h2 className="title">Compare perfumes</h2>
      <p className="meta">Find the right match side by side.</p>
      <div className="scroll">
        <table>
          <thead>
            <tr><th></th><th>{pick(0)}</th><th>{pick(1)}</th></tr>
            <tr><td></td>{[a, b].map((p, k) => <td key={k}><Img p={p} className="cmpimg" /></td>)}</tr>
          </thead>
          <tbody>
            {rows.map(([l, f]) => <tr key={l}><td>{l}</td><td>{f(a)}</td><td>{f(b)}</td></tr>)}
            <tr><td></td>{[a, b].map((p, k) => <td key={k}><button className="btn" onClick={() => addToCart(p.id)}>Add to bag</button></td>)}</tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

export function Custom({ items }) {
  const { addToCart, say } = useStore();
  const [wrap, setWrap] = useState("Premium");
  const [msg, setMsg] = useState("");
  const [eng, setEng] = useState("");
  const W = [["Standard", 0], ["Premium", 350], ["Luxury", 990]];
  const extra = W.find((w) => w[0] === wrap)[1];
  return (
    <>
      <h2 className="title">Personalize your perfume</h2>
      <p className="meta">Make it more special with custom options.</p>
      <div className="two" style={{ marginTop: 20 }}>
        <div className="hero preview">{items[0] && <Img p={items[0]} />}{eng && <span className="engr">{eng}</span>}</div>
        <div>
          <label>Gift message</label>
          <textarea rows="3" maxLength="120" value={msg} onChange={(e) => setMsg(e.target.value)} />
          <p style={{ margin: "16px 0 4px" }}>Gift wrapping</p>
          <div className="opts" style={{ margin: "0 0 16px" }}>
            {W.map(([n, c]) => (
              <button key={n} className={`opt ${wrap === n ? "on" : ""}`} onClick={() => setWrap(n)}>
                {n}<br /><span className="meta">{c ? inr(c) : "Free"}</span>
              </button>
            ))}
          </div>
          <label>Bottle engraving</label>
          <input maxLength="14" placeholder="Initials or name" value={eng} onChange={(e) => setEng(e.target.value)} />
          <div className="row" style={{ marginTop: 22 }}>
            <span className="price">{inr(extra)}</span>
            <button className="btn" onClick={() => { addToCart(items[0].id); say("Personalized bottle added"); }}>Add to bag</button>
          </div>
        </div>
      </div>
    </>
  );
}

export function Wishlist({ items, go }) {
  const { wish } = useStore();
  const list = items.filter((p) => wish.includes(p.id));
  return (
    <>
      <h2 className="title">My wishlist</h2>
      {list.length ? (
        <div className="grid" style={{ marginTop: 20 }}>{list.map((p) => <Card key={p.id} p={p} />)}</div>
      ) : (
        <>
          <p className="meta">Nothing saved yet. Tap the heart on any perfume.</p>
          <button className="btn" onClick={() => go("collection")}>Browse collection</button>
        </>
      )}
    </>
  );
}

export function Bag({ items, go }) {
  const { cart, addToCart, clearCart, say } = useStore();
  const list = items.filter((p) => cart[p.id]);
  const total = list.reduce((s, p) => s + p.price * cart[p.id], 0);
  if (!list.length)
    return (
      <>
        <h2 className="title">My bag</h2>
        <p className="meta">Your bag is empty.</p>
        <button className="btn" onClick={() => go("collection")}>Browse collection</button>
      </>
    );
  return (
    <>
      <h2 className="title">My bag</h2>
      {list.map((p) => (
        <div className="line" key={p.id}>
          <div className="t"><Img p={p} /></div>
          <div style={{ flex: 1 }}><h3>{p.name}</h3><span className="meta">{inr(p.price)}</span></div>
          <button className="q" onClick={() => addToCart(p.id, -1)}>−</button>
          {cart[p.id]}
          <button className="q" onClick={() => addToCart(p.id, 1)}>+</button>
        </div>
      ))}
      <div className="row" style={{ margin: "22px 0" }}>
        <h3>Total</h3><span className="price" style={{ fontSize: 22 }}>{inr(total)}</span>
      </div>
      <button className="btn" onClick={() => { clearCart(); say("Order placed"); go("home"); }}>Checkout</button>
    </>
  );
}