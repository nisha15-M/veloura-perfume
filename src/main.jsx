import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { StoreProvider } from "./store.jsx";
import { AuthProvider } from "./auth.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <StoreProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StoreProvider>
);