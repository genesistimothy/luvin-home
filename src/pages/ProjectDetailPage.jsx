import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Breadcrumb from "../components/Breadcrumb";
import CatalogProductCard from "../components/CatalogProductCard";
import { useSanityQuery } from "../hooks/useSanityQuery";
import { projectBySlugQuery } from "../lib/queries";
import { sanityImageUrl } from "../lib/sanityImage";

function ProjectImage({ image, className }) {
  if (!image?.image?.asset) return null;
  return <img src={image.image.asset.url} alt={image.altText || ""} className={className} />;
}

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const { data: project, loading } = useSanityQuery(projectBySlugQuery, { slug });

  const relatedProducts = useMemo(
    () =>
      (project?.relatedProducts || []).map((product) => ({
        ...product,
        mainImageUrl: sanityImageUrl(product.mainImage, { width: 900 }),
      })),
    [project]
  );

  if (loading) return null;

  if (!project) {
    return (
      <section className="section-shell flex min-h-[60vh] items-center bg-cream pt-32 lg:pt-40">
        <div className="mx-auto max-w-xl text-center">
          <p className="section-kicker">404</p>
          <h1 className="mt-4 font-display text-3xl text-cocoa sm:text-4xl">Project not found.</h1>
          <Link
            to="/projects"
            className="premium-button mt-8 inline-flex items-center justify-center gap-2 bg-cocoa px-7 py-4 text-sm font-bold text-cream hover:bg-umber"
          >
            Back to Projects <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    );
  }

  const hasBeforeAfter = project.beforeImage?.image?.asset && project.afterImage?.image?.asset;

  return (
    <section className="section-shell bg-cream pt-32 lg:pt-40">
      <div className="mx-auto max-w-6xl">
        <Breadcrumb
          items={[
            { label: "Home", to: "/" },
            { label: "Projects", to: "/projects" },
            { label: project.title },
          ]}
        />

        <div className="mt-6 max-w-2xl">
          <p className="section-kicker">{project.roomType}</p>
          <h1 className="mt-4 font-display text-[2.35rem] leading-[1.08] tracking-[-0.025em] text-cocoa sm:text-5xl">
            {project.title}
          </h1>
          {project.summary && <p className="mt-6 leading-8 text-cocoa/[0.68]">{project.summary}</p>}
        </div>

        {hasBeforeAfter ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-clay-strong">Before</p>
              <div className="aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-oat">
                <ProjectImage image={project.beforeImage} className="h-full w-full object-cover" />
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-clay-strong">After</p>
              <div className="aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-oat">
                <ProjectImage image={project.afterImage} className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        ) : (
          project.coverImage?.image?.asset && (
            <div className="mt-10 aspect-[21/9] overflow-hidden rounded-[1.5rem] bg-oat">
              <ProjectImage image={project.coverImage} className="h-full w-full object-cover" />
            </div>
          )
        )}

        {project.gallery?.length > 0 && (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {project.gallery.map((image, index) => (
              <div key={image.image?.asset?._id || index} className="aspect-[4/3] overflow-hidden rounded-2xl bg-oat">
                <ProjectImage image={image} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <p className="section-kicker">Products in This Project</p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {relatedProducts.map((product) => (
                <CatalogProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
