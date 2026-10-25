export default function ContentError({ label, onRetry }) {
  return (
    <div className="mt-16 flex flex-col items-center gap-4 text-center" role="status">
      <p className="max-w-sm text-cocoa/70">
        We couldn&apos;t load the {label} right now. Please try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="premium-button bg-cocoa px-5 py-2.5 text-sm font-semibold text-cream hover:bg-umber"
      >
        Try again
      </button>
    </div>
  );
}
