# Veloura — Luxury Fragrances (React + API)

    npm install
    npm run dev

Open the local URL Vite prints (usually http://localhost:5173).

## API
Perfumes (names, brands, prices, ratings and real product photos) come from the free
DummyJSON fragrances endpoint, no API key needed:
https://dummyjson.com/products/category/fragrances

- Change the endpoint: copy `.env.example` to `.env` and edit `VITE_API_URL`.
- Mapping from API fields to the UI is in `src/api.js` (`normalize`).
- Prices are converted from USD to INR with `USD_TO_INR` in `src/api.js`.
- DummyJSON has no scent notes, so notes/family are derived in `src/api.js`.

## Structure
- `src/api.js` fetch + normalize
- `src/store.jsx` wishlist and bag (saved in localStorage)
- `src/pages.jsx` Home, Collection, Quiz, Notes, Compare, Personalize, Wishlist, Bag
- `src/App.jsx` navigation and loading/error states

## Photos
- 32 Veloura perfumes + the 5 DummyJSON designer perfumes (37 total), priced from ₹300.
- Image order: your own photo `public/perfumes/<id>.jpg` (ids 101–132) → online photo (loremflickr) → drawn bottle.
  Put your photos in `public/perfumes/` (create the folder) named 101.jpg, 102.jpg, ... and they replace the online ones.
- Edit names and prices in `src/api.js`.

## Live photos
Real perfume photos load live from Open Beauty Facts (free, no key) via `getPerfumes()` in `src/api.js`.
`vite.config.js` proxies `/obf` to avoid CORS. **Restart `npm run dev` after changing it.**
If the API returns nothing (offline), Veloura house perfumes with drawn bottles fill the grid.
