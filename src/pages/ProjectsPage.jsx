import { Link, useSearchParams } from "react-router-dom";
import { Images } from "lucide-react";
import Breadcrumb from "../components/Breadcrumb";
import ContentError from "../components/ContentError";
import { sanityImageUrl, sanityImageSrcSet } from "../lib/sanityImage";
import { useSanityQuery } from "../hooks/useSanityQuery";
import { projectsQuery } from "../lib/queries";

const ROOM_TYPES = ["Living Room", "Dining Room", "Bedroom", "Kitchen", "Workspace", "Entryway", "Other"];

export default function ProjectsPage() {
  const { data, loading, error, refetch } = useSanityQuery(projectsQuery);
  const [searchParams, setSearchParams] = useSearchParams();
  const roomType = searchParams.get("tipe") || "";

  const projects = data || [];
  const filtered = roomType ? projects.filter((project) => project.roomType === roomType) : projects;

  return (
    <section className="section-shell bg-cream pt-32 lg:pt-40">
      <div className="mx-auto max-w-7xl">
        <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Projects" }]} />
        <div className="mt-6 max-w-2xl">
          <p className="section-kicker">Projects</p>
          <h1 className="mt-4 font-display text-[2.35rem] leading-[1.08] tracking-[-0.025em] text-cocoa sm:text-5xl">
            Our Projects
          </h1>
          <p className="mt-6 leading-8 text-cocoa/[0.68]">Case studies of spaces we&apos;ve designed and brought to life with our clients.</p>
        </div>

        {error ? (
          <ContentError label="projects" onRetry={refetch} />
        ) : projects.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSearchParams({})}
              className={`rounded-full px-4 py-2 text-sm transition ${!roomType ? "bg-cocoa text-cream" : "bg-linen text-cocoa/70 hover:bg-oat/50"}`}
            >
              All Rooms
            </button>
            {ROOM_TYPES.filter((type) => projects.some((project) => project.roomType === type)).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSearchParams({ tipe: type })}
                className={`rounded-full px-4 py-2 text-sm transition ${roomType === type ? "bg-cocoa text-cream" : "bg-linen text-cocoa/70 hover:bg-oat/50"}`}
              >
                {type}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <p className="mt-16 text-center text-cocoa/70">Loading projects…</p>
        ) : error ? null : filtered.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((project) => (
              <Link
                key={project._id}
                to={`/projects/${project.slug}`}
                className="group overflow-hidden rounded-[1.5rem] border border-oat/[0.55] bg-cream shadow-[0_20px_60px_rgba(62,44,35,0.07)] transition-[transform,border-color] duration-200 ease-[var(--ease-premium)] motion-safe:hover:-translate-y-1.5 hover:border-clay/30"
              >
                <div className="aspect-[4/3] overflow-hidden bg-oat">
                  {project.coverImage?.image?.asset?.url ? (
                    <img
                      src={sanityImageUrl(project.coverImage, { width: 720 })}
                      srcSet={sanityImageSrcSet(project.coverImage, [480, 720, 1080])}
                      sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
                      alt={project.coverImage.altText || project.title}
                      loading="lazy"
                      decoding="async"
                      className="media-zoom h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-cocoa/25">
                      <Images size={40} />
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-clay-strong">{project.roomType}</p>
                  <h2 className="mt-2 font-display text-xl tracking-[-0.02em] text-cocoa">{project.title}</h2>
                  {project.summary && <p className="mt-2 text-sm leading-6 text-cocoa/70">{project.summary}</p>}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          !loading && (
            <p className="mt-16 text-center text-cocoa/70">
              {projects.length === 0 ? "No projects published yet. Stay tuned for our latest case studies." : "No projects for this room type."}
            </p>
          )
        )}
      </div>
    </section>
  );
}
