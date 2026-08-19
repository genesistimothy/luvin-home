export const fieldInputClass =
  "w-full rounded-xl border border-oat/60 bg-white/70 px-4 py-3 text-sm text-cocoa placeholder:text-cocoa/40 focus:border-clay/50 focus:outline-none";

/**
 * @param {{label: string, htmlFor?: string, error?: string, hint?: string, children: any}} props
 */
export default function FormField({ label, htmlFor, error, hint, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-cocoa">
        {label}
      </label>
      <div className="mt-2">{children}</div>
      {error ? (
        <p className="mt-1.5 text-xs font-semibold text-red-600">{error}</p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-cocoa/50">{hint}</p>
      )}
    </div>
  );
}
