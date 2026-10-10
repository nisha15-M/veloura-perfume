import { useEffect, useState } from "react";

const TINT = { Fresh: "#4aa8c8", Floral: "#d98a9b", Woody: "#c8913d" };
function bottle(p) {
  const c = TINT[p.family] || "#c8913d";
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 160'><rect width='120' height='160' fill='#17110d'/><rect x='50' y='14' width='20' height='16' fill='#d4a55a'/><rect x='42' y='30' width='36' height='10' fill='#8a6a35'/><rect x='20' y='40' width='80' height='108' rx='8' fill='${c}' fill-opacity='.35' stroke='#d4a55a'/><text x='60' y='96' fill='#f0cf8e' font-size='9' text-anchor='middle' font-family='serif' letter-spacing='2'>VELOURA</text></svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

/* Tries: your own photo in /public/perfumes/<id>.jpg → API image → drawn bottle */
export function Img({ p, className }) {
  const srcs = [`/perfumes/${p.id}.jpg`, p.image, bottle(p)].filter(Boolean);
  const [i, setI] = useState(0);
  useEffect(() => setI(0), [p.id]);
  return (
    <img
      className={className}
      src={srcs[i]}
      alt={p.name}
      loading="lazy"
      style={{ objectFit: p.fit || "cover" }}
      onError={() => i < srcs.length - 1 && setI(i + 1)}
    />
  );
}