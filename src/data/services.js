// Default content shown until the matching `service` document is published in Sanity.
// ServiceDetailPage merges CMS data over this by slug, so pages stay fully usable either way.
const defaultProcessSteps = [
  { title: "Consultation", description: "We listen to your needs, lifestyle, and budget." },
  { title: "Design", description: "Our team develops a complete space concept with moodboards and layout plans." },
  { title: "Production", description: "Selected furniture is produced or prepared to the agreed specifications." },
  { title: "Installation", description: "We install and style the furniture directly in your space until it's ready to live in." },
];

export const serviceLinks = [
  {
    slug: "interior-design-consultation",
    name: "Interior Design Consultation",
    summary: "Discuss your vision for the space with our team, from color palettes to furniture layout.",
    processSteps: defaultProcessSteps,
  },
  {
    slug: "custom-furniture",
    name: "Custom Furniture",
    summary: "Furniture made to the exact size, material, and style your space calls for.",
    processSteps: defaultProcessSteps,
  },
  {
    slug: "home-furnishing",
    name: "Home Furnishing",
    summary: "Complete furniture selection and styling for a new home or renovation.",
    processSteps: defaultProcessSteps,
  },
  {
    slug: "project-contract",
    name: "Project & Contract",
    summary: "Project-scale partnerships for offices, apartments, and commercial properties.",
    processSteps: defaultProcessSteps,
  },
];

// Merges CMS `service` documents over the static fallback list by slug, so the
// four core services always render even before Sanity content is published.
export function mergeServiceContent(cmsServices) {
  return serviceLinks.map((fallback) => {
    const cms = cmsServices?.find((item) => item.slug === fallback.slug);
    if (!cms) return fallback;
    return {
      ...fallback,
      ...cms,
      processSteps: cms.processSteps?.length ? cms.processSteps : fallback.processSteps,
    };
  });
}
