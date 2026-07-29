import React, { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const RootApp = window.location.pathname.startsWith("/admin")
  ? lazy(() => import("./admin/AdminApp.jsx"))
  : lazy(() => import("./App.jsx"));

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Suspense fallback={null}>
      <RootApp />
    </Suspense>
  </React.StrictMode>,
);
