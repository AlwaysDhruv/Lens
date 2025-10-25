import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ThemeProvider } from "./context/ThemeContext"; // ✅ added
import "./styles/global.css";
import "./styles/theme.css"; // ✅ theme styles (dark/light)

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <ThemeProvider>  {/* ✅ Wrap App so theme is global */}
          <App />
        </ThemeProvider>
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);
