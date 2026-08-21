import { Link } from "react-router-dom";
import { Newspaper } from "lucide-react";
import Breadcrumb from "../components/Breadcrumb";
import { useSanityQuery } from "../hooks/useSanityQuery";
import { articlesQuery } from "../lib/queries";

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(value));
}

export default function BlogPage() {
  const { data, loading } = useSanityQuery(articlesQuery);
  const articles = data || [];

  return (
    <section className="section-shell bg-cream pt-32">
      <div className="mx-auto max-w-7xl">
        <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Blog" }]} />
        <div className="mt-6 max-w-2xl">
          <p className="section-kicker">Blog</p>
          <h1 className="mt-4 font-display text-[2.35rem] leading-[1.08] tracking-[-0.025em] text-cocoa sm:text-5xl">
            Tips Interior &amp; Desain
          </h1>
        </div>

        {articles.length > 0 ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {articles.map((article) => (
              <Link
                key={article._id}
                to={`/blog/${article.slug}`}
                className="group overflow-hidden rounded-[1.5rem] border border-oat/[0.55] bg-cream shadow-[0_20px_60px_rgba(62,44,35,0.07)] transition duration-500 hover:-translate-y-1.5 hover:border-clay/30 hover:shadow-[0_30px_80px_rgba(62,44,35,0.12)]"
              >
                <div className="aspect-[16/10] overflow-hidden bg-oat">
                  {article.coverImage?.image?.asset?.url ? (
                    <img
                      src={article.coverImage.image.asset.url}
                      alt={article.coverImage.altText || article.title}
                      className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-cocoa/25">
                      <Newspaper size={40} />
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-cocoa/[0.45]">
                    {formatDate(article.publishedAt)}
                  </p>
                  <h2 className="mt-2 font-display text-xl tracking-[-0.02em] text-cocoa">{article.title}</h2>
                  {article.excerpt && <p className="mt-2 text-sm leading-6 text-cocoa/[0.65]">{article.excerpt}</p>}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          !loading && <p className="mt-16 text-center text-cocoa/60">Belum ada artikel yang dipublikasikan. Nantikan tulisan terbaru kami.</p>
        )}
      </div>
    </section>
  );
}
