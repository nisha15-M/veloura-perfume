import { useState } from "react";
import { inr } from "./api.js";
import { Img } from "./img.jsx";
import { useStore } from "./store.jsx";

export function Product({ items = [], go, opt }) {
  const { wish, toggleWish, addToCart } = useStore();
  const [quantity, setQuantity] = useState(1);

  const product = items.find((item) => String(item.id) === String(opt?.id));

  if (!product) {
    return (
      <section className="banner">
        <h2 className="title">Fragrance not found</h2>
        <p className="meta">Please choose a fragrance from the collection.</p>
        <button className="btn" onClick={() => go("collection")}>
          Back to collection
        </button>
      </section>
    );
  }

  const saved = wish.includes(product.id);

  return (
    <section className="showcase">
      <div className={`pdimg ${product.fit === "contain" ? "light" : ""}`}>
        <Img p={product} />
      </div>

      <div>
        <p className="meta">VELOURA · LUXURY FRAGRANCES</p>
        <h1 className="serif">{product.name}</h1>
        <p className="meta">{product.family} fragrance</p>
        <p className="meta">★ {product.rating}</p>
        <h2>{inr(product.price)}</h2>
        <p>{product.description}</p>

        <div className="chips">
          <button className="chip" aria-label="Less" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
          <span>{quantity}</span>
          <button className="chip" aria-label="More" onClick={() => setQuantity(Math.min(10, quantity + 1))}>+</button>
        </div>

        <div className="ctas">
          <button className="btn" onClick={() => addToCart(product.id, quantity)}>
            Add to bag · {inr(product.price * quantity)}
          </button>
          <button className="btn ghost" onClick={() => toggleWish(product.id)}>
            {saved ? "♥ Saved" : "♡ Add to wishlist"}
          </button>
        </div>

        <button className="chip" style={{ marginTop: 16 }} onClick={() => go("collection")}>
          ← Back to collection
        </button>
      </div>
    </section>
  );
}
