import { Link, useParams } from "react-router-dom";
import { PortableText } from "@portabletext/react";
import { ArrowRight } from "lucide-react";
import Breadcrumb from "../components/Breadcrumb";
import { useSanityQuery } from "../hooks/useSanityQuery";
import { articleBySlugQuery } from "../lib/queries";
import { portableTextComponents } from "../lib/portableTextComponents";

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(value));
}

export default function BlogDetailPage() {
  const { slug } = useParams();
  const { data: article, loading } = useSanityQuery(articleBySlugQuery, { slug });

  if (loading) return null;

  if (!article) {
    return (
      <section className="section-shell flex min-h-[60vh] items-center bg-cream pt-32">
        <div className="mx-auto max-w-xl text-center">
          <p className="section-kicker">404</p>
          <h1 className="mt-4 font-display text-3xl text-cocoa sm:text-4xl">Artikel tidak ditemukan.</h1>
          <Link
            to="/blog"
            className="premium-button mt-8 inline-flex items-center justify-center gap-2 bg-cocoa px-7 py-4 text-sm font-bold text-cream hover:bg-umber"
          >
            Kembali ke Blog <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section-shell bg-cream pt-32">
      <div className="mx-auto max-w-3xl">
        <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Blog", to: "/blog" }, { label: article.title }]} />

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.1em] text-cocoa/45">
          {formatDate(article.publishedAt)}
          {article.author ? ` · ${article.author}` : ""}
        </p>
        <h1 className="mt-3 font-display text-[2.1rem] leading-[1.1] tracking-[-0.02em] text-cocoa sm:text-[2.6rem]">
          {article.title}
        </h1>

        {article.coverImage?.image?.asset?.url && (
          <div className="mt-8 aspect-[16/9] overflow-hidden rounded-[1.5rem] bg-oat">
            <img
              src={article.coverImage.image.asset.url}
              alt={article.coverImage.altText || article.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {article.body?.length > 0 && (
          <div className="mt-8">
            <PortableText value={article.body} components={portableTextComponents} />
          </div>
        )}
      </div>
    </section>
  );
}
