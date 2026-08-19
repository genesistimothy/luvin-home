// Default content shown until the matching `service` document is published in Sanity.
// ServiceDetailPage merges CMS data over this by slug, so pages stay fully usable either way.
const defaultProcessSteps = [
  { title: "Konsultasi", description: "Kami mendengarkan kebutuhan, gaya hidup, dan anggaran Anda." },
  { title: "Desain", description: "Tim kami menyusun konsep ruang lengkap dengan moodboard dan rencana tata letak." },
  { title: "Produksi", description: "Furnitur terpilih diproduksi atau disiapkan sesuai spesifikasi yang disepakati." },
  { title: "Instalasi", description: "Kami memasang dan menata furnitur langsung di ruang Anda hingga siap dipakai." },
];

export const serviceLinks = [
  {
    slug: "interior-design-consultation",
    name: "Interior Design Consultation",
    summary: "Diskusikan visi ruang Anda bersama tim kami, dari palet warna hingga tata letak furnitur.",
    processSteps: defaultProcessSteps,
  },
  {
    slug: "custom-furniture",
    name: "Custom Furniture",
    summary: "Furnitur yang dibuat sesuai ukuran, material, dan gaya ruang Anda secara spesifik.",
    processSteps: defaultProcessSteps,
  },
  {
    slug: "home-furnishing",
    name: "Home Furnishing",
    summary: "Pemilihan dan penataan furnitur lengkap untuk rumah baru atau renovasi.",
    processSteps: defaultProcessSteps,
  },
  {
    slug: "project-contract",
    name: "Project & Contract",
    summary: "Kerja sama skala proyek untuk kantor, apartemen, dan properti komersial.",
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
