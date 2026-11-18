import { sanityImageUrl } from "./sanityImage";

/** @type {any} */
export const portableTextComponents = {
  types: {
    image: ({ value }) => (
      <img src={sanityImageUrl(value, { width: 1200 })} alt={value.alt || ""} className="my-8 w-full rounded-2xl" />
    ),
  },
  block: {
    h2: ({ children }) => <h2 className="mt-10 font-display text-2xl tracking-[-0.02em] text-cocoa">{children}</h2>,
    h3: ({ children }) => <h3 className="mt-8 font-display text-xl tracking-[-0.01em] text-cocoa">{children}</h3>,
    h4: ({ children }) => <h4 className="mt-6 font-display text-lg tracking-[-0.01em] text-cocoa">{children}</h4>,
    blockquote: ({ children }) => (
      <blockquote className="mt-6 border-l-2 border-clay/60 pl-6 italic text-cocoa/75">{children}</blockquote>
    ),
    normal: ({ children }) => <p className="mt-5 leading-8 text-cocoa/75">{children}</p>,
  },
  list: {
    bullet: ({ children }) => <ul className="mt-5 list-disc space-y-2 pl-6 text-cocoa/75">{children}</ul>,
    number: ({ children }) => <ol className="mt-5 list-decimal space-y-2 pl-6 text-cocoa/75">{children}</ol>,
  },
  marks: {
    link: ({ value, children }) => {
      const raw = String(value?.href || "");
      const safe = /^(https?:|mailto:|tel:|\/(?!\/))/.test(raw) ? raw : "#";
      const external = /^https?:/.test(safe);
      return (
        <a href={safe} {...(external ? { rel: "noopener noreferrer" } : {})}>
          {children}
        </a>
      );
    },
  },
};
