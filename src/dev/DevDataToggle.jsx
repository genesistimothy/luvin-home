import { useSearchParams } from "react-router-dom";
import { SCENARIOS } from "../data/devWorstCase";

/**
 * Dev-only scenario switch. Plain grey chrome on purpose: it is not part of
 * the design under test, so it must not look like one.
 *
 * The choice lives in `?data=` so a reload keeps it and a screenshot is
 * reproducible.
 */
export default function DevDataToggle() {
  const [params, setParams] = useSearchParams();
  const active = params.get("data") || "demo";

  function pick(id) {
    const next = new URLSearchParams(params);
    if (id === "demo") next.delete("data");
    else next.set("data", id);
    setParams(next, { replace: true });
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 12,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 99999,
        display: "flex",
        gap: 2,
        padding: 3,
        borderRadius: 999,
        background: "#e5e5e5",
        font: "600 12px/1 system-ui, -apple-system, Segoe UI, sans-serif",
        boxShadow: "0 4px 16px rgba(0,0,0,.18)",
        maxWidth: "calc(100vw - 16px)",
        overflowX: "auto",
        whiteSpace: "nowrap",
      }}
    >
      {SCENARIOS.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => pick(s.id)}
          style={{
            border: 0,
            borderRadius: 999,
            padding: "7px 12px",
            background: active === s.id ? "#fff" : "transparent",
            color: active === s.id ? "#111" : "#555",
            cursor: "pointer",
            boxShadow: active === s.id ? "0 1px 3px rgba(0,0,0,.18)" : "none",
            fontSize: 12,
            whiteSpace: "nowrap",
            flex: "0 0 auto",
          }}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
