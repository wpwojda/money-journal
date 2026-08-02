import React from "react";
import ReactDOM from "react-dom/client";

// Self-hosted Inter (latin subset, only the weights this app actually uses).
// Bundled at build time so the app makes zero third-party requests at runtime -
// see README "Privacy-first philosophy". Do not replace with a font CDN link.
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import "@fontsource/inter/latin-800.css";

import App from "./App.jsx";
import { ErrorBoundary } from "./components/ErrorBoundary.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
