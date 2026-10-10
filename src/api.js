const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://dummyjson.com/products/category/fragrances?limit=30";
const USD_TO_INR = 85;

export const FAMILIES = {
  Floral: { top: "Pear, Bergamot", mid: "Rose, Jasmine", base: "Musk, Vanilla", notes: ["Rose", "Jasmine", "Peony"] },
  Woody: { top: "Saffron, Pepper", mid: "Oud, Cedarwood", base: "Amber, Patchouli", notes: ["Oud", "Cedar", "Amber"] },
  Fresh: { top: "Lemon, Mint", mid: "Marine, Neroli", base: "Vetiver, Musk", notes: ["Citrus", "Sea Salt", "Mint"] },
};

/* Veloura house catalog: 32 perfumes, from ₹300 up to ₹9,999 */
const NAMES = {
  Fresh: ["Aqua Dawn", "Citrus Whisper", "Ocean Mist", "Mint Horizon", "Silver Rain", "Lemon Verbena Veil", "Sea Salt & Sage", "Glacier Bloom", "Green Tea Haze", "Cool Linen", "Blue Lagoon"],
  Floral: ["Peony Petal", "Jasmine Silk", "Rose Atelier", "Velvet Rose", "Lily Twilight", "Neroli Garden", "Cherry Blossom Dusk", "Iris Noir", "Tuberose Gold", "Magnolia Lace", "Orchid Reverie"],
  Woody: ["Cedar Essence", "Sandal Sutra", "Amber Noir", "Smoked Vetiver", "Leather & Saffron", "Midnight Oud", "Royal Oud Reserve", "Tobacco Ember", "Patchouli Dynasty", "Oud for Greatness"],
};
const PRICES = [300, 349, 399, 449, 499, 549, 599, 699, 799, 899, 999, 1199, 1299, 1499, 1699, 1899, 1999, 2299, 2499, 2799, 2999, 3299, 3499, 3999, 4499, 4999, 5499, 5999, 6999, 7999, 8999, 9999];

function catalog() {
  const out = [];
  Object.entries(NAMES).forEach(([family, list]) =>
    list.forEach((name) => {
      const i = out.length;
      const category = family === "Floral" ? (i % 3 === 2 ? "Unisex" : "Women") : i % 3 === 2 ? "Unisex" : "Men";
      const f = FAMILIES[family];
      out.push({
        id: 101 + i,
        name,
        brand: "Veloura",
        description: `A ${family.toLowerCase()} blend of ${f.notes.join(", ").toLowerCase()}.`,
        price: PRICES[i],
        rating: +(4.2 + ((i * 7) % 8) / 10).toFixed(1),
        family,
        category,
        longevity: `${6 + (i % 7)} hrs`,
        ...f,
      });
    })
  );
  return out;
}

function familyOf(p) {
  const t = `${p.title} ${p.description}`.toLowerCase();
  if (/(rose|flower|floral|jasmine|blossom|lady|women)/.test(t)) return "Floral";
  if (/(oud|wood|amber|noir|intense|absolu|homme|men)/.test(t)) return "Woody";
  return ["Floral", "Woody", "Fresh"][p.id % 3];
}

function fromApi(p) {
  const family = familyOf(p);
  return {
    id: `d${p.id}`,
    name: p.title,
    brand: p.brand || "Designer",
    description: p.description,
    price: Math.round(p.price * USD_TO_INR),
    rating: p.rating,
    image: p.thumbnail || p.images?.[0],
    fit: "contain",
    clean: true,
    family,
    category: ["Men", "Women", "Unisex"][p.id % 3],
    longevity: `${6 + (p.id % 7)} hrs`,
    ...FAMILIES[family],
  };
}

const OBF_TERMS = ["eau de parfum", "eau de toilette", "perfume"];
const OBF_PATH = (t) =>
  `/cgi/search.pl?search_terms=${encodeURIComponent(t)}&search_simple=1&action=process&json=1&page_size=40&fields=code,product_name,brands,image_front_url`;

/* fetch that gives up after `ms` so the page never waits too long */
async function fetchJson(url, ms = 8000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    return r.ok ? await r.json() : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function searchObf(term) {
  for (const base of ["/obf", "https://world.openbeautyfacts.org"]) {
    const j = await fetchJson(base + OBF_PATH(term), 25000);
    if (j?.products) return j.products;
  }
  return [];
}

function fromObf(p, i) {
  const name = p.product_name.trim();
  const t = name.toLowerCase();
  const family = /(rose|floral|flower|jasmin|blossom|fleur|femme|woman|women|lady)/.test(t)
    ? "Floral"
    : /(oud|wood|bois|homme|men|noir|intense|amber|ambre|cuir|leather)/.test(t)
    ? "Woody"
    : "Fresh";
  const brand = (p.brands || "").split(",")[0].trim() || "Designer";
  return {
    id: `o${p.code}`,
    name,
    brand,
    description: `${name} by ${brand}.`,
    price: PRICES[(i * 5) % PRICES.length], // sample prices: the API has none
    rating: +(4.0 + ((i * 3) % 10) / 10).toFixed(1),
    image: p.image_front_url,
    fit: "contain",
    family,
    category: ["Men", "Women", "Unisex"][i % 3],
    longevity: `${6 + (i % 7)} hrs`,
    ...FAMILIES[family],
  };
}

const CACHE_KEY = "veloura:live:v1";
function readCache() {
  try {
    const c = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (c && Date.now() - c.t < 24 * 3600 * 1000) return c.items;
  } catch {}
  return [];
}
function writeCache(items) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), items })); } catch {}
}

/* top up with Veloura house perfumes (drawn bottles) so there are always 30+ */
function withHouse(real) {
  const need = Math.max(0, 36 - real.length);
  const extra = catalog().sort((a, b) => ((a.id * 7) % 32) - ((b.id * 7) % 32)).slice(0, need);
  return [...real, ...extra];
}

/* Instant list for first paint: saved live results (if any) + house perfumes */
export function getQuick() {
  return withHouse(readCache());
}

/* Live list: runs all searches at the same time, each with a timeout */
export async function getPerfumes() {
  const [dummyJson, ...obf] = await Promise.all([fetchJson(API_URL), ...OBF_TERMS.map(searchObf)]);
  const dummy = (dummyJson?.products || []).map(fromApi);

  const seen = new Set();
  const live = obf
    .flat()
    .filter((p) => p.product_name && p.image_front_url && /(parfum|perfume|eau de|cologne|toilette|fragrance)/i.test(p.product_name))
    .filter((p) => {
      if (seen.has(p.image_front_url)) return false;
      seen.add(p.image_front_url);
      return true;
    })
    .slice(0, 40)
    .map(fromObf);

  const real = [...dummy, ...live];
  if (real.length) writeCache(real);
  return withHouse(real);
}

export const inr = (n) => "₹" + n.toLocaleString("en-IN");