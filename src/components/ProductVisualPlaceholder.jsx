export default function ProductVisualPlaceholder({ category }) {
  return (
    <div className="relative aspect-[16/10] overflow-hidden bg-[radial-gradient(circle_at_20%_15%,#fffaf2,#e7d6c0_42%,#bfa181)]">
      <div className="absolute inset-x-8 bottom-10 h-16 rounded-[50%] bg-cocoa/[0.15] blur-xl" />
      <div className="absolute left-1/2 top-1/2 h-24 w-52 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white/[0.55] shadow-[inset_0_-16px_25px_rgba(62,44,35,0.12)] transition duration-700 ease-out group-hover:-translate-y-[54%] group-hover:scale-[1.04]" />
      <div className="absolute left-1/2 top-[54%] h-14 w-64 max-w-[76%] -translate-x-1/2 rounded-b-3xl rounded-t-xl bg-oat shadow-lg transition duration-700 ease-out group-hover:bg-[#dbc5aa]" />
      <div className="absolute left-[23%] top-[47%] h-16 w-8 rounded-lg bg-umber/80" />
      <div className="absolute right-[23%] top-[47%] h-16 w-8 rounded-lg bg-umber/80" />
      {category && (
        <div className="absolute left-5 top-5 rounded-full border border-white/40 bg-cream/80 px-3.5 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-cocoa backdrop-blur-md">
          {category}
        </div>
      )}
    </div>
  );
}
