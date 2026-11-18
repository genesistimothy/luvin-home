import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function NotFoundPage() {
  return (
    <section className="section-shell flex min-h-[70vh] items-center bg-cream pt-32 lg:pt-40">
      <div className="mx-auto max-w-xl text-center">
        <p className="section-kicker">404</p>
        <h1 className="mt-4 font-display text-[2.35rem] leading-[1.08] tracking-[-0.025em] text-cocoa sm:text-5xl">
          This page hasn&apos;t found its space yet.
        </h1>
        <p className="mt-6 leading-8 text-cocoa/[0.68]">
          The page you&apos;re looking for couldn&apos;t be found. Let&apos;s get you back to exploring our collection.
        </p>
        <Link
          to="/"
          className="premium-button mt-9 inline-flex items-center justify-center gap-2 bg-cocoa px-7 py-4 text-sm font-bold text-cream hover:bg-umber"
        >
          Back to Home
          <ArrowRight size={17} />
        </Link>
      </div>
    </section>
  );
}
