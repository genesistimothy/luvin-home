import Breadcrumb from "./Breadcrumb";

export default function PlaceholderPage({ eyebrow = "Coming Soon", title, description, breadcrumbItems }) {
  return (
    <section className="section-shell min-h-[60vh] bg-cream pt-32">
      <div className="mx-auto max-w-4xl">
        <Breadcrumb items={breadcrumbItems} />
        <p className="section-kicker mt-6">{eyebrow}</p>
        <h1 className="mt-4 font-display text-[2.35rem] leading-[1.08] tracking-[-0.025em] text-cocoa sm:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-6 max-w-2xl text-[1.05rem] leading-8 text-cocoa/[0.68]">{description}</p>
        )}
      </div>
    </section>
  );
}
